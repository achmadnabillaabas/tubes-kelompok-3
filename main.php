<?php
// main.php - Simple router + layout wrapper

// Base URL for absolute asset links (auto-detect or fallback)
$scriptDir = dirname($_SERVER['SCRIPT_NAME']);
if ($scriptDir === '/' || $scriptDir === '\\') {
    $scriptDir = '';
}
$relativePath = rtrim($scriptDir, '/\\') . '/';
// Ensure we have a proper path that starts with /
if ($relativePath === './') {
    $relativePath = '/tubes-kelompok-3/'; // fallback for local development
}
define('BASE_URL', $relativePath);

// Whitelist of pages (key => relative path)
$pages = [
    'home' => 'laman/home/home.php',
    'current' => 'laman/current/current.php',
    'berita-terbaru' => 'laman/berita-terbaru/berita.php'
];

// Detect correct forecast path (may live under laman/forecast or forecast/)
$forecastA = __DIR__ . '/laman/forecast/index.php';
$forecastB = __DIR__ . '/forecast/index.php';
if (file_exists($forecastA)) {
    $pages['forecast'] = 'laman/forecast/index.php';
} elseif (file_exists($forecastB)) {
    $pages['forecast'] = 'forecast/index.php';
} else {
    // fallback to a safe placeholder that will trigger a 404 include later
    $pages['forecast'] = 'forecast/index.php';
}



// Get requested page and validate
$requestPage = isset($_GET['page']) ? trim($_GET['page']) : 'home';
if (!array_key_exists($requestPage, $pages)) {
    $requestPage = 'home';
}

// Resolve include path (prevent directory traversal by using whitelist)
$includePath = $pages[$requestPage];

// Check if current page should be fullscreen
$isFullscreen = ($requestPage === 'current');

// Helper to get nav active state
function navActive($key, $current) {
    return $key === $current ? 'active' : '';
}

// Basic HTML layout
?><!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Aplikasi Cuaca - Simple Router</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <!-- Main app stylesheet -->
    <link rel="stylesheet" href="<?php echo BASE_URL; ?>assets/main.css">

</head>
<body>

<!-- Universal Header -->
<header class="universal-header">
    <div class="header-container">
        <a href="<?php echo BASE_URL; ?>main.php?page=home" class="header-brand">CuacaApp</a>
        <nav class="header-nav">
            <a href="<?php echo BASE_URL; ?>main.php?page=home" class="<?php echo navActive('home', $requestPage); ?>">Home</a>
            <a href="<?php echo BASE_URL; ?>main.php?page=current" class="<?php echo navActive('current', $requestPage); ?>">Current</a>
            <a href="<?php echo BASE_URL; ?>main.php?page=forecast" class="<?php echo navActive('forecast', $requestPage); ?>">Forecast</a>
            <a href="<?php echo BASE_URL; ?>main.php?page=berita-terbaru" class="<?php echo navActive('berita-terbaru', $requestPage); ?>">Berita Terbaru</a>
        </nav>
    </div>
</header>

