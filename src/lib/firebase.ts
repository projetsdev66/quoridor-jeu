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

/** Generates a room code that isn't already in use, so two hosts can never collide and overwrite each other. */
export async function generateUniqueRoomCode(maxAttempts = 8): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateRoomCode();
    const snapshot = await get(getRoomRef(code));
    if (!snapshot.exists()) return code;
  }
  // Extremely unlikely fallback: widen to 5 characters to guarantee availability
  return generateRoomCode() + Math.floor(Math.random() * 10);
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

/** Lightweight peek used before actually joining, so the joiner can see the host's chosen color and pick a different one. */
export async function peekRoom(roomId: string): Promise<{ hostColor: string; hostName: string } | null> {
  const snapshot = await get(getRoomRef(roomId));
  if (!snapshot.exists()) return null;
  const data = snapshot.val();
  return {
    hostColor: data?.colors?.p1 ?? '#c0392b',
    hostName: data?.names?.p1 ?? 'Hôte',
  };
}

export async function joinRoom(roomId: string, joinerColor?: string, joinerName?: string): Promise<GameState | null> {
  const snapshot = await get(getRoomRef(roomId));
  if (snapshot.exists()) {
    const data = snapshot.val();
    const merged = {
      ...getFreshState(),
      ...data,
      walls: data.walls || [],
      history: data.history || [],
      chat: data.chat || [],
      players: { p1: true, p2: true },
      colors: { p1: data?.colors?.p1 ?? '#c0392b', p2: joinerColor ?? '#3a6ea8' },
      names: { p1: data?.names?.p1 ?? 'Hôte', p2: joinerName || data?.names?.p2 || 'Adversaire' },
    } as GameState;
    // Tell the host in real time that an opponent has connected, with the agreed colors/name.
    await update(getRoomRef(roomId), {
      players: merged.players,
      colors: merged.colors,
      names: merged.names,
    });
    return merged;
  }
  return null;
}
