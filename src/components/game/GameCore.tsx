import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Copy, Lightbulb, Sparkles } from 'lucide-react';
import { type GameState, type Player } from '@/lib/gameLogic';
import { getBestSurvivalRound, recordSurvivalRound } from '@/lib/survivalRecord';
import { useGame } from '@/hooks/useGame';
import { useAI } from '@/hooks/useAI';
import { useSound } from '@/hooks/useSound';
import { useTimer } from '@/hooks/useTimer';
import { useTurnTimer, TURN_DURATION, BLITZ_TURN_DURATION } from '@/hooks/useTurnTimer';
import { useStats } from '@/hooks/useStats';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';
import { Board } from '@/components/game/Board';
import { TopBar } from '@/components/game/TopBar';
import { PlayerCard } from '@/components/game/PlayerCard';
import { ModeControls } from '@/components/game/ModeControls';
import { StatusLine } from '@/components/game/StatusLine';
import { GameOverlay } from '@/components/game/GameOverlay';
import { RulesOverlay } from '@/components/game/RulesOverlay';
import { ChatPanel } from '@/components/game/ChatPanel';
import { HistoryPanel } from '@/components/game/HistoryPanel';
import { SettingsPanel } from '@/components/game/SettingsPanel';
import { WaitingOverlay } from '@/components/game/WaitingOverlay';

interface GameCoreProps {
  initialState: GameState;
  roomId?: string;
  localPlayerId: Player;
  onHome: () => void;
  onSurvivalResult?: (won: boolean) => void;
  survivalRound?: number;
  survivalSearchBoost?: number;
  onRestartSurvivalRun?: () => void;
}

function getModeLabel(mode?: GameState['mode']) {
  switch (mode) {
    case 'blitz':
      return 'Blitz';
    case 'survival':
      return 'Survie';
    case 'duo':
      return 'Duo local';
    case 'puzzle':
      return 'Puzzle';
    default:
      return 'Classique';
  }
}

