<?php
$env = [];
$possible = [
    __DIR__ . '/../2.env',
    __DIR__ . '/2.env'
];
foreach ($possible as $p) {
    if (file_exists($p)) {
        $env = @parse_ini_file($p) ?: [];
        break;
    }
}
$home_api = $env['home_api'] ?? '';
?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WeatherApp - Cek Cuaca Real-time</title>

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/style.css">
</head>

<body>
    <!-- Hero Section -->
    <div class="hero-section">
        <!-- Theme Toggle Switch -->
        <div class="theme-switch-wrapper">
            <label class="theme-switch" for="themeCheckbox">
                <input type="checkbox" id="themeCheckbox" />
                <div class="slider">
                    <i class="bi bi-sun-fill sun-icon"></i>
                    <i class="bi bi-moon-stars-fill moon-icon"></i>
                </div>
            </label>
        </div>

        <div class="container">
            <h1><span class="emoji-3d">⛅</span> Selamat Datang di WeatherApp</h1>
            <p>Cek kondisi cuaca dan prakiraan 5 hari ke depan untuk kota mana pun!</p>
            <div>
                <a href="current.php" class="btn btn-custom">
                    <span class="emoji-3d">🔍</span> Lihat Cuaca Sekarang
                </a>
                <a href="forecast.php" class="btn btn-custom">
                    <span class="emoji-3d">📅</span> Prakiraan 5 Hari
                </a>
            </div>
        </div>
    </div>

    <div class="container">
        <!-- Search Section -->
        <div class="search-section">
            <h3 class="text-center"><span class="emoji-3d">📍</span> Cari Cuaca Kota</h3>
            <form id="weatherForm">
                <div class="mb-3">
                    <input type="text" class="form-control" id="cityInput"
                        placeholder="Masukkan nama kota (contoh: Jakarta, Kediri, Bandung)" required>
                    <small class="text-muted">
                        <span class="emoji-3d">💡</span> Tips: Gunakan format NamaKota,KodeNegara untuk hasil akurat
                        (contoh: Bandung,ID)
                    </small>
                </div>
                <div class="row mb-3">
                    <div class="col-md-6">
                        <select class="form-control" id="unitSelect">
                            <option value="metric">Celsius (°C)</option>
                            <option value="imperial">Fahrenheit (°F)</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <button type="submit" class="btn btn-search w-100">
                            <span class="emoji-3d">🔍</span> Cari Cuaca
                        </button>
                    </div>
                </div>
            </form>

            <div class="loading">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Mengambil data cuaca...</p>
            </div>

            <div class="weather-result" id="weatherResult"></div>
        </div>

        <!-- Popular Cities Section with Carousel -->
        <div class="my-5">
            <h2 class="section-title"><span class="emoji-3d">⭐</span> Cuaca Ibukota Provinsi Indonesia</h2>
            <div id="carouselCities" class="carousel slide" data-bs-ride="carousel" data-bs-interval="4000">
                <div class="carousel-inner" id="popularCities">
                    <div class="carousel-item active">
                        <div class="row">
                            <div class="col-12">
                                <div class="city-loading">
                                    <div class="spinner-border text-primary" role="status"></div>
                                    <p class="mt-3">Memuat data cuaca dari 34 ibukota provinsi...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="carousel-control-prev" type="button" data-bs-target="#carouselCities"
                    data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#carouselCities"
                    data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                </button>
            </div>
        </div>

        <!-- Features Section -->
        <div class="my-5">
            <h2 class="section-title"><span class="emoji-3d">⚡</span> Fitur Unggulan Aplikasi</h2>
            <div class="row">
                <div class="col-md-3 mb-4">
                    <div class="feature-card">
                        <span class="emoji-3d feature-emoji">⚡</span>
                        <h5>Data Real-time</h5>
                        <p>Cuaca langsung dari OpenWeatherMap API</p>
                    </div>
                </div>
                <div class="col-md-3 mb-4">
                    <div class="feature-card">
                        <span class="emoji-3d feature-emoji">🌍</span>
                        <h5>Cakupan Global</h5>
                        <p>Bisa cek kota di seluruh dunia</p>
                    </div>
                </div>
                <div class="col-md-3 mb-4">
                    <div class="feature-card">
                        <span class="emoji-3d feature-emoji">📊</span>
                        <h5>Prakiraan Detail</h5>
                        <p>Per jam & per hari hingga 5 hari</p>
                    </div>
                </div>
                <div class="col-md-3 mb-4">
                    <div class="feature-card">
                        <span class="emoji-3d feature-emoji">📱</span>
                        <h5>Responsif</h5>
                        <p>Bisa diakses di HP maupun laptop</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Testimonials Section -->
        <div class="my-5">
            <h2 class="section-title"><span class="emoji-3d">💬</span> Testimoni Pengguna</h2>

            <!-- Form Testimoni -->
            <div class="testimonial-form-card mb-4">
                <h4><span class="emoji-3d">✍️</span> Tulis Testimoni Anda</h4>
                <form id="testimonialForm">
                    <div class="mb-3">
                        <input type="text" class="form-control" id="testimonialName" placeholder="Nama Anda" required
                            maxlength="50">
                    </div>
                    <div class="mb-3">
                        <input type="text" class="form-control" id="testimonialCity" placeholder="Kota Anda" required
                            maxlength="50">
                    </div>
                    <div class="mb-3">
                        <textarea class="form-control" id="testimonialMessage" rows="3"
                            placeholder="Tulis testimoni Anda di sini..." required maxlength="200"></textarea>
                        <small class="text-muted"><span id="charCount">0</span>/200 karakter</small>
                    </div>
                    <button type="submit" class="btn btn-search">
                        <span class="emoji-3d">📝</span> Kirim Testimoni
                    </button>
                </form>
            </div>

            <!-- Testimoni List -->
            <div class="row" id="testimonialList">
                <div class="col-md-6">
                    <div class="testimonial-card">
                        <div class="quote">
                            "Sangat membantu sebelum berangkat kerja! Saya jadi tahu kapan harus bawa payung."
                        </div>
                        <div class="author">
                            <span class="emoji-3d">👤</span> Anin, Kediri
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="testimonial-card">
                        <div class="quote">
                            "Aplikasinya ringan dan tampilannya bagus banget. Mudah digunakan!"
                        </div>
                        <div class="author">
                            <span class="emoji-3d">👤</span> Leo, Kediri
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Tips Section -->
    <div class="tips-section">
        <div class="container">
            <h2 class="text-center mb-4"><span class="emoji-3d">💡</span> Tips & Fakta Cuaca</h2>
            <div class="row">
                <div class="col-md-4">
                    <div class="tip-card">
                        <h5><span class="emoji-3d">☂️</span> Tips Hujan</h5>
                        <p>Bawa payung saat kelembapan di atas 80%!</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="tip-card">
                        <h5><span class="emoji-3d">🌡️</span> Fakta Suhu</h5>
                        <p>Suhu rata-rata Jakarta meningkat 0,3°C per dekade.</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="tip-card">
                        <h5><span class="emoji-3d">💨</span> Info Angin</h5>
                        <p>Angin di atas 10 m/s biasanya terasa seperti badai ringan.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="text-center py-4" style="background-color: var(--color-4); color: white;">
        <p class="mb-0">&copy; 2024 WeatherApp. Powered by OpenWeatherMap API</p>
    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Inject API key from server (2.env) into client JS -->
    <script>
    window.HOME_API_KEY = '<?php echo addslashes($home_api); ?>';
    </script>
    <!-- Custom JS -->
    <script src="js/weather.js"></script>
</body>

</html>