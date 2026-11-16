# ISSUE 008: COMPLETE FNF ASSET MIGRATION, AUTHENTIC GAMEPLAY & CHART SYSTEM CORRECTION

**Priority:** Critical  
**Status:** To Do  
**Type:** Full Asset Integration, UI Reconstruction, Audio Integration & Rhythm Engine Correction  
**Target:** Desktop Web Browser

## OFFICIAL SOURCE

**Main Game Repository:**
https://github.com/FunkinCrew/Funkin

**Official Asset Repository:**
https://github.com/FunkinCrew/funkin.assets

---

# 1. CRITICAL PROBLEMS

Implementasi sebelumnya belum menyelesaikan masalah yang diminta.

Berdasarkan screenshot terbaru, ditemukan beberapa masalah:

### Gameplay

- Note masih terlihat seperti panah generik.
- Receptor belum menggunakan tampilan dan animasi FNF secara utuh.
- Note muncul dengan susunan yang tidak sesuai dengan chart lagu.
- Visual note highway masih terlalu sederhana.
- Hold note dan sustain note belum memiliki tampilan yang meyakinkan.
- Feedback judgment masih menggunakan tampilan generik.
- Karakter dan stage belum memanfaatkan keseluruhan aset yang tersedia.

### Results Screen

- Results Screen masih menggunakan card generik.
- Background belum menggunakan komposisi aset FNF yang sesuai.
- Karakter hanya ditampilkan sebagai ikon kecil.
- Typography belum konsisten.
- Judgment breakdown masih menggunakan panel generik.
- Tombol Play Again dan Back to Free Play belum mengikuti gaya menu FNF.

### Platform

- Lobby masih belum sepenuhnya menggunakan aset FNF.
- Beberapa halaman masih terlihat seperti aplikasi dashboard.
- Audio menu dan interaksi belum terintegrasi secara menyeluruh.

**PENTING: Jangan melakukan perbaikan kosmetik saja. Lakukan audit ulang terhadap integrasi aset, chart, rendering, dan gameplay.**

---

# 2. FULL OFFICIAL ASSET INTEGRATION

Gunakan repository berikut sebagai sumber utama:

https://github.com/FunkinCrew/funkin.assets

Targetnya adalah memanfaatkan seluruh kategori aset yang relevan dari repository, bukan hanya beberapa sprite panah.

Lakukan inventarisasi seluruh asset repository.

### A. Characters

Integrasikan aset karakter yang tersedia:

- Character sprites.
- Character animations.
- Character icons.
- Character atlases.
- Character offsets.
- Character metadata.
- Character animations for idle.
- Singing animations.
- Miss animations.
- Other supported character animations.

Jangan mengganti karakter resmi dengan ikon atau placeholder jika aset aslinya tersedia.

### B. Stages

Integrasikan:

- Stage backgrounds.
- Background layers.
- Foreground layers.
- Stage props.
- Animated stage objects.
- Stage lighting.
- Stage effects.
- Stage metadata.

Pastikan komposisi stage sesuai dengan definisi stage yang digunakan.

### C. Notes & Receptors

Integrasikan:

- Note sprites.
- Receptor sprites.
- Arrow graphics.
- Receptor idle animations.
- Pressed animations.
- Confirm animations.
- Hold note graphics.
- Sustain body.
- Sustain tail.
- Note effects.
- Judgment effects.

Jangan membuat ulang note dan receptor menggunakan CSS jika aset resmi tersedia.

### D. HUD

Integrasikan:

- Health bar.
- Health icons.
- Score display graphics.
- Combo graphics.
- Judgment graphics.
- Countdown graphics.
- Gameplay UI.
- Relevant HUD effects.

### E. Menu & Interface

Integrasikan:

- Main menu backgrounds.
- Freeplay graphics.
- Menu navigation graphics.
- Menu selection effects.
- Difficulty graphics.
- Song artwork.
- Album artwork.
- Fonts.
- UI decorations.
- Menu transitions.

### F. Audio

Integrasikan seluruh kategori audio yang relevan:

- Menu music.
- Gameplay music.
- Instrumental.
- Vocals.
- Menu sound effects.
- Navigation sound effects.
- Confirm sound.
- Cancel sound.
- Gameplay sound effects.
- Countdown sound.
- Other relevant audio assets.

### G. Asset Catalog

Buat dokumentasi dan manifest aset.

Setiap aset harus memiliki informasi:

- Asset ID.
- File path.
- Asset category.
- Original filename.
- Associated character, stage, song, or UI component.
- Animation metadata jika tersedia.
- Loading method.
- Source repository.
- License and attribution information.

