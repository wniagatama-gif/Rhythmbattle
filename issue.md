# ISSUE 005: FNF WEB PORT, ORIGINAL ASSET INTEGRATION & ONLINE PLAYER VS PLAYER

**Priority:** Critical  
**Status:** To Do  
**Type:** Major Gameplay Reconstruction & Multiplayer Integration  
**Target Platform:** Web Browser (Desktop First)

## 1. PROJECT OBJECTIVE

Lakukan rekonstruksi keseluruhan gameplay Modern Rhythm Battle dengan menjadikan Friday Night Funkin sebagai acuan implementasi utama.

Target utama adalah membuat pengalaman gameplay yang secara visual, komposisi, animasi, dan interaksi sedekat mungkin dengan Friday Night Funkin versi resmi.

**Bukan sekadar mengambil inspirasi desain. Bukan membuat ulang empat lane dengan tampilan berbeda. Bukan membuat mini-game rhythm sederhana.**

Gunakan repository resmi berikut sebagai sumber utama:

### Main Game Repository
https://github.com/FunkinCrew/Funkin

### Official Asset Repository
https://github.com/FunkinCrew/funkin.assets

Gunakan source code dan aset dari kedua repository tersebut sesuai izin penggunaan yang telah disampaikan pengguna dan ketentuan lisensi yang berlaku.

Game harus dapat dimainkan melalui browser dan memiliki dua mode utama:

1. Free Play.
2. Online Multiplayer Player VS Player (1 VS 1).

Identitas visual dan pengalaman gameplay FNF harus dipertahankan, sedangkan sistem pertandingan online menjadi pengembangan khusus Modern Rhythm Battle.

---

## 2. OFFICIAL REPOSITORY INTEGRATION

Jangan hanya melihat screenshot atau menjadikan repository sebagai inspirasi.

Lakukan audit dan pelajari implementasi aktual dari repository.

### A. Main Game Source

Repository:

https://github.com/FunkinCrew/Funkin

Pelajari dan manfaatkan implementasi yang relevan, termasuk:

- Gameplay state.
- Play state.
- Note rendering.
- Receptor system.
- Character system.
- Animation controller.
- Stage system.
- Camera system.
- Health bar.
- Score system.
- Combo system.
- Judgment system.
- Countdown.
- Pause.
- Results.
- Song chart.
- Asset loading.
- Audio synchronization.

Identifikasi struktur source code dan komponen yang dapat digunakan atau diadaptasi.

### B. Official Assets

Repository:

https://github.com/FunkinCrew/funkin.assets

Gunakan repository ini sebagai sumber aset utama.

Audit seluruh struktur direktori dan identifikasi aset yang diperlukan.

Kategori aset:

- Character sprites.
- Character spritesheets.
- Character animation data.
- Character icons.
- Stage backgrounds.
- Stage props.
- Note textures.
- Receptor textures.
- HUD graphics.
- Health bar graphics.
- Judgment graphics.
- Combo graphics.
- Fonts.
- Visual effects.
- Audio assets.
- Song-related assets.
- Other gameplay assets.

Jangan mengganti aset resmi dengan placeholder atau desain generik jika aset yang sesuai sudah tersedia dan dapat digunakan.

### C. Asset Pipeline

Buat mekanisme integrasi aset yang mempertahankan struktur dan format sumbernya.

Ketentuan:

- Pertahankan nama dan identitas aset.
- Pertahankan transparansi gambar.
- Pertahankan sprite sheet dan frame animation.
- Pertahankan definisi animasi.
- Pertahankan proporsi karakter.
- Pertahankan offset dan anchor point.
- Pertahankan metadata yang diperlukan.
- Pastikan format aset dapat dibaca oleh target browser.

Jika diperlukan konversi format, buat proses konversi yang konsisten dan dapat diulang.

Jangan mengubah aset secara manual satu per satu tanpa dokumentasi.

### D. Asset Credits

Simpan dokumentasi sumber aset, versi repository, commit hash, dan atribusi yang diwajibkan.

Pastikan proses distribusi mengikuti ketentuan lisensi dan izin penggunaan yang berlaku.

---

## 3. WEB PORTING STRATEGY

Tujuan utama adalah mempertahankan pengalaman FNF semirip mungkin ketika dijalankan di browser.

