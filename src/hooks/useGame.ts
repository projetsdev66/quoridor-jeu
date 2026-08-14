import { useState, useEffect, useCallback } from 'react';
import {
  type GameState,
  type Player,
  type Wall,
  type Position,
  getFreshState,
  normalizeGameState,
  applyMove,
  applyWall,
} from '../lib/gameLogic';
import { updateGameState, subscribeToRoom } from '../lib/firebase';

export function useGame(initialState?: GameState, roomId?: string, onSyncError?: () => void) {
  const [gameState, setGameState] = useState<GameState>(() => normalizeGameState(initialState));
  const [localPlayer, setLocalPlayer] = useState<Player>('p1');

  useEffect(() => {
    if (!roomId) return;
    return subscribeToRoom(roomId, setGameState, onSyncError);
  }, [roomId, onSyncError]);

  const dispatchMove = useCallback((player: Player, pos: Position) => {
    setGameState((current) => {
      const next = applyMove(current, player, pos);
      if (next === current) return current;
      if (roomId) updateGameState(roomId, next).catch(() => onSyncError?.());
      return roomId ? current : next;
    });
  }, [roomId, onSyncError]);

  const dispatchWall = useCallback((player: Player, wall: Wall) => {
    setGameState((current) => {
      const next = applyWall(current, player, wall);
      if (next === current) return current;
      if (roomId) updateGameState(roomId, next).catch(() => onSyncError?.());
      return roomId ? current : next;
    });
  }, [roomId, onSyncError]);

  const dispatchChat = useCallback((sender: string, text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;
    setGameState((current) => {
      const newChat = [...current.chat, { sender: sender.trim() || 'Joueur', text: cleanText, time: Date.now() }].slice(-100);
      const newState = { ...current, chat: newChat, updatedAt: Date.now() };
      if (roomId) updateGameState(roomId, { chat: newChat, updatedAt: newState.updatedAt }).catch(() => onSyncError?.());
      return roomId ? current : newState;
    });
  }, [roomId, onSyncError]);

  const restartGame = useCallback(() => {
    const fresh = getFreshState(gameState.maxPlayers);
    fresh.aiDifficulty = gameState.aiDifficulty;
    fresh.roomId = roomId;
    fresh.names = { ...gameState.names };
    fresh.mode = gameState.mode;
    fresh.colors = { ...gameState.colors };
    fresh.players = { ...gameState.players };
    if (roomId) {
      updateGameState(roomId, fresh).catch(() => onSyncError?.());
    } else {
      setGameState(fresh);
    }
  }, [gameState, roomId, onSyncError]);

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
