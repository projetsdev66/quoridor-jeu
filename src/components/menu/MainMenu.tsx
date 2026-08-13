import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, ChevronRight, ArrowLeft, Flame, Trophy, Zap, Shield, Puzzle as PuzzleIcon, HelpCircle, Info } from 'lucide-react';
import { type GameState, getFreshState } from '@/lib/gameLogic';
import { generateUniqueRoomCode, createRoom, joinRoom, peekRoom } from '@/lib/firebase';
import { useStats } from '@/hooks/useStats';
import { getBestSurvivalRound } from '@/lib/survivalRecord';
import { getPuzzleProgress } from '@/lib/puzzleProgress';
import { PLAYER_COLORS, DEFAULT_P1_COLOR, DEFAULT_P2_COLOR } from '@/lib/playerColors';
import type { Difficulty } from '@/lib/aiEngine';
import { RulesOverlay } from '@/components/game/RulesOverlay';
import { ColorPicker } from '@/components/menu/ColorPicker';

interface MainMenuProps {
  onStartSolo: (difficulty: Difficulty, playerName: string, mode: 'classic' | 'blitz', myColor: string) => void;
  onStartDuo: (playerName: string, myColor: string) => void;
  onStartSurvival: (playerName: string, myColor: string, startRound?: number) => void;
  onOpenPuzzles: (startIndex?: number) => void;
  onRoomCreated: (roomId: string, state: GameState) => void;
  onRoomJoined: (roomId: string, state: GameState) => void;
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
      className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-colors border ${
        accent
          ? 'bg-[var(--color-brass)]/10 hover:bg-[var(--color-brass)]/20 border-[var(--color-brass)]/30'
          : 'bg-[var(--color-wood-medium)] hover:bg-[#4a2e1b] border-transparent hover:border-[#5c3a24]'
      }`}
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
      className="flex flex-col items-start gap-1.5 p-3 rounded-xl text-left bg-[var(--color-wood-medium)] hover:bg-[#4a2e1b] border border-transparent hover:border-[#5c3a24] transition-colors"
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
  const [view, setView] = useState<'main' | 'solo' | 'multi' | 'multi-join' | 'survival-start'>('main');
  const [showRules, setShowRules] = useState(false);
  const [pendingMode, setPendingMode] = useState<'classic' | 'blitz'>('classic');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hostColorSeen, setHostColorSeen] = useState<string | null>(null);
  const [joinerColor, setJoinerColor] = useState(DEFAULT_P2_COLOR);
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
    const code = await generateUniqueRoomCode();
    const state = getFreshState();
    state.roomId = code;
    state.names.p1 = playerName.trim() || 'Hôte';
    state.names.p2 = 'Adversaire';
    state.colors = { p1: myColor, p2: myColor === PLAYER_COLORS[1].hex ? PLAYER_COLORS[2].hex : DEFAULT_P2_COLOR };
    await createRoom(state, code);
    setLoading(false);
    onRoomCreated(code, state);
  };

  const handleLookupRoom = async () => {
    if (!joinCode || joinCode.length !== 4) {
      setError('Le code doit contenir 4 caractères');
      return;
    }
    setLoading(true);
    setError('');
    const info = await peekRoom(joinCode.toUpperCase());
    setLoading(false);
    if (!info) {
      setError('Salle introuvable');
      return;
    }
    setHostColorSeen(info.hostColor);
    setJoinerColor(info.hostColor === DEFAULT_P1_COLOR ? DEFAULT_P2_COLOR : DEFAULT_P1_COLOR);
    setView('multi-join');
  };

  const handleConfirmJoin = async () => {
    setLoading(true);
    const state = await joinRoom(joinCode.toUpperCase(), joinerColor, playerName.trim());
    setLoading(false);
    if (state) {
      onRoomJoined(joinCode.toUpperCase(), state);
    } else {
      setError('Salle introuvable');
      setView('multi');
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
          className="text-6xl sm:text-7xl font-serif font-bold tracking-widest mb-2 bg-gradient-to-b from-[#f0d090] via-[var(--color-brass)] to-[#a87c3d] bg-clip-text text-transparent drop-shadow-[0_2px_18px_rgba(201,154,82,0.35)]"
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
          <div className="mt-4 inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[var(--color-wood-dark)]/80 border border-[#3b2419] text-sm">
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
          </div>
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
                  className="w-full bg-[#180f0a] border border-[#3b2419] rounded-xl px-4 py-2 text-[var(--color-ivory)] focus:outline-none focus:border-[var(--color-brass)] placeholder:text-[var(--color-ivory)]/25 text-sm transition-colors"
                />
              </div>

              <ColorPicker value={myColor} onChange={saveColor} label="Votre couleur" />

              {/* Primary CTA — the one action most players want first */}
              <motion.button
                onClick={() => openDifficulty('classic')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-left bg-gradient-to-br from-[var(--color-brass)] to-[#a8793a] text-[#180f0a] shadow-[0_10px_30px_-8px_rgba(201,154,82,0.55)]"
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
                  label="Duo local"
                  subtitle="Même appareil"
                  onClick={() => onStartDuo(playerName.trim(), myColor)}
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

          {view === 'multi' && (
            <motion.div key="multi" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-4">
              <button onClick={() => setView('main')} className="text-[var(--color-ivory)]/50 hover:text-[var(--color-ivory)] flex items-center gap-2 mb-2 w-fit">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>

              <div className="flex items-start gap-2 rounded-xl border border-[#3b2419] bg-[#180f0a] p-3 text-xs text-[var(--color-ivory)]/60">
                <Info className="w-4 h-4 text-[var(--color-brass)] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[var(--color-ivory)]/80">Comment jouer en ligne :</strong> l'un de vous crée une salle et obtient un code à 4 caractères. L'autre entre ce code pour vous rejoindre — vous pouvez être n'importe où, il faut juste être connectés à Internet, pas au même Wi-Fi. La partie démarre dès que les deux joueurs sont présents.
                </p>
              </div>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full py-4 bg-[var(--color-brass)] text-[#180f0a] font-bold rounded-xl transition-colors hover:bg-[#e2a868] disabled:opacity-50"
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
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={4}
                  className="w-full bg-[#180f0a] border border-[#3b2419] rounded-xl px-4 py-3 text-[var(--color-ivory)] font-mono tracking-widest text-center text-xl mb-3 focus:outline-none focus:border-[var(--color-brass)] uppercase"
                />
                {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLookupRoom}
                  disabled={loading || joinCode.length !== 4}
                  className="w-full py-3 bg-[var(--color-wood-medium)] text-[var(--color-ivory)] font-bold rounded-xl transition-colors hover:bg-[#4a2e1b] disabled:opacity-50 border border-[#5c3a24]"
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

              <p className="text-sm text-[var(--color-ivory)]/60">
                Salle <span className="font-mono font-bold text-[var(--color-ivory)]">{joinCode}</span> trouvée. Choisissez votre couleur :
              </p>

              <ColorPicker value={joinerColor} onChange={setJoinerColor} excludeHex={hostColorSeen ?? undefined} />

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmJoin}
                disabled={loading}
                className="w-full py-3 bg-[var(--color-brass)] text-[#180f0a] font-bold rounded-xl transition-colors hover:bg-[#e2a868] disabled:opacity-50"
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
