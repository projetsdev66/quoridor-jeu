import { useCallback, useEffect, useState } from 'react';
import {
  type GameState,
  type Player,
  type Wall,
  type Position,
  PLAYER_IDS,
  getFreshState,
  wallsForPlayerCount,
  normalizeGameState,
  applyMove,
  applyWall,
} from '../lib/gameLogic';
import { transactGameState, subscribeToRoom, type RoomSyncIssue } from '../lib/firebase';

function resetStateFrom(current: GameState, roomId?: string): GameState {
  const fresh = getFreshState(current.maxPlayers, current.mode ?? 'classic');
  fresh.aiDifficulty = current.aiDifficulty;
  fresh.roomId = roomId;
  fresh.names = { ...current.names };
  fresh.mode = current.mode;
  fresh.colors = { ...current.colors };
  fresh.players = { ...current.players };
  const wallCapacity = wallsForPlayerCount(current.maxPlayers);
  fresh.wallsLeft = Object.fromEntries(
    PLAYER_IDS.map((player) => [player, fresh.players[player] ? wallCapacity : 0]),
  ) as GameState['wallsLeft'];
  return fresh;
}

export function useGame(initialState?: GameState, roomId?: string, onSyncError?: (issue: RoomSyncIssue) => void) {
  const [gameState, setGameState] = useState<GameState>(() => normalizeGameState(initialState));
  const [localPlayer, setLocalPlayer] = useState<Player>('p1');

  useEffect(() => {
    if (!roomId) return;
    return subscribeToRoom(roomId, setGameState, onSyncError);
  }, [roomId, onSyncError]);

  const dispatchMove = useCallback((player: Player, pos: Position) => {
    if (roomId) {
      void transactGameState(roomId, (current) => {
        const next = applyMove(current, player, pos);
        return next === current ? null : next;
      }).catch(() => onSyncError?.('error'));
      return;
    }
    setGameState((current) => applyMove(current, player, pos));
  }, [roomId, onSyncError]);

  const dispatchWall = useCallback((player: Player, wall: Wall) => {
    if (roomId) {
      void transactGameState(roomId, (current) => {
        const next = applyWall(current, player, wall);
        return next === current ? null : next;
      }).catch(() => onSyncError?.('error'));
      return;
    }
    setGameState((current) => applyWall(current, player, wall));
  }, [roomId, onSyncError]);

  const dispatchChat = useCallback((sender: string, text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    if (roomId) {
      void transactGameState(roomId, (current) => {
        const chat = [...current.chat, { sender: sender.trim() || 'Joueur', text: cleanText, time: Date.now() }].slice(-100);
        return { ...current, chat, updatedAt: Date.now() };
      }).catch(() => onSyncError?.('error'));
      return;
    }

    setGameState((current) => ({
      ...current,
      chat: [...current.chat, { sender: sender.trim() || 'Joueur', text: cleanText, time: Date.now() }].slice(-100),
      updatedAt: Date.now(),
    }));
  }, [roomId, onSyncError]);

  const restartGame = useCallback(() => {
    if (roomId) {
      void transactGameState(roomId, (current) => resetStateFrom(current, roomId))
        .catch(() => onSyncError?.('error'));
      return;
    }
    setGameState((current) => resetStateFrom(current));
  }, [roomId, onSyncError]);

  return {
    gameState,
    setGameState,
    localPlayer,
    setLocalPlayer,
    dispatchMove,
    dispatchWall,
    dispatchChat,
    restartGame,
  };
}
