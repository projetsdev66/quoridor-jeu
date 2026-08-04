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

export function useGame(initialState?: GameState, roomId?: string) {
  const [gameState, setGameState] = useState<GameState>(initialState || getFreshState());
  const [localPlayer, setLocalPlayer] = useState<Player>('p1');

  // Multiplayer sync
  useEffect(() => {
    if (!roomId) return;
    const roomRef = getRoomRef(roomId);
    const unsubscribe = onValue(roomRef, (snapshot) => {
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
    });
    return () => unsubscribe();
  }, [roomId]);

  const dispatchMove = useCallback((player: Player, pos: Position) => {
    const newState = applyMove(gameState, player, pos);
    if (roomId) {
      updateGameState(roomId, newState);
    } else {
      setGameState(newState);
    }
  }, [gameState, roomId]);

  const dispatchWall = useCallback((player: Player, wall: Wall) => {
    const newState = applyWall(gameState, player, wall);
    if (roomId) {
      updateGameState(roomId, newState);
    } else {
      setGameState(newState);
    }
  }, [gameState, roomId]);

  const dispatchChat = useCallback((sender: string, text: string) => {
    const newChat = [...gameState.chat, { sender, text, time: Date.now() }];
    const newState = { ...gameState, chat: newChat };
    if (roomId) {
      updateGameState(roomId, { chat: newChat });
    } else {
      setGameState(newState);
    }
  }, [gameState, roomId]);

  const restartGame = useCallback(() => {
    const fresh = getFreshState();
    fresh.aiDifficulty = gameState.aiDifficulty;
    fresh.roomId = roomId;
    fresh.names = gameState.names;
    fresh.mode = gameState.mode;

    if (roomId) {
      updateGameState(roomId, fresh);
    } else {
      setGameState(fresh);
    }
  }, [gameState, roomId]);

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
