import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { type GameState, type Player, getFreshState } from '@/lib/gameLogic';
import { useGame } from '@/hooks/useGame';
import { useAI } from '@/hooks/useAI';
import { useSound } from '@/hooks/useSound';
import { useTimer } from '@/hooks/useTimer';
import { useTurnTimer } from '@/hooks/useTurnTimer';
import { useStats } from '@/hooks/useStats';
import { Board } from '@/components/game/Board';
import { TopBar } from '@/components/game/TopBar';
import { PlayerCard } from '@/components/game/PlayerCard';
import { ModeControls } from '@/components/game/ModeControls';
import { StatusLine } from '@/components/game/StatusLine';
import { GameOverlay } from '@/components/game/GameOverlay';
import { RulesOverlay } from '@/components/game/RulesOverlay';
import { ChatPanel } from '@/components/game/ChatPanel';
import { HistoryPanel } from '@/components/game/HistoryPanel';

interface GameCoreProps {
  initialState: GameState;
  roomId?: string;
  localPlayerId: Player;
  onHome: () => void;
}

export function GameCore({ initialState, roomId, localPlayerId, onHome }: GameCoreProps) {
  const { gameState, dispatchMove, dispatchWall, dispatchChat, restartGame } = useGame(initialState, roomId);
  const [mode, setMode] = useState<'move' | 'wallH' | 'wallV'>('move');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [showPath, setShowPath] = useState(false);

  const { formatted: gameTime } = useTimer(!gameState.winner, gameState.roomId || 'local');
  const { playMove, playWall, playError, playVictory } = useSound(soundEnabled);

  const { stats, recordWin, recordLoss } = useStats();

  // Prevent double-recording on re-renders
  const hasRecordedRef = useRef(false);
  useEffect(() => {
    if (gameState.winner && !hasRecordedRef.current) {
      hasRecordedRef.current = true;
      if (gameState.winner === localPlayerId) {
        recordWin();
      } else {
        recordLoss();
      }
    }
    if (!gameState.winner) {
      hasRecordedRef.current = false;
    }
  }, [gameState.winner, localPlayerId, recordWin, recordLoss]);

  const isMyTurn = gameState.turn === localPlayerId && !gameState.winner;

  // Per-turn countdown — resets on each action (history.length is a reliable turn key)
  const { secondsLeft: turnSecondsLeft, isUrgent: turnIsUrgent } = useTurnTimer(
    isMyTurn,
    gameState.history.length,
  );

  // Configure AI if active
  useAI({
    gameState,
    dispatchMove: (p, pos) => {
      dispatchMove(p, pos);
      playMove();
    },
    dispatchWall: (p, wall) => {
      dispatchWall(p, wall);
      playWall();
    },
    isAIActive: !roomId && !!gameState.aiDifficulty,
  });

  // Sound effects based on last action
  useEffect(() => {
    if (gameState.lastAction) {
      if (gameState.lastAction.type === 'move') playMove();
      else if (gameState.lastAction.type === 'wall') playWall();
    }
  }, [gameState.lastAction, playMove, playWall]);

  useEffect(() => {
    if (gameState.winner) {
      playVictory();
    }
  }, [gameState.winner, playVictory]);

  const oppPlayerId = localPlayerId === 'p1' ? 'p2' : 'p1';
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>(roomId ? 'chat' : 'history');

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--color-wood-dark)]">
      <TopBar
        soundEnabled={soundEnabled}
        toggleSound={() => setSoundEnabled(!soundEnabled)}
        onQuit={onHome}
        onRules={() => setShowRules(true)}
        roomId={roomId}
        gameTime={gameTime}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-5xl mx-auto w-full gap-6">

        {/* Opponent Card */}
        <div className="w-full max-w-[460px]">
          <PlayerCard
            player={oppPlayerId}
            name={gameState.names[oppPlayerId]}
            wallsLeft={gameState.wallsLeft[oppPlayerId]}
            isActive={gameState.turn === oppPlayerId && !gameState.winner}
            isLocal={false}
          />
        </div>

        {/* Status Line */}
        <StatusLine
          isMyTurn={isMyTurn}
          winner={gameState.winner}
          opponentName={gameState.names[oppPlayerId]}
        />

        {/* The Board */}
        <Board
          gameState={gameState}
          localPlayer={localPlayerId}
          mode={mode}
          showPath={showPath}
          onMove={(pos) => dispatchMove(localPlayerId, pos)}
          onWall={(wall) => dispatchWall(localPlayerId, wall)}
        />

        {/* Path hint toggle */}
        {!gameState.winner && (
          <div className="flex justify-center -mt-2">
            <button
              onClick={() => setShowPath(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                showPath
                  ? 'bg-[var(--color-brass)]/20 border-[var(--color-brass)]/60 text-[var(--color-brass)]'
                  : 'bg-transparent border-[#3b2419] text-[var(--color-ivory)]/40 hover:text-[var(--color-ivory)]/70 hover:border-[#5c3a24]'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Chemin optimal
            </button>
          </div>
        )}

        {/* My Card & Controls */}
        <div className="w-full max-w-[460px] flex flex-col gap-4">
          <PlayerCard
            player={localPlayerId}
            name={gameState.names[localPlayerId]}
            wallsLeft={gameState.wallsLeft[localPlayerId]}
            isActive={isMyTurn}
            isLocal={true}
            turnSecondsLeft={isMyTurn ? turnSecondsLeft : undefined}
            turnIsUrgent={turnIsUrgent}
          />

          {!gameState.winner && (
            <ModeControls
              mode={mode}
              setMode={setMode}
              wallsLeft={gameState.wallsLeft[localPlayerId]}
              isMyTurn={isMyTurn}
            />
          )}

          <div className="w-full flex flex-col">
            {roomId && (
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-t-lg transition-colors ${activeTab === 'chat' ? 'bg-[var(--color-wood-dark)] text-[var(--color-brass)] border border-b-0 border-[#3b2419]' : 'bg-transparent text-[var(--color-ivory)]/50'}`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-t-lg transition-colors ${activeTab === 'history' ? 'bg-[var(--color-wood-dark)] text-[var(--color-brass)] border border-b-0 border-[#3b2419]' : 'bg-transparent text-[var(--color-ivory)]/50'}`}
                >
                  Historique
                </button>
              </div>
            )}

            {activeTab === 'chat' && roomId ? (
              <ChatPanel
                chat={gameState.chat}
                onSend={(text) => dispatchChat(gameState.names[localPlayerId], text)}
              />
            ) : (
              <HistoryPanel
                history={gameState.history}
                names={gameState.names}
              />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {gameState.winner && (
          <GameOverlay
            key="game-overlay"
            winner={gameState.winner}
            localPlayer={localPlayerId}
            stats={stats}
            onRestart={restartGame}
            onHome={onHome}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRules && <RulesOverlay key="rules-overlay" onClose={() => setShowRules(false)} />}
      </AnimatePresence>
    </div>
  );
}
