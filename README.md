# GOWES — Papan Gambar Rute Sepeda Indonesia

Hari 25 · 30 Days of Code · 2026-11-03

**Live:** https://kayzenn123.github.io/agent-gowes-v2/
**Konsep satu kalimat:** Situs = satu lembar gambar teknik blueprint raksasa di atas kertas hijau-pucat — kop judul, nomor lembar, skala — berisi petak-petak bento asimetris yang sengaja terpotong, digambar hanya dengan 3 ukuran huruf.

## Fitur
- **Katalog 16 rute** di 12 kota Indonesia: saring (kota/level/permukaan/cari), urut, denah rute per kartu (SVG generatif draw-on), estimasi waktu & kalori per kecepatan
- **Perencana**: input kota + target km + kecepatan → 3 rekomendasi rute + estimasi waktu/kalori/air
- **Log gowes**: catat ride → odometer total km, streak hari, rata-rata; localStorage `gowes-v1`; ekspor JSON/CSV; salin ringkasan WA; hapus 2-langkah
- **Checklist 10 gear** + progress bar, tersimpan lokal
- Deep-link `?rute=<id>` & `?tab=b|c|d`; easter egg: ketik `gaspol`
- Jarak/elevasi/kalori = **estimasi (contoh)**, dilabeli jelas di UI

## Gerak (5 lapis)
A. Parallax 5 lapis + zoom-out di akhir · B. 3 band marquee (skew velocity, tombol jeda) · C. scramble/decode · D. hover kartu → tema Pagi/Siang/Senja seluruh halaman · E. draw-on garis rute. Mode ringan otomatis + toggle GERAK + hormat prefers-reduced-motion.

## Skor
- Lighthouse mobile **90–96/100/100/100**, desktop **89–99/100/100/100** (median ≥90; satu outlier 78 saat VM sibuk)
- qa.js exit 0 (4 viewport, 0 overflow, 0 console issue, tap ≥44px, 1 h1, lang=id); e2e Playwright **18/18**; fps CPU 4x **59.7–60.3**; reduced-motion 0 animasi
- Kontras AA terverifikasi (teks 16.2:1, muted 6.62:1, aksen ≥3.04 untuk teks besar/grafis)

## Tech
0 dependency JS · HTML/CSS/JS vanilla · font self-host woff2 (Zain, Epunda Sans, Aguafina Script — OFL, 145KB) · ikon 100% SVG custom geometris-bulat · tanpa gambar raster · tanpa tracker

## Jalankan lokal
```
cd site && python3 -m http.server 8000
# buka http://localhost:8000/
```

## Seed
Base 2026-12-30 (lolos pick-seed, 22 penolakan): domain jalur sepeda · layout bento asimetris dipotong · ref blueprint arsitek · constraint 3 ukuran font · gerak parallax-5+zoom-out / 3 marquee / scramble / hover-tema / draw-on · ikon geometris bulat custom · font Zain/Epunda Sans/Aguafina Script · palet light/triadic hue 152.
