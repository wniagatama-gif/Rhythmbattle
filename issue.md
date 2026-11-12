# ISSUE 003: GAMEPLAY UI REDESIGN & LANE MAPPING CORRECTION

**Project:** Modern Rhythm Battle  
**Phase:** 2 - Rhythm Engine  
**Priority:** High  
**Type:** UI/UX Redesign + Gameplay Input Correction  
**Reference:** Friday Night Funkin (FNF) Modern

---

## 1. OBJECTIVE

Lakukan redesign menyeluruh terhadap tampilan gameplay Modern Rhythm Battle sekaligus memperbaiki urutan lane dan keyboard mapping.

Implementasi saat ini masih terlihat seperti rhythm game prototype generik. Area permainan terlalu kecil, banyak ruang kosong, tidak memiliki karakter, tidak memiliki arena, dan HUD belum memiliki identitas visual yang kuat.

Selain itu, urutan lane dan keyboard mapping belum sesuai dengan konfigurasi yang ditentukan.

Tujuan pengerjaan:

1. Menghadirkan pengalaman visual yang terinspirasi Friday Night Funkin dengan identitas Modern Rhythm Battle sendiri.
2. Membuat arena permainan yang lebih luas dan menarik.
3. Menampilkan karakter pemain dan lawan.
4. Mendesain ulang HUD, note, receptor, dan feedback visual.
5. Memperbaiki urutan lane menjadi LEFT → DOWN → UP → RIGHT.
6. Memastikan keyboard input sesuai dengan posisi lane.
7. Mempertahankan seluruh gameplay logic dari ISSUE 002.

**PENTING:** Jangan membangun ulang Rhythm Engine. Pertahankan seluruh sistem yang sudah berfungsi dan fokus pada redesign serta koreksi mapping.

## 2. PROJECT INSPECTION

Sebelum melakukan perubahan:

1. Periksa struktur proyek hasil Phase 1 dan Phase 2.
2. Identifikasi seluruh komponen gameplay yang sudah tersedia.
3. Periksa implementasi note rendering dan lane mapping.
4. Periksa keyboard input handler.
5. Periksa chart loader dan format data chart.
6. Periksa sistem audio dan game session.
7. Identifikasi komponen yang dapat digunakan kembali.

Jangan membuat komponen atau sistem baru yang menduplikasi implementasi yang sudah ada.

Ikuti struktur aktual repository.

## 3. VISUAL DIRECTION

Gunakan konsep:

**Modern FNF-Inspired Rhythm Battle**

Karakteristik desain:

- Modern arcade rhythm game.
- Stylized cartoon visual.
- Dynamic stage presentation.
- Expressive character animation.
- Bold typography.
- Colorful directional notes.
- High contrast HUD.
- Smooth visual feedback.
- Professional game interface.

Inspirasi mekanik dan presentasi berasal dari Friday Night Funkin, tetapi desain karakter, arena, efek, dan identitas visual harus orisinal.

Hindari tampilan seperti:

- Dashboard admin.
- Website statistik.
- Minimalist data visualization.
- Game typing racer.
- Roblox-style generic interface.
- Prototype dengan lane kecil di tengah dan ruang kosong berlebihan.

## 4. GAMEPLAY VIEWPORT

Gameplay harus menggunakan hampir seluruh area browser.

Ketentuan:

- Gunakan viewport-based layout.
- Hilangkan footer website ketika gameplay berlangsung.
- Hilangkan scrollbar yang tidak diperlukan.
- Hindari ruang kosong berlebihan.
- Jangan membatasi arena hanya pada kolom kecil di tengah.
- Pastikan elemen permainan proporsional pada resolusi desktop.
- Pastikan area note mudah terlihat.

Gameplay harus terasa seperti layar permainan penuh, bukan halaman website yang kebetulan memiliki game di tengahnya.

## 5. BATTLE STAGE

Buat panggung permainan dengan perspektif side-view.

### Player Side

