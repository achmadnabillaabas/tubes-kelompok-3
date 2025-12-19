<?php
// =====================================================================
// index.php - Berita Cuaca Kekinian (Multi-Source Pool + Server-Side Pagination)
// =====================================================================
// Purpose:
//   - Aggressively fetch articles into a large pool (Kompas → global fallback)
//   - Cache the FULL pool (not sliced to page size)
//   - Paginate ONLY at render time
//   - Support ?nocache=1, ?debug=1, ?page=N
// =====================================================================

// ======================== CONFIGURATION BLOCK ========================
// !! WARNING: Do NOT commit NEWSAPI_KEY literal to version control !!
// Use environment variable NEWSAPI_KEY in production (hosting control panel).

// API Key (prefer environment variable for production)
// Try common environment variable names first.
$apiKey = getenv('NEWSAPI_KEY') ?: getenv('news_api_key');

// If not available in environment, try loading project .env (simple parser).
if (!$apiKey) {
  $envPath = dirname(__DIR__, 1) . DIRECTORY_SEPARATOR . '.env';
  // __DIR__ is laman/berita-terbaru, so dirname(__DIR__,1) is laman — .env is in project root, go one more up
  $possible = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . '.env';
  if (file_exists($possible)) {
    $envPath = $possible;
  }

  if (file_exists($envPath) && is_readable($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
      $line = trim($line);
      if ($line === '' || $line[0] === '#') continue;
      if (strpos($line, '=') === false) continue;
      list($k, $v) = explode('=', $line, 2);
      $k = trim($k);
      $v = trim($v);
      $v = trim($v, "'\"");
      if (strcasecmp($k, 'NEWSAPI_KEY') === 0 || strcasecmp($k, 'news_api_key') === 0) {
        $apiKey = $v;
        break;
      }
    }
  }
}

if (!$apiKey) {
  die("❌ API key tidak ditemukan. Set environment variable NEWSAPI_KEY atau tambahkan .env dengan entry news_api_key=YOUR_KEY.");
}

// Cache configuration
$cacheDir = __DIR__ . '/cache';
$cacheFile = $cacheDir . '/news_weather.json';
$cacheTtl = 60 * 15;  // 15 menit

// Ensure cache directory exists and is writable
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0755, true);
}
if (!is_writable($cacheDir)) {
    @chmod($cacheDir, 0755);
}

// Fetch configuration (aggressive multi-page pool collection)
$language = 'id';                  // Language for API
$pageSizeDisplay = 10;             // Articles per page on UI (rendering only)
$perRequest = 50;                  // Articles per API call (max 100 for NewsAPI free tier)
$maxPagesKompas = 3;               // Max pages to fetch from Kompas domain
$maxPagesGlobal = 3;               // Max pages for global fallback search
$maxPool = 500;                    // Max total articles to collect in pool

// Keywords for server-side filtering (used to prioritize Kompas articles)
$keywords = ['cuaca', 'hujan', 'banjir', 'BMKG', 'peringatan cuaca', 'cuaca ekstrem'];

// Global search query terms for fallback
$queryTerms = 'cuaca OR hujan OR banjir OR BMKG OR "cuaca ekstrem"';

// Query parameters
$nocache = isset($_GET['nocache']) && $_GET['nocache'] == '1';
$debug = isset($_GET['debug']) && $_GET['debug'] == '1';
$currentPage = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;

// ======================== HELPER FUNCTIONS ========================

/**
 * Fetch raw data from NewsAPI endpoint
 * @param string $url Full API URL
 * @return array ['ok' => bool, 'body' => string|null, 'error' => string|null, 'http' => int]
 */
function fetchFromApiRaw($url) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_USERAGENT => 'BeritaCuacaBot/2.0 (+http://localhost)'
    ]);
    $res = curl_exec($ch);
    $err = curl_error($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);  // Still safe, just less common in PHP 8+

    if ($res === false || $http < 200 || $http >= 300) {
        return [
            'ok' => false,
            'http' => $http,
            'error' => $err ?: "HTTP {$http}",
            'body' => null
        ];
    }

    return ['ok' => true, 'body' => $res, 'error' => null, 'http' => $http];
}