**Jangan mengunduh lalu menggunakan aset secara acak. Semua aset harus dipetakan ke komponen yang benar.**

Jangan menganggap setiap file dalam repository harus ditampilkan sekaligus. Gunakan seluruh koleksi aset yang relevan dengan fitur dan konten yang benar-benar digunakan.

---

# 3. CHART SYSTEM: STOP RANDOM NOTE GENERATION

**INI ADALAH PRIORITAS TERTINGGI.**

Note yang muncul saat ini tidak sesuai dengan chart lagu.

Audit dan perbaiki sumber masalahnya.

### Dilarang

- Generate note secara random.
- Mengacak lane.
- Mengacak waktu note.
- Membuat note berdasarkan interval acak.
- Membuat note dekoratif yang tidak berasal dari chart.
- Menggunakan jumlah note buatan yang tidak sesuai dengan lagu.
- Mengubah urutan note secara otomatis tanpa dasar chart.
- Menggunakan satu chart untuk seluruh lagu jika chart aslinya berbeda.

### Wajib

Gunakan chart asli yang tersedia dalam source FNF jika format dan lisensinya memungkinkan.

Audit struktur:

- Song metadata.
- BPM.
- Tempo changes.
- Song sections.
- Section timing.
- Note timestamps.
- Note lanes.
- Sustain duration.
- Note types.
- Chart difficulty.
- Character assignment.
- Instrumental and vocal synchronization.

Jika chart tersedia dalam format FNF, buat parser yang memahami format tersebut.

Jangan hanya mengambil sebagian data chart tanpa memahami struktur dan metadata-nya.

### Chart Mapping

Buat sistem pemetaan yang konsisten antara:

- Original chart lane.
- Player side.
- Direction.
- Note sprite.
- Receptor.
- Keyboard input.

Pastikan lane tidak tertukar.

Untuk kontrol empat arah Modern Rhythm Battle, gunakan mapping:

| Index | Direction | Keyboard |
|---|---|---|
| 0 | LEFT | Arrow Left |
| 1 | DOWN | Arrow Down |
| 2 | UP | Arrow Up |
| 3 | RIGHT | Arrow Right |

Jika chart asli memiliki struktur lane berbeda, buat adapter yang benar berdasarkan format chart tersebut.

Jangan mengubah urutan note untuk sekadar menyesuaikan tampilan.

### Difficulty

Setiap difficulty harus memiliki chart yang sesuai.

- Easy menggunakan chart Easy.
- Normal menggunakan chart Normal.
- Hard menggunakan chart Hard.
- Difficulty tambahan hanya tersedia jika datanya memang ada.

Jangan membuat chart Easy, Normal, dan Hard dari satu chart yang sama melalui randomisasi.

Jika chart tidak tersedia, tampilkan status bahwa chart belum tersedia. Jangan berpura-pura memiliki chart asli.

---

# 4. NOTE HIGHWAY & RECEPTOR RECONSTRUCTION

Rekonstruksi note highway mengikuti implementasi FNF.

### Note Highway

- Gunakan empat lane.
- Pertahankan ukuran dan proporsi yang sesuai.
- Gunakan background dan separator lane yang tepat.
- Jangan membuat area kosong yang tidak perlu.
- Pastikan note terlihat jelas.
- Pastikan note tidak terpotong.
- Pastikan HUD tidak menutupi note.
- Gunakan aset receptor yang benar.

Pertahankan arah note Modern Rhythm Battle yang telah ditentukan: **BOTTOM-TO-TOP**.

Artinya, note bergerak dari bawah menuju receptor di bagian atas.

### Receptor

Setiap lane harus memiliki receptor dengan animasi:

1. Idle.
2. Pressed.
3. Confirm.

Ketika input dilakukan:

- Receptor memainkan pressed animation.
- Jika input mengenai note yang valid, mainkan confirm animation.
- Jika tidak mengenai note, jangan memberikan judgment palsu.
- Setelah animasi selesai, receptor kembali ke idle.

Jangan menggunakan panah outline statis sebagai pengganti receptor resmi.

### Note Rendering

Semua note harus berasal dari chart yang valid.

Note harus:

- Muncul pada waktu yang benar.
- Berada di lane yang benar.
- Bergerak dengan kecepatan yang benar.
- Memiliki ukuran yang sesuai.
- Menggunakan sprite yang benar.
- Menghilang ketika berhasil diselesaikan.
- Menghasilkan Miss jika melewati batas judgment.

### Hold & Sustain

Gunakan aset resmi untuk:

