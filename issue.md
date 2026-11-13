# ISSUE 007: COMPLETE FNF UI, ASSET, AUDIO & NOTE HIGHWAY INTEGRATION

**Priority:** Critical  
**Status:** To Do  
**Type:** UI/UX Reconstruction, Asset Integration & Gameplay Correction

**Official Repositories:**

Main Game: https://github.com/FunkinCrew/Funkin

Official Assets: https://github.com/FunkinCrew/funkin.assets

---

# PART A: FULL FNF UI & AUDIO INTEGRATION

## 1. OBJECTIVE

Saat ini gameplay Modern Rhythm Battle sudah menggunakan sebagian aset FNF, tetapi Lobby dan beberapa halaman lainnya masih menggunakan tampilan generik.

Selain itu, sistem audio menu dan beberapa interaksi belum menggunakan aset serta pengalaman audio yang sesuai.

Lakukan pembaruan menyeluruh agar seluruh halaman memiliki identitas visual dan audio yang konsisten dengan Friday Night Funkin.

Target halaman:

- Main Menu.
- Lobby.
- Free Play.
- Song Selection.
- Difficulty Selection.
- Character Selection.
- Online PvP.
- Quick Match.
- Private Room.
- Match Lobby.
- Settings.
- Pause Menu.
- Results Screen.
- Profile.
- Leaderboard.

Jangan hanya mengubah warna, font, dan ikon. Pelajari implementasi menu asli FNF dan gunakan aset yang sesuai dari repository resmi.

## 2. OFFICIAL ASSET INTEGRATION

Audit repository:

https://github.com/FunkinCrew/funkin.assets

Integrasikan aset yang relevan:

- Menu backgrounds.
- Menu graphics.
- Character sprites.
- Character animations.
- Song artwork.
- Album artwork.
- Difficulty graphics.
- Buttons.
- Navigation graphics.
- Fonts.
- Menu animations.
- UI effects.
- Sound effects.
- Menu music.
- Gameplay audio.

Pertahankan format, transparansi, sprite sheet, frame animasi, proporsi, offset, dan metadata aset.

Jangan mengganti aset resmi dengan placeholder atau ilustrasi generik apabila aset yang sesuai tersedia dan dapat digunakan.

Dokumentasikan sumber aset, versi repository, commit hash, dan atribusi yang diperlukan.

## 3. MAIN MENU REDESIGN

Rekonstruksi Main Menu dengan gaya FNF.

Elemen:

- Background.
- Logo atau title.
- Menu navigation.
- Selection indicator.
- Selected state animation.
- Character atau visual dekoratif.
- Transition effects.
- Menu sound effects.

Menu:

1. Free Play.
2. Online PvP.
3. Settings.
4. Profile.
5. Leaderboard.

Semua menu harus interaktif dan dapat diakses menggunakan keyboard maupun mouse.

## 4. LOBBY REDESIGN

Perbaiki tampilan Lobby yang saat ini masih berbentuk dashboard generik.

Hapus atau rekonstruksi elemen berikut:

- Header logo RB generik.
- Card lagu generik.
- Ikon musik buatan CSS.
- Panel detail lagu generik.
- Slider yang tidak sesuai.
- Tombol Play Battle generik.
- Layout dashboard yang berbeda dari gameplay.

Ganti dengan tampilan yang mengikuti struktur dan gaya menu FNF.

Integrasikan:

- Background.
- Menu navigation.
- Song selection.
- Song artwork.
- Selected song.
- Difficulty.
- Character presentation.
- Song preview.
- Navigation indicator.
- Transition animations.

Jangan membuat screenshot statis. Semua elemen harus benar-benar berfungsi.

## 5. FREE PLAY MENU

Gunakan tampilan Freeplay FNF sebagai acuan utama.

Fitur:

- Song list.
- Song artwork.
- Song title.
- Artist information jika tersedia.
- Difficulty selection.
- High score.
- Song preview.
- Selected song indicator.
- Gameplay launch.

Pertahankan data lagu dan chart yang sudah ada.

## 6. ONLINE PVP MENU

Buat menu Online PvP yang mengikuti identitas visual FNF.

### Quick Match

- Search opponent.
- Searching animation.
- Match found.
- Connection status.
- Cancel matchmaking.

### Private Room

- Create room.
- Join room.
- Room code.
- Copy room code.
- Player ready.
- Host start match.

### Match Lobby

- Player 1.
- Player 2.
- Character selection.
- Selected song.
- Difficulty.
- Connection status.
- Ready status.
- Countdown.

Mekanisme multiplayer yang sudah berjalan tidak boleh rusak.

## 7. CHARACTER SELECTION

Gunakan karakter dari repository aset resmi.

- Character sprites.
- Character animations.
- Character icons.
- Selected character state.
- Character transition.
- Player 1 selection.
- Player 2 selection.

Jangan menggunakan avatar generik.

## 8. SETTINGS MENU

Gunakan gaya visual FNF.

Pengaturan minimum:

- Master Volume.
- Music Volume.
- Sound Effects Volume.
- Note Scroll Speed.
- Key Bindings.
- Audio Offset.
- Display Settings.
- Gameplay Settings.

Seluruh pengaturan harus berfungsi dan tersimpan.

Perubahan pengaturan harus benar-benar diterapkan ke gameplay.

## 9. OTHER SCREENS

Audit dan sesuaikan:

- Pause Menu.
- Results Screen.
- Profile.
- Leaderboard.
- Loading Screen.
- Matchmaking Screen.
- Match Found Screen.

Halaman khusus Modern Rhythm Battle yang tidak memiliki padanan langsung di FNF harus mengikuti visual language yang sama.

## 10. AUDIO INTEGRATION

**Seluruh pengalaman audio menu dan gameplay harus diperiksa. Jangan hanya mengintegrasikan gambar.**

Audit audio dari repository resmi.

### Menu Music

- Gunakan musik menu yang tersedia dan sesuai.
- Musik diputar pada halaman yang relevan.
- Transisi halaman tidak menyebabkan audio bertumpuk.
- Musik berhenti atau berganti ketika gameplay dimulai.

### Menu Sound Effects

Integrasikan sound effect untuk:

- Menu navigation.
- Menu selection.
- Confirm.
- Cancel.
- Difficulty selection.
- Song selection.
- Matchmaking.
- Player ready.
- Match found.
- Countdown.
- Menu transitions.

### Song Preview

- Preview dimulai ketika lagu dipilih.
- Preview berhenti ketika lagu diganti.
- Preview tidak bertumpuk dengan musik menu.
- Preview berhenti ketika gameplay dimulai.

### Gameplay Audio

Pertahankan sistem audio yang sudah berjalan.

Audit:

- Instrumental.
- Vocals.
- BPM.
- Song timing.
- Audio synchronization.
- Pause.
- Resume.
- Results transition.

Jangan merusak audio clock atau judgment timing yang sudah selesai.

### Central Audio Manager

Buat atau rapikan central audio manager untuk:

- Menu music.
- Song preview.
- Gameplay music.
- Sound effects.
- Volume configuration.
- Audio transitions.
- Audio cleanup.
- Audio lifecycle.

Pastikan tidak ada audio ganda ketika berpindah halaman.

---

# PART B: NOTE HIGHWAY, RECEPTOR & HIT NOTE CORRECTION

## 11. OBJECTIVE

Perbaiki sistem Note Highway dan Hit Note agar mengikuti visual dan mekanisme gameplay FNF.

Kondisi saat ini berdasarkan screenshot:

- Receptor hanya menggunakan panah outline statis.
- Note belum terlihat bergerak dengan benar.
- Lane masih tampak kosong.
- Animasi receptor belum mengikuti input.
- Tombol arah ditampilkan sebagai tombol besar di bawah gameplay.
- Feedback hit note belum sesuai.
- Animasi karakter belum terintegrasi dengan baik.

Jangan hanya memperbaiki CSS.

Audit note rendering, asset mapping, note spawning, keyboard input, receptor animation, dan judgment secara menyeluruh.

## 12. NOTE & RECEPTOR ASSETS

Gunakan aset resmi dari:

https://github.com/FunkinCrew/funkin.assets

Audit:

- Note sprites.
- Receptor sprites.
- Arrow animations.
- Hold note sprites.
- Sustain note graphics.
- Pressed animation.
- Confirm animation.
- Directional graphics.
- Note effects.

Gunakan sprite dan animasi resmi yang sesuai.

Jangan menggunakan panah CSS, Unicode, emoji, atau SVG generik jika aset resmi tersedia.

Pertahankan:

- Original texture.
- Original proportions.
- Original colors.
- Original animation frames.
- Original visual effects.
- Directional identity.

Pastikan asset loader membaca definisi sprite dan animasi dengan benar.

## 13. RECEPTOR SYSTEM

Setiap lane harus memiliki receptor sendiri.

Minimal terdapat tiga kondisi:

### Idle

- Receptor berada pada posisi tetap.
- Menampilkan animasi idle sesuai aset.
- Tidak menggunakan panah outline generik.
- Tetap terlihat jelas ketika tidak ada input.

### Pressed

Ketika pemain menekan tombol yang sesuai:

- Receptor memainkan animasi pressed.
- Respons visual terjadi secara langsung.
- Tidak perlu menunggu respons server untuk feedback visual awal.
- Tidak mengganggu perhitungan judgment.

### Confirm

Ketika input mengenai note dengan benar:

- Receptor memainkan animasi confirm.
- Note yang terkena input diselesaikan.
- Judgment feedback ditampilkan.
- Karakter memainkan animasi sesuai arah note.

Setelah animasi selesai, receptor kembali ke idle.

Jangan membiarkan receptor terjebak pada kondisi pressed atau confirm.

## 14. NOTE SPAWNING & MOVEMENT

Audit mengapa note belum terlihat bergerak dengan benar.

Pastikan seluruh note dari chart dirender.

Ketentuan:

- Note muncul berdasarkan waktu chart.
- Note bergerak dari bawah menuju receptor di bagian atas.
- Note memiliki arah dan lane yang benar.
- Note terlihat jelas selama bergerak.
- Note tidak muncul terlambat.
- Note tidak menghilang sebelum mencapai receptor.
- Note tidak bertumpuk secara tidak wajar.
- Note tidak muncul di lane yang salah.

Setiap note yang terlihat harus memiliki data timing dan lane yang valid.

### Note Types

Pastikan semua jenis note berfungsi:

- Tap Note.
- Hold Note.
- Sustain Note.

Hold note harus memiliki body dan tail yang sesuai dengan durasinya.

## 15. HIT NOTE MECHANISM

Perbaiki deteksi input agar sesuai dengan timing note.

Urutan:

1. Note bergerak menuju receptor.
2. Pemain menekan tombol yang sesuai.
3. Sistem memeriksa lane.
4. Sistem memeriksa timing input terhadap note.
5. Judgment dihitung.
6. Receptor memainkan animasi confirm.
7. Note yang berhasil ditekan diselesaikan.
8. Judgment feedback ditampilkan.
9. Karakter memainkan animasi sesuai arah note.
10. Score, combo, dan accuracy diperbarui.

Jika pemain menekan tombol tanpa note yang valid:

- Terapkan aturan input rhythm engine yang sudah digunakan.
- Jangan memberikan judgment palsu.
- Jangan menghasilkan damage atau score yang tidak valid.

Jika note melewati receptor tanpa input:

- Hitung sebagai Miss.
- Tampilkan feedback Miss.
- Mainkan animasi karakter yang sesuai.
- Terapkan konsekuensi gameplay berdasarkan konfigurasi.

Jangan mengubah judgment window tanpa alasan teknis dan pengujian.

## 16. REMOVE GENERIC ARROW BUTTON UI

Pada screenshot saat ini terdapat empat tombol besar di bawah lane:

- LEFT.
- DOWN.
- UP.
- RIGHT.

Tampilan tersebut tidak sesuai dengan komposisi gameplay FNF untuk target desktop.

Ketentuan:

- Hilangkan tombol kontrol besar di bawah gameplay.
- Gunakan keyboard sebagai input utama.
- Jangan menampilkan tombol arah sebagai elemen UI permanen.
- Receptor menjadi indikator visual input.
- Animasi pressed dan confirm menjadi feedback ketika tombol ditekan.

Informasi kontrol dapat ditampilkan melalui Settings atau tutorial.

### Keyboard Mapping

| Lane | Keyboard |
|---|---|
| LEFT | Arrow Left |
| DOWN | Arrow Down |
| UP | Arrow Up |
| RIGHT | Arrow Right |

Pertahankan mapping yang sudah ditetapkan sebelumnya.

## 17. NOTE HIGHWAY LAYOUT

Perbaiki komposisi lane agar mengikuti gameplay FNF.

Ketentuan:

- Empat lane memiliki lebar dan jarak konsisten.
- Receptor berada pada posisi yang sesuai.
- Note bergerak menuju receptor.
- Note tidak terpotong container.
- Note tidak tertutup HUD.
- Tidak ada ruang kosong berlebihan.
- Background stage tetap terlihat.
- Note highway menyatu dengan komposisi gameplay.

**Arah note wajib bottom-to-top.**

Jangan mengubahnya menjadi top-to-bottom.

## 18. INPUT FEEDBACK & CHARACTER ANIMATION

Input harus memberikan respons visual langsung.

Mapping:

- LEFT: receptor kiri bereaksi dan karakter memainkan singLEFT.
- DOWN: receptor bawah bereaksi dan karakter memainkan singDOWN.
- UP: receptor atas bereaksi dan karakter memainkan singUP.
- RIGHT: receptor kanan bereaksi dan karakter memainkan singRIGHT.

Pastikan animasi karakter tidak tertukar.

Animasi harus kembali ke idle sesuai mekanisme karakter.

Untuk Online PvP, input dan animasi kedua pemain harus terpisah.

## 19. ONLINE PVP COMPATIBILITY

Seluruh perbaikan harus tetap mendukung pertandingan 1 VS 1.

- Player 1 memiliki note dan receptor sendiri.
- Player 2 memiliki note dan receptor sendiri.
- Keduanya memainkan chart yang sama.
- Input kedua pemain diproses terpisah.
- Judgment dihitung untuk masing-masing pemain.
- Receptor masing-masing bereaksi secara independen.
- Animasi karakter masing-masing tidak saling memengaruhi.
- Server tetap menjadi otoritas judgment dan combat.

Jangan membuat satu receptor atau input bersama untuk kedua pemain.

---

# PART C: TECHNICAL INTEGRATION & QUALITY ASSURANCE

## 20. TECHNICAL AUDIT

Sebelum melakukan perubahan, audit implementasi yang sudah berjalan.

### UI Audit

- Apakah seluruh halaman menggunakan aset yang sesuai?
- Apakah navigasi terhubung dengan benar?
- Apakah menu transition berfungsi?
- Apakah song selection menggunakan data yang benar?
- Apakah audio menu dibersihkan ketika halaman berganti?

### Note Audit

