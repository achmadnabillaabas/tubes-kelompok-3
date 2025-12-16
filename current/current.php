<?php
// index.php

// Load API key from env file (1.env)
function loadEnvFile($path) {
    $env = [];
    if (!file_exists($path)) return $env;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($k, $v) = explode('=', $line, 2);
        $k = trim($k);
        $v = trim($v);
        // remove surrounding quotes and whitespace
        $v = trim($v, " \t\n\r\0\x0B'\"");
        $env[$k] = $v;
    }
    return $env;
}

$env = loadEnvFile(__DIR__ . '/../1.env');
$apiKey = isset($env['current_api']) ? $env['current_api'] : '';

// Fetch weather data from WeatherAPI
function getWeatherData($query) {
    global $apiKey;
    if (empty($apiKey)) {
        return null; // missing API key
    }
    $url = "https://api.weatherapi.com/v1/forecast.json?key={$apiKey}&q=" . urlencode($query) . "&days=10&aqi=no&alerts=no";

    // Use context to handle SSL
    $context = stream_context_create([
        'http' => [
            'timeout' => 10,
            'ignore_errors' => true
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false
        ]
    ]);

    $response = @file_get_contents($url, false, $context);

    if ($response === false) {
        return null;
    }

    $data = json_decode($response, true);

    // Check if API returned an error
    if (isset($data['error'])) {
        return null;
    }

    return $data;
}

// Default location if geolocation is denied
$defaultLatitude = -6.2088; // Jakarta latitude
$defaultLongitude = 106.8456; // Jakarta longitude

// Check for city search
$searchQuery = null;
if (isset($_GET['city']) && !empty($_GET['city'])) {
    $searchQuery = $_GET['city'];
} elseif (isset($_GET['lat']) && isset($_GET['lon'])) {
    $searchQuery = $_GET['lat'] . ',' . $_GET['lon'];
} else {
    $searchQuery = $defaultLatitude . ',' . $defaultLongitude;
}

$weatherData = getWeatherData($searchQuery);
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
    <meta name="description" content="Aplikasi prakiraan cuaca dengan data real-time">
    <title>Aplikasi Cuaca</title>
    <link rel="stylesheet" href="css/style.css">
    <style>
        /* Loading Screen */
        .loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #1a1f2e;
            background-image: url("assets/bg.jpg");
            background-size: cover;
            background-position: center;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: opacity 0.5s ease, visibility 0.5s ease;
            pointer-events: auto;
        }
        
        .loading-screen.hidden {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }
        
        .loading-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid rgba(255, 255, 255, 0.2);
            border-top-color: #4a9eff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .loading-text {
            color: #ffffff;
            font-size: 18px;
            font-weight: 500;
            text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
        }
    </style>