export function GameCore({ initialState, roomId, localPlayerId, onHome, onSurvivalResult, survivalRound, survivalSearchBoost = 0, onRestartSurvivalRun }: GameCoreProps) {
  const { gameState, dispatchMove, dispatchWall, dispatchChat, restartGame } = useGame(initialState, roomId);
  const [mode, setMode] = useState<'move' | 'wallH' | 'wallV'>('move');
  const [showRules, setShowRules] = useState(false);
  const { settings, updateSetting, resetSettings } = useSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [showPath, setShowPath] = useState(() => settings.showPathByDefault);

  const { formatted: gameTime } = useTimer(!gameState.winner, gameState.roomId || 'local');
  const { playMove, playWall, playError, playVictory } = useSound(settings.soundEnabled);
  const { toast } = useToast();

  const { stats, recordWin, recordLoss } = useStats();

  const isLocalDuo = !roomId && !gameState.aiDifficulty;
  const boardPlayer: Player = roomId ? localPlayerId : isLocalDuo ? gameState.turn : localPlayerId;

  const hasRecordedRef = useRef(false);
  const lastHistoryCountRef = useRef(gameState.history.length);
  const [survivalOutcome, setSurvivalOutcome] = useState<{ roundsSurvived: number; best: number; isNewRecord: boolean } | null>(null);

  useEffect(() => {
    if (gameState.winner && !hasRecordedRef.current) {
      hasRecordedRef.current = true;
      const won = gameState.winner === localPlayerId;
      if (won) recordWin();
      else recordLoss();

      if (gameState.mode === 'survival' && typeof survivalRound === 'number') {
        const roundsSurvived = won ? survivalRound : survivalRound - 1;
        const { best, isNewRecord } = recordSurvivalRound(Math.max(0, roundsSurvived));
        setSurvivalOutcome({ roundsSurvived: Math.max(0, roundsSurvived), best, isNewRecord });
        if (!won && onSurvivalResult) onSurvivalResult(false);
      } else if (onSurvivalResult) {
        onSurvivalResult(won);
      }
    }

    if (!gameState.winner) {
      hasRecordedRef.current = false;
      setSurvivalOutcome(null);
    }
  }, [gameState.winner, gameState.mode, localPlayerId, onSurvivalResult, recordLoss, recordWin, survivalRound]);

  const isMyTurn = gameState.turn === localPlayerId && !gameState.winner;
  const isBoardTurn = gameState.turn === boardPlayer && !gameState.winner;

  const turnDuration = gameState.mode === 'blitz' ? BLITZ_TURN_DURATION : TURN_DURATION;
  const { secondsLeft: turnSecondsLeft, isUrgent: turnIsUrgent } = useTurnTimer(
    isBoardTurn,
    gameState.history.length,
    turnDuration,
  );

  useAI({
    gameState,
    dispatchMove,
    dispatchWall,
    isAIActive: !roomId && !!gameState.aiDifficulty,
    searchBoost: survivalSearchBoost,
  });

  useEffect(() => {
    const previousCount = lastHistoryCountRef.current;
    const currentCount = gameState.history.length;

    if (currentCount > previousCount) {
      const latestAction = gameState.history[currentCount - 1]?.action;
      if (latestAction?.type === 'move') playMove();
      if (latestAction?.type === 'wall') playWall();
    }

    lastHistoryCountRef.current = currentCount;
  }, [gameState.history, playMove, playWall]);

  useEffect(() => {
    if (gameState.winner) {
      playVictory();
    }
  }, [gameState.winner, playVictory]);

  const oppPlayerId = localPlayerId === 'p1' ? 'p2' : 'p1';
  const displayOppId = isLocalDuo ? (boardPlayer === 'p1' ? 'p2' : 'p1') : oppPlayerId;
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>(roomId ? 'chat' : 'history');

  const modeLabel = getModeLabel(gameState.mode);

  const handleCopyRoom = async () => {
    if (!roomId) return;
    try {
      await navigator.clipboard.writeText(roomId);
      toast({
        title: 'Code copié',
        description: `Le code ${roomId} est prêt à être partagé.`,
      });
    } catch {
      toast({
        title: 'Copie impossible',
        description: 'Votre navigateur a refusé la copie automatique.',
      });
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--color-wood-dark)]">
      <TopBar
        soundEnabled={settings.soundEnabled}
        toggleSound={() => updateSetting('soundEnabled', !settings.soundEnabled)}
        onQuit={onHome}
        onRules={() => setShowRules(true)}
        onSettings={() => setShowSettings(true)}
        onCopyRoom={roomId ? handleCopyRoom : undefined}
        roomId={roomId}
        gameTime={gameTime}
      />

      <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center p-4 pb-28 lg:pb-8 max-w-6xl mx-auto w-full gap-6 lg:gap-10">
        <div className="flex flex-col items-center gap-6 w-full lg:w-auto">
          <div className="w-full max-w-[460px]">
            <PlayerCard
              player={displayOppId}
              name={gameState.names[displayOppId]}
              color={gameState.colors?.[displayOppId] ?? '#3a6ea8'}
              wallsLeft={gameState.wallsLeft[displayOppId]}
              isActive={gameState.turn === displayOppId && !gameState.winner}
              isLocal={isLocalDuo}
              avatarLabel={isLocalDuo ? (displayOppId === 'p1' ? 'J1' : 'J2') : undefined}
            />
          </div>

          <StatusLine
            isMyTurn={isLocalDuo ? true : isMyTurn}
            winner={gameState.winner}
            opponentName={gameState.names[displayOppId]}
            reducedMotion={settings.reducedMotion}
          />

          <Board
            gameState={gameState}
            localPlayer={boardPlayer}
            mode={mode}
            showPath={showPath}
            confirmWalls={settings.confirmWalls}
            reducedMotion={settings.reducedMotion}
            onMove={(pos) => dispatchMove(boardPlayer, pos)}
            onWall={(wall) => dispatchWall(boardPlayer, wall)}
            onInvalidAction={playError}
          />

          {/* Mobile: commands pinned to the bottom of the screen — no scrolling needed to reach them. */}
          {!gameState.winner && (
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#3b2419] bg-[var(--color-wood-dark)]/95 p-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
              <div className="mx-auto max-w-[460px]">
                <ModeControls
                  mode={mode}
                  setMode={setMode}
                  wallsLeft={gameState.wallsLeft[boardPlayer]}
                  isMyTurn={isBoardTurn}
                />
              </div>
            </div>
          )}

          {!gameState.winner && (
            <div className="flex w-full max-w-[460px] flex-col gap-2">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setShowPath((p) => !p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    showPath
                      ? 'bg-[var(--color-brass)]/20 border-[var(--color-brass)]/60 text-[var(--color-brass)]'
                      : 'bg-transparent border-[#3b2419] text-[var(--color-ivory)]/55 hover:text-[var(--color-ivory)]/85 hover:border-[#5c3a24]'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  Chemin optimal
                </button>

                {roomId && (
                  <button
                    onClick={handleCopyRoom}
                    className="flex items-center gap-1.5 rounded-lg border border-[#3b2419] px-3 py-1.5 text-xs font-bold text-[var(--color-ivory)]/70 transition-colors hover:border-[#5c3a24] hover:text-[var(--color-ivory)]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copier le code
                  </button>
                )}
              </div>

              <div className="rounded-2xl border border-[#3b2419] bg-[#180f0a]/70 px-4 py-3 text-sm text-[var(--color-ivory)]/65 shadow-inner">
                <div className="mb-1 flex items-center gap-2 text-[var(--color-ivory)]">
                  <Sparkles className="h-4 w-4 text-[var(--color-brass)]" />
                  <span className="font-semibold">{modeLabel}</span>
                  <span className="text-[var(--color-ivory)]/30">•</span>
                  <span>{settings.confirmWalls ? 'Murs sécurisés' : 'Murs instantanés'}</span>
                  {settings.reducedMotion && (
                    <>
                      <span className="text-[var(--color-ivory)]/30">•</span>
                      <span>Animations légères</span>
                    </>
                  )}
                </div>
                {mode === 'move'
                  ? 'Touchez un point lumineux pour jouer rapidement votre prochain déplacement.'
                  : settings.confirmWalls
                    ? 'Touchez un emplacement puis confirmez le mur pour éviter les erreurs.'
                    : 'Touchez directement un emplacement valide pour poser un mur en un geste.'}
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-[460px] lg:w-[360px] lg:shrink-0 lg:sticky lg:top-6 flex flex-col gap-4">
          <PlayerCard
            player={boardPlayer}
            name={gameState.names[boardPlayer]}
            color={gameState.colors?.[boardPlayer] ?? '#c0392b'}
            wallsLeft={gameState.wallsLeft[boardPlayer]}
            isActive={isBoardTurn}
            isLocal={true}
            turnSecondsLeft={isBoardTurn ? turnSecondsLeft : undefined}
            turnIsUrgent={turnIsUrgent}
            turnDuration={turnDuration}
            avatarLabel={isLocalDuo ? (boardPlayer === 'p1' ? 'J1' : 'J2') : undefined}
          />

          {/* Desktop: controls live in the sidebar. Mobile: they're pinned to the bottom bar below instead. */}
          {!gameState.winner && (
            <div className="hidden lg:block">
              <ModeControls
                mode={mode}
                setMode={setMode}
                wallsLeft={gameState.wallsLeft[boardPlayer]}
                isMyTurn={isBoardTurn}
              />
            </div>
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
            isSurvival={gameState.mode === 'survival'}
            survivalRoundNumber={survivalRound}
            roundsSurvived={survivalOutcome?.roundsSurvived}
            bestRound={survivalOutcome?.best ?? getBestSurvivalRound()}
            isNewRecord={survivalOutcome?.isNewRecord}
            onContinueSurvival={() => onSurvivalResult?.(true)}
            onRestartSurvival={onRestartSurvivalRun}
            reducedMotion={settings.reducedMotion}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRules && <RulesOverlay key="rules-overlay" onClose={() => setShowRules(false)} />}
      </AnimatePresence>

      <SettingsPanel
        open={showSettings}
        settings={settings}
        onClose={() => setShowSettings(false)}
        onToggle={updateSetting}
        onReset={() => {
          resetSettings();
          setShowPath(false);
        }}
      />

      {roomId && !gameState.players?.p2 && !gameState.winner && (
        <WaitingOverlay roomId={roomId} onQuit={onHome} />
      )}
    </div>
  );
}