- Apakah chart berhasil dibaca?
- Apakah note spawning berjalan?
- Apakah posisi awal note benar?
- Apakah note diperbarui berdasarkan audio clock?
- Apakah receptor menggunakan aset resmi?
- Apakah definisi animasi receptor terbaca?
- Apakah keyboard input terhubung dengan lane?
- Apakah input memicu animasi receptor?
- Apakah judgment terhubung dengan note yang benar?
- Apakah note diselesaikan setelah hit?
- Apakah Miss terdeteksi ketika note melewati receptor?

Perbaiki penyebab sebenarnya, bukan hanya gejala visual.

## 21. REGRESSION PROTECTION

Jangan merusak fitur yang sudah selesai pada issue sebelumnya.

Pertahankan:

- Project foundation.
- Rhythm engine.
- Audio clock.
- Chart system.
- Judgment system.
- Score.
- Combo.
- Accuracy.
- Health system.
- Combat.
- Special Attack.
- Free Play.
- Online PvP.
- WebSocket.
- Database.
- Authentication.

Jangan mengubah logic gameplay yang sudah berjalan tanpa kebutuhan teknis.

## 22. IMPLEMENTATION PHASES

### Phase 1: Audit

- Audit seluruh halaman.
- Audit repository FNF.
- Audit repository aset.
- Audit menu dan audio.
- Audit note rendering.
- Audit receptor.
- Audit input dan judgment.
- Buat laporan komponen yang harus diperbaiki.

### Phase 2: Asset Integration

- Integrasikan menu assets.
- Integrasikan fonts.
- Integrasikan backgrounds.
- Integrasikan song artwork.
- Integrasikan menu graphics.
- Integrasikan receptor sprites.
- Integrasikan note sprites.
- Integrasikan sound effects.
- Integrasikan menu music.

### Phase 3: Menu Reconstruction

- Main Menu.
- Lobby.
- Free Play.
- Song Selection.
- Difficulty Selection.
- Character Selection.
- Online PvP.
- Quick Match.
- Private Room.
- Settings.

### Phase 4: Note Highway Correction

- Receptor sprites.
- Receptor idle.
- Receptor pressed.
- Receptor confirm.
- Note spawning.
- Note movement.
- Hold note.
- Sustain note.
- Keyboard input.
- Hit detection.
- Judgment feedback.
- Character animation.

### Phase 5: Audio Integration

- Menu music.
- Navigation sound.
- Confirm sound.
- Cancel sound.
- Song preview.
- Gameplay audio.
- Volume configuration.
- Audio lifecycle.

### Phase 6: Other Screens

- Pause Menu.
- Results Screen.
- Profile.
- Leaderboard.
- Loading.
- Matchmaking.
- Match Found.

### Phase 7: QA

- Test seluruh navigasi.
- Test menu audio.
- Test song preview.
- Test note rendering.
- Test receptor animation.
- Test hit detection.
- Test Free Play.
- Test Online PvP.
- Test dua browser berbeda.
- Test audio synchronization.
- Test reconnect.
- Test seluruh fitur yang sudah ada.

---

# 23. ACCEPTANCE CRITERIA

## UI & Menu

- [ ] Main Menu menggunakan aset dan gaya visual FNF.
- [ ] Lobby menggunakan aset dan gaya visual FNF.
- [ ] Free Play mengikuti visual FNF.
- [ ] Song Selection berfungsi.
- [ ] Difficulty Selection berfungsi.
- [ ] Character Selection berfungsi.
- [ ] Online PvP menggunakan visual konsisten.
- [ ] Quick Match berfungsi.
- [ ] Private Room berfungsi.
- [ ] Settings menggunakan visual konsisten.
- [ ] Pause Menu menggunakan visual konsisten.
- [ ] Results Screen menggunakan visual konsisten.
- [ ] Tidak ada dashboard generik yang tidak sesuai.

## Audio

- [ ] Menu music berfungsi.
- [ ] Navigation sound berfungsi.
- [ ] Confirm sound berfungsi.
- [ ] Cancel sound berfungsi.
- [ ] Song preview berfungsi.
- [ ] Volume settings berfungsi.
- [ ] Audio tidak bertumpuk.
- [ ] Gameplay audio tetap sinkron.