/**
 * Filter articles by keywords, return matching subset up to limit
 * @param array $articles
 * @param array $keywords
 * @param int $limit
 * @return array Subset of articles matching at least one keyword
 */
function filterByKeywords($articles, $keywords, $limit = PHP_INT_MAX) {
    $matching = [];

    foreach ($articles as $article) {
        if (count($matching) >= $limit) break;

        $text = strtolower(
            ($article['title'] ?? '') . ' ' .
            ($article['description'] ?? '') . ' ' .
            ($article['content'] ?? '')
        );

        foreach ($keywords as $keyword) {
            if (stripos($text, $keyword) !== false) {
                $matching[] = $article;
                break;
            }
        }
    }

    return $matching;
}

/**
 * Fetch weather articles with aggressive multi-step strategy:
 * 1. Try Kompas domain multi-page fetch (without 'q')
 * 2. If insufficient or blocked, fallback to global multi-page search
 * 3. Server-side filter for Kompas if domain was blocked
 * 4. Deduplicate by URL
 * 5. Rank: keyword matches first, then fill with remaining candidates
 * 6. Return FULL pool (no pagination slicing here)
 *
 * @param string $apiKey
 * @param int $perRequest Articles per API call
 * @param int $maxPagesKompas Max pages from Kompas domain
 * @param int $maxPagesGlobal Max pages from global search
 * @param array $keywords Keywords for prioritization
 * @param string $queryTerms Global search query
 * @param int $maxPool Max total articles in pool
 * @return array [$articles_pool, $kompas_result, $fallback_used, $warnings]
 */
function fetchRelevantArticles(
    $apiKey,
    $perRequest,
    $maxPagesKompas,
    $maxPagesGlobal,
    $keywords,
    $queryTerms,
    $maxPool
) {
    $seenUrls = [];
    $warnings = [];
    $kompasResult = null;
    $fallbackUsed = false;

    // Step 1: Try Kompas domain fetch (multi-page, no 'q' param)
    $kompasCandidates = [];
    $kompasError = false;
    $kompasBlockedByPlan = false;

    for ($page = 1; $page <= $maxPagesKompas && count($kompasCandidates) < $maxPool; $page++) {
        $url = 'https://newsapi.org/v2/everything?'
            . 'domains=kompas.com'
            . '&sortBy=publishedAt'
            . '&page=' . $page
            . '&pageSize=' . $perRequest
            . '&apiKey=' . urlencode($apiKey);

        $result = fetchFromApiRaw($url);

        if (!$result['ok']) {
            $kompasError = true;
            $kompasResult = $result;

            // Detect plan restrictions (HTTP 426 or domain-related error)
            if ($result['http'] === 426 ||
                stripos($result['error'], 'domain') !== false ||
                stripos($result['error'], 'param') !== false) {
                $kompasBlockedByPlan = true;
                $warnings[] = "⚠️ API plan tidak mendukung parameter 'domains'. Fallback ke pencarian global + filter Kompas.";
                break;
            }
            continue;
        }

        $data = json_decode($result['body'], true);
        if ($data && ($data['status'] ?? '') === 'ok') {
            $articles = $data['articles'] ?? [];
            if (empty($articles)) break;
            $kompasCandidates = array_merge($kompasCandidates, $articles);
        }
    }

    // Step 2: Prepare article pool (prioritize keyword matches from Kompas)
    if (!empty($kompasCandidates)) {
        $matched = filterByKeywords($kompasCandidates, $keywords);
        $unmatched = array_filter($kompasCandidates, function($a) use ($matched) {
            return !in_array($a, $matched, true);
        });
        $articlePool = array_merge($matched, array_values($unmatched));
    } else {
        $articlePool = [];
        if ($kompasError || $kompasBlockedByPlan) {
            $fallbackUsed = true;
        }
    }

    // Step 3: If insufficient or Kompas failed, fetch global search (multi-page)
    if (count($articlePool) < 20 || $kompasError) {
        $fallbackUsed = true;
        $encodedQuery = urlencode($queryTerms);

        for ($page = 1; $page <= $maxPagesGlobal && count($articlePool) < $maxPool; $page++) {
            $url = 'https://newsapi.org/v2/everything?'
                . 'q=' . $encodedQuery
                . '&language=' . urlencode('id')
                . '&sortBy=publishedAt'
                . '&page=' . $page
                . '&pageSize=' . $perRequest
                . '&apiKey=' . urlencode($apiKey);

            $result = fetchFromApiRaw($url);

            if (!$result['ok']) {
                // If HTTP 426 (plan doesn't support 'q'), stop trying and use what we have (silently)
                if ($result['http'] === 426) {
                    // Silent fallback - don't show warning for unsupported 'q' parameter
                    break;
                }
                // For other errors, log but continue to next page
                if ($page === 1) {
                    $warnings[] = "⚠️ Pencarian global gagal (HTTP " . intval($result['http']) . "): " . $result['error'];
                }
                break;
            }

            $data = json_decode($result['body'], true);
            if ($data && ($data['status'] ?? '') === 'ok') {
                $articles = $data['articles'] ?? [];
                if (empty($articles)) break;

                // If Kompas domain was blocked, prioritize Kompas URLs from global results
                if ($kompasBlockedByPlan) {
                    $kompasList = array_filter($articles, function($a) {
                        $url = $a['url'] ?? '';
                        return stripos($url, 'kompas.com') !== false;
                    });
                    $otherList = array_filter($articles, function($a) {
                        $url = $a['url'] ?? '';
                        return stripos($url, 'kompas.com') === false;
                    });
                    $articlePool = array_merge($articlePool, $kompasList, array_values($otherList));
                } else {
                    $articlePool = array_merge($articlePool, $articles);
                }
            }
        }
    }

    // Step 4: Deduplicate by URL and enforce maxPool limit
    $finalPool = [];
    foreach ($articlePool as $article) {
        if (count($finalPool) >= $maxPool) break;

        $url = $article['url'] ?? null;
        if ($url && !isset($seenUrls[$url])) {
            $seenUrls[$url] = true;
            $finalPool[] = $article;
        }
    }

    return [$finalPool, $kompasResult, $fallbackUsed, $warnings];
}

