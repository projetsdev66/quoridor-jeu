import { useState } from 'react';
import { motion } from 'framer-motion';
import { MousePointer2, Grid3x3, Users, ArrowRight } from 'lucide-react';

interface OnboardingScreenProps {
  onDone: (name: string) => void;
}

const STEPS = [
  {
    icon: MousePointer2,
    title: 'Déplacez ou bloquez',
    text: "À votre tour, avancez votre pion d'une case, ou posez un mur pour ralentir votre adversaire.",
  },
  {
    icon: Grid3x3,
    title: 'Traversez le plateau',
    text: 'Le premier à atteindre la ligne opposée à son point de départ gagne — impossible de totalement enfermer un adversaire.',
  },
  {
    icon: Users,
    title: 'Seul ou à plusieurs',
    text: "Affrontez l'IA, jouez en Duo sur le même appareil, ou créez une salle pour jouer en ligne avec un ami.",
  },
];

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDone(name.trim());
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-serif font-bold text-[var(--color-brass)] tracking-widest mb-2">
          QUORIDOR
        </h1>
        <p className="text-[var(--color-ivory)]/70 text-sm">Bienvenue ! Voici comment jouer.</p>
      </div>

      <div className="bg-[var(--color-wood-dark)] rounded-2xl shadow-2xl p-6 border border-[#3b2419] flex flex-col gap-4">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-full bg-[var(--color-brass)]/15 border border-[var(--color-brass)]/40 flex items-center justify-center shrink-0">
              <step.icon className="w-4 h-4 text-[var(--color-brass)]" />
            </div>
            <div>
              <div className="font-bold text-[var(--color-ivory)] text-sm">{step.title}</div>
              <div className="text-[var(--color-ivory)]/60 text-xs leading-relaxed mt-0.5">{step.text}</div>
            </div>
          </motion.div>
        ))}

        <form onSubmit={handleSubmit} className="mt-2 pt-4 border-t border-[#3b2419] flex flex-col gap-3">
          <div>
            <label className="block text-xs text-[var(--color-ivory)]/50 mb-1 font-bold tracking-wide uppercase">
              Choisissez votre pseudo
            </label>
            <input
              type="text"
              placeholder="Votre nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              autoFocus
              className="w-full bg-[#180f0a] border border-[#3b2419] rounded-xl px-4 py-2.5 text-[var(--color-ivory)] focus:outline-none focus:border-[var(--color-brass)] placeholder:text-[var(--color-ivory)]/25 text-sm"
            />
            <p className="text-[10px] text-[var(--color-ivory)]/35 mt-1">
              Vous pourrez le modifier à tout moment depuis le menu.
            </p>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-brass)] text-[#180f0a] font-bold rounded-xl hover:bg-[#e2a868] transition-colors"
          >
            Commencer à jouer
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
