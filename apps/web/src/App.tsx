import { useEffect, useMemo, useState } from "react";
import { RAW_CHART_FILES } from "@rhythm-battle/game-data";
import type { HealthResponse } from "@rhythm-battle/shared";
import { GamePlayScreen } from "./components/GamePlayScreen";
import { ResultScreen } from "./components/ResultScreen";
import { SongSelectScreen } from "./components/SongSelectScreen";
import { ChartParser } from "./game/engine/ChartParser";
import type { ChartFile } from "./game/types/chart";
import { useRhythmEngine } from "./hooks/useRhythmEngine";
import { fetchHealthStatus } from "./services/api";

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  const parsedChartsResult = useMemo<{ charts: ChartFile[]; error: string | null }>(() => {
    try {
      return {
        charts: ChartParser.parseList(RAW_CHART_FILES),
        error: null
      };
    } catch (err: unknown) {
      return {
        charts: [],
        error: err instanceof Error ? err.message : "Failed to parse chart files."
      };
    }
  }, []);

  const [selectedChartId, setSelectedChartId] = useState<string>(
    () => parsedChartsResult.charts[0]?.id ?? ""
  );

  const {
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
  } = useRhythmEngine();

  const checkBackendHealth = async (): Promise<void> => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const data = await fetchHealthStatus();
      setHealth(data);
    } catch (err: unknown) {
      setHealthError(err instanceof Error ? err.message : "Backend unreachable");
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    void checkBackendHealth();
  }, []);

  const activeChart =
    selectedChart ??
    parsedChartsResult.charts.find((chart) => chart.id === selectedChartId) ??
    parsedChartsResult.charts[0] ??
    null;

  return (
    <div className="min-h-screen bg-[#111318] text-[#F3F4F6] flex flex-col">
      <header className="border-b border-[#2E3442] bg-[#111318]">
        <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#F3F4F6]">
              Modern Rhythm Battle
            </h1>
            <p className="text-xs text-[#A8B0BF]">
              Phase 2: Rhythm Engine (draft without direction)
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-xs text-[#A8B0BF] flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`inline-block w-2 h-2 rounded-full ${
                  healthLoading
                    ? "bg-[#FBBF24]"
                    : health?.success
                    ? "bg-[#34D399]"
                    : "bg-[#FB7185]"
                }`}
              />
              <span>
                API:{" "}
                {healthLoading
                  ? "Checking..."
                  : health?.success
                  ? "Connected"
                  : healthError ?? "Offline"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => void checkBackendHealth()}
              disabled={healthLoading}
              className="min-h-[44px] px-3 py-2 rounded-md bg-[#181B22] border border-[#64748B] text-xs font-medium text-[#F3F4F6] hover:bg-[#20242E] disabled:opacity-50"
            >
              Check API
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex-1">
        {snapshot.phase === "song-select" && (
          <SongSelectScreen
            charts={parsedChartsResult.charts}
            parseError={parsedChartsResult.error}
            engineError={engineError}
            selectedChartId={selectedChartId}
            scrollSpeed={scrollSpeed}
            isLoadingAudio={isLoadingAudio}
            onSelectChart={setSelectedChartId}
            onScrollSpeedChange={setScrollSpeed}
            onStartTrack={(chart) => void startChart(chart)}
            onDismissError={clearError}
          />
        )}

        {(snapshot.phase === "countdown" ||
          snapshot.phase === "playing" ||
          snapshot.phase === "paused") &&
          activeChart && (
            <GamePlayScreen
              chart={activeChart}
              snapshot={snapshot}
              setCanvasRef={setCanvasElement}
              onPause={pause}
              onResume={resume}
              onRestart={() => void startChart(activeChart)}
              onExit={backToSongSelect}
              onLanePress={triggerLanePress}
              onLaneRelease={triggerLaneRelease}
            />
          )}

        {snapshot.phase === "result" && activeChart && (
          <ResultScreen
            chart={activeChart}
            scoreState={snapshot.scoreState}
            onPlayAgain={() => void startChart(activeChart)}
            onBackToList={backToSongSelect}
          />
        )}
      </main>

      <footer className="border-t border-[#2E3442]">
        <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#A8B0BF]">
          <span>Modern Rhythm Battle</span>
          <span>Issue 002: Rhythm Engine</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
