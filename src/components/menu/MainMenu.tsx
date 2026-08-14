import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, ChevronRight, ArrowLeft, Flame, Trophy, Zap, Shield, Puzzle as PuzzleIcon, HelpCircle, Info } from 'lucide-react';
import { type GameState, type Player, type PlayerCount, PLAYER_IDS, getFreshState } from '@/lib/gameLogic';
import { generateUniqueRoomCode, createRoom, joinRoom, peekRoom, type RoomInfo } from '@/lib/firebase';
import { useStats } from '@/hooks/useStats';
import { getBestSurvivalRound } from '@/lib/survivalRecord';
import { getPuzzleProgress } from '@/lib/puzzleProgress';
import { PLAYER_COLORS, DEFAULT_P1_COLOR, DEFAULT_P2_COLOR } from '@/lib/playerColors';
import type { Difficulty } from '@/lib/aiEngine';
import { RulesOverlay } from '@/components/game/RulesOverlay';
import { ColorPicker } from '@/components/menu/ColorPicker';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';

interface MainMenuProps {
  onStartSolo: (difficulty: Difficulty, playerName: string, mode: 'classic' | 'blitz', myColor: string) => void;
  onStartDuo: (playerName: string, myColor: string, playerCount: PlayerCount) => void;
  onStartSurvival: (playerName: string, myColor: string, startRound?: number) => void;
  onOpenPuzzles: (startIndex?: number) => void;
  onRoomCreated: (roomId: string, state: GameState) => void;
  onRoomJoined: (roomId: string, state: GameState, playerId: Player) => void;
}

const DIFFICULTIES: { id: Difficulty; label: string; desc: string }[] = [
  { id: 'easy', label: 'Facile', desc: 'Pour apprendre les bases' },
  { id: 'medium', label: 'Moyen', desc: 'Un défi équilibré' },
  { id: 'hard', label: 'Difficile', desc: 'Préparez-vous à souffrir' },
  { id: 'expert', label: 'Expert', desc: "L'IA joue à son maximum" },
];

interface MenuButtonProps {
  icon: ReactNode;
  label: string;
  subtitle?: string;
  onClick: () => void;
  accent?: boolean;
}

function MenuButton({ icon, label, subtitle, onClick, accent }: MenuButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={buttonVariants({
        variant: accent ? 'outline' : 'wood',
        size: 'lg',
        className: 'w-full justify-between rounded-xl p-3.5 text-left font-sans',
      })}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-[var(--color-brass)]/15 border border-[var(--color-brass)]/30 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-[var(--color-ivory)] truncate">{label}</div>
          {subtitle && <div className="text-xs text-[var(--color-ivory)]/45 truncate">{subtitle}</div>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
    </motion.button>
  );
}

function GridButton({ icon, label, subtitle, onClick }: MenuButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={buttonVariants({
        variant: 'wood',
        size: 'lg',
        className: 'flex flex-col items-start gap-1.5 rounded-xl p-3 text-left font-sans',
      })}
    >
      <div className="w-8 h-8 rounded-full bg-[var(--color-brass)]/15 border border-[var(--color-brass)]/30 flex items-center justify-center">
        {icon}
      </div>
      <div className="font-bold text-sm text-[var(--color-ivory)] leading-tight">{label}</div>
      {subtitle && <div className="text-[10px] text-[var(--color-ivory)]/45 leading-tight">{subtitle}</div>}
    </motion.button>
  );
}

