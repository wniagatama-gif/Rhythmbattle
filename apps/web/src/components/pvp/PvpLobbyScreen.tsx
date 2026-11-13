import { useEffect, useState } from "react";
import type { PvpPlayerSnapshot, PvpRoomSnapshot } from "@rhythm-battle/shared";
import type { ChartFile } from "../../game/types/chart";
import { AudioManager } from "../../game/engine/AudioManager";

interface PvpLobbyScreenProps {
  charts: ChartFile[];
  selectedChartId: string;
  connected: boolean;
  connecting: boolean;
  playerId: string;
  playerName: string;
  pingMs: number | null;
  searching: boolean;
  room: PvpRoomSnapshot | null;
  error: string | null;
  onConnect: (name: string) => void;
  onDisconnect: () => void;
  onQuickMatch: (chartId?: string) => void;
  onCreateRoom: (chartId: string) => void;
  onJoinRoom: (roomCode: string) => void;
  onSelectChart: (chartId: string) => void;
  onSetReady: (ready: boolean) => void;
  onStartMatch: () => void;
  onLeaveRoom: () => void;
  onDismissError: () => void;
  onBackToMenu?: () => void;
}

export function PvpLobbyScreen({
  charts,
  selectedChartId,
  connected,
  connecting,
  playerId,
  playerName,
  pingMs,
  searching,
  room,
  error,
  onConnect,
  onDisconnect,
  onQuickMatch,
  onCreateRoom,
  onJoinRoom,
  onSelectChart,
  onSetReady,
  onStartMatch,
  onLeaveRoom,
  onDismissError,
  onBackToMenu
}: PvpLobbyScreenProps) {
  const [nameInput, setNameInput] = useState<string>(playerName);
  const [roomCodeInput, setRoomCodeInput] = useState<string>("");
  const audio = AudioManager.getInstance();

  useEffect(() => {
    audio.playMenuMusic();
  }, [audio]);

  const self: PvpPlayerSnapshot | undefined = room?.players.find((p) => p.playerId === playerId);
  const isHost = room?.hostId === playerId;
  const bothReady =
    Boolean(room) &&
    room!.players.length === 2 &&
    room!.players.every((p) => p.ready && p.connected);
  const activeRoomChart = charts.find((c) => c.id === room?.chartId) ?? charts[0];

  const handleBack = (): void => {
    audio.playCancel();
    onBackToMenu?.();
  };

  return (
    <div className="relative min-h-dvh w-full overflow-hidden flex flex-col justify-between select-none">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter hue-rotate-[200deg] brightness-90"
        style={{ backgroundImage: "url('/assets/images/menu/menuDesat.png')" }}
      />
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

      {/* Header */}
      <header className="relative z-10 pt-5 px-6 max-w-6xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBackToMenu && (
            <button
              type="button"
              onClick={handleBack}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-black/70 border-2 border-[#FDE047] text-white font-black text-xs uppercase hover:bg-black transition-transform active:translate-y-0.5"
            >
              ◀ BACK (ESC)
            </button>
          )}
          <h2 className="text-2xl sm:text-3xl font-black italic tracking-wider text-white uppercase drop-shadow-[0_4px_0_#000]">
            ONLINE 1V1 PVP
          </h2>
        </div>

        {connected && (
          <div className="flex items-center gap-2 bg-black/80 px-3 py-1.5 rounded-full border-2 border-[#34D399] text-xs font-bold text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] animate-pulse" />
            <span>Connected{pingMs !== null ? ` (${pingMs} ms)` : ""}</span>
          </div>
        )}
      </header>

      {/* Main Body */}
      <main className="relative z-10 my-auto py-5 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-5">
        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-900/90 border-2 border-red-400 text-white flex items-center justify-between gap-3 text-sm font-bold shadow-[0_4px_0_#000]"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={onDismissError}
              className="px-3 py-1 rounded bg-black text-xs uppercase font-black"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Connection Bar */}
        <div className="bg-black/85 border-4 border-[#FDE047] shadow-[0_8px_0_#000] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transform -skew-x-2">
          <div>
            <h3 className="text-xl font-black italic text-white uppercase">
              Online Matchmaking
            </h3>
            <p className="text-xs font-semibold text-gray-300">
              Synchronized bottom-to-top note highway with server-authoritative scoring & Special Attacks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              maxLength={20}
              value={nameInput}
              disabled={connected}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your Singer Name"
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-black border-2 border-white/30 text-sm font-black text-[#FDE047] uppercase disabled:opacity-70 max-w-[200px]"
            />
            {!connected ? (
              <button
                type="button"
                disabled={connecting}
                onClick={() => {
                  audio.playConfirm();
                  onConnect(nameInput);
                }}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] border-2 border-white shadow-[0_4px_0_#000] text-sm font-black uppercase text-white transition-transform active:translate-y-0.5 disabled:opacity-50"
              >
                {connecting ? "Connecting..." : "Connect"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  audio.playCancel();
                  onDisconnect();
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border-2 border-white/30 text-xs font-black uppercase text-white"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        {!connected ? (
          <div className="bg-black/75 border-4 border-dashed border-[#1E2436] rounded-2xl p-10 text-center space-y-2">
            <p className="text-lg font-black italic text-white uppercase">
              Connect to the Online Server to Find Challengers
            </p>
            <p className="text-xs font-semibold text-gray-400">
              Set your name above and connect to enter Quick Match or create a Private Room.
            </p>
          </div>
        ) : room ? (
          /* Active Match Room */
          <div className="bg-black/85 border-4 border-[#FDE047] shadow-[0_8px_0_#000] rounded-2xl p-6 sm:p-7 space-y-6 transform -skew-x-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded bg-[#E11D48] text-white text-xs font-black uppercase">
                    {room.mode === "quick" ? "QUICK MATCH" : "PRIVATE ROOM"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-[#0284C7] text-white text-xs font-black tracking-widest">
                    ROOM: {room.roomCode}
                  </span>
                </div>
                <h3 className="text-2xl font-black italic text-white uppercase mt-1">
                  Track: {activeRoomChart?.title ?? room.chartId} [{activeRoomChart?.difficulty.toUpperCase()}]
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  audio.playCancel();
                  onLeaveRoom();
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border-2 border-white/30 text-xs font-black uppercase text-white shrink-0"
              >
                Leave Room
              </button>
            </div>

            {/* Host Song Select */}
            {isHost && room.mode === "private" && (
              <div className="space-y-1.5">
                <label htmlFor="pvp-chart-select" className="text-xs font-black uppercase text-[#FDE047]">
                  Select Match Track (Host Control)
                </label>
                <select
                  id="pvp-chart-select"
                  value={room.chartId}
                  onChange={(e) => {
                    audio.playScroll();
                    onSelectChart(e.target.value);
                  }}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl bg-black border-2 border-white/30 text-sm font-black text-white uppercase"
                >
                  {charts.map((chart) => (
                    <option key={chart.id} value={chart.id}>
                      {chart.title} [{chart.difficulty.toUpperCase()} - {chart.bpm} BPM]
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 2 Player Slots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((slot) => {
                const occupant = room.players.find((p) => p.slot === slot);
                const isSelf = occupant?.playerId === playerId;
                const iconSrc = slot === 1 ? "/assets/images/icons/icon-bf.png" : "/assets/images/icons/icon-spooky.png";

                return (
                  <div
                    key={slot}
                    className={`p-4 rounded-xl border-4 ${
                      occupant
                        ? "bg-black/70 border-white/30"
                        : "bg-black/40 border-dashed border-gray-700"
                    } flex items-center justify-between gap-3`}
                  >
                    {occupant ? (
                      <>
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={iconSrc}
                            alt=""
                            className="w-12 h-12 rounded-lg bg-black/60 p-1 border-2 border-white/20 object-contain"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-black text-white italic uppercase truncate">
                                {occupant.playerName}
                              </span>
                              {isSelf && (
                                <span className="px-1.5 py-0.5 rounded bg-[#FDE047] text-black text-[10px] font-black uppercase">
                                  YOU
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-gray-300">
                              Player {slot} | {occupant.connected ? "Connected" : "Reconnecting..."}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                            occupant.ready
                              ? "bg-[#34D399] text-black"
                              : "bg-[#1E2436] text-gray-300"
                          }`}
                        >
                          {occupant.ready ? "READY" : "WAITING"}
                        </span>
                      </>
                    ) : (
                      <div className="w-full text-center py-3 text-sm font-black text-gray-400 uppercase italic">
                        Waiting for Player 2 (Code: <strong className="text-[#38BDF8]">{room.roomCode}</strong>)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  audio.playConfirm();
                  onSetReady(!(self?.ready ?? false));
                }}
                className={`flex-1 min-h-[50px] px-6 py-3 rounded-xl border-2 font-black uppercase italic text-base transition-transform active:translate-y-0.5 ${
                  self?.ready
                    ? "bg-gray-800 border-white/30 text-white"
                    : "bg-[#0284C7] hover:bg-[#0369A1] border-white text-white shadow-[0_4px_0_#000]"
                }`}
              >
                {self?.ready ? "CANCEL READY" : "READY UP!"}
              </button>

              {room.mode === "private" && isHost && (
                <button
                  type="button"
                  disabled={!bothReady}
                  onClick={() => {
                    audio.playConfirm();
                    onStartMatch();
                  }}
                  className="flex-1 min-h-[50px] px-6 py-3 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] border-2 border-white shadow-[0_4px_0_#000] disabled:opacity-50 text-white font-black uppercase italic text-base transition-transform active:translate-y-0.5"
                >
                  {bothReady ? "START 1V1 BATTLE!" : "WAITING FOR READY"}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Matchmaking Choices */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Match */}
            <div className="bg-black/85 border-4 border-[#FDE047] shadow-[0_8px_0_#000] rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-6 transform -skew-x-2">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded bg-[#E11D48] text-white text-xs font-black uppercase">
                  MATCHMAKER
                </span>
                <h3 className="text-2xl font-black italic text-white uppercase">
                  Quick Match
                </h3>
                <p className="text-xs font-semibold text-gray-300">
                  Instantly queue up and play against the first available online challenger on the current stage.
                </p>
              </div>

              {searching ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-black border-2 border-[#38BDF8] text-sm font-black text-[#38BDF8] text-center uppercase animate-pulse">
                    Searching for challenger...
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      audio.playCancel();
                      onLeaveRoom();
                    }}
                    className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border-2 border-white/20 text-xs font-black uppercase text-white"
                  >
                    Cancel Search
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    audio.playConfirm();
                    onQuickMatch(selectedChartId);
                  }}
                  className="w-full min-h-[52px] px-6 py-3 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] border-2 border-white shadow-[0_4px_0_#000] text-white font-black text-base uppercase italic transition-transform active:translate-y-0.5"
                >
                  Find Opponent (Quick Match)
                </button>
              )}
            </div>

            {/* Private Room */}
            <div className="bg-black/85 border-4 border-[#FDE047] shadow-[0_8px_0_#000] rounded-2xl p-6 sm:p-7 space-y-6 transform -skew-x-2">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded bg-[#0284C7] text-white text-xs font-black uppercase">
                  ROOM CODE
                </span>
                <h3 className="text-2xl font-black italic text-white uppercase">
                  Private Room
                </h3>
                <p className="text-xs font-semibold text-gray-300">
                  Create a custom match room and share the room code, or join an existing room below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  audio.playConfirm();
                  onCreateRoom(selectedChartId);
                }}
                className="w-full min-h-[52px] px-6 py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] border-2 border-white shadow-[0_4px_0_#000] text-white font-black text-base uppercase italic transition-transform active:translate-y-0.5"
              >
                Create Private Room
              </button>

              <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  maxLength={8}
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="ROOM CODE"
                  className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-black border-2 border-white/30 text-sm font-black uppercase tracking-widest text-[#FDE047]"
                />
                <button
                  type="button"
                  disabled={roomCodeInput.trim().length < 4}
                  onClick={() => {
                    audio.playConfirm();
                    onJoinRoom(roomCodeInput.trim());
                  }}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border-2 border-white/30 disabled:opacity-50 text-xs font-black uppercase text-white"
                >
                  Join Room
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 pb-5 text-center text-xs font-black text-white drop-shadow-[0_2px_0_#000]">
        1v1 Rhythm Combat is server-authoritative. Misses deal damage; Combos charge Special Attacks!
      </footer>
    </div>
  );
}
