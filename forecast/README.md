# Forecast+ Weather System

Sistem perkiraan cuaca berbasis web dengan data real-time dari OpenWeatherMap API.

## 🚀 Fitur

- Cuaca saat ini dengan animasi dinamis
- Prakiraan per jam (24 jam ke depan)
- Prakiraan harian (7 hari ke depan)
- Peta interaktif dengan Leaflet.js
- Grafik tren cuaca dengan Chart.js
- Analitik dan insight otomatis
- Responsive design untuk semua perangkat
- Bahasa Indonesia

## 🛠️ Teknologi

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: PHP (konfigurasi)
- **API**: OpenWeatherMap
- **Libraries**: Chart.js, Leaflet.js
- **Palet Warna**: #BDD8F1, #82A6CB, #3667A6, #214177

## 📋 Struktur File

```
forecast/
├── index.php          # Halaman utama
├── config.php         # Konfigurasi API key
├── css/
│   ├── theme.css      # Variabel warna dan tema
│   └── style.css      # Styling utama
├── js/
│   ├── api.js         # Logika API cuaca
│   ├── ui.js          # Update DOM dan animasi
│   ├── charts.js      # Grafik Chart.js
│   ├── map.js         # Peta Leaflet
│   └── main.js        # Entry point aplikasi
└── img/
    ├── icons/         # Ikon cuaca SVG
    └── bg/            # Background (placeholder)
```

## 🎯 Cara Menggunakan

1. Buka `index.php` di browser
2. Sistem akan menampilkan cuaca real-time Jakarta
3. Gunakan fitur pencarian untuk lokasi lain
4. Klik "Gunakan Lokasi Saya" untuk cuaca lokasi Anda

## 🌐 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📞 Konfigurasi

Edit `config.php` untuk mengubah:
- API key OpenWeatherMap
- Lokasi default
- Units (metric/imperial)
- Bahasa

---

Dibuat untuk Tugas Akhir - Sistem Perkiraan Cuaca Berbasis Web