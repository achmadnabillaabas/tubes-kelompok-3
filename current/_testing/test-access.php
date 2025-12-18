<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Access - Weather App</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 50px;
            text-align: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 30px;
            max-width: 800px;
            margin: 0 auto;
            backdrop-filter: blur(10px);
        }
        h1 { color: #fff; margin-bottom: 30px; }
        .success { color: #4caf50; font-size: 24px; margin: 20px 0; }
        .info-box {
            background: rgba(0, 0, 0, 0.2);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: left;
        }
        .info-box h3 { margin-top: 0; color: #4a9eff; }
        .file-check { margin: 10px 0; }
        .file-check.ok { color: #4caf50; }
        .file-check.error { color: #f44336; }
        .btn {
            display: inline-block;
            padding: 15px 30px;
            margin: 10px;
            background: #4a9eff;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            transition: background 0.3s;
        }
        .btn:hover { background: #357abd; }
        .btn-secondary {
            background: #667eea;
        }
        .btn-secondary:hover { background: #5568d3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>✅ Folder Current Berhasil Diakses!</h1>
        <div class="success">PHP berjalan dengan baik di localhost/tubes-kelompok-3/current/</div>
        
        <div class="info-box">
            <h3>📋 Informasi Sistem</h3>
            <div><strong>PHP Version:</strong> <?php echo phpversion(); ?></div>
            <div><strong>Server:</strong> <?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'; ?></div>
            <div><strong>Document Root:</strong> <?php echo $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown'; ?></div>
            <div><strong>Current Path:</strong> <?php echo getcwd(); ?></div>
            <div><strong>Script Name:</strong> <?php echo $_SERVER['SCRIPT_NAME'] ?? 'Unknown'; ?></div>
        </div>
        
        <div class="info-box">
            <h3>📁 File Structure Check</h3>
            <?php
            $files = [
                'index.php' => 'Main Application',
                'index-simple.php' => 'Simple Test Page',
                'test.php' => 'Detailed Test',
                'css/style.css' => 'CSS Stylesheet',
                'js/script.js' => 'Main JavaScript',
                'js/analytics.js' => 'Analytics Script',
                'js/weather-background.js' => 'Background Script',
                'js/weather-loader.js' => 'Loader Script',
                'api/api-weather.php' => 'Weather API',
                'assets/bg.jpg' => 'Background Image 1',
                'assets/bg2.jpg' => 'Background Image 2',
                '.htaccess' => 'Apache Configuration'
            ];
            
            $allOk = true;
            foreach ($files as $file => $name) {
                $exists = file_exists($file);
                $class = $exists ? 'ok' : 'error';
                $icon = $exists ? '✅' : '❌';
                echo "<div class='file-check $class'>$icon <strong>$name:</strong> $file</div>";
                if (!$exists) $allOk = false;
            }
            ?>
        </div>
        
        <div style="margin-top: 30px;">
            <?php if (file_exists('index.php')): ?>
                <a href="index.php" class="btn">🌤️ Buka Weather App</a>
            <?php endif; ?>
            
            <?php if (file_exists('index-simple.php')): ?>
                <a href="index-simple.php" class="btn btn-secondary">📝 Simple Test Page</a>
            <?php endif; ?>
            
            <?php if (file_exists('test.php')): ?>
                <a href="test.php" class="btn btn-secondary">🔍 Detailed Test</a>
            <?php endif; ?>
        </div>
        
        <div style="margin-top: 30px; font-size: 14px; opacity: 0.8;">
            <p>✅ Folder current sudah dikonfigurasi dengan benar!</p>
            <p>Path: <strong>localhost/tubes-kelompok-3/current/</strong></p>
        </div>
    </div>
</body>
</html>
