import { useCallback, useEffect, useRef, useState } from "react";
import {
  PVP_COMBAT_CONFIG,
  type PvpClientMessage,
  type PvpFinishReason,
  type PvpPlayerSnapshot,
  type PvpRoomSnapshot,
  type PvpServerMessage
} from "@rhythm-battle/shared";
import { getApiBaseUrl } from "../services/api";

export interface PvpMatchResult {
  matchId: string;
  winnerId: string | null;
  reason: PvpFinishReason;
  players: PvpPlayerSnapshot[];
}

export interface PvpScheduledInfo {
  matchId: string;
  chartId: string;
  scheduledStartServerMs: number;
  startDelayMs: number;
}

export interface PvpCombatPulse {
  id: number;
  actorId: string;
  kind: "hit" | "miss" | "special" | "hurt";
  lane?: number;
}

function getWsUrl(): string {
  const base = getApiBaseUrl();
  const wsBase = base.replace(/^http:/i, "ws:").replace(/^https:/i, "wss:");
  return `${wsBase}/ws/pvp`;
}

export function usePvpMatch() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef<boolean>(false);
  const playerIdRef = useRef<string>("");
  const playerNameRef = useRef<string>("Challenger");
  const clockOffsetMsRef = useRef<number>(0);

  const [connected, setConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("Challenger");
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [room, setRoom] = useState<PvpRoomSnapshot | null>(null);
  const [scheduledMatch, setScheduledMatch] = useState<PvpScheduledInfo | null>(null);
  const [matchResult, setMatchResult] = useState<PvpMatchResult | null>(null);
  const [combatPulse, setCombatPulse] = useState<PvpCombatPulse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback((msg: PvpClientMessage): void => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }
    ws.send(JSON.stringify(msg));
  }, []);

  const stopHeartbeat = useCallback((): void => {
    if (pingIntervalRef.current !== null) {
      window.clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  const openSocket = useCallback(
    (name: string) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        return;
      }

      setConnecting(true);
      setError(null);

      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setConnecting(false);
        ws.send(
          JSON.stringify({
            type: "hello",
            playerName: name,
            playerId: playerIdRef.current || undefined
          } satisfies PvpClientMessage)
        );
        ws.send(
          JSON.stringify({
            type: "ping",
            clientTimeMs: Date.now()
          } satisfies PvpClientMessage)
        );

        stopHeartbeat();
        pingIntervalRef.current = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: "ping",
                clientTimeMs: Date.now()
              } satisfies PvpClientMessage)
            );
          }
        }, 3000);
      };

      ws.onmessage = (event) => {
        let msg: PvpServerMessage;
        try {
          msg = JSON.parse(String(event.data)) as PvpServerMessage;
        } catch {
          return;
        }

        switch (msg.type) {
          case "welcome":
            playerIdRef.current = msg.playerId;
            setPlayerId(msg.playerId);
            setPlayerName(msg.playerName);
            break;
          case "pong": {
            const now = Date.now();
            const rtt = Math.max(0, now - msg.clientTimeMs);
            setPingMs(rtt);
            clockOffsetMsRef.current = msg.serverTimeMs - (msg.clientTimeMs + rtt / 2);
            break;
          }
          case "matchmaking_status":
            setSearching(msg.status === "searching");
            break;
          case "room_state":
            setRoom(msg.room);
            setSearching(false);
            break;
          case "match_scheduled": {
            setRoom(msg.room);
            setMatchResult(null);
            const estimatedServerNow = Date.now() + clockOffsetMsRef.current;
            const startDelayMs = Math.max(300, msg.scheduledStartServerMs - estimatedServerNow);
            setScheduledMatch({
              matchId: msg.matchId,
              chartId: msg.chartId,
              scheduledStartServerMs: msg.scheduledStartServerMs,
              startDelayMs
            });
            break;
          }
          case "note_judged": {
            setRoom((prev) => (prev ? { ...prev, players: msg.players } : prev));
            setCombatPulse({
              id: performance.now(),
              actorId: msg.playerId,
              kind: msg.judgement === "MISS" ? "miss" : "hit",
              lane: msg.lane
            });
            break;
          }
          case "special_triggered": {
            setRoom((prev) => (prev ? { ...prev, players: msg.players } : prev));
            setCombatPulse({
              id: performance.now(),
              actorId: msg.attackerId,
              kind: "special"
            });
            break;
          }
          case "match_finished":
            setScheduledMatch(null);
            setMatchResult({
              matchId: msg.matchId,
              winnerId: msg.winnerId,
              reason: msg.reason,
              players: msg.players
            });
            setRoom((prev) => (prev ? { ...prev, players: msg.players, matchState: "lobby" } : prev));
            break;
          case "error":
            setError(msg.message);
            break;
        }
      };

      ws.onerror = () => {
        setError("Unable to reach Online PvP server.");
      };

      ws.onclose = () => {
        stopHeartbeat();
        setConnected(false);
        setConnecting(false);
        wsRef.current = null;

        if (shouldReconnectRef.current) {
          reconnectTimerRef.current = window.setTimeout(() => {
            openSocket(playerNameRef.current);
          }, 1500);
        }
      };
    },
    [stopHeartbeat]
  );

  const connect = useCallback(
    (name: string) => {
      const cleanName = name.trim() || "Challenger";
      playerNameRef.current = cleanName;
      setPlayerName(cleanName);
      shouldReconnectRef.current = true;
      openSocket(cleanName);
    },
    [openSocket]
  );

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    stopHeartbeat();
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
    setRoom(null);
    setSearching(false);
    setScheduledMatch(null);
  }, [stopHeartbeat]);

  useEffect(() => {
    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      stopHeartbeat();
      wsRef.current?.close();
    };
  }, [stopHeartbeat]);

  const selfPlayer = room?.players.find((p) => p.playerId === playerId) ?? null;
  const opponentPlayer = room?.players.find((p) => p.playerId !== playerId) ?? null;

  const isSpecialReady = Boolean(
    selfPlayer &&
      selfPlayer.combo >= PVP_COMBAT_CONFIG.specialAttack.comboThreshold &&
      (selfPlayer.lastSpecialAtMs === 0 ||
        Date.now() + clockOffsetMsRef.current - selfPlayer.lastSpecialAtMs >=
          PVP_COMBAT_CONFIG.specialAttack.cooldownMs)
  );

  return {
    connected,
    connecting,
    playerId,
    playerName,
    pingMs,
    searching,
    room,
    selfPlayer,
    opponentPlayer,
    scheduledMatch,
    matchResult,
    combatPulse,
    isSpecialReady,
    error,
    connect,
    disconnect,
    clearError: () => setError(null),
    clearMatchResult: () => setMatchResult(null),
    clearScheduledMatch: () => setScheduledMatch(null),
    quickMatch: (chartId?: string) => sendMessage({ type: "quick_match", chartId }),
    createRoom: (chartId: string) => sendMessage({ type: "create_room", chartId }),
    joinRoom: (roomCode: string) => sendMessage({ type: "join_room", roomCode }),
    selectChart: (chartId: string) => sendMessage({ type: "select_chart", chartId }),
    setReady: (ready: boolean) => sendMessage({ type: "set_ready", ready }),
    startMatch: () => sendMessage({ type: "start_match" }),
    leaveRoom: () => {
      sendMessage({ type: "leave_room" });
      setRoom(null);
      setScheduledMatch(null);
      setMatchResult(null);
    },
    sendNoteInput: (lane: number, songTimeSec: number) =>
      sendMessage({ type: "note_input", lane, songTimeSec }),
    sendNoteMissTimeout: (noteIndex: number) =>
      sendMessage({ type: "note_miss_timeout", noteIndex }),
    sendSpecialAttack: () => sendMessage({ type: "special_attack" }),
    sendSongEnded: () => sendMessage({ type: "match_song_ended" })
  };
}