// ======================== MAIN LOGIC & CACHE ========================

$warning = null;
$note = null;
$articles = [];
$fallbackUsed = false;
$totalArticles = 0;
$totalPages = 1;

// Force cache bypass if ?nocache=1
if ($nocache && is_writable($cacheDir)) {
    @unlink($cacheFile);
}

// Try to load from cache first (unless nocache)
$useCache = false;
$json = null;

if (!$nocache && file_exists($cacheFile)) {
    $age = time() - filemtime($cacheFile);
    if ($age < $cacheTtl) {
        $json = file_get_contents($cacheFile);
        $useCache = true;
    }
}

// If no valid cache, fetch from API
if (!$useCache) {
    [$articles, $kompasResult, $fallbackUsed, $warnings] = fetchRelevantArticles(
        $apiKey,
        $perRequest,
        $maxPagesKompas,
        $maxPagesGlobal,
        $keywords,
        $queryTerms,
        $maxPool
    );

    // Debug mode: output raw API response and exit
    if ($debug) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'debug' => true,
            'timestamp' => date('Y-m-d H:i:s'),
            'kompas_result' => $kompasResult,
            'fallback_used' => $fallbackUsed,
            'warnings' => $warnings,
            'total_articles_fetched' => count($articles),
            'articles_sample' => array_slice($articles, 0, 3)
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        exit;
    }

    // Save FULL pool to cache (no pagination slicing here)
    if (!empty($articles) && is_writable($cacheDir)) {
        $cacheData = [
            'status' => 'ok',
            'totalResults' => count($articles),
            'articles' => $articles,  // Full pool, NOT sliced to pageSizeDisplay
            'warning' => !empty($warnings) ? implode(' | ', $warnings) : null,
            'fallback_used' => $fallbackUsed,
            'generated_at' => date('Y-m-d H:i:s')
        ];
        $json = json_encode($cacheData);
        // Atomic write via temp file + rename
        $tmpFile = $cacheFile . '.tmp';
        file_put_contents($tmpFile, $json);
        rename($tmpFile, $cacheFile);
    } elseif (empty($articles)) {
        die("❌ Tidak dapat memuat artikel dari API dan cache kosong. Coba lagi nanti.");
    }

    if (!empty($warnings)) {
        $warning = implode(' | ', $warnings);
    }
} else {
    // Loaded from cache
    $cacheData = json_decode($json, true);
    if ($cacheData) {
        $articles = $cacheData['articles'] ?? [];
        $fallbackUsed = $cacheData['fallback_used'] ?? false;
        $cacheWarning = $cacheData['warning'] ?? null;
        if ($cacheWarning) {
            $warning = $cacheWarning . " (dari cache)";
        }
    }
}