- Hold head.
- Sustain body.
- Sustain tail.

Pastikan panjang visual sesuai durasi note.

Ketika pemain menahan tombol:

- Sustain tetap aktif.
- Judgment dihitung sesuai mekanisme yang digunakan.
- Animasi receptor dan karakter berjalan dengan benar.
- Tidak menghasilkan hit berulang secara tidak sengaja.

---

# 5. TIMING, AUDIO CLOCK & JUDGMENT

Jangan mengubah sistem audio clock yang sudah berjalan dengan benar.

Periksa:

- Song offset.
- Chart offset.
- BPM.
- Tempo changes.
- Audio playback position.
- Note spawn time.
- Note hit time.
- Sustain duration.
- Judgment windows.

Gunakan audio clock sebagai acuan waktu utama.

Jangan menggunakan frame rendering sebagai sumber waktu chart.

### Judgment

Pertahankan sistem judgment yang sudah ada kecuali ditemukan kesalahan implementasi.

Pastikan:

- Sick.
- Good.
- Bad.
- Shit.
- Miss.

dihitung berdasarkan selisih waktu input dengan timestamp note.

Jangan mengubah hasil judgment hanya untuk mempercantik Results Screen.

### Accuracy & Score

Audit rumus:

- Total score.
- Accuracy.
- Max combo.
- Judgment count.
- Miss count.

Pastikan hasil yang ditampilkan di Results Screen benar-benar berasal dari hasil gameplay.

Jumlah note dalam chart harus sesuai dengan data sebenarnya.

---

# 6. CHARACTER & STAGE ANIMATION

Gunakan character sprites dan animation metadata resmi.

Setiap input arah harus memicu animasi yang sesuai.

| Input | Character Animation |
|---|---|
| LEFT | singLEFT |
| DOWN | singDOWN |
| UP | singUP |
| RIGHT | singRIGHT |

Integrasikan:

- Idle.
- Singing.
- Miss.
- Hurt.
- Special.
- Victory.
- Defeat.

Gunakan animasi yang memang tersedia.

Jangan memaksakan nama animasi yang tidak ada dalam definisi karakter.

Pastikan karakter tidak terus berada dalam animasi singing setelah input selesai.

Stage juga harus menggunakan background, foreground, props, dan animasi yang tersedia.

---

# 7. FULL UI RECONSTRUCTION

Seluruh halaman harus menggunakan identitas visual FNF.

Jangan mempertahankan tampilan dashboard generik.

### Main Menu

- Background resmi.
- Typography sesuai.
- Menu selection.
- Navigation effects.
- Character presentation.
- Menu music.
- Menu sound effects.

### Lobby

- Song selection.
- Song artwork.
- Selected song.
- Difficulty.
- Character presentation.
- Song preview.
- Navigation animation.

### Free Play

- Song list.
- Artwork.
- Difficulty.
- High score.
- Song preview.
- Selected state.

### Online PvP

- Quick Match.
- Private Room.
- Room Code.
- Matchmaking.
- Player Ready.
- Character Selection.
- Match Lobby.
- Match Countdown.

Pertahankan semua mekanisme Online PvP yang sudah ada.

### Settings

- Master Volume.
- Music Volume.
- Sound Effects Volume.
- Note Scroll Speed.
- Key Bindings.
- Audio Offset.
- Display Settings.
- Gameplay Settings.

### Pause Menu

Gunakan komposisi dan aset menu yang sesuai.

### Results Screen

Rekonstruksi total Results Screen.

Jangan mempertahankan card generik seperti screenshot saat ini.

Integrasikan:

- Background hasil.
- Character presentation.
- Stage result title.
- Result status.
- Score.
- Accuracy.
- Max combo.
- Judgment breakdown.
- Rank atau grade jika tersedia.
- Play Again.
- Back to Free Play.

Gunakan aset dan typography FNF yang sesuai.

Karakter harus ditampilkan menggunakan sprite atau animasi yang benar, bukan ikon kecil generik.

Pastikan seluruh nilai hasil berasal dari gameplay yang sebenarnya.

Untuk Online PvP, Results Screen harus dapat menampilkan hasil kedua pemain.

---

# 8. AUDIO INTEGRATION

Integrasikan audio secara menyeluruh.

### Menu

- Menu music.
- Navigation sound.
- Confirm.
- Cancel.
- Song selection.
- Difficulty selection.
- Matchmaking.
- Match found.
- Player ready.
- Countdown.

### Free Play

- Song preview.
- Preview switching.
- Preview cleanup.
- Gameplay music transition.

### Gameplay