- Berada di bagian kiri.
- Memiliki karakter pemain.
- Karakter menghadap ke kanan.
- Menampilkan identitas pemain.

### Opponent Side

- Berada di bagian kanan.
- Memiliki karakter lawan.
- Karakter menghadap ke kiri.
- Menampilkan identitas lawan.

### Rhythm Lane

- Berada di area tengah sebagai fokus permainan.
- Memiliki empat lane.
- Lane cukup besar agar note mudah dikenali.
- Receptor berada pada posisi konsisten.
- Animasi note tidak boleh mengganggu visibilitas karakter.

Untuk sementara, karakter dapat menggunakan placeholder artwork yang dirancang khusus.

Siapkan struktur komponen agar model 3D GLB dapat diintegrasikan pada tahap berikutnya.

Jangan menggunakan emoji sebagai aset utama karakter.

## 6. FINAL LANE ORDER & KEYBOARD MAPPING

<IMPORTANT>

Urutan lane dari kiri ke kanan wajib:

**LEFT → DOWN → UP → RIGHT**

Ini adalah konfigurasi final Modern Rhythm Battle.

Jangan menggunakan urutan LEFT → RIGHT → UP → DOWN atau urutan lainnya.

</IMPORTANT>

Gunakan konfigurasi berikut:

| Lane Index | Direction | Keyboard | Color |
|---|---|---|---|
| 0 | LEFT (←) | ArrowLeft | Red / Pink |
| 1 | DOWN (↓) | ArrowDown | Blue / Cyan |
| 2 | UP (↑) | ArrowUp | Yellow / Orange |
| 3 | RIGHT (→) | ArrowRight | Purple |

Urutan visual:

```text
┌────────┬────────┬────────┬────────┐
│   ←    │   ↓    │   ↑    │   →    │
│  LEFT  │  DOWN  │   UP   │ RIGHT  │
└────────┴────────┴────────┴────────┘
```

Mapping keyboard:

```text
ArrowLeft  → LEFT
ArrowDown  → DOWN
ArrowUp    → UP
ArrowRight → RIGHT
```

Persyaratan:

1. ArrowLeft hanya mengaktifkan lane LEFT.
2. ArrowDown hanya mengaktifkan lane DOWN.
3. ArrowUp hanya mengaktifkan lane UP.
4. ArrowRight hanya mengaktifkan lane RIGHT.
5. Tidak boleh ada pertukaran fungsi tombol.
6. Setiap input hanya boleh mengaktifkan lane yang sesuai.
7. Mapping visual dan fungsional harus menggunakan konfigurasi yang sama.
8. Hindari mendefinisikan mapping terpisah di berbagai komponen.

Jika tersedia konfigurasi lane terpusat, gunakan dan perbarui konfigurasi tersebut.

Jika belum tersedia, buat satu konfigurasi terpusat yang menjadi sumber utama untuk UI dan input handler.

## 7. CHART COMPATIBILITY

Periksa sistem chart yang sudah tersedia.

Lane identifier tetap menggunakan:

- left
- down
- up
- right

Jika chart menggunakan index numerik, pastikan index mengikuti urutan final:

- 0 = left
- 1 = down
- 2 = up
- 3 = right

Jangan mengubah:

- Song ID.
- Chart ID.
- Note ID.
- BPM.
- Offset.
- Timing note.
- Note duration.
- Judgment window.
- Formula score.
- Formula accuracy.

Chart yang sudah ada harus tetap kompatibel.

Jika ditemukan ketidaksesuaian antara chart dan lane mapping, lakukan penyesuaian dengan mempertahankan waktu dan identitas note.

## 8. NOTE LANE REDESIGN

Tingkatkan tampilan visual empat lane:

- LEFT.
- DOWN.
- UP.
- RIGHT.

Ketentuan:

