import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, ChevronRight, ArrowLeft } from 'lucide-react';
import { type GameState, getFreshState } from '@/lib/gameLogic';
import { generateRoomCode, createRoom, joinRoom } from '@/lib/firebase';

interface MainMenuProps {
  onStartSolo: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onRoomCreated: (roomId: string, state: GameState) => void;
  onRoomJoined: (roomId: string, state: GameState) => void;
}

export function MainMenu({ onStartSolo, onRoomCreated, onRoomJoined }: MainMenuProps) {
  const [view, setView] = useState<'main' | 'solo' | 'multi'>('main');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () => {
    setLoading(true);
    const code = generateRoomCode();
    const state = getFreshState();
    state.roomId = code;
    state.names.p1 = 'Hôte';
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
      onRoomJoined(joinCode.toUpperCase(), state);
    } else {
      setError('Salle introuvable');
    }
  };

  const variants = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-serif font-bold text-[var(--color-brass)] tracking-widest mb-4">QUORIDOR</h1>
        <p className="text-[var(--color-ivory)]/70">L'art du labyrinthe</p>
      </div>

      <div className="relative bg-[var(--color-wood-dark)] rounded-2xl shadow-2xl p-6 border border-[#3b2419] min-h-[300px] overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'main' && (
            <motion.div key="main" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-4">
              <button 
                onClick={() => setView('solo')}
                className="w-full flex items-center justify-between p-4 bg-[var(--color-wood-medium)] hover:bg-[#4a2e1b] text-[var(--color-ivory)] rounded-xl transition-colors border border-transparent hover:border-[#5c3a24]"
              >
                <div className="flex items-center gap-3">
                  <User className="text-[var(--color-brass)]" />
                  <span className="font-bold text-lg">Jouer en Solo</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </button>

              <button 
                onClick={() => setView('multi')}
                className="w-full flex items-center justify-between p-4 bg-[var(--color-wood-medium)] hover:bg-[#4a2e1b] text-[var(--color-ivory)] rounded-xl transition-colors border border-transparent hover:border-[#5c3a24]"
              >
                <div className="flex items-center gap-3">
                  <Users className="text-[var(--color-brass)]" />
                  <span className="font-bold text-lg">Multijoueur en ligne</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </button>
            </motion.div>
          )}

          {view === 'solo' && (
            <motion.div key="solo" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-3">
              <button onClick={() => setView('main')} className="text-[var(--color-ivory)]/50 hover:text-[var(--color-ivory)] flex items-center gap-2 mb-2 w-fit">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              
              <h3 className="text-xl font-serif text-[var(--color-brass)] mb-2">Difficulté de l'IA</h3>
              
              <button onClick={() => onStartSolo('easy')} className="p-3 bg-[var(--color-wood-medium)] rounded-xl text-left hover:bg-[#4a2e1b] transition-colors border border-transparent hover:border-[#5c3a24]">
                <div className="font-bold text-[var(--color-ivory)]">Facile</div>
                <div className="text-sm text-[var(--color-ivory)]/50">Pour apprendre les bases</div>
              </button>
              <button onClick={() => onStartSolo('medium')} className="p-3 bg-[var(--color-wood-medium)] rounded-xl text-left hover:bg-[#4a2e1b] transition-colors border border-transparent hover:border-[#5c3a24]">
                <div className="font-bold text-[var(--color-ivory)]">Moyen</div>
                <div className="text-sm text-[var(--color-ivory)]/50">Un défi équilibré</div>
              </button>
              <button onClick={() => onStartSolo('hard')} className="p-3 bg-[var(--color-wood-medium)] rounded-xl text-left hover:bg-[#4a2e1b] transition-colors border border-transparent hover:border-[#5c3a24]">
                <div className="font-bold text-[var(--color-ivory)]">Difficile</div>
                <div className="text-sm text-[var(--color-ivory)]/50">Préparez-vous à souffrir</div>
              </button>
            </motion.div>
          )}

          {view === 'multi' && (
            <motion.div key="multi" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-4">
              <button onClick={() => setView('main')} className="text-[var(--color-ivory)]/50 hover:text-[var(--color-ivory)] flex items-center gap-2 mb-2 w-fit">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>

              <button 
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full py-4 bg-[var(--color-brass)] text-[#180f0a] font-bold rounded-xl transition-colors hover:bg-[#e2a868] disabled:opacity-50"
              >
                {loading ? 'Création...' : 'Créer une salle'}
              </button>

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
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={4}
                  className="w-full bg-[#180f0a] border border-[#3b2419] rounded-xl px-4 py-3 text-[var(--color-ivory)] font-mono tracking-widest text-center text-xl mb-3 focus:outline-none focus:border-[var(--color-brass)] uppercase"
                />
                {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}
                <button 
                  onClick={handleJoinRoom}
                  disabled={loading || joinCode.length !== 4}
                  className="w-full py-3 bg-[var(--color-wood-medium)] text-[var(--color-ivory)] font-bold rounded-xl transition-colors hover:bg-[#4a2e1b] disabled:opacity-50 border border-[#5c3a24]"
                >
                  {loading ? 'Connexion...' : 'Rejoindre'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
