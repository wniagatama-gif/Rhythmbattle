const BEST_SCORES_STORAGE_KEY = "modern-rhythm-battle:best-scores:v1";

export interface TrackBestRecord {
  score: number;
  accuracy: number;
  maxCombo: number;
  updatedAt: string;
}

export type BestScoresMap = Record<string, TrackBestRecord>;

export function loadBestScores(): BestScoresMap {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(BEST_SCORES_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return {};
    }
    return parsed as BestScoresMap;
  } catch {
    return {};
  }
}

export function recordBestScore(
  chartId: string,
  score: number,
  accuracy: number,
  maxCombo: number
): { bestScores: BestScoresMap; isNewBest: boolean } {
  const current = loadBestScores();
  const previous = current[chartId];
  const isNewBest = !previous || score > previous.score;

  if (isNewBest) {
    current[chartId] = {
      score,
      accuracy,
      maxCombo,
      updatedAt: new Date().toISOString()
    };
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(BEST_SCORES_STORAGE_KEY, JSON.stringify(current));
      } catch {
        // Ignore storage quota failures in restricted browsing contexts.
      }
    }
  }

  return { bestScores: current, isNewBest };
}