</head>
<body>
    <!-- Loading Screen -->
    <div id="loadingScreen" class="loading-screen">
        <div class="loading-spinner"></div>
        <div class="loading-text">Memuat data cuaca...</div>
    </div>
    <?php if ($weatherData && isset($weatherData['location'])): 
        // Use location's local time for accurate time display
        $locationTime = isset($weatherData['location']['localtime']) ? strtotime($weatherData['location']['localtime']) : time();
        $currentTime = date('H:i', $locationTime);
        $updateTime = isset($weatherData['current']['last_updated']) ? date('H:i', strtotime($weatherData['current']['last_updated'])) : $currentTime;
        
        // Calculate statistics
        $allTemps = [];
        $allMaxTemps = [];
        $allMinTemps = [];
        if (isset($weatherData['forecast']['forecastday'])) {
            foreach ($weatherData['forecast']['forecastday'] as $day) {
                $allMaxTemps[] = $day['day']['maxtemp_c'];
                $allMinTemps[] = $day['day']['mintemp_c'];
            }
        }
        $avgMaxTemp = count($allMaxTemps) > 0 ? round(array_sum($allMaxTemps) / count($allMaxTemps)) : 0;
        $avgMinTemp = count($allMinTemps) > 0 ? round(array_sum($allMinTemps) / count($allMinTemps)) : 0;
        $maxTemp = count($allMaxTemps) > 0 ? max($allMaxTemps) : 0;
        $minTemp = count($allMinTemps) > 0 ? min($allMinTemps) : 0;
        
        // Prepare all forecast days data for JavaScript
        $allForecastData = [];
        if (isset($weatherData['forecast']['forecastday'])) {
            foreach ($weatherData['forecast']['forecastday'] as $index => $day) {
                $hourlyDataForDay = [];
                if (isset($day['hour'])) {
                    foreach ($day['hour'] as $hour) {
                        $hourlyDataForDay[] = [
                            'time' => date('H:i', strtotime($hour['time'])),
                            'temp' => round($hour['temp_c']),
                            'icon' => $hour['condition']['icon'],
                            'condition' => $hour['condition']['text'],
                            'feelslike' => round($hour['feelslike_c']),
                            'humidity' => $hour['humidity'],
                            'wind_kph' => round($hour['wind_kph']),
                            'pressure_mb' => $hour['pressure_mb'],
                            'chance_of_rain' => $hour['chance_of_rain']
                        ];
                    }
                }
                
                $allForecastData[] = [
                    'date' => $day['date'],
                    'dayName' => date('l', strtotime($day['date'])),
                    'dayShort' => date('D', strtotime($day['date'])),
                    'dayDate' => date('j', strtotime($day['date'])),
                    'maxtemp_c' => round($day['day']['maxtemp_c']),
                    'mintemp_c' => round($day['day']['mintemp_c']),
                    'condition' => $day['day']['condition']['text'],
                    'icon' => $day['day']['condition']['icon'],
                    'avgtemp_c' => round($day['day']['avgtemp_c']),
                    'maxwind_kph' => round($day['day']['maxwind_kph']),
                    'totalprecip_mm' => round($day['day']['totalprecip_mm'], 1),
                    'avgvis_km' => round($day['day']['avgvis_km']),
                    'avghumidity' => $day['day']['avghumidity'],
                    'daily_chance_of_rain' => $day['day']['daily_chance_of_rain'],
                    'daily_chance_of_snow' => $day['day']['daily_chance_of_snow'],
                    'hourly' => $hourlyDataForDay
                ];
            }
        }
        
        // Get hourly data for current day starting from current time
        $currentHour = (int)date('H');
        $currentMinute = (int)date('i');
        $currentTimeStr = date('H:i');
        
        $hourlyData = [];
        if (isset($allForecastData[0]['hourly'])) {
            // Filter hourly data starting from current time
            foreach ($allForecastData[0]['hourly'] as $hour) {
                $hourTime = $hour['time'];
                // Compare time strings (HH:mm format)
                if ($hourTime >= $currentTimeStr) {
                    $hourlyData[] = $hour;
                }
            }
            
            // If not enough hours for today, get from tomorrow
            if (count($hourlyData) < 24 && isset($allForecastData[1]['hourly'])) {
                $remainingHours = 24 - count($hourlyData);
                $tomorrowHours = array_slice($allForecastData[1]['hourly'], 0, $remainingHours);
                $hourlyData = array_merge($hourlyData, $tomorrowHours);
            }
            
            // Limit to 24 hours
            $hourlyData = array_slice($hourlyData, 0, 24);
        }
        
        // Get today's details (sunrise, sunset, UV, visibility, cloud cover)
        $todayForecast = $weatherData['forecast']['forecastday'][0] ?? null;
        $sunrise = $todayForecast ? ($todayForecast['astro']['sunrise'] ?? '06:00') : '06:00';
        $sunset = $todayForecast ? ($todayForecast['astro']['sunset'] ?? '18:00') : '18:00';
        $uvIndex = round($weatherData['current']['uv'] ?? 0);
        $visibility = round($weatherData['current']['vis_km'] ?? 10);
        $cloudCover = $weatherData['current']['cloud'] ?? 0;
        
        // UV Index level
        $uvLevel = 'Rendah';
        if ($uvIndex >= 11) $uvLevel = 'Ekstrem';
        elseif ($uvIndex >= 8) $uvLevel = 'Sangat Tinggi';
        elseif ($uvIndex >= 6) $uvLevel = 'Tinggi';
        elseif ($uvIndex >= 3) $uvLevel = 'Sedang';
    ?>
        <div class="weather-app">
            <div class="main-container">
                <!-- Search Bar -->
                <div class="search-section">
                    <form class="search-form" method="GET" action="">
                        <input type="text" 
                               name="city" 
                               class="search-input" 
                               placeholder="Cari kota (contoh: Jakarta, Bandung, Surabaya)..." 
                               value="<?php echo isset($_GET['city']) ? htmlspecialchars($_GET['city']) : ''; ?>">
                        <button type="submit" class="search-btn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                        </button>
                        <button type="button" class="location-btn" id="useLocationBtn" title="Gunakan Lokasi Saya">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                            </svg>
                            <span>Lokasi Saya</span>
                        </button>
                    </form>
                </div>
                
                <!-- Top Section: Current Weather -->
                <div class="top-section">
                    <div class="location-header">
                        <h1 class="location-name"><?php echo htmlspecialchars($weatherData['location']['name'] ?? 'Unknown'); ?>, <?php echo htmlspecialchars($weatherData['location']['country'] ?? ''); ?></h1>
                    </div>
                    
                    <div class="current-weather-main">
                        <div class="current-temp"><?php echo round($weatherData['current']['temp_c'] ?? 0); ?>°<span class="temp-unit">C</span></div>
                        <div class="current-condition"><?php echo htmlspecialchars($weatherData['current']['condition']['text'] ?? 'N/A'); ?></div>
                        <div class="update-time">Diperbarui pada <?php echo $updateTime; ?></div>
                    </div>
                    
                    <!-- 6 Detail Conditions in Horizontal Row -->
                    <div class="weather-details-row">
                        <div class="detail-box">
                            <span class="detail-label">Terasa Seperti</span>
                            <span class="detail-value"><?php echo round($weatherData['current']['feelslike_c'] ?? 0); ?>°</span>
                        </div>
                        <div class="detail-box">
                            <span class="detail-label">Angin</span>
                            <span class="detail-value"><?php 
                                $windSpeed = round($weatherData['current']['wind_kph'] ?? 0);
                                echo $windSpeed . ' km/j';
                            ?></span>
                        </div>
                        <div class="detail-box">
                            <span class="detail-label">Jarak Pandang</span>
                            <span class="detail-value"><?php echo round(($weatherData['current']['vis_km'] ?? 0)); ?> km</span>
                        </div>
                        <div class="detail-box">
                            <span class="detail-label">Tekanan Udara</span>
                            <span class="detail-value"><?php echo number_format($weatherData['current']['pressure_mb'] ?? 0, 2); ?> mb</span>
                        </div>
                        <div class="detail-box">
                            <span class="detail-label">Kelembaban</span>
                            <span class="detail-value"><?php echo round($weatherData['current']['humidity'] ?? 0); ?>%</span>
                        </div>
                        <div class="detail-box">
                            <span class="detail-label">Titik Embun</span>
                            <span class="detail-value"><?php echo round($weatherData['current']['dewpoint_c'] ?? 0); ?>°</span>
                        </div>
                    </div>
                </div>
                
                <!-- Today's Details Section -->
                <div class="today-details-section">
                    <h2 class="section-title">Detail Hari Ini</h2>
                    <div class="today-details-grid">
                        <div class="today-detail-card" data-detail-type="sunrise-sunset" style="cursor: pointer;">
                            <div class="detail-card-icon sunrise-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="4"></circle>
                                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
                                </svg>
                            </div>
                            <div class="detail-card-title">Matahari Terbit & Terbenam</div>
                            <div class="detail-card-content">
                                <div class="sunrise-sunset-item">
                                    <span class="ss-label">Terbit</span>
                                    <span class="ss-value"><?php echo $sunrise; ?></span>
                                </div>
                                <div class="sunrise-sunset-item">
                                    <span class="ss-label">Terbenam</span>
                                    <span class="ss-value"><?php echo $sunset; ?></span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="today-detail-card" data-detail-type="uv-index" style="cursor: pointer;">
                            <div class="detail-card-icon uv-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="12" r="8" fill="orange"></circle>
                                    <path d="M12 4v8M12 12l-4 4M12 12l4 4" stroke="white" stroke-width="2"></path>
                                </svg>
                            </div>
                            <div class="detail-card-title">Indeks UV</div>
                            <div class="detail-card-content">
                                <div class="uv-value"><?php echo $uvIndex; ?></div>
                                <div class="uv-level"><?php echo $uvLevel; ?></div>
                                <div class="uv-progress">
                                    <div class="uv-progress-bar" style="width: <?php echo min(100, ($uvIndex / 11) * 100); ?>%"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="today-detail-card" data-detail-type="visibility" style="cursor: pointer;">
                            <div class="detail-card-icon visibility-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </div>
                            <div class="detail-card-title">Jarak Pandang</div>
                            <div class="detail-card-content">
                                <div class="visibility-value"><?php echo $visibility; ?> km</div>
                            </div>
                        </div>
                        
                        <div class="today-detail-card" data-detail-type="cloud-cover" style="cursor: pointer;">
                            <div class="detail-card-icon cloud-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.5 10.5c0-2.5-2-4.5-4.5-4.5-1.2 0-2.3.5-3.1 1.3C9.8 6.1 8.2 5 6.5 5 3.5 5 1 7.5 1 10.5c0 .8.2 1.6.5 2.3C.6 13.7 0 14.9 0 16.2c0 2.1 1.7 3.8 3.8 3.8h13.4c2.1 0 3.8-1.7 3.8-3.8 0-1.3-.6-2.5-1.5-3.4.3-.7.5-1.5.5-2.3z" fill="lightblue"/>
                                </svg>
                            </div>
                            <div class="detail-card-title">Tutupan Awan</div>
                            <div class="detail-card-content">
                                <div class="cloud-value"><?php echo $cloudCover; ?>%</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Middle Section: Daily Forecast -->
                <div class="daily-section">
                    <h2 class="section-title">Harian</h2>
                    <div class="forecast-list-horizontal">
                        <?php if (isset($weatherData['forecast']['forecastday']) && is_array($weatherData['forecast']['forecastday'])): ?>
                            <?php foreach ($weatherData['forecast']['forecastday'] as $index => $day): 
                                $dayName = date('D', strtotime($day['date']));
                                $dayDate = date('j', strtotime($day['date']));
                                $isToday = $index === 0;
                            ?>
                                <div class="forecast-day-item <?php echo $isToday ? 'active' : ''; ?>" 
                                     data-day="<?php echo $index; ?>"
                                     data-date="<?php echo $day['date']; ?>">
                                    <div class="day-header">
                                        <span class="day-name"><?php echo $dayName; ?></span>
                                        <span class="day-date"><?php echo $dayDate; ?></span>
                                    </div>
                                    <div class="day-icon-wrapper">
                                        <img src="<?php echo htmlspecialchars($day['day']['condition']['icon'] ?? ''); ?>" 
                                             alt="<?php echo htmlspecialchars($day['day']['condition']['text'] ?? ''); ?>" 
                                             class="day-icon-img"
                                             onerror="this.style.display='none'">
                                    </div>
                                    <div class="day-temps">
                                        <span class="high-temp"><?php echo round($day['day']['maxtemp_c'] ?? 0); ?>°</span>
                                        <span class="temp-dash"> - </span>
                                        <span class="low-temp"><?php echo round($day['day']['mintemp_c'] ?? 0); ?>°</span>
                                    </div>
                                    <div class="day-condition-text"><?php echo htmlspecialchars($day['day']['condition']['text'] ?? ''); ?></div>
                                    <div class="day-rain-chance"><?php echo ($day['day']['daily_chance_of_rain'] ?? 0); ?>%</div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>
                
                <!-- Statistics Section -->
                <div class="statistics-section">
                    <div class="stat-card">
                        <div class="stat-label">Rata-rata Tertinggi</div>
                        <div class="stat-value"><?php echo $avgMaxTemp; ?>°</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Rata-rata Terendah</div>
                        <div class="stat-value"><?php echo $avgMinTemp; ?>°</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Suhu Maksimal</div>
                        <div class="stat-value"><?php echo $maxTemp; ?>°</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Suhu Minimal</div>
                        <div class="stat-value"><?php echo $minTemp; ?>°</div>
                    </div>
                </div>
                
                <!-- Bottom Section: Hourly Forecast with Graph -->
                <div class="hourly-section">
                    <h2 class="section-title">Per Jam</h2>
                    <div class="hourly-container">
                        <div class="hourly-graph-wrapper">
                            <canvas id="hourlyChart" width="800" height="200"></canvas>
                            <div class="hourly-icons">
                                <?php foreach ($hourlyData as $hour): ?>
                                    <div class="hourly-icon-item">
                                        <img src="<?php echo htmlspecialchars($hour['icon']); ?>" 
                                             alt="<?php echo htmlspecialchars($hour['condition']); ?>" 
                                             class="hourly-icon-img"
                                             onerror="this.style.display='none'">
                                        <span class="hourly-time"><?php echo $hour['time']; ?></span>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                        
                        <!-- Hourly Analytics Section -->
                        <div class="hourly-analytics">
                            <h3 class="analytics-title">Analitik Per Jam</h3>
                            <div class="analytics-grid">
                                <!-- Temperature Analytics -->
                                <div class="analytics-card">
                                    <div class="analytics-header">
                                        <div class="analytics-icon temp-icon">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z"></path>
                                            </svg>
                                        </div>
                                        <div class="analytics-label">Suhu</div>
                                    </div>
                                    <div class="analytics-stats" id="tempAnalytics">
                                        <!-- Will be populated by JavaScript -->
                                    </div>
                                    <canvas class="analytics-chart" id="tempChart" width="300" height="80"></canvas>
                                </div>

                                <!-- Humidity Analytics -->
                                <div class="analytics-card">
                                    <div class="analytics-header">
                                        <div class="analytics-icon humidity-icon">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                                            </svg>
                                        </div>
                                        <div class="analytics-label">Kelembaban</div>
                                    </div>
                                    <div class="analytics-stats" id="humidityAnalytics">
                                        <!-- Will be populated by JavaScript -->
                                    </div>
                                    <canvas class="analytics-chart" id="humidityChart" width="300" height="80"></canvas>
                                </div>

                                <!-- Rain Analytics -->
                                <div class="analytics-card">
                                    <div class="analytics-header">
                                        <div class="analytics-icon rain-icon">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M16 13v8M8 13v8M12 15v8"></path>
                                                <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path>
                                            </svg>
                                        </div>
                                        <div class="analytics-label">Hujan</div>
                                    </div>
                                    <div class="analytics-stats" id="rainAnalytics">
                                        <!-- Will be populated by JavaScript -->
                                    </div>
                                    <canvas class="analytics-chart" id="rainChart" width="300" height="80"></canvas>
                                </div>

                                <!-- Cloud Analytics -->
                                <div class="analytics-card">
                                    <div class="analytics-header">
                                        <div class="analytics-icon cloud-icon">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M18.5 10.5c0-2.5-2-4.5-4.5-4.5-1.2 0-2.3.5-3.1 1.3C9.8 6.1 8.2 5 6.5 5 3.5 5 1 7.5 1 10.5c0 .8.2 1.6.5 2.3C.6 13.7 0 14.9 0 16.2c0 2.1 1.7 3.8 3.8 3.8h13.4c2.1 0 3.8-1.7 3.8-3.8 0-1.3-.6-2.5-1.5-3.4.3-.7.5-1.5.5-2.3z" fill="lightblue"/>
                                            </svg>
                                        </div>
                                        <div class="analytics-label">Awan</div>
                                    </div>
                                    <div class="analytics-stats" id="cloudAnalytics">
                                        <!-- Will be populated by JavaScript -->
                                    </div>
                                    <canvas class="analytics-chart" id="cloudChart" width="300" height="80"></canvas>
                                </div>
                            </div>
                        </div>
                        
                        <div class="hourly-buttons">
                            <button class="hourly-btn" id="summaryBtn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                                <span>Ringkasan</span>
                            </button>
                            <button class="hourly-btn" id="detailsBtn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                                <span>Detail</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Daily Forecast Detail Modal -->
        <div id="dayDetailModal" class="modal">
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <div id="modalDayContent">
                    <!-- Content will be loaded dynamically -->
                </div>
            </div>
        </div>
        
        <!-- Hourly Summary Modal -->
        <div id="hourlySummaryModal" class="modal">
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <div id="hourlySummaryContent">
                    <!-- Content will be loaded dynamically -->
                </div>
            </div>
        </div>
        
        <!-- Hourly Details Modal -->
        <div id="hourlyDetailsModal" class="modal">
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <div id="hourlyDetailsContent">
                    <!-- Content will be loaded dynamically -->
                </div>
            </div>
        </div>
        
        <!-- Today's Details Modal -->
        <div id="todayDetailsModal" class="modal">
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <div id="todayDetailsContent">
                    <!-- Content will be loaded dynamically -->
                </div>
            </div>
        </div>
        
        <!-- Pass data to JavaScript -->
        <script>
            window.weatherData = <?php echo json_encode([
                'hourly' => $hourlyData,
                'current' => $weatherData['current'] ?? [],
                'location' => $weatherData['location'] ?? [],
                'forecast' => $allForecastData,
                'searchQuery' => $searchQuery,
                'todayDetails' => [
                    'sunrise' => $sunrise,
                    'sunset' => $sunset,
                    'uvIndex' => $uvIndex,
                    'uvLevel' => $uvLevel,
                    'visibility' => $visibility,
                    'cloudCover' => $cloudCover
                ]
            ]); ?>;
            
            // Store search query for reference
            window.currentSearchQuery = <?php echo json_encode($searchQuery); ?>;
            
            // Log for debugging - all data is from searched city
            console.log('Weather data loaded for:', window.weatherData.location?.name || 'Unknown');
        </script>
    <?php else: ?>
        <div class="error-container">
            <h1>Error Loading Weather Data</h1>
            <div class="error-message">
                <p>Sorry, unable to load weather data at this time.</p>
                <p>Possible causes:</p>
                <ul>
                    <li>API key is invalid or expired</li>
                    <li>Internet connection problem</li>
                    <li>API service is currently unavailable</li>
                </ul>
                <p>Please check your API key at <a href="https://www.weatherapi.com/" target="_blank">WeatherAPI.com</a></p>
            </div>
        </div>
    <?php endif; ?>
    <script src="js/weather-loader.js"></script>
    <script src="js/weather-background.js"></script>
    <script src="js/analytics.js"></script>
    <script src="js/script.js"></script>
    <script>
        // Optimize images loading
        document.addEventListener('DOMContentLoaded', function() {
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                img.loading = 'lazy';
                img.decoding = 'async';
            });
        });

        // Preload critical resources
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = 'style.css';
        document.head.appendChild(link);
    </script>
</body>
</html>
