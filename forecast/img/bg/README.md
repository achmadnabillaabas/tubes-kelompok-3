# Background Images

Folder ini berisi file GIF untuk background dinamis hero section.

## File yang Diperlukan:

1. **sunny.gif** - Background untuk cuaca cerah
2. **cloudy.gif** - Background untuk cuaca berawan
3. **rainy.gif** - Background untuk cuaca hujan
4. **storm.gif** - Background untuk badai/hujan lebat
5. **night.gif** - Background untuk malam hari

## Sumber Rekomendasi:

Anda dapat mencari GIF animasi cuaca dari:
- [Giphy](https://giphy.com/) - Cari: "weather sunny", "rain animation", "storm", dll
- [Tenor](https://tenor.com/)
- Buat sendiri menggunakan tools seperti Adobe After Effects atau Canva

## Spesifikasi:

- Format: GIF atau MP4 (convert ke GIF)
- Resolusi: Minimal 1920x1080px
- Ukuran file: Maksimal 5MB per file (untuk performa optimal)
- Style: Pilih yang smooth dan tidak terlalu ramai agar teks tetap terbaca

## Cara Menambahkan:

1. Download atau buat GIF sesuai kondisi cuaca
2. Rename file sesuai nama di atas
3. Letakkan di folder ini (`forecast/img/bg/`)
4. Background akan otomatis berubah sesuai kondisi cuaca

## Placeholder Sementara:

Jika belum ada GIF, sistem akan menggunakan gradient warna sebagai fallback.
Anda bisa menambahkan CSS gradient di `css/style.css` pada class `.hero-background`.

## Tips:

- Gunakan GIF dengan loop seamless untuk transisi yang halus
- Pastikan GIF tidak terlalu terang agar overlay gradient berfungsi dengan baik
- Test di berbagai ukuran layar untuk memastikan responsivitas
