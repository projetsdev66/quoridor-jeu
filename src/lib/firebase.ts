import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, get, update, runTransaction, type DatabaseReference } from 'firebase/database';
import { type GameState, type GameMode, type Player, PLAYER_IDS, type PlayerCount, getFreshState, normalizeGameState, nextPlayer, wallsForPlayerCount } from './gameLogic';

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDXUJLgFNufpdZLMWjxRBQNGLOukvLx_4w',
  authDomain: 'quoridor-jeu-651d6.firebaseapp.com',
  databaseURL: 'https://quoridor-jeu-651d6-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'quoridor-jeu-651d6',
};

const app = initializeApp(FIREBASE_CONFIG);
export const db = getDatabase(app);

const ROOM_OPERATION_TIMEOUT_MS = 9000;

function withRoomTimeout<T>(operation: Promise<T>, timeoutMs = ROOM_OPERATION_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('ROOM_REQUEST_TIMEOUT')), timeoutMs);
    operation.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function isTransientRoomError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes('timeout') || message.includes('network') || message.includes('unavailable') || message.includes('disconnected');
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

export async function generateUniqueRoomCode(maxAttempts = 8): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateRoomCode();
    const snapshot = await withRoomTimeout(get(getRoomRef(code)));
    if (!snapshot.exists()) return code;
  }
  throw new Error('ROOM_CODE_UNAVAILABLE');
}

export function getRoomRef(roomId: string): DatabaseReference {
  return ref(db, `rooms/${roomId.toUpperCase()}`);
}

export async function createRoom(initialState: GameState, roomId: string): Promise<boolean> {
  const result = await withRoomTimeout(runTransaction(getRoomRef(roomId), (currentData) => {
    if (currentData) return;
    return normalizeGameState(initialState);
  }));
  return result.committed;
}

export async function updateGameState(roomId: string, updates: Partial<GameState>): Promise<void> {
  await withRoomTimeout(update(getRoomRef(roomId), updates));
}

export async function transactGameState(
  roomId: string,
  updater: (state: GameState) => GameState | null,
): Promise<boolean> {
  const result = await withRoomTimeout(runTransaction(getRoomRef(roomId), (currentData) => {
    if (!currentData) return;
    const current = normalizeGameState(currentData as Partial<GameState>);
    const next = updater(current);
    return next ? normalizeGameState(next) : undefined;
  }));
  return result.committed;
}

export interface RoomInfo {
  hostColor: string;
  hostName: string;
  maxPlayers: PlayerCount;
  joinedPlayers: number;
  availablePlayers: number;
  mode?: GameMode;
  colors: Record<Player, string>;
  players: Record<Player, boolean>;
}

export async function peekRoom(roomId: string): Promise<RoomInfo | null> {
  const snapshot = await get(getRoomRef(roomId));
  if (!snapshot.exists()) return null;
  const state = normalizeGameState(snapshot.val());
  const joinedPlayers = Object.values(state.players).filter(Boolean).length;
  return {
    hostColor: state.colors.p1,
    hostName: state.names.p1,
    maxPlayers: state.maxPlayers,
    joinedPlayers,
    availablePlayers: state.maxPlayers - joinedPlayers,
    mode: state.mode,
    colors: state.colors,
    players: state.players,
  };
}

export interface JoinRoomResult {
  state: GameState;
  playerId: Player;
}

export async function joinRoom(roomId: string, joinerColor?: string, joinerName?: string): Promise<JoinRoomResult | null> {
  const roomRef = getRoomRef(roomId);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    let assignedPlayer: Player | null = null;
    try {
      const transaction = await withRoomTimeout(runTransaction(roomRef, (currentData) => {
        if (!currentData) return currentData;
        const current = normalizeGameState(currentData as Partial<GameState>);
        const slot = PLAYER_IDS.slice(0, current.maxPlayers).find((player) => !current.players[player]);
        if (!slot) return;

        const usedColors = new Set(PLAYER_IDS.filter((player) => current.players[player]).map((player) => current.colors[player]));
        const color = joinerColor && !usedColors.has(joinerColor) ? joinerColor : PLAYER_IDS
          .map((player) => current.colors[player])
          .find((candidate) => !usedColors.has(candidate)) ?? joinerColor ?? current.colors.p2;

        assignedPlayer = slot;
        return normalizeGameState({
          ...current,
          players: { ...current.players, [slot]: true },
          wallsLeft: { ...current.wallsLeft, [slot]: wallsForPlayerCount(current.maxPlayers) },
          names: { ...current.names, [slot]: joinerName?.trim() || `Joueur ${Number(slot.slice(1))}` },
          colors: { ...current.colors, [slot]: color },
          updatedAt: Date.now(),
        });
      }));

      if (!transaction.committed || !assignedPlayer) return null;
      return { state: normalizeGameState(transaction.snapshot.val()), playerId: assignedPlayer };
    } catch (error) {
      if (attempt === 1 || !isTransientRoomError(error)) throw error;
      await wait(350);
    }
  }

  return null;
}

export async function leaveRoom(roomId: string, playerId: Player): Promise<boolean> {
  const roomRef = getRoomRef(roomId);
  const result = await withRoomTimeout(runTransaction(roomRef, (currentData) => {
    if (!currentData) return currentData;
    const current = normalizeGameState(currentData as Partial<GameState>);

    // The host owns the room lifecycle. Removing the host removes the room so
    // other clients do not remain trapped in a stale waiting/game state.
    if (playerId === 'p1') return null;
    if (!current.players[playerId]) return currentData;

    const players = { ...current.players, [playerId]: false };
    const wallsLeft = { ...current.wallsLeft, [playerId]: 0 };
    const names = { ...current.names, [playerId]: `Joueur ${Number(playerId.slice(1))}` };
    const nextState = normalizeGameState({
      ...current,
      players,
      wallsLeft,
      names,
      turn: current.turn === playerId ? nextPlayer({ players, maxPlayers: current.maxPlayers, ranking: current.ranking }, playerId) : current.turn,
      updatedAt: Date.now(),
    });
    return nextState;
  }));
  return result.committed;
}

export type RoomSyncIssue = 'closed' | 'error';

export function subscribeToRoom(
  roomId: string,
  onState: (state: GameState) => void,
  onError?: (issue: RoomSyncIssue) => void,
): () => void {
  return onValue(
    getRoomRef(roomId),
    (snapshot) => {
      if (snapshot.exists()) onState(normalizeGameState(snapshot.val()));
      else onError?.('closed');
    },
    () => onError?.('error'),
  );
}
