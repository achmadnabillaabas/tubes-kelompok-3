<?php require_once 'config.php'; ?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forecast+ — Sistem Perkiraan Cuaca</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/theme.css">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <!-- HEADER / NAVBAR -->
    <header class="navbar" id="navbar">
        <div class="navbar-container">
            <div class="navbar-brand">
                <h1>Forecast+</h1>
                <p class="navbar-subtitle">Sistem Perkiraan Cuaca Real-Time</p>
            </div>
            
            <nav class="navbar-menu">
                <a href="#hero" class="nav-link active">Beranda</a>
                <a href="#hourly" class="nav-link">Per Jam</a>
                <a href="#daily" class="nav-link">10 Hari</a>
                <a href="#map" class="nav-link">Peta & Radar</a>
                <a href="#analytics" class="nav-link">Analitik</a>
                <a href="#tips" class="nav-link">Tips & Info</a>
                <a href="#about" class="nav-link">Tentang Sistem</a>
            </nav>
            
            <div class="navbar-controls">
                <div class="search-box">
                    <input type="text" id="searchInput" placeholder="Cari lokasi...">
                    <button id="searchBtn" class="btn-search">Cari</button>
                </div>
                <button id="useLocationBtn" class="btn-location">📍 Gunakan Lokasi Saya</button>
                <div class="unit-toggle">
                    <button id="unitToggle" class="btn-unit">°C</button>
                </div>
            </div>
        </div>
    </header>

    <!-- SECTION 1: HERO - CUACA SAAT INI -->
    <section id="hero" class="hero-section">
        <div class="hero-background" id="heroBackground"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
            <div class="location-info">
                <h2 id="locationName">Memuat lokasi...</h2>
                <p id="lastUpdated">Diperbarui: --:--</p>
            </div>
            
            <div class="current-weather">
                <div class="temp-main">
                    <span id="currentTemp" class="temperature">--</span>
                    <span class="temp-unit">°C</span>
                </div>
                <div class="weather-icon-main">
                    <img id="weatherIcon" src="" alt="Weather Icon">
                </div>
            </div>
            
            <div class="weather-description">
                <p id="weatherDesc" class="desc-main">--</p>
                <p id="feelsLike" class="feels-like">Terasa seperti --°C</p>
                <p id="weatherSummary" class="summary">Memuat data cuaca...</p>
            </div>
            
            <div class="mini-stats">
                <div class="stat-card">
                    <div class="stat-icon">💧</div>
                    <div class="stat-info">
                        <span class="stat-label">Kelembapan</span>
                        <span id="humidity" class="stat-value">--%</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💨</div>
                    <div class="stat-info">
                        <span class="stat-label">Angin</span>
                        <span id="wind" class="stat-value">-- m/s</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🌡️</div>
                    <div class="stat-info">
                        <span class="stat-label">Tekanan</span>
                        <span id="pressure" class="stat-value">-- hPa</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">☁️</div>
                    <div class="stat-info">
                        <span class="stat-label">Awan</span>
                        <span id="clouds" class="stat-value">--%</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 2: DETAIL HARI INI -->
    <section id="today-details" class="section today-details">
        <div class="container">
            <h2 class="section-title">Detail Hari Ini</h2>
            <div class="details-grid">
                <div class="detail-card">
                    <div class="card-icon">🌅</div>
                    <h3>Matahari Terbit & Terbenam</h3>
                    <div class="sun-times">
                        <div class="sun-time">
                            <span class="label">Terbit</span>
                            <span id="sunrise" class="time">--:--</span>
                        </div>
                        <div class="sun-time">
                            <span class="label">Terbenam</span>
                            <span id="sunset" class="time">--:--</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-card">
                    <div class="card-icon">☀️</div>
                    <h3>Indeks UV</h3>
                    <div class="uv-info">
                        <span id="uvValue" class="uv-value">--</span>
                        <span id="uvLevel" class="uv-level">--</span>
                        <div class="uv-bar">
                            <div id="uvProgress" class="uv-progress"></div>
                        </div>
                    </div>
                </div>
                
                <div class="detail-card">
                    <div class="card-icon">👁️</div>
                    <h3>Jarak Pandang</h3>
                    <div class="visibility-info">
                        <span id="visibility" class="visibility-value">-- km</span>
                    </div>
                </div>
                
                <div class="detail-card">
                    <div class="card-icon">☁️</div>
                    <h3>Tutupan Awan</h3>
                    <div class="cloud-info">
                        <span id="cloudCover" class="cloud-value">--%</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 3: PRAKIRAAN PER JAM -->
    <section id="hourly" class="section hourly-forecast">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Prakiraan Per Jam</h2>
                <div class="view-controls">
                    <button id="viewCards" class="view-btn active">Kartu</button>
                    <button id="viewChart" class="view-btn">Grafik</button>
                </div>
            </div>
            
            <div id="hourlyCards" class="hourly-cards-container">
                <button class="slider-arrow left" id="hourlyPrev">‹</button>
                <div class="hourly-cards" id="hourlyCardsWrapper">
                    <!-- Cards will be inserted by JS -->
                </div>
                <button class="slider-arrow right" id="hourlyNext">›</button>
            </div>
            
            <div id="hourlyChart" class="hourly-chart-container" style="display: none;">
                <canvas id="hourlyChartCanvas"></canvas>
            </div>
        </div>
    </section>

    <!-- SECTION 4: PRAKIRAAN 7-10 HARI -->
    <section id="daily" class="section daily-forecast">
        <div class="container">
            <h2 class="section-title">Prakiraan 7–10 Hari ke Depan</h2>
            <div class="daily-list" id="dailyList">
                <!-- Daily cards will be inserted by JS -->
            </div>
        </div>
    </section>

    <!-- SECTION 5: PETA & RADAR -->
    <section id="map" class="section map-section">
        <div class="container">
            <h2 class="section-title">Peta & Radar</h2>
            <div class="map-container">
                <div class="map-controls">
                    <h3>Layer Peta</h3>
                    <label><input type="checkbox" id="layerRain"> Radar Hujan</label>
                    <label><input type="checkbox" id="layerClouds"> Awan</label>
                    <label><input type="checkbox" id="layerTemp"> Suhu</label>
                    <button id="centerMapBtn" class="btn-center-map">📍 Pusat ke Lokasi Saya</button>
                </div>
                <div id="weatherMap" class="weather-map"></div>
            </div>
        </div>
    </section>

    <!-- SECTION 6: ANALITIK & TREN -->
    <section id="analytics" class="section analytics-section">
        <div class="container">
            <h2 class="section-title">Analitik & Tren Cuaca</h2>
            <div class="analytics-grid">
                <div class="chart-container">
                    <h3>Tren Suhu 7 Hari</h3>
                    <canvas id="tempTrendChart"></canvas>
                </div>
                <div class="chart-container">
                    <h3>Tren Kelembapan</h3>
                    <canvas id="humidityTrendChart"></canvas>
                </div>
            </div>
            <div class="insights-box" id="insightsBox">
                <h3>💡 Insight Otomatis</h3>
                <div id="insightsContent">
                    <p>Memuat analisis...</p>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 7: TIPS & INFO -->
    <section id="tips" class="section tips-section">
        <div class="container">
            <h2 class="section-title">Tips & Info Cuaca</h2>
            <div class="tips-grid">
                <div class="tip-card">
                    <div class="tip-icon">🚗</div>
                    <h3>Berkendara Saat Hujan</h3>
                    <p>Kurangi kecepatan, nyalakan lampu, dan jaga jarak aman. Hindari genangan air yang dalam.</p>
                </div>
                <div class="tip-card">
                    <div class="tip-icon">🌡️</div>
                    <h3>Cuaca Panas</h3>
                    <p>Minum air yang cukup, gunakan tabir surya, dan hindari aktivitas berat di luar ruangan saat siang hari.</p>
                </div>
                <div class="tip-card">
                    <div class="tip-icon">☀️</div>
                    <h3>Indeks UV Tinggi</h3>
                    <p>Gunakan kacamata hitam, topi, dan pakaian pelindung. Batasi paparan sinar matahari langsung.</p>
                </div>
                <div class="tip-card">
                    <div class="tip-icon">⛈️</div>
                    <h3>Cuaca Ekstrem</h3>
                    <p>Tetap di dalam ruangan saat badai. Hindari pohon tinggi dan area terbuka saat ada petir.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 8: TENTANG SISTEM -->
    <section id="about" class="section about-section">
        <div class="container">
            <h2 class="section-title">Tentang Sistem Forecast+</h2>
            <div class="about-content">
                <div class="about-box">
                    <h3>Teknologi</h3>
                    <p>Sistem Forecast+ menggunakan API cuaca dari <strong>OpenWeatherMap</strong> untuk menyediakan data cuaca real-time yang akurat dan terpercaya.</p>
                    <ul>
                        <li>Current Weather: Data cuaca saat ini</li>
                        <li>Hourly Forecast: Prakiraan per jam hingga 48 jam</li>
                        <li>Daily Forecast: Prakiraan harian hingga 7-10 hari</li>
                    </ul>
                </div>
                
                <div class="about-box">
                    <h3>Fitur Unggulan</h3>
                    <ul>
                        <li>Background dinamis yang berubah sesuai kondisi cuaca (Clear, Clouds, Rain, Thunderstorm, Night)</li>
                        <li>Visualisasi data dengan grafik interaktif menggunakan Chart.js</li>
                        <li>Peta interaktif dengan Leaflet.js</li>
                        <li>Animasi smooth dan responsif untuk semua perangkat</li>
                    </ul>
                </div>
                
                <div class="about-box">
                    <h3>Arsitektur</h3>
                    <p><strong>Frontend:</strong> HTML5, CSS3, JavaScript (Vanilla)</p>
                    <p><strong>Backend:</strong> PHP (untuk konfigurasi)</p>
                    <p><strong>Libraries:</strong> Chart.js, Leaflet.js</p>
                </div>
                
                <div class="about-box developer-info">
                    <h3>Informasi Pengembang</h3>
                    <p><strong>Nama:</strong> [Nama Anda]</p>
                    <p><strong>Judul Tugas Akhir:</strong> Sistem Perkiraan Cuaca Berbasis Web</p>
                    <p><strong>Institusi:</strong> [Nama Institusi]</p>
                </div>
            </div>
        </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 Forecast+. All rights reserved.</p>
            <p>Data cuaca disediakan oleh <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap</a></p>
        </div>
    </footer>

    <!-- Loading Overlay -->
    <div id="loadingOverlay" class="loading-overlay">
        <div class="spinner"></div>
        <p>Memuat data cuaca...</p>
    </div>

    <!-- Demo Mode Notice -->
    <?php if (WEATHER_API_KEY === 'DEMO_MODE'): ?>
    <div id="demoNotice" style="position: fixed; top: 70px; left: 50%; transform: translateX(-50%); background: #ff9800; color: white; padding: 10px 20px; border-radius: 5px; z-index: 10000; font-size: 14px;">
        🔧 Mode Demo - Data simulasi | <a href="GET_API_KEY.md" target="_blank" style="color: white; text-decoration: underline;">Cara dapatkan API key</a>
    </div>
    <?php endif; ?>

    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    
    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    
    <!-- Custom JS -->
    <script>
        // Pass PHP config to JavaScript
        const CONFIG = {
            apiKey: '<?php echo WEATHER_API_KEY; ?>',
            baseUrl: '<?php echo WEATHER_API_BASE_URL; ?>',
            oneCallUrl: '<?php echo WEATHER_API_ONECALL_URL; ?>',
            defaultLat: <?php echo DEFAULT_LAT; ?>,
            defaultLon: <?php echo DEFAULT_LON; ?>,
            defaultLocation: '<?php echo DEFAULT_LOCATION_NAME; ?>',
            units: '<?php echo UNITS; ?>',
            lang: '<?php echo LANG; ?>'
        };
        
        console.log('CONFIG loaded:', CONFIG);
    </script>
    <script src="js/api.js"></script>
    <script src="js/ui.js"></script>
    <script src="js/charts.js"></script>
    <script src="js/map.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
