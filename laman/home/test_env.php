<?php
// Test file untuk memverifikasi loading environment variables
echo "<h2>Test Environment Variables</h2>";

$env = [];
$possible = [
    __DIR__ . '/../../2.env',  // Root directory (2 levels up)
    __DIR__ . '/../2.env',     // One level up
    __DIR__ . '/2.env'         // Current directory
];

echo "<h3>Checking paths:</h3>";
foreach ($possible as $p) {
    echo "<p>Path: $p - ";
    if (file_exists($p)) {
        echo "<strong style='color: green;'>EXISTS</strong>";
        $env = @parse_ini_file($p) ?: [];
        echo " - Loaded successfully";
        break;
    } else {
        echo "<span style='color: red;'>NOT FOUND</span>";
    }
    echo "</p>";
}

echo "<h3>Environment Variables:</h3>";
echo "<pre>";
print_r($env);
echo "</pre>";

$home_api = $env['home_api'] ?? '';
echo "<h3>API Key:</h3>";
echo "<p>home_api = '$home_api'</p>";
echo "<p>Length: " . strlen($home_api) . " characters</p>";

if (strlen($home_api) === 32) {
    echo "<p style='color: green;'><strong>✓ API key length is correct (32 characters)</strong></p>";
} else {
    echo "<p style='color: red;'><strong>✗ API key length is incorrect (should be 32 characters)</strong></p>";
}
?>