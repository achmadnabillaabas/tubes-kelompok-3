# Script untuk mengganti terjemahan yang tersisa di script.js
# Jalankan script ini dari folder current/_testing

$scriptPath = "..\js\script.js"

Write-Host "Mengganti terjemahan yang tersisa di script.js..." -ForegroundColor Green

# Baca file
$content = Get-Content $scriptPath -Raw -Encoding UTF8

# Ganti label yang tersisa
$content = $content -replace '<span class="modal-stat-label">Max</span>', '<span class="modal-stat-label">Maks</span>'
$content = $content -replace '<span class="modal-stat-label">Avg</span>', '<span class="modal-stat-label">Rata</span>'

# Simpan file
$content | Set-Content $scriptPath -Encoding UTF8 -NoNewline

Write-Host "Selesai! Semua label sudah diterjemahkan." -ForegroundColor Green
Write-Host ""
Write-Host "Perubahan yang dilakukan:" -ForegroundColor Yellow
Write-Host "- Max → Maks"
Write-Host "- Avg → Rata"
Write-Host ""
Write-Host "Silakan refresh browser untuk melihat perubahan." -ForegroundColor Cyan
