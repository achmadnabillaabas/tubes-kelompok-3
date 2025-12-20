<?php
/**
 * Konfigurasi Global Sistem Forecast Cuaca
 * File ini berisi konstanta dan variabel untuk API key dan pengaturan default
 * MENGGUNAKAN 3.env DENGAN API_KEY_FORECAST
 */

// Load environment variables from 3.env file
function loadEnvFile($filePath) {
    if (!file_exists($filePath)) {
        return false;
    }
    
    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue; // Skip comments
        }
        
        if (strpos($line, '=') === false) {
            continue; // Skip lines without =
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        if (!array_key_exists($name, $_ENV)) {
            $_ENV[$name] = $value;
        }
    }
    return true;
}

// Load ONLY 3.env file (prioritas utama untuk forecast)
$envLoaded = loadEnvFile('3.env');

if (!$envLoaded) {
    error_log("❌ File 3.env tidak ditemukan! Menggunakan fallback values.");
}

// API Configuration - WAJIB menggunakan API_KEY_FORECAST dari 3.env
$apiKey = isset($_ENV['API_KEY_FORECAST']) ? $_ENV['API_KEY_FORECAST'] : '78ba052a799565572ea0ca34a380c266';

// Pastikan tidak menggunakan DEMO_MODE
if ($apiKey === 'DEMO_MODE') {
    error_log("⚠️ DEMO_MODE terdeteksi, menggunakan API key real dari 3.env");
    $apiKey = '78ba052a799565572ea0ca34a380c266';
}

define('WEATHER_API_KEY', $apiKey);
define('WEATHER_API_BASE_URL', 'https://api.openweathermap.org/data/2.5');
define('WEATHER_API_ONECALL_URL', 'https://api.openweathermap.org/data/3.0/onecall');

// Default Location - Gunakan dari 3.env
define('DEFAULT_LAT', isset($_ENV['DEFAULT_LAT']) ? floatval($_ENV['DEFAULT_LAT']) : -7.8167);
define('DEFAULT_LON', isset($_ENV['DEFAULT_LON']) ? floatval($_ENV['DEFAULT_LON']) : 112.0167);
define('DEFAULT_LOCATION_NAME', isset($_ENV['DEFAULT_LOCATION_NAME']) ? $_ENV['DEFAULT_LOCATION_NAME'] : 'Kediri, Indonesia');

// Units & Language - Gunakan dari 3.env
define('UNITS', isset($_ENV['UNITS']) ? $_ENV['UNITS'] : 'metric');
define('LANG', isset($_ENV['LANG']) ? $_ENV['LANG'] : 'id');

// Timezone
date_default_timezone_set('Asia/Jakarta');

// Log configuration untuk debugging
error_log("🔧 Forecast Config Loaded dari 3.env:");
error_log("   API Key: " . substr(WEATHER_API_KEY, 0, 10) . '...' . substr(WEATHER_API_KEY, -4));
error_log("   Location: " . DEFAULT_LOCATION_NAME . " (" . DEFAULT_LAT . ", " . DEFAULT_LON . ")");
error_log("   Units: " . UNITS . ", Lang: " . LANG);
?>
