# 🌤️ Weather App - Current Folder

## ✅ Status: SIAP DIGUNAKAN

Aplikasi weather forecast dengan data real-time dari WeatherAPI.

---

## 🚀 Quick Start

### 1. Akses Aplikasi
```
http://localhost/tubes-kelompok-3/current/
```

### 2. Langkah Cepat
1. Pastikan XAMPP Apache running (status hijau)
2. Buka browser
3. Akses URL di atas
4. Selesai!

### 3. Verifikasi (Opsional)
```
http://localhost/tubes-kelompok-3/current/_testing/test-access.php
```

---

## 📁 Struktur Folder

```
current/
├── current.php              # Main weather application
├── .htaccess                # Apache configuration
├── README.md                # This file
│
├── api/
│   └── api-weather.php      # Weather API endpoint
│
├── assets/
│   ├── bg.jpg               # Background images
│   └── bg2.jpg
│
├── css/
│   └── style.css            # Main stylesheet
│
├── js/
│   ├── script.js            # Main JavaScript
│   ├── analytics.js         # Analytics
│   ├── weather-background.js
│   └── weather-loader.js
│
├── docs/                    # Detailed documentation
│
└── _testing/                # Testing files (development only)
    ├── test-access.php      # Access verification
    ├── index-simple.php     # Simple test
    ├── test.php             # Detailed test
    ├── info.php             # PHP info
    └── test-background.html # Background test
```

---

## ✨ Fitur

- 🌤️ Real-time weather data
- 📊 10-day forecast
- 📈 Hourly forecast dengan grafik
- 📍 Geolocation support
- 🔍 City search
- 📱 Responsive design
- 🎨 Dynamic background
- 📊 Weather analytics

---

## ⚠️ Troubleshooting

### Error 404 (Not Found)
**Solusi:**
1. Pastikan folder di: `D:\xampp\htdocs\tubes-kelompok-3\current\`
2. Pastikan Apache running di XAMPP
3. Cek file `current.php` ada

### Error 403 (Forbidden)
**Solusi:**
1. Cek file `.htaccess` ada
2. Restart Apache di XAMPP

### CSS/JS Tidak Load
**Solusi:**
1. Buka browser console (F12)
2. Cek error 404
3. Pastikan path di `.htaccess` benar: `/tubes-kelompok-3/current/`

### Weather Data Tidak Muncul
**Solusi:**
1. Cek koneksi internet
2. Cek API key di `current.php`
3. Lihat browser console untuk error

---

## 🔧 Konfigurasi

### Apache (.htaccess)
```apache
RewriteBase /tubes-kelompok-3/current/
DirectoryIndex current.php index.php index.html
```

### API Configuration
- **Provider:** WeatherAPI.com
- **API Key:** Dikonfigurasi di `current.php`
- **Endpoint:** `https://api.weatherapi.com/v1/forecast.json`

---

## 📚 Dokumentasi Detail

Untuk dokumentasi lengkap, lihat folder `docs/`:
- `PROJECT_STRUCTURE.md` - Struktur proyek detail
- `ANALYTICS_README.md` - Dokumentasi analytics
- `DYNAMIC_BACKGROUND.md` - Dynamic background feature
- Dan lainnya...

---

## 📞 Support

### Jika Ada Masalah:
1. Buka `_testing/test-access.php` untuk cek status file
2. Buka `_testing/info.php` untuk cek konfigurasi PHP
3. Cek browser console (F12) untuk error
4. Cek Apache error log di XAMPP

### File Logs:
- Apache Error: `D:\xampp\apache\logs\error.log`
- Apache Access: `D:\xampp\apache\logs\access.log`

---

## ✅ Che![alt text](image.png)cklist

- [x] XAMPP Apache running
- [x] Folder di path yang benar
- [x] File `.htaccess` ada
- [x] File `current.php` ada
- [x] File CSS/JS ada
- [x] Koneksi internet aktif

---

**Version:** 1.0.0  
**Last Updated:** 2024-12-07  
**Status:** ✅ READY TO USE
