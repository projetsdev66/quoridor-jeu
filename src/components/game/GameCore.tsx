import { useCallback, useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Copy, Lightbulb, Sparkles } from 'lucide-react';
import { activePlayers, finishTarget, isGameOver, type GameState, type Player } from '@/lib/gameLogic';
import { leaveRoom, type RoomSyncIssue } from '@/lib/firebase';
import { getBestSurvivalRound, recordSurvivalRound } from '@/lib/survivalRecord';
import { useGame } from '@/hooks/useGame';
import { useAI } from '@/hooks/useAI';
import { useSound } from '@/hooks/useSound';
import { useTimer } from '@/hooks/useTimer';
import { useTurnTimer, TURN_DURATION } from '@/hooks/useTurnTimer';
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
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    case 'survival':
      return 'Survie';
    case 'duo':
      return 'Partie locale';
    case 'center':
      return 'Centre · 4 joueurs';
    default:
      return 'Classique';
  }
}

export function GameCore({ initialState, roomId, localPlayerId, onHome, onSurvivalResult, survivalRound, survivalSearchBoost = 0, onRestartSurvivalRun }: GameCoreProps) {
  const { toast } = useToast();
  const handleSyncError = useCallback((issue: RoomSyncIssue) => {
    if (issue === 'closed') {
      toast({
        title: 'Salle fermée',
        description: 'La salle n’est plus disponible. Retour au menu.',
      });
      onHome();
      return;
    }

    toast({
      title: 'Connexion perdue',
      description: "Impossible de synchroniser la partie. Vérifiez votre connexion Internet.",
    });
  }, [onHome, toast]);
  const { gameState, dispatchMove, dispatchWall, dispatchChat, restartGame } = useGame(initialState, roomId, roomId ? handleSyncError : undefined);
  const handleExit = useCallback(() => {
    if (!roomId) {
      onHome();
      return;
    }
    void leaveRoom(roomId, localPlayerId).catch(() => undefined).finally(onHome);
  }, [roomId, localPlayerId, onHome]);
  const [mode, setMode] = useState<'move' | 'wallH' | 'wallV'>('move');
  const [showRules, setShowRules] = useState(false);
  const { settings, updateSetting, resetSettings } = useSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [showPath, setShowPath] = useState(() => settings.showPathByDefault);

  const gameIsOver = isGameOver(gameState);
  const { formatted: gameTime } = useTimer(!gameIsOver, gameState.roomId || 'local');
  const { playMove, playWall, playError, playArrival } = useSound(settings.soundEnabled);

  const { stats, recordWin, recordLoss } = useStats();

  const isLocalDuo = !roomId && !gameState.aiDifficulty;
  const boardPlayer: Player = roomId ? localPlayerId : isLocalDuo ? gameState.turn : localPlayerId;

  const hasRecordedRef = useRef(false);
  const lastRankingRef = useRef<Player[]>(gameState.ranking);
  const lastHistoryCountRef = useRef(gameState.history.length);
  const [survivalOutcome, setSurvivalOutcome] = useState<{ roundsSurvived: number; best: number; isNewRecord: boolean } | null>(null);

  useEffect(() => {
    if (gameIsOver && !hasRecordedRef.current) {
      hasRecordedRef.current = true;
      const won = gameState.ranking.includes(localPlayerId);

      // Duo local doesn't have a single "you" — skip personal win/loss stats for it.
      if (!isLocalDuo) {
        if (won) recordWin();
        else recordLoss();
      }

      if (gameState.mode === 'survival' && typeof survivalRound === 'number') {
        const roundsSurvived = won ? survivalRound : survivalRound - 1;
        const { best, isNewRecord } = recordSurvivalRound(Math.max(0, roundsSurvived));
        setSurvivalOutcome({ roundsSurvived: Math.max(0, roundsSurvived), best, isNewRecord });
        if (!won && onSurvivalResult) onSurvivalResult(false);
      } else if (onSurvivalResult) {
        onSurvivalResult(won);
      }
    }

    if (!gameIsOver) {
      hasRecordedRef.current = false;
      setSurvivalOutcome(null);
    }
  }, [gameIsOver, gameState.ranking, gameState.mode, localPlayerId, isLocalDuo, onSurvivalResult, recordLoss, recordWin, survivalRound]);

  useEffect(() => {
    const previousRanking = lastRankingRef.current;
    const newFinishers = gameState.ranking.filter((player) => !previousRanking.includes(player));
    newFinishers.forEach((player) => playArrival(gameState.ranking.indexOf(player) + 1));
    lastRankingRef.current = gameState.ranking;
  }, [gameState.ranking, playArrival]);

  const isMyTurn = gameState.turn === localPlayerId && !gameIsOver && !gameState.ranking.includes(localPlayerId);
  const isBoardTurn = gameState.turn === boardPlayer && !gameIsOver && !gameState.ranking.includes(boardPlayer);

  const turnDuration = TURN_DURATION;
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

  const participants = activePlayers(gameState);
  const opponentPlayers = participants.filter((player) => player !== boardPlayer);
  const displayOppId = opponentPlayers[0] ?? boardPlayer;
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

  const overlayWinner = gameState.winner;

  return (
    <div
      className="relative min-h-[100dvh] overflow-x-clip overflow-y-auto overscroll-y-auto flex flex-col bg-[var(--color-wood-dark)] touch-pan-y"
      style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
    >
      <TopBar
        soundEnabled={settings.soundEnabled}
        toggleSound={() => updateSetting('soundEnabled', !settings.soundEnabled)}
        onQuit={handleExit}
        onRules={() => setShowRules(true)}
        onSettings={() => setShowSettings(true)}
        onCopyRoom={roomId ? handleCopyRoom : undefined}
        roomId={roomId}
        gameTime={gameTime}
        modeLabel={modeLabel}
        centerTarget={gameState.mode === 'center'}
      />

      <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center p-2 pb-24 sm:p-4 sm:pb-28 lg:pb-8 max-w-6xl mx-auto w-full gap-3 sm:gap-6 lg:gap-10">
          <div className="flex flex-col items-center gap-6 w-full lg:w-auto">
          <div className={`grid w-full max-w-[460px] gap-1.5 ${opponentPlayers.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {opponentPlayers.map((player) => (
              <PlayerCard
                key={player}
                player={player}
                name={gameState.names[player]}
                color={gameState.colors?.[player] ?? '#3a6ea8'}
                wallsLeft={gameState.wallsLeft[player]}
                wallCapacity={gameState.maxPlayers === 2 ? 10 : 5}
                isActive={gameState.turn === player && !gameIsOver && !gameState.ranking.includes(player)}
                finishedRank={gameState.ranking.indexOf(player) >= 0 ? gameState.ranking.indexOf(player) + 1 : undefined}
                isLocal={false}
                avatarLabel={isLocalDuo ? `J${player.slice(1)}` : player.slice(1)}
                compact
              />
            ))}
          </div>

          <StatusLine
            isMyTurn={isLocalDuo ? true : isMyTurn}
            winner={gameState.winner}
            opponentName={gameState.names[gameState.turn] ?? gameState.names[displayOppId]}
            winnerName={gameState.winner ? gameState.names[gameState.winner] : undefined}
            lastFinisherName={gameState.ranking.length ? gameState.names[gameState.ranking[gameState.ranking.length - 1]] : undefined}
            finishedCount={gameState.ranking.length}
            finishTarget={finishTarget(gameState.maxPlayers)}
            gameOver={gameIsOver}
            passAndPlay={isLocalDuo}
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
          {!gameIsOver && (
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

          {!gameIsOver && (
            <div className="flex w-full max-w-[460px] flex-col gap-2">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setShowPath((p) => !p)}
                  className={cn(buttonVariants({
                    variant: showPath ? 'outline' : 'ghost',
                    size: 'sm',
                    className: 'rounded-lg border-[#3b2419] px-3 py-1.5 text-xs',
                  }))}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  Chemin optimal
                </button>

                {roomId && (
                  <button
                    onClick={handleCopyRoom}
                    className={cn(buttonVariants({ variant: 'ghost', size: 'sm', className: 'rounded-lg border border-[#3b2419] px-3 py-1.5 text-xs text-[var(--color-ivory)]/70' }))}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copier le code
                  </button>
                )}
              </div>

              <div className="rounded-2xl border border-[#3b2419] bg-[#180f0a]/70 px-4 py-3 text-sm text-[var(--color-ivory)]/65 shadow-inner">
                <div className="mb-1 flex items-center gap-2 text-[var(--color-ivory)]">
                  <Badge variant="brass" className="px-2 py-0.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{modeLabel}</span>
                  </Badge>
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
            wallCapacity={gameState.maxPlayers === 2 ? 10 : 5}
            isActive={isBoardTurn}
            isLocal={true}
            turnSecondsLeft={isBoardTurn ? turnSecondsLeft : undefined}
            turnIsUrgent={turnIsUrgent}
            turnDuration={turnDuration}
            avatarLabel={isLocalDuo ? `J${boardPlayer.slice(1)}` : undefined}
          />

          {/* Desktop: controls live in the sidebar. Mobile: they're pinned to the bottom bar below instead. */}
          {!gameIsOver && (
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
                  className={cn(buttonVariants({ variant: activeTab === 'chat' ? 'outline' : 'ghost', size: 'sm', className: 'flex-1 rounded-t-lg rounded-b-none py-1.5 text-xs' }))}
                >
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={cn(buttonVariants({ variant: activeTab === 'history' ? 'outline' : 'ghost', size: 'sm', className: 'flex-1 rounded-t-lg rounded-b-none py-1.5 text-xs' }))}
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
                colors={gameState.colors}
              />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {gameIsOver && overlayWinner && (
          <GameOverlay
            key="game-overlay"
            winner={overlayWinner}
            localPlayer={localPlayerId}
            winnerName={gameState.names[overlayWinner] ?? overlayWinner}
            winnerColor={gameState.colors?.[overlayWinner]}
            ranking={gameState.ranking}
            participants={participants}
            names={gameState.names}
            colors={gameState.colors}
            centerTarget={gameState.mode === 'center'}
            passAndPlay={isLocalDuo}
            stats={stats}
            onRestart={restartGame}
            onHome={handleExit}
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

      {roomId && participants.length < gameState.maxPlayers && !gameIsOver && (
        <WaitingOverlay
          roomId={roomId}
          maxPlayers={gameState.maxPlayers}
          joinedPlayers={participants.length}
          players={gameState.players}
          names={gameState.names}
          colors={gameState.colors}
          centerTarget={gameState.mode === 'center'}
          onQuit={handleExit}
        />
      )}
    </div>
  );
}
