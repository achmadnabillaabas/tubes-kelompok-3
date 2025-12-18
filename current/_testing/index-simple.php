<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather App - Test</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div style="padding: 50px; text-align: center; background: #1a1f2e; color: white; min-height: 100vh;">
        <h1>🌤️ Weather App - Test Page</h1>
        <p>If you see this, PHP is working!</p>
        
        <h2>File Check:</h2>
        <div style="text-align: left; max-width: 600px; margin: 20px auto; background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
            <?php
            $files = [
                'css/style.css' => 'CSS File',
                'js/script.js' => 'Main Script',
                'js/analytics.js' => 'Analytics',
                'js/weather-background.js' => 'Background Script',
                'js/weather-loader.js' => 'Loader Script',
                'api/api-weather.php' => 'API Endpoint',
                'assets/bg.jpg' => 'Background Image 1',
                'assets/bg2.jpg' => 'Background Image 2'
            ];
            
            foreach ($files as $file => $name) {
                $exists = file_exists($file);
                $icon = $exists ? '✅' : '❌';
                $color = $exists ? '#4caf50' : '#f44336';
                echo "<div style='margin: 10px 0; color: $color;'>$icon <strong>$name:</strong> $file</div>";
            }
            ?>
        </div>
        
        <h2>Next Steps:</h2>
        <div style="margin: 20px;">
            <?php
            $allExist = true;
            foreach ($files as $file => $name) {
                if (!file_exists($file)) {
                    $allExist = false;
                    break;
                }
            }
            
            if ($allExist) {
                echo '<p style="color: #4caf50; font-size: 18px;">✅ All files found! You can now access:</p>';
                echo '<p><a href="index.php" style="color: #4a9eff; font-size: 20px; text-decoration: none; padding: 10px 20px; background: rgba(74,158,255,0.2); border-radius: 5px; display: inline-block; margin-top: 10px;">Open Weather App</a></p>';
            } else {
                echo '<p style="color: #f44336; font-size: 18px;">❌ Some files are missing!</p>';
                echo '<p>Please check the file structure and make sure all files are in the correct folders.</p>';
                echo '<p><a href="TROUBLESHOOTING.md" style="color: #ff9800;">View Troubleshooting Guide</a></p>';
            }
            ?>
        </div>
        
        <h2>System Info:</h2>
        <div style="text-align: left; max-width: 600px; margin: 20px auto; background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
            <div><strong>PHP Version:</strong> <?php echo phpversion(); ?></div>
            <div><strong>Server:</strong> <?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'; ?></div>
            <div><strong>Document Root:</strong> <?php echo $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown'; ?></div>
            <div><strong>Current Directory:</strong> <?php echo getcwd(); ?></div>
        </div>
        
        <div style="margin-top: 30px;">
            <a href="test.php" style="color: #4a9eff; margin: 0 10px;">Detailed Test</a>
            <a href="TROUBLESHOOTING.md" style="color: #ff9800; margin: 0 10px;">Troubleshooting</a>
            <a href="docs/PROJECT_STRUCTURE.md" style="color: #4caf50; margin: 0 10px;">Project Structure</a>
        </div>
    </div>
</body>
</html>