- Gunakan directional arrow yang jelas.
- Gunakan warna berbeda untuk setiap lane.
- Receptor terlihat jelas.
- Note terlihat menonjol dari background.
- Tambahkan efek hit ketika pemain berhasil menekan note.
- Tambahkan efek miss yang berbeda.
- Hold note memiliki kepala note dan sustain body.
- Note tidak terpotong atau tertutup elemen UI.
- Posisi note selalu sesuai dengan lane chart.

Urutan receptor harus sama dengan urutan note lane:

LEFT → DOWN → UP → RIGHT.

Semua posisi note wajib tetap mengikuti timeline Rhythm Engine.

## 9. HEALTH BAR

Tambahkan battle health bar pada bagian atas.

Ketentuan:

- Merepresentasikan kondisi kedua pemain.
- Gunakan identitas visual berbeda untuk kedua sisi.
- Tampilkan ikon atau avatar pemain pada kedua ujung.
- Perubahan HP memiliki animasi transisi.
- Siapkan komponen agar dapat menerima nilai HP dari Combat System pada Phase 3.

Untuk tahap ini gunakan nilai visual sementara jika Combat System belum tersedia.

Nilai placeholder tidak boleh mengubah score atau logic Rhythm Engine.

## 10. HUD REDESIGN

Tampilkan informasi permainan secara terintegrasi:

- Player name.
- Opponent name.
- Song title.
- Difficulty.
- BPM.
- Song progress.
- Score.
- Accuracy.
- Current combo.
- Max combo.
- Judgment feedback.

Jangan membuat setiap informasi menjadi kotak kecil terpisah yang memenuhi layar.

Gunakan hierarki visual yang jelas.

Score dan combo harus mudah terbaca selama permainan.

## 11. HIT FEEDBACK

Buat feedback judgment yang lebih ekspresif:

- SICK.
- GOOD.
- BAD.
- SHIT.
- MISS.

Ketentuan:

- Muncul dekat area rhythm lane.
- Memiliki animasi singkat.
- Warna dan tipografi mudah dibedakan.
- Tidak menghalangi note berikutnya.
- Combo memiliki visual feedback ketika meningkat.
- Hindari animasi terlalu besar yang mengganggu permainan.

## 12. CHARACTER PRESENTATION

Siapkan komponen karakter dengan state:

- Idle.
- Sing Left.
- Sing Down.
- Sing Up.
- Sing Right.
- Hurt.
- Special.
- Victory.
- Defeat.

Pada tahap ini animasi boleh menggunakan placeholder 2D atau CSS animation yang rapi.

Pastikan arsitektur komponen dapat diganti dengan model 3D GLB pada tahap berikutnya.

Karakter harus dapat memberikan reaksi visual terhadap gameplay.

## 13. GAMEPLAY CONTROLS

Rapikan kontrol permainan:

- Pause.
- Resume.
- Restart.
- Exit.

Ketentuan:

- Kontrol tidak mengambil ruang terlalu besar.
- Pause menu muncul sebagai overlay.
- Layout gameplay tidak berpindah ketika pause.
- Keyboard input tetap mengikuti mapping final.
- Tombol kontrol visual harus menggunakan urutan LEFT, DOWN, UP, RIGHT jika ditampilkan sebagai empat tombol lane.

Jangan membuat mapping keyboard baru yang berbeda dari konfigurasi utama.

## 14. SONG SELECTION REDESIGN

Rapikan halaman song selection agar memiliki identitas game yang konsisten.

Tampilkan:

- Song title.
- Cover artwork.
- BPM.
- Difficulty.
- Best score.
- Play button.

Gunakan desain arcade game, bukan tabel administrasi.

Jangan menghilangkan kemampuan memilih lagu dan chart yang sudah tersedia.

## 15. RESPONSIVENESS

Prioritaskan desktop browser.

Pastikan:

- Layout tidak pecah pada resolusi desktop.
- Lane tetap terlihat.
- Urutan lane tidak berubah.
- HUD tidak bertumpuk.
- Karakter tidak menutupi note.
- Tombol kontrol tidak keluar dari viewport.
- Gameplay tidak menghasilkan horizontal scrollbar.

