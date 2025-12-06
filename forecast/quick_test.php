<?php
// Quick API test
$api_key = 'c13d439e2e38401130ef11ef60a0da86';
$lat = -6.2;
$lon = 106.8;

$url = "https://api.openweathermap.org/data/2.5/weather?lat=$lat&lon=$lon&appid=$api_key&units=metric&lang=id";

echo "<h3>Quick API Test</h3>";
echo "<p>Testing API key: " . substr($api_key, 0, 8) . "...</p>";

$response = @file_get_contents($url);

if ($response) {
    $data = json_decode($response, true);
    if (isset($data['cod']) && $data['cod'] == 200) {
        echo "<p style='color: green;'>✅ API KEY VALID!</p>";
        echo "<p>Lokasi: " . $data['name'] . "</p>";
        echo "<p>Suhu: " . $data['main']['temp'] . "°C</p>";
        echo "<p>Cuaca: " . $data['weather'][0]['description'] . "</p>";
    } else {
        echo "<p style='color: red;'>❌ API Error: " . ($data['message'] ?? 'Unknown') . "</p>";
    }
} else {
    echo "<p style='color: red;'>❌ Connection Error</p>";
}

echo "<hr><a href='index.php'>→ Buka Forecast+</a>";
?>