## Note Highway

- [ ] Note menggunakan aset resmi.
- [ ] Receptor menggunakan aset resmi.
- [ ] Receptor memiliki animasi idle.
- [ ] Receptor memiliki animasi pressed.
- [ ] Receptor memiliki animasi confirm.
- [ ] Note muncul berdasarkan chart.
- [ ] Note bergerak dari bawah ke atas.
- [ ] Semua lane menampilkan note yang benar.
- [ ] Tap note berfungsi.
- [ ] Hold note berfungsi.
- [ ] Sustain note berfungsi.
- [ ] Input keyboard terdeteksi.
- [ ] Judgment sesuai timing.
- [ ] Note diselesaikan setelah hit.
- [ ] Miss terdeteksi dengan benar.
- [ ] Karakter bereaksi terhadap input.
- [ ] Tombol arah besar di bawah gameplay dihilangkan.
- [ ] Tidak ada panah outline generik jika aset resmi tersedia.

## Multiplayer

- [ ] Player 1 dan Player 2 memiliki receptor masing-masing.
- [ ] Kedua pemain memainkan chart yang sama.
- [ ] Input masing-masing pemain terpisah.
- [ ] Animasi masing-masing karakter independen.
- [ ] Judgment masing-masing pemain benar.
- [ ] Score dan HP tersinkronisasi.
- [ ] Combat tetap divalidasi server.
- [ ] Online PvP tetap berfungsi.

## Final QA

- [ ] Semua halaman konsisten secara visual.
- [ ] Semua aset dimuat dengan benar.
- [ ] Tidak ada missing asset.
- [ ] Tidak ada audio error.
- [ ] Tidak ada regresi gameplay.
- [ ] Tidak ada regresi multiplayer.
- [ ] Tidak ada masalah judgment timing.
- [ ] Berjalan di browser desktop.

---

# 24. FINAL INSTRUCTIONS FOR AI CODING AGENT

Lakukan audit terhadap keseluruhan proyek sebelum implementasi.

Gunakan screenshot Lobby dan screenshot Gameplay yang diberikan pengguna sebagai referensi kondisi saat ini.

Fokus pekerjaan:

1. Menyamakan seluruh UI platform dengan identitas visual FNF.
2. Mengintegrasikan aset menu dan audio resmi.
3. Memperbaiki Lobby dan seluruh halaman yang masih generik.
4. Mengintegrasikan note dan receptor sprites resmi.
5. Memperbaiki note spawning dan movement.
6. Memperbaiki receptor animation.
7. Memperbaiki keyboard input dan hit detection.
8. Menghilangkan tombol arah besar di bawah gameplay.
9. Memastikan animasi karakter dan judgment terintegrasi.
10. Mempertahankan Free Play dan Online PvP.

Jangan hanya membuat mockup atau tampilan statis.

Jangan menyatakan pekerjaan selesai hanya karena aset sudah terlihat.

Seluruh navigasi, audio, note, receptor, input, judgment, dan animasi harus benar-benar berfungsi.

Jika ada keterbatasan teknis, dokumentasikan penyebab dan alternatifnya sebelum mengubah arsitektur.

**DEFINITION OF DONE:**

Seluruh platform Modern Rhythm Battle memiliki identitas visual dan audio yang konsisten dengan Friday Night Funkin.

Lobby tidak lagi terlihat seperti dashboard generik.

Note Highway menggunakan aset note dan receptor yang sesuai.

Note bergerak dari bawah ke atas menuju receptor.

Input keyboard menghasilkan animasi pressed dan confirm yang benar.

Hit detection, judgment, score, combo, dan karakter animation berjalan secara terintegrasi.

Free Play dan Online PvP tetap berfungsi tanpa regresi.