<?php if (!$isFullscreen): ?><main class="main-content container"><?php else: ?><main class="main-content fullscreen"><?php endif; ?>
    <?php
    // Include the requested page safely. Use include_once as requested.
    $fullPath = __DIR__ . DIRECTORY_SEPARATOR . $includePath;
    if (file_exists($fullPath) && is_readable($fullPath)) {
      // Buffer the included page output so we can rewrite relative asset URLs
      ob_start();
      include $fullPath;
      $pageHtml = ob_get_clean();

      // Compute asset base URL for this included page (e.g. /tubes-kelompok-3/laman/current/)
      $assetBase = rtrim(BASE_URL, '/') . '/' . dirname($includePath) . '/';
      // Normalize any duplicate slashes
      $assetBase = preg_replace('#/+#', '/', $assetBase);

      // Replace relative asset references (href/src) that start with css/, js/, assets/, img/, icons/
      $pageHtml = preg_replace_callback(
        '/(href|src)\s*=\s*("|\')(?!https?:|\/)(css|js|assets|img|images|icons|fonts)\/([^"\']*)\2/i',
        function($m) use ($assetBase) {
          $attr = $m[1];
          $quote = $m[2];
          $folder = $m[3];
          $rest = $m[4];
          $new = $attr . '=' . $quote . $assetBase . $folder . '/' . $rest . $quote;
          return $new;
        },
        $pageHtml
      );

      // Also rewrite generic relative paths (e.g. "style.css", "./script.js", "../img.png")
      // Skip absolute paths, anchors, query-strings, and URI schemes like mailto:, tel:, javascript:
      $pageHtml = preg_replace_callback(
        '/(href|src)\s*=\s*("|\')(?!https?:|\/|#|\?|mailto:|tel:|javascript:)([^"\']+?)\2/i',
        function($m) use ($assetBase) {
          $attr = $m[1];
          $quote = $m[2];
          $path = $m[3];

          // Skip if already processed by first regex (contains assetBase)
          if (strpos($path, $assetBase) === 0) {
            return $m[0];
          }

          // Normalize ./ prefix (optional)
          if (strpos($path, './') === 0) {
            $path = substr($path, 2);
          }

          // Do not alter protocol-relative or already absolute paths (defensive)
          if (preg_match('#^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|//)#', $path)) {
            return $m[0];
          }

          $new = $attr . '=' . $quote . $assetBase . $path . $quote;
          return $new;
        },
        $pageHtml
      );

      // Safety: neutralize obviously placeholder API keys (keep real keys untouched)
      // Remove aggressive replacement for `window.HOME_API_KEY` so valid keys from server pass through.

      // Replace only clearly placeholder apiKey values in JS config objects, e.g. '' or 'YOUR_KEY' or 'REPLACE_ME'
      $pageHtml = preg_replace_callback("/apiKey\s*:\s*('|\")(.*?)\1/", function($m){
        $raw = trim($m[2]);
        $placeholders = ['YOUR_KEY', 'REPLACE_ME', 'API_KEY', '', 'DEMOMODE', 'DEMO_MODE', 'INVALID'];
        foreach ($placeholders as $ph) {
          if (strcasecmp($raw, $ph) === 0) {
            return "apiKey: 'DEMO_MODE'";
          }
        }
        // If empty after trimming, neutralize
        if ($raw === '') return "apiKey: 'DEMO_MODE'";
        // Otherwise keep the original (do not attempt to validate length/form)
        return $m[0];
      }, $pageHtml);

      // Inject a small guard script after <body> to block OpenWeatherMap calls when no valid API key
      $guardJs = <<<'JS'
<script>(function(){
  try{
    const BLOCK_HOST = 'api.openweathermap.org';
    function isBlockedUrl(u){
      try{ const url = new URL(u, location.href); return url.hostname.indexOf(BLOCK_HOST) !== -1; }catch(e){ return false; }
    }

    // Guard fetch
    const _fetch = window.fetch;
    window.fetch = function(input, init){
      try{
        const url = (typeof input === 'string') ? input : (input && input.url) || '';
        if (isBlockedUrl(url)){
          const key = String(window.HOME_API_KEY || (window.CONFIG && window.CONFIG.apiKey) || '');
          if (!key || key === 'DEMO_MODE' || key.length < 10 || /^\d+$/.test(key)){
            console.warn('main.php: blocked OpenWeatherMap fetch (invalid API key):', url);
            return Promise.reject(new Error('OpenWeatherMap requests blocked (no valid API key)'));
          }
        }
      }catch(e){/* ignore */}
      return _fetch.apply(this, arguments);
    };

    // Guard XHR
    const _open = XMLHttpRequest.prototype.open;
    const _send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url){
      this.__owm_url = url;
      return _open.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function(body){
      try{
        if (this.__owm_url && isBlockedUrl(this.__owm_url)){
          const key = String(window.HOME_API_KEY || (window.CONFIG && window.CONFIG.apiKey) || '');
          if (!key || key === 'DEMO_MODE' || key.length < 10 || /^\d+$/.test(key)){
            console.warn('main.php: blocked OpenWeatherMap XHR (invalid API key):', this.__owm_url);
            // Fire onerror/onload handlers gracefully without sending network
            if (typeof this.onerror === 'function'){
              try{ this.onerror(new Error('OpenWeatherMap requests blocked')); }catch(e){}
            }
            if (typeof this.onload === 'function'){
              try{ this.onload(); }catch(e){}
            }
            return;
          }
        }
      }catch(e){/* ignore */}
      return _send.apply(this, arguments);
    };
  }catch(e){console.warn('main.php guard init failed', e);} })();</script>
JS;

      // Fix any relative navigation links in the included page to use main.php
      $pageHtml = preg_replace_callback(
        '/href\s*=\s*("|\')(\?page=[^"\']*)\1/i',
        function($m) {
          $quote = $m[1];
          $query = $m[2];
          return 'href=' . $quote . BASE_URL . 'main.php' . $query . $quote;
        },
        $pageHtml
      );

      // Fix CSS url() references in inline styles only
      $pageHtml = preg_replace_callback(
        '/url\s*\(\s*["\']?(?!https?:|\/|data:)([^"\')\s]+)["\']?\s*\)/i',
        function($m) use ($assetBase) {
          $path = $m[1];
          // Skip if already absolute
          if (strpos($path, 'http') === 0 || strpos($path, '/') === 0) {
            return $m[0];
          }

          // Handle relative paths like "../assets/bg.jpg"
          if (strpos($path, '../') === 0) {
            // Remove ../ and use assetBase directly
            $path = substr($path, 3);
          }

          return 'url("' . $assetBase . $path . '")';
        },
        $pageHtml
      );

      // Fix JavaScript image path references
      $pageHtml = preg_replace_callback(
        '/(["\'])(?!https?:|\/|data:|#)([^"\']*\.(jpg|jpeg|png|gif|svg|webp|ico))["\']/',
        function($m) use ($assetBase) {
          $quote = $m[1];
          $path = $m[2];

          // Skip if already absolute or contains variables
          if (strpos($path, 'http') === 0 || strpos($path, '/') === 0 || strpos($path, '$') !== false || strpos($path, '{') !== false) {
            return $m[0];
          }

          // Handle common image paths
          if (strpos($path, 'img/') === 0 || strpos($path, 'assets/') === 0 || strpos($path, '../') === 0) {
            if (strpos($path, '../') === 0) {
              $path = substr($path, 3);
            }
            return $quote . $assetBase . $path . $quote;
          }

          return $m[0];
        },
        $pageHtml
      );

      // Add CSS variable for background images to override external CSS
      if (strpos($includePath, 'laman/current/current.php') !== false) {
        $bgPath = $assetBase . 'assets/bg.jpg';
        $cssOverride = '<style>
          :root { --bg-image: url("' . $bgPath . '"); }
          .weather-app {
            background-image: var(--bg-image) !important;
            min-height: 100vh !important;
            margin: 0 !important;
            padding: 20px !important;
            padding-top: 100px !important;
          }
          .modal { background-image: var(--bg-image) !important; }
          .universal-header {
            background: rgba(26, 31, 46, 0.8) !important;
          }
        </style>';
        $pageHtml = preg_replace('#</head>#i', $cssOverride . '</head>', $pageHtml, 1);
      }

      // Insert guard script right after opening <body> tag so it runs before page scripts
      $pageHtml = preg_replace('#(<body[^>]*>)#i', "$1" . $guardJs, $pageHtml, 1);

      // Inject BASE_URL and page info to JavaScript for all pages
      $jsConfig = '<script>
        window.BASE_URL = "' . addslashes(BASE_URL) . '";
        window.CURRENT_PAGE = "' . addslashes($requestPage) . '";
        window.ASSET_BASE = "' . addslashes($assetBase) . '";
        console.log("BASE_URL:", window.BASE_URL);
        console.log("CURRENT_PAGE:", window.CURRENT_PAGE);
        console.log("ASSET_BASE:", window.ASSET_BASE);

        // Fix relative API calls in JavaScript
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
          if (typeof input === "string" && !input.startsWith("http") && !input.startsWith("/")) {
            // Convert relative API paths to absolute
            if (input.startsWith("api/")) {
              input = window.ASSET_BASE + input;
              console.log("Fixed API path:", input);
            }
          }
          return originalFetch.call(this, input, init);
        };

        // Helper function to fix image paths in JavaScript
        window.fixImagePath = function(relativePath) {
          if (!relativePath || relativePath.startsWith("http") || relativePath.startsWith("/")) {
            return relativePath;
          }
          return window.ASSET_BASE + relativePath;
        };

        // Helper function to get asset path
        window.getAssetPath = function(assetPath) {
          return window.ASSET_BASE + assetPath;
        };
      </script>';
      $pageHtml = preg_replace('#(<body[^>]*>)#i', "$1" . $jsConfig, $pageHtml, 1);

      // Load centralized API configuration
      require_once __DIR__ . '/config.php';
      $apiConfig = getApiConfig();

      // Inject centralized API config
      $apiConfigJs = '<script>
        window.API_CONFIG = ' . json_encode($apiConfig) . ';
        // Backward compatibility
        window.HOME_API_KEY = window.API_CONFIG.home_api || "DEMO_MODE";
        console.log("API Config loaded:", window.API_CONFIG);
      </script>';
      $pageHtml = preg_replace("#</body>#i", $apiConfigJs . "</body>", $pageHtml, 1);

      // Replace any existing HOME_API_KEY assignments
      $pageHtml = preg_replace("/window\.HOME_API_KEY\s*=\s*('|\").*?\1\s*;?/s", "", $pageHtml);

      // Output modified page HTML
      echo $pageHtml;
    } else {
      // Simple 404 message inside layout
      http_response_code(404);
      ?>
      <div class="py-5 text-center">
        <h1>404 — Halaman tidak ditemukan</h1>
        <p class="lead">Halaman yang diminta tidak tersedia. <a href="<?php echo BASE_URL; ?>main.php?page=home">Kembali ke beranda</a></p>
        <p class="text-muted">Terlampir path: <code><?php echo htmlspecialchars($includePath); ?></code></p>
      </div>
      <?php
    }
    ?>
<?php if (!$isFullscreen): ?></main>

<footer class="text-center">
  <div class="container">
    <small>© <?php echo date('Y'); ?> — Aplikasi Cuaca. Semua hak dilindungi.</small>
  </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script><?php else: ?></main><?php endif; ?>
<!-- Main app script -->
<script src="<?php echo BASE_URL; ?>assets/main.js"></script>
</body>
</html>