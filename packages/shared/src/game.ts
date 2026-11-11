export interface GameBaseConfig {
  defaultBpm: number;
  minBpm: number;
  maxBpm: number;
  hitWindowMs: {
    perfect: number;
    great: number;
    good: number;
    miss: number;
  };
  lanesCount: number;
  audioOffsetMs: number;
}

export const DEFAULT_GAME_CONFIG: GameBaseConfig = {
  defaultBpm: 120,
  minBpm: 60,
  maxBpm: 300,
  hitWindowMs: {
    perfect: 45,
    great: 90,
    good: 135,
    miss: 180
  },
  lanesCount: 4,
  audioOffsetMs: 0
};

