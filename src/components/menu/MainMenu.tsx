import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, ChevronRight, ArrowLeft, Flame, Trophy, Zap, Shield, Puzzle as PuzzleIcon, HelpCircle } from 'lucide-react';
import { type GameState, getFreshState } from '@/lib/gameLogic';
import { generateUniqueRoomCode, createRoom, joinRoom } from '@/lib/firebase';
import { useStats } from '@/hooks/useStats';
import { getBestSurvivalRound } from '@/lib/survivalRecord';
import type { Difficulty } from '@/lib/aiEngine';
import { RulesOverlay } from '@/components/game/RulesOverlay';

interface MainMenuProps {
  onStartSolo: (difficulty: Difficulty, playerName: string, mode: 'classic' | 'blitz') => void;
  onStartDuo: (playerName: string) => void;
  onStartSurvival: (playerName: string) => void;
  onOpenPuzzles: () => void;
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

export function MainMenu({
  onStartSolo,
  onStartDuo,
  onStartSurvival,
  onOpenPuzzles,
  onRoomCreated,
  onRoomJoined,
}: MainMenuProps) {
  const [view, setView] = useState<'main' | 'solo' | 'multi'>('main');
  const [showRules, setShowRules] = useState(false);
  const [pendingMode, setPendingMode] = useState<'classic' | 'blitz'>('classic');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [playerName, setPlayerName] = useState(() => {
    try { return localStorage.getItem('quoridor_name') ?? ''; } catch { return ''; }
  });

  const { stats } = useStats();
  const bestRound = getBestSurvivalRound();

  const saveName = (name: string) => {
    setPlayerName(name);
    try { localStorage.setItem('quoridor_name', name); } catch { /* ignore */ }
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
    await createRoom(state, code);
    setLoading(false);
    onRoomCreated(code, state);
  };

  const handleJoinRoom = async () => {
    if (!joinCode || joinCode.length !== 4) {
      setError('Le code doit contenir 4 caractères');
      return;
    }
    setLoading(true);
    setError('');
    const state = await joinRoom(joinCode.toUpperCase());
    setLoading(false);
    if (state) {
      if (playerName.trim()) state.names.p2 = playerName.trim();
      onRoomJoined(joinCode.toUpperCase(), state);
    } else {
      setError('Salle introuvable');
    }
  };

  const variants = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  };

  const totalGames = stats.wins + stats.losses;

  return (
    <div className="w-full max-w-md lg:max-w-lg mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-serif font-bold text-[var(--color-brass)] tracking-widest mb-2 drop-shadow-[0_2px_12px_rgba(201,154,82,0.25)]">
          QUORIDOR
        </h1>
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
                  className="w-full bg-[#180f0a] border border-[#3b2419] rounded-xl px-4 py-2.5 text-[var(--color-ivory)] focus:outline-none focus:border-[var(--color-brass)] placeholder:text-[var(--color-ivory)]/25 text-sm transition-colors"
                />
              </div>

              <MenuButton
                icon={<User className="text-[var(--color-brass)] w-4 h-4" />}
                label="Classique — vs IA"
                onClick={() => openDifficulty('classic')}
              />

              <MenuButton
                icon={<Zap className="text-[var(--color-brass)] w-4 h-4" />}
                label="Blitz"
                subtitle="20 secondes par coup"
                onClick={() => openDifficulty('blitz')}
              />

              <MenuButton
                icon={<Shield className="text-[var(--color-brass)] w-4 h-4" />}
                label="Survie"
                subtitle={bestRound ? `Record : manche ${bestRound}` : "L'IA monte en puissance"}
                onClick={() => onStartSurvival(playerName.trim())}
              />

              <MenuButton
                icon={<Users className="text-[var(--color-brass)] w-4 h-4" />}
                label="Duo local"
                subtitle="Même appareil, à tour de rôle"
                onClick={() => onStartDuo(playerName.trim())}
              />

              <MenuButton
                icon={<PuzzleIcon className="text-[var(--color-brass)] w-4 h-4" />}
                label="Puzzles"
                onClick={onOpenPuzzles}
              />

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
                  onClick={() => onStartSolo(d.id, playerName.trim(), pendingMode)}
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
                  onClick={handleJoinRoom}
                  disabled={loading || joinCode.length !== 4}
                  className="w-full py-3 bg-[var(--color-wood-medium)] text-[var(--color-ivory)] font-bold rounded-xl transition-colors hover:bg-[#4a2e1b] disabled:opacity-50 border border-[#5c3a24]"
                >
                  {loading ? 'Connexion...' : 'Rejoindre'}
                </motion.button>
              </div>
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
