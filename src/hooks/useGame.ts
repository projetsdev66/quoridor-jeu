import { useState, useEffect, useCallback } from 'react';
import { 
  type GameState, 
  type Player, 
  type MoveAction, 
  type Wall, 
  type Position, 
  getFreshState, 
  applyMove, 
  applyWall 
} from '../lib/gameLogic';
import { getRoomRef, updateGameState } from '../lib/firebase';
import { onValue } from 'firebase/database';

export function useGame(initialState?: GameState, roomId?: string, onSyncError?: () => void) {
  const [gameState, setGameState] = useState<GameState>(initialState || getFreshState());
  const [localPlayer, setLocalPlayer] = useState<Player>('p1');

  // Multiplayer sync
  useEffect(() => {
    if (!roomId) return;
    const roomRef = getRoomRef(roomId);
    const unsubscribe = onValue(
      roomRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setGameState({
            ...getFreshState(),
            ...data,
            walls: data.walls || [],
            history: data.history || [],
            chat: data.chat || [],
          } as GameState);
        }
      },
      () => {
        // Permission denied, offline, or the room was removed — let the UI know instead of freezing silently.
        onSyncError?.();
      },
    );
    return () => unsubscribe();
  }, [roomId, onSyncError]);

  const dispatchMove = useCallback((player: Player, pos: Position) => {
    const newState = applyMove(gameState, player, pos);
    if (roomId) {
      updateGameState(roomId, newState).catch(() => onSyncError?.());
    } else {
      setGameState(newState);
    }
  }, [gameState, roomId, onSyncError]);

  const dispatchWall = useCallback((player: Player, wall: Wall) => {
    const newState = applyWall(gameState, player, wall);
    if (roomId) {
      updateGameState(roomId, newState).catch(() => onSyncError?.());
    } else {
      setGameState(newState);
    }
  }, [gameState, roomId, onSyncError]);

  const dispatchChat = useCallback((sender: string, text: string) => {
    const newChat = [...gameState.chat, { sender, text, time: Date.now() }];
    const newState = { ...gameState, chat: newChat };
    if (roomId) {
      updateGameState(roomId, { chat: newChat }).catch(() => onSyncError?.());
    } else {
      setGameState(newState);
    }
  }, [gameState, roomId, onSyncError]);

  const restartGame = useCallback(() => {
    const fresh = getFreshState();
    fresh.aiDifficulty = gameState.aiDifficulty;
    fresh.roomId = roomId;
    fresh.names = gameState.names;
    fresh.mode = gameState.mode;
    fresh.colors = gameState.colors;

    if (roomId) {
      updateGameState(roomId, fresh).catch(() => onSyncError?.());
    } else {
      setGameState(fresh);
    }
  }, [gameState, roomId, onSyncError]);

  return {
    gameState,
    setGameState, // For initial setup
    localPlayer,
    setLocalPlayer,
    dispatchMove,
    dispatchWall,
    dispatchChat,
    restartGame
  };
}
