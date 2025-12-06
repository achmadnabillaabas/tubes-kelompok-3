<?php
// api-weather.php - AJAX endpoint for weather data

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Fetch weather data from WeatherAPI
function getWeatherData($query) {
    $apiKey = 'c24a6aed8c14428ab28115923250612';
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
