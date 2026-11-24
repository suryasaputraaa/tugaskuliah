# 🎓 TugasKuliah - Aplikasi Pencatat Tugas & Deadline Mahasiswa (APK / PWA)

Aplikasi pencatat tugas dan deadline khusus mahasiswa dengan antarmuka mobile modern (Material 3), ringan, cepat, dan bekerja 100% offline di HP Android atau Laptop.

---

## 🌟 Fitur Khusus Mahasiswa
1. **Manajemen Mata Kuliah (Matkul)**:
   - Tambah, kelola, dan filter tugas berdasarkan mata kuliahmu (misal: *Basis Data*, *Algoritma*, *Kecerdasan Buatan*, dll.).
2. **Klasifikasi Jenis Tugas**:
   - 📝 Tugas Individu
   - 👥 Tugas Kelompok
   - 🧪 Laporan Praktikum / Lab
   - 💻 Proyek / Tugas Besar Koding
   - 📄 Makalah / Paper
   - 📊 Presentasi PPT
   - 🎯 Kuis / UTS / UAS
3. **Peringatan & Countdown Deadline Otomatis**:
   - Menghitung sisa waktu hingga deadline (*"Sisa 4 jam lagi!"*, *"⏰ Hari Ini!"*, *"⚠️ Terlambat 1 hari"*).
   - Banner peringatan di bagian atas jika ada tugas yang mepet deadline.
4. **Tautan Langsung ke LMS / Google Drive**:
   - Sertakan URL pengumpulan (Google Classroom, Moodle/LMS Kampus, Google Drive, atau GitHub) sehingga bisa dibuka dengan sekali klik dari kartu tugas.
5. **Catatan Dosen & Instruksi**:
   - Kolom nama dosen pengampu dan rincian instruksi (format penamaan file, batas ukuran, font, dsb.).
6. **Statistik Beban Tugas**:
   - Pantau persentase tugas yang sudah terkumpul per semester dan per mata kuliah.
7. **Penyimpanan Lokal & Backup**:
   - Data tersimpan otomatis di perangkat tanpa perlu internet.
   - Fitur Ekspor/Impor JSON untuk mencadangkan data saat ganti HP atau semester baru.
8. **Siap Install di Android (PWA & APK Ready)**:
   - Dilengkapi `manifest.json` dan `sw.js` (Service Worker) untuk dipasang langsung ke layar HP.

---

## 🚀 Cara Menjalankan & Membuka Aplikasi

### 1. Di Laptop / Komputer:
- Buka file [index.html](file:///C:/Users/LENOVO/.gemini/antigravity/scratch/aplikasi-pencatat-tugas/index.html) langsung dengan klik ganda atau klik kanan > **Open with Google Chrome**.

### 2. Install di HP Android (Cara Paling Praktis - Tanpa Compiler):
1. Bagikan folder aplikasi ini ke HP atau buka via hosting gratis (misal: GitHub Pages / Vercel).
2. Buka di **Google Chrome** di HP Android.
3. Ketuk menu tiga titik (⋮) di pojok kanan atas Chrome.
4. Pilih **"Tambahkan ke Layar Utama" (Add to Home screen)** atau klik tombol **"Install Sekarang"** di menu Backup.
5. Ikon **TugasKuliah** akan muncul di menu HP Anda dan langsung berjalan seperti aplikasi APK asli tanpa bilah alamat browser, serta berfungsi penuh secara offline!

---

## 📦 Ingin File Installer `.apk` Murni?

Jika Anda ingin menghasilkan file `.apk` sungguhan untuk dibagikan via WhatsApp:

- **Cara 1 (Online - Sangat Cepat):** 
  Unggah folder ini ke GitHub, lalu masukkan link situsnya ke [PWABuilder.com](https://www.pwabuilder.com/) > Klik **Package for Android** > Unduh file `.apk`.
- **Cara 2 (Capacitor / Android Studio):**
  Jalankan di terminal:
  ```bash
  cd C:\Users\LENOVO\.gemini\antigravity\scratch\aplikasi-pencatat-tugas
  npm init -y
  npm install @capacitor/core @capacitor/cli @capacitor/android
  npx cap init TugasKuliah com.tugaskuliah.app --web-dir .
  npx cap add android
  npx cap open android
  ```
  Lalu di Android Studio pilih **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
