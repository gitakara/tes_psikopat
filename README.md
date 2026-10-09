# Seberapa Psikopat Kamu? (A Trolley Problem)

Permainan web interaktif berbasis **HTML5 Canvas 2D** dan **Vanilla JavaScript** yang mensimulasikan eksperimen pikiran *Trolley Problem*. Proyek ini dibangun tanpa dependensi pustaka eksternal (*zero-dependency*) untuk memastikan eksekusi grafik yang presisi, performa tinggi, dan waktu muat minimal.

---

## Spesifikasi Teknis & Arsitektur

* **Graphics Rendering Engine (Canvas 2D):**
  * Menggunakan HTML5 Canvas API untuk mengontrol *redrawing* linier pada setiap perubahan *state* dan *frame* animasi.
  * Menerapkan teknik isolasi matriks transform (`ctx.save()` & `ctx.restore()`) serta translasi asal koordinat (`ctx.translate()`) untuk kalkulasi rotasi kereta (`ctx.rotate()`) berbasis radian secara mulus mengikuti kelengkungan jalur belokan.
  * Menggunakan CSS `aspect-ratio` ($750 \times 380$) secara dinamis untuk menjaga proporsi visual dan mencegah distorsi koordinat pada berbagai ukuran layar (*responsive viewport*).

* **Asset Asynchronous Preloading Pattern:**
  * Menerapkan fungsi `preloadImages()` berbasis *Callback Pattern* untuk memastikan seluruh berkas vektor (`.svg`) termuat sempurna di memori browser sebelum fungsi `loadLevel()` dieksekusi, mencegah kegagalan perenderan Canvas (*silent rendering error*).

* **Synthesized Web Audio API:**
  * Efek suara (*SFX*) dihasilkan secara interaktif *on-the-fly* menggunakan `AudioContext`, `OscillatorNode`, dan `GainNode` tanpa bergantung pada berkas audio eksternal.
  * Musik latar (*background music*) menggunakan pengulangan array frekuensi nada (*pitch array*) yang dieksekusi secara periodik untuk menghasilkan nada chiptune 8-bit.
  * Mengimplementasikan pola *lazy-loading audio context* yang aktif saat interaksi pertama pengguna untuk mematuhi *Browser Autoplay Policy*.

* **State & Data Management:**
  * **Level State:** Disimpan dalam array objek JSON lokal yang mendefinisikan deskripsi skenario, kunci aset target, rasio statistik `pullPct`, serta bobot dampak `korbanAtas` & `korbanBawah`.
  * **Accumulated Victim Counter:** Variabel `totalKorban` mencatat akumulasi perhitungan korban berdasarkan keputusan variabel boolean `isLeverPulled` dari tiap tahapan level.

---

## Struktur Repositori

```text
├── index.html            # Core HTML, CSS layout/styling, dan logika utama JavaScript
├── ending2.svg           # Aset grafis layar penutup (End Screen)
├── track.svg             # Vektor lintasan rel utama
├── trolley.svg           # Vektor bus / kereta
└── *.svg                 # Berkas vektor karakter & target objek level
