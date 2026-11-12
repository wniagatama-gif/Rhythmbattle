# ISSUE 004: NOTE DENSITY & CHART BALANCING

**Project:** Modern Rhythm Battle  
**Phase:** 2 - Rhythm Engine  
**Priority:** High  
**Status:** To Do  
**Type:** Gameplay Balancing & Chart Improvement

---

## 1. OBJECTIVE

Perbaiki kepadatan dan distribusi directional notes pada gameplay Modern Rhythm Battle.

Implementasi chart saat ini menghasilkan terlalu banyak note panah (← ↓ ↑ →) dalam waktu berdekatan sehingga pemain kesulitan membaca pola, mengikuti irama lagu, dan menentukan input yang tepat.

Tujuan utama issue ini adalah menghasilkan chart yang lebih nyaman dimainkan, memiliki pola ritme yang jelas, dan tingkat kesulitan yang meningkat secara bertahap.

Fokus pengerjaan adalah chart design, note distribution, dan gameplay readability.

Jangan mengubah desain UI yang sudah diselesaikan pada ISSUE 003.

## 2. PROJECT INSPECTION

Sebelum melakukan perubahan:

1. Periksa seluruh chart yang saat ini digunakan.
2. Identifikasi sumber note yang terlalu rapat.
3. Periksa distribusi timeMs setiap note.
4. Periksa BPM dan offset lagu.
5. Periksa apakah chart dibuat secara manual atau dihasilkan melalui generator.
6. Periksa apakah setiap difficulty menggunakan chart yang berbeda.

Jangan langsung mengubah kecepatan note atau memperlambat lagu sebelum mengetahui penyebab kepadatan.

## 3. DIFFICULTY SYSTEM

Siapkan distribusi note berdasarkan empat tingkat kesulitan.

### EASY

Karakteristik:
- Note relatif renggang.
- Utamakan satu note pada satu waktu.
- Pola sederhana dan mudah dipelajari.
- Minim kombinasi note.
- Jeda cukup panjang di antara pola.

### NORMAL

Karakteristik:
- Target rata-rata sekitar 1-2 note per detik.
- Usahakan jarak antar-note minimal 250 ms.
- Gunakan kombinasi lane secara bertahap.
- Hindari spam note berulang.
- Chord atau beberapa note bersamaan hanya digunakan sesekali jika sesuai musik.

### HARD

Karakteristik:
- Kepadatan lebih tinggi dibanding Normal.
- Gunakan variasi arah dan kombinasi.
- Perkenalkan pola note beruntun.
- Gunakan variasi ritme yang lebih kompleks.
- Hindari spam yang tidak memiliki pola musikal.

### EXPERT

Karakteristik:
- Pola cepat dan kompleks diperbolehkan.
- Variasi ritme lebih menantang.
- Kombinasi note lebih intens.
- Tetap harus mengikuti struktur musik.
- Tidak boleh sekadar memperbanyak note secara acak.

Angka kepadatan dan jarak di atas merupakan target awal balancing, bukan aturan mutlak yang menghilangkan kebutuhan mengikuti musik.

## 4. CHART DESIGN RULES

Terapkan prinsip berikut:

1. Note harus mengikuti beat dan subdivision lagu.
2. Jangan menempatkan note secara acak.
3. Hindari terlalu banyak note berurutan pada satu lane.
4. Hindari pola yang memaksa pemain menekan tombol terlalu cepat secara terus-menerus.
5. Gunakan variasi arah LEFT, DOWN, UP, RIGHT secara seimbang.
6. Sisipkan jeda pada bagian musik yang sesuai.
7. Buat pola yang mudah dikenali dan dipelajari.
8. Kepadatan note harus meningkat sesuai difficulty.
9. Jangan mengubah BPM atau mempercepat lagu untuk mengatasi kepadatan.
10. Jangan mengubah judgment window untuk menutupi masalah chart.
11. Jangan menghilangkan note penting yang menjadi bagian dari ritme musik.

## 5. NOTE SPACING & DISTRIBUTION

Periksa distribusi `timeMs` pada seluruh chart.

Identifikasi:

- Note yang memiliki jarak terlalu dekat.
- Note yang bertumpuk pada waktu yang sama.
- Pola yang terlalu sering berulang.
- Bagian lagu dengan kepadatan tidak wajar.
- Distribusi note yang tidak sesuai beat.
- Bagian lagu yang terlalu padat tanpa jeda.

Lakukan perbaikan pada data chart yang menjadi penyebab masalah.

Jangan menggunakan pembatasan jumlah note saat runtime yang menyebabkan note terlewat atau tidak sesuai audio.

Jangan sekadar menghapus note secara acak untuk mengurangi kepadatan. Susun ulang pola berdasarkan ritme dan struktur musik.

## 6. VISUAL NOTE READABILITY

Periksa kembali kecepatan dan keterbacaan note.

Ketentuan:

- Note terlihat jelas sebelum mencapai receptor.
- Jarak visual antar-note cukup untuk dibaca.
- Note tidak saling menutupi.
- Hold note mudah dibedakan dari tap note.
- Note tidak keluar dari area permainan.
- Kecepatan visual konsisten.
- Penyesuaian kecepatan visual tidak boleh mengubah waktu judgment.

Pastikan pemain mempunyai waktu yang cukup untuk mengenali arah note berikutnya.

## 7. CHART VALIDATION

Tambahkan atau tingkatkan validasi chart untuk memeriksa:

- Urutan waktu note.
- Distribusi jarak antar-note.
- Note yang bertumpuk.
- Jumlah note per interval waktu.
- Konsistensi BPM.
- Konsistensi offset.
- Note yang berada di luar durasi lagu.
- Validitas lane.
- Validitas hold duration.

Buat laporan atau peringatan untuk pola yang terlalu padat.

Jangan otomatis menolak semua chord atau note bersamaan karena pola tersebut tetap dapat digunakan jika memang sesuai dengan musik.

## 8. MAPPING COMPATIBILITY

Pertahankan mapping yang telah diselesaikan pada ISSUE 003.

Urutan lane tetap:

**LEFT → DOWN → UP → RIGHT**

| Lane Index | Direction | Keyboard |
|---|---|---|
| 0 | LEFT | ArrowLeft |
| 1 | DOWN | ArrowDown |
| 2 | UP | ArrowUp |
| 3 | RIGHT | ArrowRight |

Jangan mengubah keyboard mapping, visual receptor, atau identitas lane.

## 9. TECHNICAL REQUIREMENTS

1. Pertahankan Rhythm Engine yang sudah ada.
2. Pertahankan Audio Clock.
3. Pertahankan Web Audio API.
4. Pertahankan format chart yang sudah tersedia.
5. Jangan mengubah judgment window.
6. Jangan mengubah formula score.
7. Jangan mengubah formula accuracy.
8. Jangan mengubah sistem combo.
9. Jangan mengubah desain UI ISSUE 003.
10. Jangan menambahkan sistem multiplayer.
11. Jangan membuat sistem damage atau special attack.
12. Jangan menghilangkan fitur yang sudah berfungsi.

Jika perlu membuat chart baru, simpan terpisah berdasarkan song dan difficulty.

## 10. TESTING

Uji seluruh difficulty.

### Easy
- Pastikan nyaman untuk pemain pemula.
- Pastikan pola note mudah dibaca.
- Pastikan terdapat jeda yang cukup.

### Normal
- Pastikan kepadatan note lebih terkontrol.
- Pastikan tidak terjadi spam berlebihan.
- Pastikan pemain dapat mengikuti irama tanpa kesulitan yang tidak wajar.

### Hard
- Pastikan tingkat kesulitan lebih tinggi dari Normal.
- Pastikan variasi note lebih kompleks.
- Pastikan pola tetap musikal.

### Expert
- Pastikan memiliki tantangan tertinggi.
- Pastikan pola cepat tetap terbaca.
- Pastikan tidak sekadar berisi note acak.

Lakukan pengujian gameplay dari awal sampai lagu selesai.

## 11. ACCEPTANCE CRITERIA

- [ ] Chart telah diaudit.
- [ ] Penyebab kepadatan note telah diidentifikasi.
- [ ] Distribusi note Easy lebih renggang.
- [ ] Distribusi note Normal lebih nyaman.
- [ ] Hard memiliki tingkat kesulitan lebih tinggi.
- [ ] Expert memiliki pola paling kompleks.
- [ ] Tidak ada spam note yang tidak diperlukan.
- [ ] Note mengikuti beat dan struktur musik.
- [ ] Terdapat jeda pada bagian musik yang sesuai.
- [ ] Tidak ada note hilang akibat pembatasan runtime.
- [ ] Tidak ada note dinilai dua kali.
- [ ] Hold note tetap berfungsi.
- [ ] Audio dan chart tetap sinkron.
- [ ] Judgment tetap akurat.
- [ ] Score, combo, dan accuracy tetap benar.
- [ ] Seluruh difficulty dapat dimainkan sampai selesai.
- [ ] Tidak merusak ISSUE 002 dan ISSUE 003.

## 12. FINAL REPORT

Setelah implementasi selesai, laporkan:

1. Chart yang diperiksa dan diperbaiki.
2. Penyebab kepadatan note.
3. Perubahan distribusi note setiap difficulty.
4. Perubahan jumlah note jika ada.
5. Perbandingan kepadatan sebelum dan sesudah.
6. Hasil pengujian gameplay.
7. Hasil validasi chart.
8. Konfirmasi audio dan note tetap sinkron.
9. Kendala yang ditemukan.
10. Screenshot gameplay setelah balancing.

**DEFINITION OF DONE:**

Modern Rhythm Battle memiliki chart dengan distribusi note yang teratur, mudah dibaca, mengikuti irama musik, dan memiliki peningkatan kesulitan yang jelas dari Easy hingga Expert tanpa merusak sistem Rhythm Engine maupun UI yang sudah selesai.