// Pagination logic: render-time only
$totalArticles = count($articles);
$totalPages = max(1, ceil($totalArticles / $pageSizeDisplay));

// Validate & clamp current page
if ($currentPage > $totalPages) {
    $currentPage = $totalPages;
}
if ($currentPage < 1) {
    $currentPage = 1;
}

// Get articles for current page (SLICE ONLY AT RENDER TIME)
$offset = ($currentPage - 1) * $pageSizeDisplay;
$pageArticles = array_slice($articles, $offset, $pageSizeDisplay);

// Fallback message if page is empty
if (empty($pageArticles) && $totalArticles > 0) {
    $note = "Halaman tidak ditemukan. Ditampilkan halaman pertama.";
    $currentPage = 1;
    $pageArticles = array_slice($articles, 0, $pageSizeDisplay);
}

if ($totalArticles === 0) {
    $note = "Tidak ada artikel cuaca ditemukan. Coba ?nocache=1 untuk refresh atau cek kembali nanti.";
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Berita Cuaca Kekinian</title>
  <link rel="stylesheet" href="style.css">
  <script src="dark-mode.js" defer></script>
</head>
<body class="light-mode">

<!-- HEADER -->
<header class="site-header">
  <div class="header-container">
    <div class="logo">📰 Berita Cuaca Kekinian</div>
    <nav class="nav-menu">
      <a href="?page=1">Refresh</a>
      <button id="darkModeToggle" class="dark-mode-toggle" title="Toggle Dark Mode">
        <span class="toggle-icon">🌙</span>
      </button>
    </nav>
  </div>
</header>

<!-- MAIN CONTENT -->
<main class="container">
  <!-- ALERTS -->
  <div id="alerts-section">
    <?php if (!empty($note)): ?>
      <div class="alert info">
        <span>ℹ️</span>
        <span><?= htmlspecialchars($note) ?></span>
      </div>
    <?php endif; ?>

    <!-- PAGE INFO -->
    <?php if ($totalArticles > 0): ?>
      <div class="page-info">
        📄 Halaman <strong><?= $currentPage ?></strong> dari <strong><?= $totalPages ?></strong>
        &nbsp; | &nbsp; Menampilkan <strong><?= count($pageArticles) ?></strong> dari <strong><?= $totalArticles ?></strong> artikel
      </div>
    <?php endif; ?>
  </div>

  <!-- CONTENT WRAPPER -->
  <div class="content-wrapper">
    <!-- ARTICLES SECTION -->
    <section class="articles-section">
      <h2>Berita Terkini</h2>

      <?php if (!empty($pageArticles)): ?>
        <div class="articles-grid">
          <?php
          foreach ($pageArticles as $a):
            $title = $a['title'] ?? 'Tanpa judul';
            $desc  = $a['description'] ?? '';
            $urlA  = $a['url'] ?? '#';
            $img   = $a['urlToImage'] ?? '';
            $source_name = $a['source']['name'] ?? 'Tidak diketahui';
            $published = $a['publishedAt'] ?? 'now';
            $date_formatted = date('d M Y', strtotime($published));

            // Determine if article is from Kompas
            $isKompas = stripos($urlA, 'kompas.com') !== false;
          ?>
          <article class="news-card" role="article">
            <div class="card-image">
              <?php if ($img): ?>
                <img src="<?= htmlspecialchars($img) ?>" alt="<?= htmlspecialchars($title) ?>" loading="lazy">
                <div class="card-category <?= $isKompas ? 'kompas-badge' : '' ?>">
                  <?= $isKompas ? '🔴 Kompas' : '📰 Berita' ?>
                </div>
              <?php else: ?>
                <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #82A6CB, #3667A6); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">
                  🌤️
                </div>
              <?php endif; ?>
            </div>

            <div class="card-body">
              <h3 class="card-title">
                <a href="<?= htmlspecialchars($urlA) ?>" target="_blank" rel="noopener noreferrer">
                  <?= htmlspecialchars(substr($title, 0, 75) . (strlen($title) > 75 ? '...' : '')) ?>
                </a>
              </h3>
              <p class="card-desc">
                <?= htmlspecialchars(substr($desc, 0, 130) . (strlen($desc) > 130 ? '...' : '')) ?>
              </p>

              <div class="card-meta">
                <span class="card-source"><?= htmlspecialchars(substr($source_name, 0, 22)) ?></span>
                <span class="card-date"><?= htmlspecialchars($date_formatted) ?></span>
              </div>
            </div>
          </article>
          <?php endforeach; ?>
        </div>
      <?php else: ?>
        <div class="alert info">
          <span>ℹ️</span>
          <span>Tidak ada artikel untuk ditampilkan pada halaman ini.</span>
        </div>
      <?php endif; ?>

      <!-- PAGINATION CONTROLS -->
      <?php if ($totalPages > 1): ?>
        <div class="pagination">
          <!-- Previous Button -->
          <?php if ($currentPage > 1): ?>
            <a href="?page=<?= ($currentPage - 1) ?>" class="page-link page-link-nav">← Sebelumnya</a>
          <?php else: ?>
            <span class="page-link page-link-disabled">← Sebelumnya</span>
          <?php endif; ?>

          <!-- Page Numbers -->
          <div class="page-numbers">
            <?php
            $start = max(1, $currentPage - 2);
            $end = min($totalPages, $currentPage + 2);

            if ($start > 1): ?>
              <a href="?page=1" class="page-link">1</a>
              <?php if ($start > 2): ?>
                <span class="page-link page-link-disabled">...</span>
              <?php endif; ?>
            <?php endif; ?>

            <?php for ($i = $start; $i <= $end; $i++): ?>
              <?php if ($i === $currentPage): ?>
                <span class="page-link page-link-active"><?= $i ?></span>
              <?php else: ?>
                <a href="?page=<?= $i ?>" class="page-link"><?= $i ?></a>
              <?php endif; ?>
            <?php endfor; ?>

            <?php if ($end < $totalPages): ?>
              <?php if ($end < $totalPages - 1): ?>
                <span class="page-link page-link-disabled">...</span>
              <?php endif; ?>
              <a href="?page=<?= $totalPages ?>" class="page-link"><?= $totalPages ?></a>
            <?php endif; ?>
          </div>

          <!-- Next Button -->
          <?php if ($currentPage < $totalPages): ?>
            <a href="?page=<?= ($currentPage + 1) ?>" class="page-link page-link-nav">Berikutnya →</a>
          <?php else: ?>
            <span class="page-link page-link-disabled">Berikutnya →</span>
          <?php endif; ?>
        </div>
      <?php endif; ?>
    </section>

    <!-- SIDEBAR -->
    <aside class="sidebar">
      <!-- TRENDING WIDGET -->
      <div class="sidebar-widget">
        <h3 class="widget-title">Trending</h3>
        <ul class="trending-list">
          <?php
          $trendingCount = 0;
          foreach ($articles as $a):
            if ($trendingCount >= 5) break;
            $title = $a['title'] ?? 'Tanpa judul';
            $urlA = $a['url'] ?? '#';
          ?>
          <li class="trending-item">
            <div class="trending-number"><?= ($trendingCount + 1) ?></div>
            <div class="trending-text">
              <a href="<?= htmlspecialchars($urlA) ?>" target="_blank" rel="noopener noreferrer">
                <?= htmlspecialchars(substr($title, 0, 45) . (strlen($title) > 45 ? '...' : '')) ?>
              </a>
            </div>
          </li>
          <?php
          $trendingCount++;
          endforeach;
          ?>
        </ul>
      </div>

      <!-- KATEGORI WIDGET -->
      <div class="sidebar-widget">
        <h3 class="widget-title">Kategori</h3>
        <div class="category-tags">
          <a href="#" class="category-tag">☀️ Cerah</a>
          <a href="#" class="category-tag">🌧️ Hujan</a>
          <a href="#" class="category-tag">⛈️ Badai</a>
          <a href="#" class="category-tag">🌊 Banjir</a>
        </div>
      </div>

      <!-- INFO WIDGET -->
      <div class="sidebar-widget">
        <h3 class="widget-title">Info</h3>
        <p style="font-size: 0.9rem; color: #6b7280; line-height: 1.6;">
          Portal berita cuaca terkini. Cache setiap <strong><?= intval($cacheTtl/60) ?> menit</strong>.
        </p>
        <p style="font-size: 0.85rem; color: #9ca3af; margin-top: 12px;">
          <strong>Total artikel:</strong> <?= $totalArticles ?><br>
          <strong>Sumber:</strong> NewsAPI
        </p>
        <p style="font-size: 0.8rem; color: #d1d5db; margin-top: 12px; line-height: 1.5;">
          <strong>Tips:</strong><br>
          • <code style="background: #f3f4f6; padding: 2px 4px; border-radius: 3px;">?nocache=1</code> bypass cache<br>
          • <code style="background: #f3f4f6; padding: 2px 4px; border-radius: 3px;">?debug=1</code> lihat JSON API
        </p>
      </div>
    </aside>
  </div>
</main>

<!-- FOOTER -->
<footer class="site-footer">
  <div class="footer-content">
    <div class="footer-section">
      <h3>Tentang Kami</h3>
      <p style="font-size: 0.95rem; margin-bottom: 16px;">
        Portal berita cuaca terkini yang menyediakan informasi cuaca dan fenomena alam terbaru dari berbagai sumber terpercaya.
      </p>
      <div class="social-links">
        <a href="#" title="Facebook">f</a>
        <a href="#" title="Twitter">𝕏</a>
        <a href="#" title="Instagram">📷</a>
      </div>
    </div>

    <div class="footer-section">
      <h3>Kategori</h3>
      <ul>
        <li><a href="#">☀️ Cuaca Cerah</a></li>
        <li><a href="#">🌧️ Peringatan Hujan</a></li>
        <li><a href="#">⛈️ Badai & Tornado</a></li>
        <li><a href="#">🌊 Banjir & Longsor</a></li>
        <li><a href="#">🌡️ Prakiraan Cuaca</a></li>
      </ul>
    </div>

    <div class="footer-section">
      <h3>Sumber Data</h3>
      <ul>
        <li><a href="#">NewsAPI</a></li>
        <li><a href="#">BMKG Indonesia</a></li>
        <li><a href="#">Weather.gov (US)</a></li>
        <li><a href="#">OpenWeatherMap</a></li>
      </ul>
    </div>

    <div class="footer-section">
      <h3>Bantuan</h3>
      <ul>
        <li><a href="#">FAQ</a></li>
        <li><a href="#">Hubungi Kami</a></li>
        <li><a href="#">Kebijakan Privasi</a></li>
        <li><a href="#">Syarat & Ketentuan</a></li>
      </ul>
    </div>
  </div>

  <div class="footer-bottom">
    <p>&copy; 2025 Berita Cuaca Kekinian. Semua hak dilindungi.</p>
    <p>Sumber data: NewsAPI • Cache: <?= intval($cacheTtl/60) ?> menit • Diupdate otomatis</p>
  </div>
</footer>

</body>
</html>