import type { LaneDirection } from "@rhythm-battle/shared";

export interface LaneDefinition {
  index: number;
  id: LaneDirection;
  direction: "LEFT" | "DOWN" | "UP" | "RIGHT";
  key: "ArrowLeft" | "ArrowDown" | "ArrowUp" | "ArrowRight";
  keyName: "Left" | "Down" | "Up" | "Right";
  symbol: "←" | "↓" | "↑" | "→";
  rotationDeg: number;
  color: string;
  darkColor: string;
  textColorOnDark: string;
  textColorOnFill: string;
  activeBgTint: string;
}

// Single source of truth for lane order (LEFT -> DOWN -> UP -> RIGHT), colors, and keyboard bindings.
export const LANE_CONFIG: readonly LaneDefinition[] = [
  {
    index: 0,
    id: "left",
    direction: "LEFT",
    key: "ArrowLeft",
    keyName: "Left",
    symbol: "←",
    rotationDeg: 0,
    color: "#F43F5E",
    darkColor: "#BE123C",
    textColorOnDark: "#FB7185",
    textColorOnFill: "#FFFFFF",
    activeBgTint: "rgba(244, 63, 94, 0.16)"
  },
  {
    index: 1,
    id: "down",
    direction: "DOWN",
    key: "ArrowDown",
    keyName: "Down",
    symbol: "↓",
    rotationDeg: -90,
    color: "#38BDF8",
    darkColor: "#0284C7",
    textColorOnDark: "#38BDF8",
    textColorOnFill: "#090B10",
    activeBgTint: "rgba(56, 189, 248, 0.16)"
  },
  {
    index: 2,
    id: "up",
    direction: "UP",
    key: "ArrowUp",
    keyName: "Up",
    symbol: "↑",
    rotationDeg: 90,
    color: "#F59E0B",
    darkColor: "#D97706",
    textColorOnDark: "#FBBF24",
    textColorOnFill: "#090B10",
    activeBgTint: "rgba(245, 158, 11, 0.16)"
  },
  {
    index: 3,
    id: "right",
    direction: "RIGHT",
    key: "ArrowRight",
    keyName: "Right",
    symbol: "→",
    rotationDeg: 180,
    color: "#A855F7",
    darkColor: "#7E22CE",
    textColorOnDark: "#C084FC",
    textColorOnFill: "#FFFFFF",
    activeBgTint: "rgba(168, 85, 247, 0.16)"
  }
] as const;

export const LANE_KEYS = LANE_CONFIG.map((lane) => lane.key);
export const LANE_LABELS = LANE_CONFIG.map((lane) => lane.symbol);
export const LANE_KEY_NAMES = LANE_CONFIG.map((lane) => lane.keyName);
export const LANE_COLORS = LANE_CONFIG.map((lane) => lane.color);

export const DEFAULT_SCROLL_SPEED = 600;
export const MIN_SCROLL_SPEED = 300;
export const MAX_SCROLL_SPEED = 1000;

export const CANVAS_WIDTH = 520;
export const CANVAS_HEIGHT = 740;
export const HIT_ZONE_Y = 620;
export const NOTE_WIDTH = 86;
export const NOTE_HEIGHT = 86;
export const LANE_COUNT = LANE_CONFIG.length;

export const COUNTDOWN_STEPS = ["3", "2", "1", "BATTLE!"] as const;
export const COUNTDOWN_STEP_MS = 650;
export const SONG_END_TAIL_SEC = 1.5;
