import { useCallback, useEffect, useRef, useState } from "react";
import { INITIAL_SCORE_STATE } from "@rhythm-battle/shared";
import { DEFAULT_SCROLL_SPEED } from "../game/constants";
import { GameEngine } from "../game/engine/GameEngine";
import type { ChartFile } from "../game/types/chart";
import type { GameSnapshot } from "../game/types/game";

const INITIAL_SNAPSHOT: GameSnapshot = {
  phase: "song-select",
  currentTime: 0,
  duration: 0,
  scoreState: INITIAL_SCORE_STATE,
  lastJudgement: null,
  countdownLabel: "",
  activeLanes: [false, false, false, false]
};

export function useRhythmEngine() {
  const engineRef = useRef<GameEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [snapshot, setSnapshot] = useState<GameSnapshot>(INITIAL_SNAPSHOT);
  const [scrollSpeed, setScrollSpeedState] = useState<number>(DEFAULT_SCROLL_SPEED);
  const [selectedChart, setSelectedChart] = useState<ChartFile | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [engineError, setEngineError] = useState<string | null>(null);

  useEffect(() => {
    const engine = new GameEngine((nextSnapshot) => {
      setSnapshot(nextSnapshot);
    });
    engineRef.current = engine;

    if (canvasRef.current) {
      engine.attachCanvas(canvasRef.current);
    }

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const setCanvasElement = useCallback((node: HTMLCanvasElement | null) => {
    canvasRef.current = node;
    engineRef.current?.attachCanvas(node);
  }, []);

  const setScrollSpeed = useCallback((speed: number) => {
    setScrollSpeedState(speed);
    engineRef.current?.setScrollSpeed(speed);
  }, []);

  const startChart = useCallback(async (chart: ChartFile) => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }

    setEngineError(null);
    setIsLoadingAudio(true);
    setSelectedChart(chart);

    try {
      engine.setScrollSpeed(scrollSpeed);
      const parsed = await engine.startChart(chart);
      setSelectedChart(parsed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initialize audio or chart.";
      setEngineError(msg);
      engine.stopToSelect();
    } finally {
      setIsLoadingAudio(false);
    }
  }, [scrollSpeed]);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    engineRef.current?.resume();
  }, []);

  const backToSongSelect = useCallback(() => {
    setEngineError(null);
    engineRef.current?.stopToSelect();
  }, []);

  const triggerLanePress = useCallback((lane: number) => {
    engineRef.current?.triggerLanePress(lane);
  }, []);

  const triggerLaneRelease = useCallback((lane: number) => {
    engineRef.current?.triggerLaneRelease(lane);
  }, []);

  const clearError = useCallback(() => {
    setEngineError(null);
  }, []);

  return {
    snapshot,
    scrollSpeed,
    selectedChart,
    isLoadingAudio,
    engineError,
    setCanvasElement,
    setScrollSpeed,
    startChart,
    pause,
    resume,
    backToSongSelect,
    triggerLanePress,
    triggerLaneRelease,
    clearError
  };
}

