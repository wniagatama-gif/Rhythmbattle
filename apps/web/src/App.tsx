import { useEffect, useMemo, useRef, useState } from "react";
import { RAW_CHART_FILES } from "@rhythm-battle/game-data";
import type { HealthResponse } from "@rhythm-battle/shared";
import { GamePlayScreen } from "./components/GamePlayScreen";
import { ResultScreen } from "./components/ResultScreen";
import { SongSelectScreen } from "./components/SongSelectScreen";
import { MainMenuScreen, type MainMenuTarget } from "./components/menu/MainMenuScreen";
import { CharacterSelectScreen } from "./components/characters/CharacterSelectScreen";
import { SettingsScreen } from "./components/settings/SettingsScreen";
import { LeaderboardScreen } from "./components/stats/LeaderboardScreen";
import { ProfileScreen } from "./components/stats/ProfileScreen";
import { PvpLobbyScreen } from "./components/pvp/PvpLobbyScreen";
import { PvpResultScreen } from "./components/pvp/PvpResultScreen";
import { ChartParser } from "./game/engine/ChartParser";
import { loadBestScores, recordBestScore, type BestScoresMap } from "./game/storage/bestScores";
import type { ChartFile } from "./game/types/chart";
import { usePvpMatch } from "./hooks/usePvpMatch";
import { useRhythmEngine } from "./hooks/useRhythmEngine";
import { fetchHealthStatus } from "./services/api";

type AppScreen =
  | "main-menu"
  | "free-play"
  | "online-pvp"
  | "character-select"
  | "settings"
  | "leaderboard"
  | "profile";

export function App() {
  const [screen, setScreen] = useState<AppScreen>("main-menu");
  const [health, setHealth] = useState<HealthResponse | null>(null);
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
    try {
      const data = await fetchHealthStatus();
      setHealth(data);
    } catch {
      setHealth(null);
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
    setScreen("online-pvp");
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
    if (screen === "online-pvp" || snapshot.phase !== "result") {
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
  }, [screen, snapshot.phase, snapshot.scoreState, activeChart]);

  const isGameplayPhase =
    snapshot.phase === "countdown" ||
    snapshot.phase === "playing" ||
    snapshot.phase === "paused";

  // Active Battle Gameplay Screen
  if (isGameplayPhase && activeChart) {
    const isPvpActive = screen === "online-pvp" && Boolean(pvp.room);
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

  // Result Screens
  if (snapshot.phase === "result" && activeChart) {
    return (
      <ResultScreen
        chart={activeChart}
        scoreState={snapshot.scoreState}
        isNewBest={isNewBest}
        onPlayAgain={() => void startChart(activeChart)}
        onBackToList={() => {
          backToSongSelect();
          setScreen("free-play");
        }}
      />
    );
  }

  // Dedicated PvP Result Screen
  if (screen === "online-pvp" && pvp.matchResult && activeChart) {
    return (
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
    );
  }

  // Main Menu Navigation Flow
  switch (screen) {
    case "main-menu":
      return (
        <MainMenuScreen
          onNavigate={(target: MainMenuTarget) => setScreen(target)}
          apiConnected={Boolean(health?.success)}
        />
      );

    case "free-play":
      return (
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
          onBackToMenu={() => setScreen("main-menu")}
        />
      );

    case "online-pvp":
      return (
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
          onBackToMenu={() => setScreen("main-menu")}
        />
      );

    case "character-select":
      return <CharacterSelectScreen onBack={() => setScreen("main-menu")} />;

    case "settings":
      return (
        <SettingsScreen
          onBack={() => setScreen("main-menu")}
          scrollSpeed={scrollSpeed}
          onScrollSpeedChange={setScrollSpeed}
        />
      );

    case "leaderboard":
      return (
        <LeaderboardScreen
          charts={parsedChartsResult.charts}
          bestScores={bestScores}
          onBack={() => setScreen("main-menu")}
        />
      );

    case "profile":
      return (
        <ProfileScreen
          charts={parsedChartsResult.charts}
          bestScores={bestScores}
          playerName={pvp.playerName}
          onUpdatePlayerName={(name) => pvp.connect(name)}
          onBack={() => setScreen("main-menu")}
        />
      );

    default:
      return (
        <MainMenuScreen
          onNavigate={(target) => setScreen(target)}
          apiConnected={Boolean(health?.success)}
        />
      );
  }
}

export default App;