Jangan langsung memutuskan untuk membuat ulang seluruh gameplay menggunakan Phaser atau Three.js.

Lakukan evaluasi teknis terhadap kemungkinan menggunakan engine asli FNF.

### Preferred Approach: Original Engine HTML5 Port

Evaluasi penggunaan:

- Haxe.
- HaxeFlixel.
- OpenFL.
- Lime.
- HTML5 target.
- Browser asset loading.
- Web Audio compatibility.

Periksa kemampuan source code FNF untuk dikompilasi menjadi HTML5.

Jika engine asli dapat berjalan dengan baik di browser:

1. Gunakan engine tersebut sebagai dasar gameplay client.
2. Pertahankan rendering dan sistem animasi aslinya.
3. Adaptasikan input dan audio untuk browser.
4. Integrasikan komunikasi WebSocket.
5. Tambahkan sistem pertandingan Player VS Player.
6. Integrasikan client ke platform web Modern Rhythm Battle.

### Alternative Approach

Jika terdapat keterbatasan teknis yang membuat engine asli tidak dapat diintegrasikan secara layak:

- Evaluasi alternatif rendering web.
- Buat compatibility layer untuk format aset FNF.
- Pertahankan struktur dan perilaku visual sedekat mungkin.
- Jangan mengubah desain menjadi game rhythm generik.
- Dokumentasikan alasan teknis sebelum mengganti engine.

**Jangan mengganti engine hanya karena implementasi ulang menggunakan teknologi web terasa lebih mudah.**

Prioritas utama adalah fidelity terhadap FNF.

---

## 4. FULL FNF GAMEPLAY VISUAL RECONSTRUCTION

Seluruh layar gameplay harus mengikuti komposisi dan tampilan FNF.

### A. Gameplay Layout

Pertahankan karakteristik layout FNF:

- Stage sebagai background utama.
- Karakter dengan posisi dan skala yang sesuai.
- Note highway.
- Receptor.
- HUD.
- Health bar.
- Score display.
- Judgment feedback.
- Combo display.
- Song progress.
- Countdown.
- Pause interface.
- Gameplay transitions.

Jangan membuat layout baru yang tidak berhubungan dengan struktur visual FNF.

### B. Stage System

Gunakan stage dari official asset repository.

Pertahankan:

- Background.
- Foreground.
- Props.
- Stage objects.
- Character placement.
- Layer ordering.
- Camera movement.
- Camera zoom.
- Stage animation.

Stage harus tetap memiliki komposisi visual seperti sumber aslinya.

### C. Character System

Gunakan karakter dari official asset repository.

Pertahankan:

- Original character sprite.
- Original animation.
- Original proportions.
- Original character offsets.
- Character positioning.
- Idle animation.
- Singing animation.
- Miss animation.
- Hurt animation jika tersedia atau diperlukan.
- Character icon.

Jangan mengganti karakter resmi dengan model 3D generik atau avatar Roblox.

### D. Character Animation

Karakter harus bereaksi terhadap gameplay secara langsung.

Gunakan animation mapping:

- singLEFT.
- singDOWN.
- singUP.
- singRIGHT.
- idle.
- miss.
- hey atau animasi khusus jika tersedia.
- death atau defeat jika tersedia.
- victory jika tersedia.

Sesuaikan nama state dengan definisi animasi aktual pada repository.

Animasi harus mengikuti input dan judgment, bukan berjalan secara acak.

### E. Camera System

Pertahankan karakteristik kamera FNF:

- Stage framing.
- Character focus.
- Camera follow.
- Camera zoom.
- Camera movement.
- Camera effects.

Jangan membuat kamera bebas seperti game 3D.

---

## 5. NOTE HIGHWAY & CHART SYSTEM

Pertahankan tampilan note dan receptor dari FNF.

### A. Receptor

Gunakan receptor texture dan perilaku animasi dari official assets.

Pertahankan:

- Bentuk receptor.
- Warna.
- Posisi.
- Animasi idle.
- Animasi pressed.
- Animasi confirm.
- Feedback ketika input diterima.

### B. Note

Gunakan note texture dan visual asli.

Pertahankan:

- Note direction.
- Note color.
- Note size.
- Note animation.
- Hold note.
- Sustain note.
- Note overlap.
- Note spacing.

### C. Note Direction

**WAJIB: Gameplay menggunakan arah note bottom-to-top.**

