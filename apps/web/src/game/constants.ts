export const LANE_KEYS = [
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown"
] as const;

export const LANE_LABELS = ["←", "→", "↑", "↓"] as const;

export const LANE_KEY_NAMES = ["Left", "Right", "Up", "Down"] as const;

export const DEFAULT_SCROLL_SPEED = 600;
export const MIN_SCROLL_SPEED = 300;
export const MAX_SCROLL_SPEED = 1000;

export const CANVAS_WIDTH = 440;
export const CANVAS_HEIGHT = 640;
export const HIT_ZONE_Y = 544;
export const NOTE_WIDTH = 84;
export const NOTE_HEIGHT = 24;
export const LANE_COUNT = 4;

// Colorblind-aware high-contrast lane palette against #111318 stage background.
export const LANE_COLORS = [
  "#F43F5E",
  "#F59E0B",
  "#38BDF8",
  "#34D399"
] as const;

export const COUNTDOWN_STEPS = ["3", "2", "1", "START"] as const;
export const COUNTDOWN_STEP_MS = 650;
export const SONG_END_TAIL_SEC = 1.5;

