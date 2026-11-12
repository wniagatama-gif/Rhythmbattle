# ISSUE 002: RHYTHM ENGINE

**Project:** Modern Rhythm Battle  
**Phase:** 2 - Rhythm Engine  
**Priority:** Critical  
**Status:** In Progress  
**Depends On:** Issue 001 (Project Foundation)

## 1. Objective

Bangun inti dari permainan: Rhythm Engine.

Rhythm Engine adalah sistem yang bertanggung jawab memuat chart lagu, mensinkronkan audio dengan waktu yang presisi, merender note yang jatuh ke lane, membaca input dari pemain, dan menentukan hasil hit berdasarkan timing window.

Fokus pada membangun sistem yang solid dan dapat diandalkan. Jangan membuat multiplayer, karakter 3D, atau sistem pertarungan pada fase ini.

## 2. Architecture

Rhythm Engine terdiri dari 6 subsistem:

```text
src/game/
├── engine/
│   ├── GameEngine.ts         # Koordinator utama, game loop (rAF)
│   ├── AudioEngine.ts        # Web Audio API wrapper, tracking waktu presisi
│   ├── ChartParser.ts        # Memuat dan memvalidasi chart JSON
│   ├── NoteManager.ts        # Spawning, scrolling, despawning note
│   ├── InputHandler.ts       # Keyboard listener → lane mapping
│   ├── JudgementEngine.ts    # Menentukan Perfect/Great/Good/Miss
│   └── ScoreEngine.ts        # Skor, combo, akurasi
├── types/
│   ├── chart.ts              # ChartFile, BPMEvent, NoteData
│   └── game.ts               # GameState, NoteObject, JudgementResult
└── constants.ts              # Lane keys, scroll speed, viewport config
```

## 3. Chart Format

Gunakan format JSON untuk data chart lagu:

```json
{
  "id": "demo-song-001",
  "title": "Demo Song",
  "artist": "Demo Artist",
  "bpm": 120,
  "audioFile": "demo.ogg",
  "duration": 60,
  "difficulty": "normal",
  "notes": [
    { "time": 0.5, "lane": 0, "type": "tap" },
    { "time": 1.0, "lane": 1, "type": "tap" },
    { "time": 1.5, "lane": 2, "type": "tap" },
    { "time": 2.0, "lane": 3, "type": "tap" }
  ]
}
```

## 4. Game Mechanics

### 4.1 Lane System
- 4 lanes (index 0–3)
- Default key mapping: ← (Left), → (Right), ↑ (Up), ↓ (Down) (tombol arah)
- Note scroll dari atas ke bawah
- Hit zone berada di bagian bawah lane

### 4.2 Judgement System (dari packages/shared)
| Judgement | Timing Window | Score |
| --- | --- | --- |
| PERFECT | ±45 ms | 300 pts |
| GREAT | ±90 ms | 200 pts |
| GOOD | ±135 ms | 100 pts |
| MISS | > 135 ms | 0 pts |

### 4.3 Scoring
- Base score x combo multiplier
- Combo multiplier: 1x (0–9), 2x (10–24), 3x (25–49), 4x (50+)
- Accuracy = Perfect / Total Notes

### 4.4 Audio Timing
- Gunakan `AudioContext.currentTime` untuk tracking waktu presisi
- Note spawn berdasarkan waktu audio bukan waktu sistem
- Scroll speed dapat dikonfigurasi (default: 600 px/s)

## 5. Frontend Implementation

### 5.1 Game Renderer
- Render menggunakan HTML Canvas 2D API
- Target 60 FPS via `requestAnimationFrame`
- Note divisualisasikan sebagai kotak berwarna per lane
- Hit zone divisualisasikan sebagai garis horizontal

### 5.2 HUD (Heads-Up Display)
- Skor real-time (top right)
- Combo counter (center)
- Accuracy (top left)
- Judgement feedback pop-up (teks PERFECT/GREAT/GOOD/MISS + animasi)

### 5.3 Game Flow
- SongSelect screen (pilih dari daftar song yang tersedia)
- CountDown screen (3–2–1–START sebelum lagu mulai)
- GamePlay screen (inti rhythm engine aktif)
- Result screen (skor akhir, akurasi, max combo)

## 6. Data Flow

```
ChartParser → NoteManager → GameEngine (rAF loop)
                                 ↓
AudioEngine.currentTime ────→ NoteManager.update()
InputHandler (keydown) ──────→ JudgementEngine.judge()
JudgementEngine.result ──────→ ScoreEngine.apply()
ScoreEngine.state ───────────→ React HUD (via callback/state)
GameEngine.noteObjects ──────→ Canvas Renderer
```

## 7. Testing & Acceptance Criteria

Issue dinyatakan selesai apabila:

- [ ] Chart JSON dapat di-parse dan divalidasi.
- [ ] Audio dapat dimuat dan diputar menggunakan Web Audio API.
- [ ] Note muncul dan bergerak dari atas ke bawah secara konsisten.
- [ ] Input keyboard terpetakan dengan benar ke lane.
- [ ] Judgement PERFECT/GREAT/GOOD/MISS dideteksi dengan benar.
- [ ] Skor dan combo dikalkulasi dengan benar.
- [ ] Accuracy dihitung dari seluruh note (termasuk MISS).
- [ ] Result screen menampilkan skor akhir, akurasi, dan max combo.
- [ ] Tidak ada `any` di TypeScript.
- [ ] Typecheck dan build berjalan tanpa error.

