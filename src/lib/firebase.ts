import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, get, update, type DatabaseReference } from 'firebase/database';
import { type GameState, getFreshState } from './gameLogic';

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDXUJLgFNufpdZLMWjxRBQNGLOukvLx_4w",
  authDomain: "quoridor-jeu-651d6.firebaseapp.com",
  databaseURL: "https://quoridor-jeu-651d6-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "quoridor-jeu-651d6"
};

const app = initializeApp(FIREBASE_CONFIG);
export const db = getDatabase(app);

export function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getRoomRef(roomId: string): DatabaseReference {
  return ref(db, `rooms/${roomId}`);
}

export async function createRoom(initialState: GameState, roomId: string): Promise<void> {
  await set(getRoomRef(roomId), initialState);
}

export async function updateGameState(roomId: string, updates: Partial<GameState>): Promise<void> {
  await update(getRoomRef(roomId), updates);
}

export async function joinRoom(roomId: string): Promise<GameState | null> {
  const snapshot = await get(getRoomRef(roomId));
  if (snapshot.exists()) {
    const data = snapshot.val();
    return {
      ...getFreshState(),
      ...data,
      walls: data.walls || [],
      history: data.history || [],
      chat: data.chat || [],
    } as GameState;
  }
  return null;
}
