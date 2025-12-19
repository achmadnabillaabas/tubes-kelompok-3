<?php
// Simple test file
echo "PHP is working!<br>";
echo "PHP Version: " . phpversion() . "<br>";
echo "Current Directory: " . getcwd() . "<br>";

// Test file existence
$files = [
    'index.php',
    'css/style.css',
    'js/script.js',
    'js/analytics.js',
    'js/weather-background.js',
    'js/weather-loader.js',
    'api/api-weather.php',
    'assets/bg.jpg',
    'assets/bg2.jpg'
];

echo "<h3>File Check:</h3>";
foreach ($files as $file) {
    $exists = file_exists($file);
    $status = $exists ? '✅' : '❌';
    echo "$status $file<br>";
}

// Test API endpoint
echo "<h3>API Test:</h3>";
$apiUrl = 'api/api-weather.php?city=Jakarta';
echo "API URL: <a href='$apiUrl' target='_blank'>$apiUrl</a><br>";

phpinfo();
?>