- Instrumental.
- Vocals.
- Gameplay sound effects.
- Countdown.
- Pause.
- Resume.
- Results transition.

### Audio Manager

Pastikan terdapat satu sistem pengelolaan audio yang konsisten.

Hindari:

- Audio bertumpuk.
- Musik menu tetap berjalan ketika gameplay dimulai.
- Song preview tidak berhenti.
- Sound effect diputar berulang secara tidak sengaja.
- Audio tidak sinkron dengan chart.

---

# 9. ONLINE PVP INTEGRATION

Pertahankan mode 1 VS 1.

Kedua pemain harus memainkan lagu dan chart yang sama.

- Player 1 memiliki lane dan receptor sendiri.
- Player 2 memiliki lane dan receptor sendiri.
- Input diproses secara independen.
- Judgment dihitung masing-masing.
- Animasi karakter independen.
- HP dan combat tetap tersinkronisasi.
- Server tetap menjadi otoritas hasil pertandingan.

Jangan membuat chart berbeda untuk kedua pemain.

Jangan mengirim hasil score atau judgment dari client sebagai nilai final tanpa validasi server.

Pastikan perubahan chart parser dan renderer tidak merusak sinkronisasi multiplayer.

---

# 10. ASSET LOADING & PERFORMANCE

Karena koleksi aset cukup besar, jangan memuat seluruh file ke memori browser sekaligus.

Implementasikan:

- Asset manifest.
- Asset preload.
- Lazy loading.
- Texture reuse.
- Sprite atlas reuse.
- Audio lifecycle.
- Cache.
- Asset validation.
- Missing asset reporting.

Muat aset berdasarkan lagu, karakter, stage, dan halaman yang sedang digunakan.

Seluruh aset yang relevan harus tersedia melalui sistem loading yang konsisten.

Jangan mengurangi kualitas aset secara sembarangan.

---

# 11. IMPLEMENTATION PHASES

### Phase 1: Audit & Asset Inventory

- Audit seluruh repository.
- Buat daftar aset.
- Audit format sprite.
- Audit animation metadata.
- Audit chart format.
- Audit audio format.
- Audit implementasi saat ini.
- Identifikasi penyebab note random atau salah mapping.

### Phase 2: Asset Pipeline

- Buat asset manifest.
- Buat asset loader.
- Integrasikan character assets.
- Integrasikan stage assets.
- Integrasikan note assets.
- Integrasikan receptor assets.
- Integrasikan HUD assets.
- Integrasikan menu assets.
- Integrasikan audio assets.

### Phase 3: Chart System Correction

- Implementasikan parser chart.
- Implementasikan difficulty mapping.
- Implementasikan BPM dan tempo changes.
- Implementasikan note timestamp.
- Implementasikan lane mapping.
- Implementasikan sustain duration.
- Hapus random note generation.
- Validasi hasil parser terhadap chart sumber.

### Phase 4: Gameplay Reconstruction

- Receptor rendering.
- Receptor animations.
- Note rendering.
- Note spawning.
- Note movement.
- Hold note.
- Sustain note.
- Hit detection.
- Judgment feedback.
- Character animation.
- Stage rendering.

### Phase 5: Platform UI

- Main Menu.
- Lobby.
- Free Play.
- Song Selection.
- Difficulty Selection.
- Character Selection.
- Online PvP.
- Settings.
- Pause.
- Results.

### Phase 6: Audio Integration

- Menu music.
- Sound effects.
- Song preview.
- Instrumental.
- Vocals.
- Gameplay audio.
- Audio lifecycle.

### Phase 7: Multiplayer & QA

- Test Player 1.
- Test Player 2.
- Test identical chart.
- Test judgment.
- Test combat.
- Test reconnect.
- Test result synchronization.
- Test browser compatibility.

---

# 12. ACCEPTANCE CRITERIA

## Asset Integration

- [ ] Asset repository sudah diaudit.
- [ ] Asset manifest tersedia.
- [ ] Seluruh kategori aset yang relevan sudah dipetakan.
- [ ] Character assets digunakan.
- [ ] Stage assets digunakan.
- [ ] Note assets digunakan.
- [ ] Receptor assets digunakan.
- [ ] HUD assets digunakan.
- [ ] Menu assets digunakan.
- [ ] Audio assets digunakan.
- [ ] Tidak ada placeholder generik ketika aset resmi tersedia.

## Chart