export function MainMenu({
  onStartSolo,
  onStartDuo,
  onStartSurvival,
  onOpenPuzzles,
  onRoomCreated,
  onRoomJoined,
}: MainMenuProps) {
  const [view, setView] = useState<'main' | 'solo' | 'local' | 'multi' | 'multi-join' | 'survival-start'>('main');
  const [showRules, setShowRules] = useState(false);
  const [pendingMode, setPendingMode] = useState<'classic' | 'blitz'>('classic');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hostColorSeen, setHostColorSeen] = useState<string | null>(null);
  const [joinerColor, setJoinerColor] = useState(DEFAULT_P2_COLOR);
  const [roomSize, setRoomSize] = useState<PlayerCount>(2);
  const [localPlayerCount, setLocalPlayerCount] = useState<PlayerCount>(2);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [playerName, setPlayerName] = useState(() => {
    try { return localStorage.getItem('quoridor_name') ?? ''; } catch { return ''; }
  });
  const [myColor, setMyColor] = useState(() => {
    try { return localStorage.getItem('quoridor_color') ?? DEFAULT_P1_COLOR; } catch { return DEFAULT_P1_COLOR; }
  });

  const { stats } = useStats();
  const bestRound = getBestSurvivalRound();
  const puzzleProgress = getPuzzleProgress();

  const saveName = (name: string) => {
    setPlayerName(name);
    try { localStorage.setItem('quoridor_name', name); } catch { /* ignore */ }
  };

  const saveColor = (hex: string) => {
    setMyColor(hex);
    try { localStorage.setItem('quoridor_color', hex); } catch { /* ignore */ }
  };

  const openDifficulty = (mode: 'classic' | 'blitz') => {
    setPendingMode(mode);
    setView('solo');
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    setError('');
    try {
      const code = await generateUniqueRoomCode();
      const state = getFreshState(roomSize);
      state.roomId = code;
      state.names.p1 = playerName.trim() || 'Hôte';
      state.names.p2 = 'Joueur 2';
      const freeColors = PLAYER_COLORS.map((color) => color.hex).filter((color) => color !== myColor);
      state.colors = Object.fromEntries(PLAYER_IDS.map((player, index) => [player, player === 'p1' ? myColor : freeColors[index - 1] ?? PLAYER_COLORS[index].hex])) as GameState['colors'];
      const created = await createRoom(state, code);
      if (!created) throw new Error('ROOM_CODE_COLLISION');
      onRoomCreated(code, state);
    } catch {
      setError('Connexion impossible. Vérifiez votre connexion et réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const handleLookupRoom = async () => {
    const normalizedCode = joinCode.trim().toUpperCase();
    if (normalizedCode.length !== 4) {
      setError('Le code doit contenir 4 caractères');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const info = await peekRoom(normalizedCode);
      if (!info) {
        setError('Salle introuvable');
        return;
      }
      if (info.availablePlayers <= 0) {
        setError('Cette salle est complète');
        return;
      }
      setRoomInfo(info);
      setHostColorSeen(info.hostColor);
      const usedColors = PLAYER_IDS.filter((player) => info.players[player]).map((player) => info.colors[player]);
      setJoinerColor(PLAYER_COLORS.map((color) => color.hex).find((color) => !usedColors.includes(color)) ?? DEFAULT_P2_COLOR);
      setView('multi-join');
    } catch {
      setError('Connexion impossible. Vérifiez votre connexion et réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmJoin = async () => {
    const normalizedCode = joinCode.trim().toUpperCase();
    if (normalizedCode.length !== 4) {
      setError('Le code doit contenir 4 caractères');
      setView('multi');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await joinRoom(normalizedCode, joinerColor, playerName.trim());
      if (result) {
        onRoomJoined(normalizedCode, result.state, result.playerId);
      } else {
        setError('Salle introuvable');
        setView('multi');
      }
    } catch {
      setError('Connexion impossible. Vérifiez votre connexion et réessayez.');
      setView('multi');
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  };

  const totalGames = stats.wins + stats.losses;

  return (
    <div className="relative w-full max-w-md lg:max-w-lg mx-auto p-6">
      {/* Ambient glow — pure CSS, no image assets needed */}
      <div className="pointer-events-none absolute -top-24 -left-16 w-64 h-64 rounded-full bg-[var(--color-brass)]/10 blur-3xl animate-menu-float" />
      <div className="pointer-events-none absolute -bottom-16 -right-10 w-56 h-56 rounded-full bg-[var(--color-brass)]/[0.08] blur-3xl animate-menu-float-delayed" />

      <div className="relative text-center mb-5">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="animate-brass-shimmer text-6xl sm:text-7xl font-serif font-bold tracking-widest mb-2 bg-[linear-gradient(120deg,#a87c3d_0%,#f0d090_38%,#c99a52_60%,#a87c3d_100%)] bg-clip-text text-transparent drop-shadow-[0_2px_18px_rgba(201,154,82,0.35)]"
        >
          QUORIDOR
        </motion.h1>
        <p className="text-[var(--color-ivory)]/70">L'art du labyrinthe</p>

        <button
          onClick={() => setShowRules(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-brass)]/80 hover:text-[var(--color-brass)] transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Comment jouer ?
        </button>

        {totalGames > 0 && (
          <Badge variant="wood" className="mt-4 px-4 py-1.5 text-sm">
            <span className="flex items-center gap-1 text-[var(--color-brass)]">
              <Trophy className="w-3.5 h-3.5" />
              <span className="font-bold">{stats.wins}</span>
              <span className="text-[var(--color-ivory)]/50">V</span>
            </span>
            <span className="text-[#3b2419]">·</span>
            <span className="text-[var(--color-ivory)]/60 font-bold">{stats.losses} D</span>
            {stats.streak >= 2 && (
              <>
                <span className="text-[#3b2419]">·</span>
                <span className="flex items-center gap-1 text-orange-400 font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  {stats.streak}
                </span>
              </>
            )}
          </Badge>
        )}
      </div>

      <div className="relative bg-[var(--color-wood-dark)] rounded-2xl shadow-2xl p-6 border border-[#3b2419] min-h-[300px] overflow-hidden before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[var(--color-brass)]/50 before:to-transparent">
        <AnimatePresence mode="wait">
          {view === 'main' && (
            <motion.div key="main" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-3">
              {/* Player name input */}
              <div>
                <label className="block text-xs text-[var(--color-ivory)]/50 mb-1 font-bold tracking-wide uppercase">
                  Votre pseudo
                </label>
                <input
                  type="text"
                  placeholder="Joueur 1"
                  value={playerName}
                  onChange={e => saveName(e.target.value)}
                  maxLength={20}
                  className="w-full rounded-xl border border-[#3b2419] bg-[#180f0a] px-4 py-2 text-sm text-[var(--color-ivory)] placeholder:text-[var(--color-ivory)]/25 transition-colors focus:border-[var(--color-brass)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brass)]/20"
                />
              </div>

              <ColorPicker value={myColor} onChange={saveColor} label="Votre couleur" />

              {/* Primary CTA — the one action most players want first */}
              <motion.button
                onClick={() => openDifficulty('classic')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={buttonVariants({
                  variant: 'brass',
                  size: 'lg',
                  className: 'w-full justify-start gap-4 rounded-2xl p-4 text-left font-sans',
                })}
              >
                <div className="w-11 h-11 rounded-full bg-[#180f0a]/15 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-lg leading-tight">Jouer contre l'IA</div>
                  <div className="text-xs text-[#180f0a]/70">Mode classique — choisissez la difficulté</div>
                </div>
                <ChevronRight className="w-5 h-5 ml-auto shrink-0" />
              </motion.button>

              {/* Secondary modes — a grid reads as distinctly different from a stacked list */}
              <div className="grid grid-cols-2 gap-2.5">
                <GridButton
                  icon={<Zap className="text-[var(--color-brass)] w-4 h-4" />}
                  label="Blitz"
                  subtitle="20s / coup"
                  onClick={() => openDifficulty('blitz')}
                />
                <GridButton
                  icon={<Shield className="text-[var(--color-brass)] w-4 h-4" />}
                  label="Survie"
                  subtitle={bestRound ? `Record : manche ${bestRound}` : "Sans limite"}
                  onClick={() => (bestRound > 0 ? setView('survival-start') : onStartSurvival(playerName.trim(), myColor))}
                />
                <GridButton
                  icon={<Users className="text-[var(--color-brass)] w-4 h-4" />}
                  label="Partie locale"
                  subtitle="2 à 4 joueurs · même appareil"
                  onClick={() => setView('local')}
                />
                <GridButton
                  icon={<PuzzleIcon className="text-[var(--color-brass)] w-4 h-4" />}
                  label="Puzzles"
                  subtitle={puzzleProgress > 0 ? `Puzzle ${puzzleProgress + 1}` : "Défis"}
                  onClick={() => onOpenPuzzles(puzzleProgress > 0 ? puzzleProgress : undefined)}
                />
              </div>

              <MenuButton
                icon={<Users className="text-[var(--color-brass)] w-4 h-4" />}
                label="Multijoueur en ligne"
                onClick={() => setView('multi')}
                accent
              />
            </motion.div>
          )}

          {view === 'solo' && (
            <motion.div key="solo" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-3">
              <button onClick={() => setView('main')} className="text-[var(--color-ivory)]/50 hover:text-[var(--color-ivory)] flex items-center gap-2 mb-2 w-fit">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>

              <h3 className="text-xl font-serif text-[var(--color-brass)] mb-1">Difficulté de l'IA</h3>
              <p className="text-xs text-[var(--color-ivory)]/40 mb-1">
                Mode {pendingMode === 'blitz' ? 'Blitz (20s par coup)' : 'Classique'}
              </p>

              {DIFFICULTIES.map((d) => (
                <motion.button
                  key={d.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onStartSolo(d.id, playerName.trim(), pendingMode, myColor)}
                  className="p-3 bg-[var(--color-wood-medium)] rounded-xl text-left hover:bg-[#4a2e1b] transition-colors border border-transparent hover:border-[#5c3a24]"
                >
                  <div className="font-bold text-[var(--color-ivory)]">{d.label}</div>
                  <div className="text-sm text-[var(--color-ivory)]/50">{d.desc}</div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {view === 'local' && (
            <motion.div key="local" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-4">
              <button onClick={() => setView('main')} className="text-[var(--color-ivory)]/50 hover:text-[var(--color-ivory)] flex items-center gap-2 mb-2 w-fit">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-serif text-[var(--color-brass)]">Partie locale</h3>
                  <Badge variant="brass">2–4 joueurs</Badge>
                </div>
                <p className="mt-1 text-xs text-[var(--color-ivory)]/50">Passez l’appareil au joueur suivant. Tous les pions jouent sur le même plateau.</p>
              </div>

              <div className="rounded-xl border border-[#3b2419] bg-[#180f0a] p-3">
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-ivory)]/55">Nombre de joueurs</div>
                <div className="grid grid-cols-3 gap-2">
                  {([2, 3, 4] as PlayerCount[]).map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setLocalPlayerCount(count)}
                      className={buttonVariants({
                        variant: localPlayerCount === count ? 'outline' : 'ghost',
                        size: 'sm',
                        className: 'rounded-lg border-[#5c3a24] px-2 py-2',
                      })}
                    >
                      {count} joueurs
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-[var(--color-ivory)]/40">Chaque joueur dispose de {localPlayerCount === 2 ? 10 : 5} murs et d’un objectif différent sur le plateau.</p>
              </div>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onStartDuo(playerName.trim(), myColor, localPlayerCount)}
                className={buttonVariants({ variant: 'brass', size: 'lg', className: 'w-full rounded-xl' })}
              >
                Lancer la partie locale
              </motion.button>
            </motion.div>
          )}

          {view === 'multi' && (
            <motion.div key="multi" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-4">
              <button onClick={() => setView('main')} className="text-[var(--color-ivory)]/50 hover:text-[var(--color-ivory)] flex items-center gap-2 mb-2 w-fit">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>

              <div className="flex items-start gap-2 rounded-xl border border-[var(--color-brass)]/20 bg-[var(--color-brass)]/[0.06] p-3 text-xs text-[var(--color-ivory)]/65 shadow-inner">
                <Info className="w-4 h-4 text-[var(--color-brass)] shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-[var(--color-ivory)]/80">Comment jouer en ligne :</strong> créez une salle pour 2, 3 ou 4 joueurs, puis partagez le code à 4 caractères. Les participants rejoignent la prochaine place libre depuis n’importe où. La partie démarre dès que la salle est complète.
                  </p>
              </div>

              <div className="rounded-xl border border-[#3b2419] bg-[#180f0a] p-3">
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-ivory)]/55">Nombre de joueurs</div>
                <div className="grid grid-cols-3 gap-2">
                  {([2, 3, 4] as PlayerCount[]).map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setRoomSize(count)}
                      className={buttonVariants({
                        variant: roomSize === count ? 'outline' : 'ghost',
                        size: 'sm',
                        className: 'rounded-lg border-[#5c3a24] px-2 py-2',
                      })}
                    >
                      {count} joueurs
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-[var(--color-ivory)]/40">Chaque joueur reçoit une couleur et un stock de murs adapté au format.</p>
              </div>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateRoom}
                disabled={loading}
                className={buttonVariants({ variant: 'brass', size: 'lg', className: 'w-full rounded-xl' })}
              >
                {loading ? 'Création...' : 'Créer une salle'}
              </motion.button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#3b2419]"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-[var(--color-wood-dark)] text-[var(--color-ivory)]/50 text-sm">ou</span>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Code de salle (4 lettres)"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase())}
                  maxLength={4}
                  inputMode="text"
                  autoCapitalize="characters"
                  autoComplete="off"
                  aria-label="Code de salle à quatre caractères"
                  className="w-full bg-[#180f0a] border border-[#3b2419] rounded-xl px-4 py-3 text-[var(--color-ivory)] font-mono tracking-widest text-center text-xl mb-3 focus:outline-none focus:border-[var(--color-brass)] focus-visible:ring-2 focus-visible:ring-[var(--color-brass)]/60 uppercase"
                />
                {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLookupRoom}
                  disabled={loading || joinCode.length !== 4}
                  className={buttonVariants({ variant: 'wood', size: 'md', className: 'w-full rounded-xl border-[#5c3a24]' })}
                >
                  {loading ? 'Recherche...' : 'Rejoindre'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {view === 'multi-join' && (
            <motion.div key="multi-join" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-4">
              <button onClick={() => setView('multi')} className="text-[var(--color-ivory)]/50 hover:text-[var(--color-ivory)] flex items-center gap-2 mb-2 w-fit">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>

              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-[var(--color-ivory)]/60">
                  Salle <span className="font-mono font-bold text-[var(--color-ivory)]">{joinCode}</span>
                </p>
                <Badge variant="brass">{roomInfo?.joinedPlayers ?? 0}/{roomInfo?.maxPlayers ?? 2}</Badge>
              </div>
              <p className="text-sm text-[var(--color-ivory)]/60">Choisissez votre couleur pour rejoindre la prochaine place libre.</p>

              <ColorPicker
                value={joinerColor}
                onChange={setJoinerColor}
                excludeHex={roomInfo ? PLAYER_IDS.filter((player) => roomInfo.players[player]).map((player) => roomInfo.colors[player]) : hostColorSeen ?? undefined}
              />

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmJoin}
                disabled={loading}
                className={buttonVariants({ variant: 'brass', size: 'md', className: 'w-full rounded-xl' })}
              >
                {loading ? 'Connexion...' : 'Rejoindre la partie'}
              </motion.button>
            </motion.div>
          )}
          {view === 'survival-start' && (
            <motion.div key="survival-start" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-3">
              <button onClick={() => setView('main')} className="text-[var(--color-ivory)]/50 hover:text-[var(--color-ivory)] flex items-center gap-2 mb-2 w-fit">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>

              <h3 className="text-xl font-serif text-[var(--color-brass)] mb-1">Mode Survie</h3>
              <p className="text-xs text-[var(--color-ivory)]/40 mb-1">
                Votre record : manche {bestRound}
              </p>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onStartSurvival(playerName.trim(), myColor, bestRound)}
                className="p-3.5 bg-gradient-to-br from-[var(--color-brass)] to-[#a8793a] text-[#180f0a] rounded-xl text-left"
              >
                <div className="font-bold">Reprendre à la manche {bestRound}</div>
                <div className="text-xs text-[#180f0a]/70">Continuez avec la difficulté de votre record</div>
              </motion.button>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onStartSurvival(playerName.trim(), myColor, 1)}
                className="p-3.5 bg-[var(--color-wood-medium)] rounded-xl text-left hover:bg-[#4a2e1b] transition-colors border border-transparent hover:border-[#5c3a24]"
              >
                <div className="font-bold text-[var(--color-ivory)]">Recommencer à la manche 1</div>
                <div className="text-xs text-[var(--color-ivory)]/50">Repartez de zéro, difficulté facile</div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showRules && <RulesOverlay key="rules-overlay" onClose={() => setShowRules(false)} />}
      </AnimatePresence>
    </div>
  );
}
