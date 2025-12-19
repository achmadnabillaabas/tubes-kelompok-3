<?php
/**
 * Konfigurasi Global Sistem Forecast Cuaca
 * File ini berisi konstanta dan variabel untuk API key dan pengaturan default
 * API Key dibaca dari file 3.env untuk keamanan
 */

// Load environment variables from 3.env file
function loadEnv($path) {
    if (!file_exists($path)) {
        die('Error: 3.env file not found. Please create 3.env file with API_KEY_FORECAST.');
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        // Parse KEY=VALUE
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Set as environment variable
            putenv("$key=$value");
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
}

// Load 3.env file
loadEnv(__DIR__ . '/3.env');

// Debug: Check if API key is loaded
$apiKey = getenv('API_KEY_FORECAST');
if (!$apiKey || empty($apiKey)) {
    error_log('WARNING: API_KEY_FORECAST not found in 3.env file');
    $apiKey = 'DEMO_MODE';
}

// API Configuration - Read from environment variable
define('WEATHER_API_KEY', $apiKey);
define('WEATHER_API_BASE_URL', 'https://api.openweathermap.org/data/2.5');
define('WEATHER_API_ONECALL_URL', 'https://api.openweathermap.org/data/3.0/onecall');

// Default Location - Read from environment variable
define('DEFAULT_LAT', (float)(getenv('DEFAULT_LAT') ?: -7.8167));
define('DEFAULT_LON', (float)(getenv('DEFAULT_LON') ?: 112.0167));
define('DEFAULT_LOCATION_NAME', getenv('DEFAULT_LOCATION_NAME') ?: 'Kediri, Indonesia');

// Units & Language - Read from environment variable
define('UNITS', getenv('UNITS') ?: 'metric'); // metric = Celsius, imperial = Fahrenheit
define('LANG', getenv('LANG') ?: 'id'); // Bahasa Indonesia

// Timezone
date_default_timezone_set('Asia/Jakarta');
?>