- [ ] Random note generation dihapus.
- [ ] Chart asli dapat dibaca.
- [ ] Difficulty sesuai.
- [ ] Timestamp sesuai.
- [ ] BPM sesuai.
- [ ] Tempo changes didukung.
- [ ] Lane mapping benar.
- [ ] Sustain duration benar.
- [ ] Tidak ada note tambahan yang tidak berasal dari chart.
- [ ] Tidak ada note hilang akibat kesalahan parser.
- [ ] Note sequence sesuai dengan sumber chart.

## Gameplay

- [ ] Note menggunakan sprite resmi.
- [ ] Receptor menggunakan sprite resmi.
- [ ] Receptor memiliki idle animation.
- [ ] Receptor memiliki pressed animation.
- [ ] Receptor memiliki confirm animation.
- [ ] Note bergerak bottom-to-top.
- [ ] Hold note benar.
- [ ] Sustain note benar.
- [ ] Judgment benar.
- [ ] Character animation benar.
- [ ] HUD menggunakan aset yang sesuai.

## UI

- [ ] Main Menu konsisten dengan FNF.
- [ ] Lobby konsisten dengan FNF.
- [ ] Free Play konsisten dengan FNF.
- [ ] Online PvP konsisten dengan FNF.
- [ ] Settings konsisten dengan FNF.
- [ ] Pause Menu konsisten dengan FNF.
- [ ] Results Screen konsisten dengan FNF.
- [ ] Tidak ada tampilan dashboard generik yang tidak sesuai.

## Audio

- [ ] Menu music berfungsi.
- [ ] Sound effects berfungsi.
- [ ] Song preview berfungsi.
- [ ] Gameplay audio sinkron.
- [ ] Audio tidak bertumpuk.
- [ ] Volume settings berfungsi.

## Online PvP

- [ ] Kedua pemain memainkan chart yang sama.
- [ ] Input independen.
- [ ] Judgment independen.
- [ ] Karakter independen.
- [ ] HP tersinkronisasi.
- [ ] Hasil pertandingan benar.

---

# 13. REQUIRED TESTING

AI coding agent wajib melakukan pengujian dengan lagu dan chart yang benar-benar tersedia.

Jangan hanya menggunakan satu chart buatan untuk membuktikan bahwa sistem bekerja.

Minimal lakukan pengujian:

1. Satu lagu dengan chart Easy.
2. Lagu yang sama dengan chart Normal.
3. Lagu yang sama dengan chart Hard jika tersedia.
4. Chart dengan hold note.
5. Chart dengan sustain note.
6. Chart dengan perubahan tempo jika tersedia.
7. Free Play.
8. Online PvP menggunakan dua browser atau dua client.

Untuk setiap pengujian, bandingkan:

- Jumlah note sumber.
- Jumlah note hasil parser.
- Urutan note.
- Lane.
- Timestamp.
- Sustain duration.
- Total note yang berhasil dimainkan.
- Judgment breakdown.
- Accuracy.
- Score.

Buat laporan hasil pengujian.

---

# 14. FINAL INSTRUCTIONS FOR AI CODING AGENT

Jangan mengulangi pendekatan implementasi sebelumnya yang hanya mengganti beberapa sprite tetapi mempertahankan sistem generik.

Pengguna menginginkan pemanfaatan aset FNF secara menyeluruh.

Prioritas pengerjaan:

1. Audit repository dan seluruh aset.
2. Audit chart source dan parser.
3. Hapus random note generation.
4. Integrasikan aset note dan receptor dengan benar.
5. Perbaiki note movement dan hit detection.
6. Integrasikan character dan stage assets.
7. Rekonstruksi Lobby dan seluruh menu.
8. Rekonstruksi Results Screen.
9. Integrasikan seluruh audio yang relevan.
10. Pastikan Online PvP tetap berfungsi.

Jangan mengklaim seluruh aset sudah digunakan tanpa membuat asset inventory dan mapping.

Jangan membuat chart palsu.

Jangan membuat note secara random.

Jangan mengganti aset resmi dengan ilustrasi generik.

Jangan merusak fitur yang sudah selesai pada issue sebelumnya.

Hormati lisensi, atribusi, dan ketentuan penggunaan repository.

**DEFINITION OF DONE:**

Modern Rhythm Battle harus menggunakan sistem aset dan chart FNF secara terintegrasi, bukan sekadar mengambil beberapa gambar dari repository.

Note yang muncul harus sesuai dengan chart lagu sebenarnya.

Receptor, note, hold, sustain, character, stage, HUD, menu, audio, dan Results Screen harus menggunakan aset yang tepat.

Seluruh pengalaman harus konsisten, berfungsi di browser, serta tetap mendukung Free Play dan Online PvP 1 VS 1.