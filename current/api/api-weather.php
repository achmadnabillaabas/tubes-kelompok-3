<?php
// api-weather.php - AJAX endpoint for weather data

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Load simple key=value env file into an associative array
function loadEnvFile($path) {
    if (!file_exists($path)) {
        return [];
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $vars = [];

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) {
            continue;
        }
        if (strpos($line, '=') === false) {
            continue;
        }
        list($key, $val) = explode('=', $line, 2);
        $key = trim($key);
        $val = trim($val);
        if ($val !== '' && (($val[0] === '"' && substr($val, -1) === '"') || ($val[0] === "'" && substr($val, -1) === "'"))) {
            $val = substr($val, 1, -1);
        }
        $vars[$key] = $val;
    }

    return $vars;
}

// Fetch weather data from WeatherAPI
function getWeatherData($query) {
    $envPath = dirname(__DIR__, 2) . '/1.env';
    $env = loadEnvFile($envPath);
    $apiKey = $env['current_api'] ?? $env['CURRENT_API'] ?? null;

    if (empty($apiKey)) {
        return [
            'success' => false,
            'error' => 'API key not configured'
        ];
    }

    $url = "https://api.weatherapi.com/v1/forecast.json?key={$apiKey}&q=" . urlencode($query) . "&days=10&aqi=no&alerts=no";

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
        return [
            'success' => false,
            'error' => 'Unable to connect to weather service'
        ];
    }
    
    $data = json_decode($response, true);
    
    if (isset($data['error'])) {
        return [
            'success' => false,
            'error' => $data['error']['message'] ?? 'Unknown error'
        ];
    }
    
    return [
        'success' => true,
        'data' => $data
    ];
}

// Get query parameter
$query = null;

if (isset($_GET['city']) && !empty($_GET['city'])) {
    $query = $_GET['city'];
} elseif (isset($_GET['lat']) && isset($_GET['lon'])) {
    $query = $_GET['lat'] . ',' . $_GET['lon'];
} else {
    echo json_encode([
        'success' => false,
        'error' => 'No location specified'
    ]);
    exit;
}

// Fetch and return weather data
$result = getWeatherData($query);
echo json_encode($result);
?>
