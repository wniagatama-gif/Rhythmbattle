# Modern Rhythm Battle Design Direction

Source brief: `issue.md` (ISSUE 003: GAMEPLAY UI REDESIGN & LANE MAPPING CORRECTION).

## Design Read & Dials

Reading this as: an arcade rhythm battle game for desktop and mobile players, in a Modern FNF-Inspired Stylized Arcade style.

- **Dial:** `ENERGY 3 / RHYTHM 2 / MOTION 2`
- **One Focal Point Per Screen:**
  - **Song Select:** the active selected track showcase and `Start Battle` launch control.
  - **Gameplay Stage:** the central 4-lane Note Highway flanked by Player (left) and Opponent (right) battle silhouettes.
  - **Result Screen:** Victory/Defeat outcome banner with final score, accuracy, and combo breakdown.
- **Identity Motif:** crisp comic-arcade dark borders (`2px-3px`), stepped hard drop-offsets (`box-shadow: 0 4px 0 #05070B`), and directional color-coded rhythm arrows (`LEFT -> DOWN -> UP -> RIGHT`).

## Color System

- **Neutral Stage Base:** `#0B0D14` (void stage), `#141824` (HUD/panel surface), `#1E2436` (elevated surface), `#F8FAFC` (primary text), `#CBD5E1` (secondary text).
- **UI Core & Accent Palette:**
  - Core 1 (Player / Primary CTA): `#BE123C` / `#E11D48`
  - Core 2 (Opponent / Contrast Side): `#0284C7` / `#0EA5E9`
  - Accent (Combo / Peak Judgment): `#F59E0B`
- **Functional Lane Colors (Gameplay Encoding from Issue 003):**
  - Lane 0 `LEFT` (`ArrowLeft`): `#F43F5E` (Red / Pink)
  - Lane 1 `DOWN` (`ArrowDown`): `#38BDF8` (Blue / Cyan)
  - Lane 2 `UP` (`ArrowUp`): `#F59E0B` (Yellow / Orange)
  - Lane 3 `RIGHT` (`ArrowRight`): `#A855F7` (Purple)

## Typography

- **Display / Arcade Headings:** bold geometric sans-serif (`Space Grotesk`, system fallback) with tight tracking for track titles, judgment callouts, and numeric counters (`tabular-nums`).
- **UI / Body:** clean system sans-serif for legible settings, track metadata, and controls.

## Decision Reasons (R-31)

- **Dark stage palette (`#0B0D14`):** maximizes figure-ground contrast for falling colored rhythm arrows and stage spotlights during fast gameplay.
- **Full-viewport gameplay layout (`h-dvh overflow-hidden`):** removes website header/footer chrome during active play so the stage fills the browser without scrollbars.
- **Hard-bordered arcade panels over blurred glass:** preserves crisp readability under fast-moving notes and respects the glassmorphism/glow dose cap.
- **BPM-synced character motion and hit bursts:** ties every animation directly to musical timing, lane presses, hits, and misses rather than looping decorative idle noise.