Ketentuan:

- Note muncul dari bagian bawah.
- Note bergerak menuju receptor di bagian atas.
- Input diterima ketika note mencapai receptor.
- Note yang melewati receptor tanpa input menjadi Miss.
- Hold note tetap memiliki visual durasi yang jelas.

Jangan menggunakan sistem top-to-bottom.

Jika implementasi default repository memiliki konfigurasi scroll direction yang berbeda, sesuaikan konfigurasi atau sistem rendering tanpa merusak chart dan timing.

### D. Lane Mapping

Pertahankan empat lane:

| Index | Direction | Keyboard |
|---|---|---|
| 0 | LEFT | Arrow Left |
| 1 | DOWN | Arrow Down |
| 2 | UP | Arrow Up |
| 3 | RIGHT | Arrow Right |

Pastikan mapping konsisten antara:

- Chart.
- Note rendering.
- Receptor.
- Keyboard input.
- Judgment calculation.

Jangan mengubah mapping yang sudah ditetapkan sebelumnya.

### E. Chart Compatibility

Audit format chart FNF yang tersedia.

Jika memungkinkan, manfaatkan chart original dan format datanya.

Jika perlu mengadaptasikan chart ke format Modern Rhythm Battle:

- Buat converter.
- Pertahankan BPM.
- Pertahankan offset.
- Pertahankan note timing.
- Pertahankan lane.
- Pertahankan hold duration.
- Pertahankan section metadata.
- Pertahankan difficulty.

Jangan membuat ulang chart tanpa kebutuhan teknis.

---

## 6. HUD & GAMEPLAY INTERFACE

Gunakan elemen visual FNF dari repository aset.

Pertahankan komposisi:

- Health bar.
- Character icons.
- Score.
- Combo.
- Judgment.
- Song progress.
- Song title.
- Difficulty.
- Countdown.
- Pause interface.
- Results interface.

Jangan mengganti HUD dengan dashboard modern generik.

HUD harus mengikuti visual hierarchy dan karakteristik gameplay FNF.

Jika diperlukan penambahan informasi khusus PvP, integrasikan dengan gaya visual yang sama.

Informasi tambahan PvP:

- Player 1 score.
- Player 2 score.
- Player 1 HP.
- Player 2 HP.
- Connection status.
- Special attack status.

Informasi tambahan tidak boleh merusak komposisi visual utama.

---

## 7. FREE PLAY MODE

Free Play tetap menjadi mode permainan solo.

Fitur:

- Song selection.
- Difficulty selection.
- Character selection jika didukung.
- Gameplay.
- Score.
- Combo.
- Accuracy.
- Judgment.
- Personal best.
- Results screen.

Gunakan tampilan gameplay yang sama dengan Online PvP.

Perbedaannya hanya pada aturan pertandingan.

Free Play tidak membutuhkan lawan manusia dan tidak menjalankan sistem damage PvP.

---

## 8. ONLINE MULTIPLAYER: PLAYER VS PLAYER

Online Multiplayer merupakan fitur utama Modern Rhythm Battle.

**WAJIB: Dua pemain manusia harus dapat bertanding secara realtime melalui internet.**

Jangan menjadikan lawan sebagai NPC.

Jangan menggunakan simulasi score lawan.

Jangan membuat sistem bergantian.

### A. Match Format

- 1 VS 1.
- Dua pemain manusia.
- Satu pertandingan.
- Satu lagu.
- Satu chart.
- Satu difficulty.
- Gameplay berjalan bersamaan.

Kedua pemain ditampilkan dalam satu stage dengan komposisi visual yang mengikuti gaya FNF.

### B. Character Positioning

- Player 1 berada di sisi kiri.
- Player 2 berada di sisi kanan.
- Keduanya terlihat dalam satu arena.
- Keduanya menggunakan karakter masing-masing.
- Animasi kedua karakter berjalan secara independen.
- Input Player 1 tidak boleh mengendalikan karakter Player 2.
- Input Player 2 tidak boleh mengendalikan karakter Player 1.

### C. Independent Input

Setiap pemain memiliki input dan note state sendiri.

Kedua pemain memainkan chart yang identik.

Sistem harus memisahkan:

- Input Player 1.
- Input Player 2.
- Judgment Player 1.
- Judgment Player 2.
- Combo Player 1.
- Combo Player 2.
- Score Player 1.
- Score Player 2.
- HP Player 1.
- HP Player 2.

Jangan membuat satu input memengaruhi kedua pemain.

### D. Matchmaking

Sediakan:

**Quick Match**
- Mencari lawan otomatis.
- Memasukkan pemain ke room pertandingan.
- Memverifikasi kesiapan kedua pemain.

**Private Room**
- Membuat room.
- Menghasilkan room code.
- Join room menggunakan kode.
- Ready system.
- Host memulai pertandingan.

### E. Match Preparation

Urutan:

1. Pemain masuk ke room.
2. Server memverifikasi kedua pemain.
3. Kedua pemain memilih atau menerima lagu.
4. Server menetapkan chart dan difficulty.
5. Kedua pemain melakukan ready.
6. Server menetapkan waktu mulai.
7. Countdown ditampilkan.
8. Musik dimulai secara sinkron.
9. Pertandingan berlangsung.

---

## 9. PVP COMBAT SYSTEM

Pertahankan sistem kompetitif Modern Rhythm Battle.

### A. Health

- Setiap pemain memulai dengan HP 100.
- Masing-masing memiliki HP terpisah.
- Damage diproses server.
- Perubahan HP disinkronkan kepada kedua pemain.

### B. Automatic Attack

- Judgment menentukan damage.
- Hit yang akurat menyerang lawan.
- Miss dan judgment buruk dapat memberikan damage kepada diri sendiri.
- Gunakan konfigurasi damage yang sudah direncanakan.
- Jangan mengubah balancing tanpa pengujian.

### C. Special Attack

- Combo menjadi dasar pengisian Special Attack.
- Pertahankan threshold combo yang sudah ditentukan.
- Space digunakan untuk aktivasi.
- Server memvalidasi aktivasi.
- Special Attack memiliki visual effect dan character animation.
- Cooldown dan damage mengikuti konfigurasi combat.

### D. Win/Lose

- HP mencapai nol berarti kalah.
- Jika lagu selesai, HP tertinggi menjadi pemenang.
- Jika HP sama, score menjadi tie-breaker.
- Server menentukan hasil akhir.

---

## 10. MULTIPLAYER SYNCHRONIZATION

Server menjadi otoritas pertandingan.

### Server Responsibilities

- Player identity.
- Room membership.
- Match state.
- Song selection.
- Chart selection.
- Start timestamp.
- Input validation.
- Judgment validation.
- Combo.
- Score.
- Accuracy.
- Damage.
- HP.
- Special attack.
- Match result.

### Client Responsibilities

- Rendering.
- Character animation.
- Stage animation.
- Note rendering.
- Audio playback.
- Keyboard input.
- Visual effects.
- HUD.
- Temporary input feedback.

Jangan mempercayai score, HP, damage, combo, dan hasil akhir yang dikirim browser sebagai data final.

### Synchronization Requirements

- Kedua pemain menggunakan Song ID yang sama.
- Kedua pemain menggunakan Chart ID yang sama.
- Kedua pemain menggunakan chart version yang sama.
- Kedua pemain menggunakan difficulty yang sama.
- Kedua pemain menerima scheduled start timestamp.
- Kedua browser menggunakan audio clock.
- Input memiliki timestamp atau informasi timing yang dapat divalidasi.
- Server menangani latency.
- Server menangani duplicate input.
- Server menangani disconnect dan reconnect.

Jangan menggunakan requestAnimationFrame atau Date.now() sebagai sumber utama timing musik dan judgment.

---

## 11. WEB PLATFORM ARCHITECTURE

Pertahankan integrasi dengan proyek Modern Rhythm Battle yang sudah berjalan.

Stack platform:

| Layer | Technology |
|---|---|
| Web platform | React + Vite + TypeScript |
| Original gameplay engine | HaxeFlixel + OpenFL + Lime, jika HTML5 port layak |
| Backend | Bun + ElysiaJS |
| Multiplayer | WebSocket |
| Database | MySQL |
| ORM | Drizzle ORM |
| Validation | Zod |
| Styling | Tailwind CSS lokal |

### Integration Principles

React tetap menangani:

- Main menu.
- Authentication.
- User profile.
- Song selection.
- Character selection.
- Matchmaking.
- Private room.
- Leaderboard.
- Match history.
- Results.

