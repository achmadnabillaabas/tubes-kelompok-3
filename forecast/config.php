<?php
/**
 * Konfigurasi Global Sistem Forecast Cuaca
 * File ini berisi konstanta dan variabel untuk API key dan pengaturan default
 */

// API Configuration
define('WEATHER_API_KEY', 'c13d439e2e38401130ef11ef60a0da86');
define('WEATHER_API_BASE_URL', 'https://api.openweathermap.org/data/2.5');
define('WEATHER_API_ONECALL_URL', 'https://api.openweathermap.org/data/3.0/onecall');

// Default Location (Jakarta, Indonesia)
define('DEFAULT_LAT', -6.2);
define('DEFAULT_LON', 106.8);
define('DEFAULT_LOCATION_NAME', 'Jakarta, Indonesia');

// Alternative: Sukorejo, Jawa Timur
// define('DEFAULT_LAT', -7.6845);
// define('DEFAULT_LON', 111.4536);
// define('DEFAULT_LOCATION_NAME', 'Sukorejo, Jawa Timur, Indonesia');

// Units & Language
define('UNITS', 'metric'); // metric = Celsius, imperial = Fahrenheit
define('LANG', 'id'); // Bahasa Indonesia

// Timezone
date_default_timezone_set('Asia/Jakarta');
?>
