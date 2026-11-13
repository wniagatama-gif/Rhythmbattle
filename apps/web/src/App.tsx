import { useEffect, useMemo, useRef, useState } from "react";
import { RAW_CHART_FILES } from "@rhythm-battle/game-data";
import type { HealthResponse } from "@rhythm-battle/shared";
import { GamePlayScreen } from "./components/GamePlayScreen";
import { ResultScreen } from "./components/ResultScreen";
import { SongSelectScreen } from "./components/SongSelectScreen";
import { PvpLobbyScreen } from "./components/pvp/PvpLobbyScreen";
import { PvpResultScreen } from "./components/pvp/PvpResultScreen";
import { ChartParser } from "./game/engine/ChartParser";
import { loadBestScores, recordBestScore, type BestScoresMap } from "./game/storage/bestScores";
import type { ChartFile } from "./game/types/chart";
import { usePvpMatch } from "./hooks/usePvpMatch";
import { useRhythmEngine } from "./hooks/useRhythmEngine";
import { fetchHealthStatus } from "./services/api";

type AppMode = "free-play" | "online-pvp";

export function App() {
  const [mode, setMode] = useState<AppMode>("free-play");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(true);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [bestScores, setBestScores] = useState<BestScoresMap>(() => loadBestScores());
  const [isNewBest, setIsNewBest] = useState<boolean>(false);
  const recordedResultRef = useRef<boolean>(false);
  const launchedMatchIdRef = useRef<string | null>(null);

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
    startSynchronizedChart,
    pause,
    resume,
    backToSongSelect,
    triggerLanePress,
    triggerLaneRelease,
    clearError
  } = useRhythmEngine();

  const pvp = usePvpMatch();

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

  // Launch synchronized PvP gameplay when server schedules a match.
  useEffect(() => {
    const scheduled = pvp.scheduledMatch;
    if (!scheduled) {
      launchedMatchIdRef.current = null;
      return;
    }
    if (launchedMatchIdRef.current === scheduled.matchId) {
      return;
    }

    const chart =
      parsedChartsResult.charts.find((c) => c.id === scheduled.chartId) ??
      parsedChartsResult.charts[0];
    if (!chart) {
      return;
    }

    launchedMatchIdRef.current = scheduled.matchId;
    setMode("online-pvp");
    void startSynchronizedChart(chart, scheduled.startDelayMs, {
      onNoteAttempt: (lane, songTimeSec) => pvp.sendNoteInput(lane, songTimeSec),
      onAutoMiss: (noteIndex) => pvp.sendNoteMissTimeout(noteIndex),
      onSongFinished: () => pvp.sendSongEnded()
    });
  }, [pvp, parsedChartsResult.charts, startSynchronizedChart]);

  // Stop local audio/engine immediately if server ends PvP match early (e.g. HP reached 0).
  useEffect(() => {
    if (pvp.matchResult && (snapshot.phase === "playing" || snapshot.phase === "countdown")) {
      backToSongSelect();
    }
  }, [pvp.matchResult, snapshot.phase, backToSongSelect]);

  const activeChart =
    selectedChart ??
    parsedChartsResult.charts.find((chart) => chart.id === selectedChartId) ??
    parsedChartsResult.charts[0] ??
    null;

  useEffect(() => {
    if (mode === "online-pvp" || snapshot.phase !== "result") {
      recordedResultRef.current = false;
      setIsNewBest(false);
      return;
    }

    if (activeChart && !recordedResultRef.current) {
      recordedResultRef.current = true;
      const result = recordBestScore(
        activeChart.id,
        snapshot.scoreState.score,
        snapshot.scoreState.accuracy,
        snapshot.scoreState.maxCombo
      );
      setBestScores(result.bestScores);
      setIsNewBest(result.isNewBest);
    }
  }, [mode, snapshot.phase, snapshot.scoreState, activeChart]);

  const isGameplayPhase =
    snapshot.phase === "countdown" ||
    snapshot.phase === "playing" ||
    snapshot.phase === "paused";

  if (isGameplayPhase && activeChart) {
    const isPvpActive = mode === "online-pvp" && Boolean(pvp.room);
    return (
      <GamePlayScreen
        chart={activeChart}
        snapshot={snapshot}
        setCanvasRef={setCanvasElement}
        onPause={pause}
        onResume={resume}
        onRestart={() => void startChart(activeChart)}
        onExit={() => {
          if (isPvpActive) {
            pvp.leaveRoom();
          }
          backToSongSelect();
        }}
        onLanePress={triggerLanePress}
        onLaneRelease={triggerLaneRelease}
        pvpContext={
          isPvpActive
            ? {
                selfPlayer: pvp.selfPlayer,
                opponentPlayer: pvp.opponentPlayer,
                pingMs: pvp.pingMs,
                isSpecialReady: pvp.isSpecialReady,
                combatPulse: pvp.combatPulse,
                onSpecialAttack: pvp.sendSpecialAttack
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="min-h-dvh bg-[#0B0D14] text-[#F8FAFC] flex flex-col">
      <header className="border-b-2 border-[#090B10] bg-[#141824]">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="w-9 h-9 rounded-lg bg-[#BE123C] border-2 border-[#090B10] shadow-[0_3px_0_#05070B] flex items-center justify-center font-black text-sm text-white"
            >
              RB
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight uppercase text-[#F8FAFC]">
                Modern Rhythm Battle
              </h1>
              <p className="text-xs font-semibold text-[#CBD5E1]">
                FNF-Inspired Arcade & Online 1v1 PvP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Mode Switcher: Free Play vs Online PvP */}
            <div
              role="tablist"
              aria-label="Game mode"
              className="inline-flex rounded-lg bg-[#0B0D14] p-1 border-2 border-[#090B10]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "free-play"}
                onClick={() => setMode("free-play")}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-md text-xs font-black uppercase transition-colors ${
                  mode === "free-play"
                    ? "bg-[#BE123C] text-white"
                    : "text-[#CBD5E1] hover:text-[#F8FAFC]"
                }`}
              >
                Free Play
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "online-pvp"}
                onClick={() => setMode("online-pvp")}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-md text-xs font-black uppercase transition-colors ${
                  mode === "online-pvp"
                    ? "bg-[#0284C7] text-white"
                    : "text-[#CBD5E1] hover:text-[#F8FAFC]"
                }`}
              >
                Online PvP
              </button>
            </div>

            <div className="text-xs font-semibold text-[#CBD5E1] flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`inline-block w-2.5 h-2.5 rounded-full border border-[#090B10] ${
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
              className="min-h-[44px] px-3.5 py-2 rounded-md bg-[#1E2436] border-2 border-[#090B10] shadow-[0_3px_0_#05070B] text-xs font-extrabold uppercase text-[#F8FAFC] hover:bg-[#2A334B] disabled:opacity-50"
            >
              Check API
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {mode === "online-pvp" ? (
          pvp.matchResult && activeChart ? (
            <PvpResultScreen
              chart={activeChart}
              playerId={pvp.playerId}
              result={pvp.matchResult}
              onBackToRoom={() => pvp.clearMatchResult()}
              onLeaveToLobby={() => {
                pvp.clearMatchResult();
                pvp.leaveRoom();
              }}
            />
          ) : (
            <PvpLobbyScreen
              charts={parsedChartsResult.charts}
              selectedChartId={selectedChartId}
              connected={pvp.connected}
              connecting={pvp.connecting}
              playerId={pvp.playerId}
              playerName={pvp.playerName}
              pingMs={pvp.pingMs}
              searching={pvp.searching}
              room={pvp.room}
              error={pvp.error}
              onConnect={pvp.connect}
              onDisconnect={pvp.disconnect}
              onQuickMatch={pvp.quickMatch}
              onCreateRoom={pvp.createRoom}
              onJoinRoom={pvp.joinRoom}
              onSelectChart={pvp.selectChart}
              onSetReady={pvp.setReady}
              onStartMatch={pvp.startMatch}
              onLeaveRoom={pvp.leaveRoom}
              onDismissError={pvp.clearError}
            />
          )
        ) : snapshot.phase === "song-select" ? (
          <SongSelectScreen
            charts={parsedChartsResult.charts}
            bestScores={bestScores}
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
        ) : snapshot.phase === "result" && activeChart ? (
          <ResultScreen
            chart={activeChart}
            scoreState={snapshot.scoreState}
            isNewBest={isNewBest}
            onPlayAgain={() => void startChart(activeChart)}
            onBackToList={backToSongSelect}
          />
        ) : null}
      </main>

      <footer className="border-t-2 border-[#090B10] bg-[#141824]">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold text-[#CBD5E1]">
          <span>Modern Rhythm Battle</span>
          <span>Bottom-to-Top 4-Lane Engine & Online PvP</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