Gameplay engine menangani:

- Stage.
- Character.
- Note highway.
- Receptor.
- HUD.
- Animation.
- Audio.
- Judgment.
- Gameplay rendering.

Bun + ElysiaJS menangani:

- Authentication.
- Matchmaking.
- Room management.
- WebSocket.
- Match authority.
- Combat.
- Result persistence.

Jangan membuat aplikasi kedua yang tidak terintegrasi dengan proyek utama.

---

## 12. IMPLEMENTATION PHASES

Kerjakan secara bertahap agar tidak merusak fitur yang sudah selesai.

### Phase 1: Repository Audit

- Audit proyek Modern Rhythm Battle.
- Audit repository FNF.
- Audit repository funkin.assets.
- Audit lisensi dan dokumentasi penggunaan.
- Audit build HTML5.
- Audit engine compatibility.
- Identifikasi bagian yang dapat digunakan kembali.
- Buat integration plan.

Output: laporan audit dan rencana integrasi.

### Phase 2: Original Asset Integration

- Integrasikan official asset source.
- Buat asset loader.
- Integrasikan karakter.
- Integrasikan stage.
- Integrasikan note dan receptor.
- Integrasikan HUD.
- Integrasikan font dan effects.
- Pastikan seluruh aset tampil dengan benar di browser.

Output: gameplay menggunakan aset sumber resmi yang diotorisasi.

### Phase 3: FNF Gameplay Reconstruction

- Reproduksi gameplay layout.
- Stage rendering.
- Character rendering.
- Animation system.
- Note highway.
- Receptor.
- Judgment.
- HUD.
- Camera.
- Effects.
- Countdown.
- Pause.
- Results.

Output: Free Play yang memiliki pengalaman gameplay FNF sedekat mungkin.

### Phase 4: Modern Rhythm Battle Integration

- Integrasikan HP.
- Integrasikan automatic attack.
- Integrasikan Special Attack.
- Integrasikan win/lose.
- Pertahankan gameplay Free Play.

Output: gameplay dengan sistem combat Modern Rhythm Battle.

### Phase 5: Online PvP

- Matchmaking.
- Private Room.
- Ready system.
- WebSocket.
- Start synchronization.
- Independent player input.
- Server-authoritative judgment.
- Score synchronization.
- HP synchronization.
- Damage.
- Special Attack.
- Reconnect.
- Match result.

Output: dua pemain manusia dapat bertanding secara bersamaan.

### Phase 6: Quality Assurance

- Test browser desktop.
- Test dua browser berbeda.
- Test dua perangkat berbeda.
- Test koneksi internet berbeda.
- Test audio synchronization.
- Test chart.
- Test character animation.
- Test judgment.
- Test combat.
- Test reconnect.
- Test Free Play.
- Test Online PvP.

Output: game berjalan stabil dan dapat dimainkan.

---

## 13. PERFORMANCE REQUIREMENTS

Target utama browser desktop.

Pastikan:

- Gameplay berjalan lancar.
- Asset loading efisien.
- Audio tidak terputus.
- Animasi tidak menghambat input.
- WebSocket stabil.
- Penggunaan memory terkendali.
- Tidak terjadi freeze saat pergantian animasi.
- Rendering tidak menurunkan akurasi input.
- Multiplayer tetap berjalan saat koneksi mengalami fluktuasi.

Jangan mengorbankan ketepatan timing demi efek visual.

---

## 14. TECHNICAL RESTRICTIONS

Jangan:

- Mengubah keseluruhan proyek tanpa audit.
- Menghapus fitur yang sudah selesai pada ISSUE 001 sampai ISSUE 004.
- Menghilangkan rhythm engine yang sudah berfungsi tanpa alasan teknis.
- Mengubah mapping lane.
- Mengubah audio clock tanpa kebutuhan teknis.
- Mengubah judgment window tanpa pengujian.
- Mengubah arah note menjadi top-to-bottom.
- Mengganti karakter resmi dengan avatar generik.
- Mengganti visual FNF dengan dashboard atau UI rhythm generik.
- Mengubah Online PvP menjadi bot.
- Membuat pemain bermain bergantian.
- Mempercayai score dan HP dari browser.
- Menggunakan CDN untuk Tailwind CSS.

---

