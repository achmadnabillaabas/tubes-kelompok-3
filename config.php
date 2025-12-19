<?php
/**
 * Konfigurasi Terpusat untuk Aplikasi Cuaca
 * File ini berisi semua konfigurasi API key dan pengaturan global
 */

// Load all environment files
function loadAllEnvFiles() {
    $config = [];
    
    // Load home API key from 2.env
    $homeEnv = __DIR__ . '/2.env';
    if (file_exists($homeEnv)) {
        $env = @parse_ini_file($homeEnv) ?: [];
        $config['home_api'] = trim($env['home_api'] ?? $env['HOME_API'] ?? '');
    }
    
    // Load current API key from 1.env
    $currentEnv = __DIR__ . '/1.env';
    if (file_exists($currentEnv)) {
        $env = @parse_ini_file($currentEnv) ?: [];
        $config['current_api'] = trim($env['current_api'] ?? '');
    }
    
    // Load forecast API key from laman/forecast/3.env
    $forecastEnv = __DIR__ . '/laman/forecast/3.env';
    if (file_exists($forecastEnv)) {
        $env = @parse_ini_file($forecastEnv) ?: [];
        $config['forecast_api'] = trim($env['API_KEY_FORECAST'] ?? $env['forecast_api'] ?? '');
    }
    
    // Set defaults for empty keys
    foreach ($config as $key => $value) {
        if (empty($value)) {
            $config[$key] = 'DEMO_MODE';
        }
    }
    
    return $config;
}

// Get centralized API configuration
function getApiConfig() {
    static $config = null;
    if ($config === null) {
        $config = loadAllEnvFiles();
    }
    return $config;
}

// Export for JavaScript
function getApiConfigJson() {
    return json_encode(getApiConfig());
}
?>