Siapkan fallback untuk layar lebih kecil.

## 16. IMPLEMENTATION RULES

1. Audit UI dan komponen yang sudah ada sebelum melakukan perubahan.
2. Pertahankan seluruh logic ISSUE 002.
3. Jangan mengubah format chart tanpa kebutuhan kompatibilitas yang jelas.
4. Jangan mengubah judgment window.
5. Jangan mengubah formula score dan accuracy.
6. Jangan mengubah audio clock.
7. Jangan menambahkan multiplayer.
8. Jangan membuat combat damage atau special attack.
9. Gunakan aset visual lokal.
10. Jangan menggunakan URL gambar eksternal sebagai dependency utama.
11. Gunakan komponen UI reusable.
12. Pisahkan styling dari logic gameplay.
13. Jangan menghapus fitur yang sudah berfungsi.
14. Gunakan satu konfigurasi lane untuk rendering dan keyboard input.
15. Pastikan perubahan mapping tidak mengubah timing note.

## 17. ACCEPTANCE CRITERIA

### UI/UX

- [ ] Gameplay memenuhi hampir seluruh viewport.
- [ ] Tidak ada footer website saat gameplay.
- [ ] Tidak ada scrollbar yang tidak diperlukan.
- [ ] Arena memiliki visual stage.
- [ ] Terdapat karakter pemain di kiri.
- [ ] Terdapat karakter lawan di kanan.
- [ ] Empat lane memiliki visual yang jelas.
- [ ] Note dan receptor memiliki desain baru.
- [ ] Health bar tersedia sebagai visual presentation.
- [ ] HUD terintegrasi dengan baik.
- [ ] Judgment feedback memiliki animasi.
- [ ] Combo memiliki visual feedback.
- [ ] Pause menu bekerja.
- [ ] Song selection memiliki desain konsisten.

### Lane Mapping

- [ ] Urutan lane LEFT → DOWN → UP → RIGHT.
- [ ] ArrowLeft mengaktifkan lane pertama.
- [ ] ArrowDown mengaktifkan lane kedua.
- [ ] ArrowUp mengaktifkan lane ketiga.
- [ ] ArrowRight mengaktifkan lane keempat.
- [ ] Note muncul pada lane yang sesuai chart.
- [ ] Receptor sesuai dengan arah lane.
- [ ] Warna note dan receptor konsisten.
- [ ] Tidak ada input yang tertukar.
- [ ] Hold note tetap berfungsi.

### Regression Testing

- [ ] Rhythm Engine tetap berfungsi.
- [ ] Audio dan note tetap sinkron.
- [ ] Judgment tetap akurat.
- [ ] Score dan accuracy tetap benar.
- [ ] Combo tetap berfungsi.
- [ ] Pause dan resume tetap berfungsi.
- [ ] Restart tetap berfungsi.
- [ ] Tidak ada error TypeScript.
- [ ] Build berhasil.

## 18. FINAL REPORT

Setelah implementasi selesai, laporkan:

1. Komponen UI yang dibuat atau diperbarui.
2. Struktur file yang berubah.
3. Aset visual yang digunakan.
4. Konfigurasi lane yang digunakan.
5. Hasil pengujian masing-masing tombol.
6. Hasil pengujian chart compatibility.
7. Hasil pengujian gameplay.
8. Konfirmasi bahwa Rhythm Engine tidak rusak.
9. Screenshot gameplay terbaru.
10. Kendala dan pekerjaan yang belum selesai.

## DEFINITION OF DONE

Modern Rhythm Battle memiliki tampilan gameplay modern yang terinspirasi FNF dengan arena, karakter pemain dan lawan, empat lane, HUD, health bar presentation, dan feedback visual yang terintegrasi.

Seluruh sistem lane dan keyboard menggunakan urutan final:

**LEFT → DOWN → UP → RIGHT**

Redesign tidak boleh merusak Rhythm Engine yang sudah selesai pada ISSUE 002.