## 15. ACCEPTANCE CRITERIA

### Repository & Assets

- [ ] Repository FNF telah diaudit.
- [ ] Repository funkin.assets telah diaudit.
- [ ] Struktur aset telah dipahami.
- [ ] Asset pipeline berjalan.
- [ ] Karakter resmi dapat ditampilkan.
- [ ] Animasi karakter berfungsi.
- [ ] Stage dan background dapat ditampilkan.
- [ ] Note dan receptor menggunakan aset yang sesuai.
- [ ] HUD menggunakan elemen visual yang sesuai.
- [ ] Dokumentasi sumber aset tersedia.

### FNF Gameplay

- [ ] Gameplay layout mengikuti FNF.
- [ ] Stage rendering berfungsi.
- [ ] Character rendering berfungsi.
- [ ] Character animation berfungsi.
- [ ] Note highway berfungsi.
- [ ] Receptor berada di atas.
- [ ] Note bergerak dari bawah ke atas.
- [ ] Hold note berfungsi.
- [ ] Judgment berfungsi.
- [ ] Score berfungsi.
- [ ] Combo berfungsi.
- [ ] HUD berfungsi.
- [ ] Audio sinkron.
- [ ] Countdown berfungsi.
- [ ] Pause berfungsi.
- [ ] Results screen berfungsi.

### Free Play

- [ ] Song selection berfungsi.
- [ ] Difficulty selection berfungsi.
- [ ] Gameplay solo berfungsi.
- [ ] Personal best tersimpan.
- [ ] Hasil permainan ditampilkan.

### Online PvP

- [ ] Dua pemain manusia dapat terhubung melalui internet.
- [ ] Quick Match berfungsi.
- [ ] Private Room berfungsi.
- [ ] Room code berfungsi.
- [ ] Ready system berfungsi.
- [ ] Dua karakter ditampilkan dalam satu arena.
- [ ] Kedua pemain bermain bersamaan.
- [ ] Input kedua pemain terpisah.
- [ ] Lagu dan chart tersinkronisasi.
- [ ] Score diperbarui realtime.
- [ ] HP diperbarui realtime.
- [ ] Damage divalidasi server.
- [ ] Special Attack divalidasi server.
- [ ] Win/lose ditentukan server.
- [ ] Reconnect tersedia.
- [ ] Match result tersimpan.

### Final Testing

- [ ] Browser desktop berhasil menjalankan game.
- [ ] Free Play berhasil diuji.
- [ ] Online PvP berhasil diuji menggunakan dua browser.
- [ ] Tidak ada regresi pada ISSUE sebelumnya.
- [ ] Tidak ada masalah audio synchronization.
- [ ] Tidak ada masalah judgment timing.
- [ ] Tidak ada error kritis selama pertandingan.

---

## 16. FINAL INSTRUCTIONS FOR AI CODING AGENT

Lakukan audit menyeluruh sebelum memulai implementasi.

Jangan terburu-buru mengganti teknologi atau membuat ulang gameplay.

Prioritas utama:

1. Gunakan repository FNF sebagai acuan implementasi utama.
2. Gunakan repository funkin.assets sebagai sumber aset resmi yang telah diotorisasi.
3. Pertahankan pengalaman visual dan perilaku gameplay sedekat mungkin dengan FNF.
4. Port atau integrasikan gameplay agar berjalan di browser.
5. Pertahankan platform React dan backend Bun yang sudah ada.
6. Tambahkan sistem Online PvP 1 VS 1.
7. Pertahankan Free Play.
8. Uji seluruh fitur secara nyata.

Jangan hanya membuat mockup atau tampilan statis.

Jangan menyatakan pekerjaan selesai hanya karena karakter dan panah sudah terlihat.

Setiap komponen harus berfungsi dan terintegrasi dengan sistem gameplay.

Jika menemukan keterbatasan engine, dokumentasikan masalah, alternatif, dan konsekuensinya sebelum mengambil keputusan arsitektur besar.

**DEFINITION OF DONE:**

Modern Rhythm Battle harus dapat dimainkan melalui browser dengan pengalaman visual dan gameplay yang mendekati Friday Night Funkin, menggunakan aset sumber resmi yang diotorisasi, serta menyediakan Free Play dan Online Player VS Player 1 VS 1 yang benar-benar berjalan secara realtime.