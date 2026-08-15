import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface RulesOverlayProps {
  onClose: () => void;
}

export function RulesOverlay({ onClose }: RulesOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-title"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--color-wood-dark)] border border-[#5c3a24] p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-lg relative max-h-[80vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          aria-label="Fermer les règles"
          className="absolute right-4 top-4 rounded-lg p-1 text-[var(--color-ivory)]/50 transition-colors hover:text-[var(--color-brass)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brass)]"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 id="rules-title" className="text-3xl font-serif font-bold text-[var(--color-brass)] mb-6">
          Règles du Quoridor
        </h2>
        
        <div className="space-y-4 text-[var(--color-ivory)]/80 text-sm md:text-base leading-relaxed">
          <p>
            <strong>But du jeu :</strong> être le premier à atteindre sa cible. En format <strong>Bords</strong>, les joueurs 1 et 2 traversent le plateau du nord vers le sud ou du sud vers le nord, tandis que les joueurs 3 et 4 visent respectivement l’est et l’ouest.
          </p>

          <div className="rounded-xl border border-[var(--color-brass)]/35 bg-[var(--color-brass)]/10 p-3">
            <strong className="text-[var(--color-brass)]">Format Centre — 4 joueurs :</strong> les quatre pions commencent dans les coins. La case centrale, marquée par une mire dorée, est la cible commune : le premier joueur qui l’atteint gagne immédiatement.
          </div>
          
          <h3 className="text-xl font-serif text-[var(--color-brass)] mt-4 mb-2">Déroulement</h3>
          <p>
            À son tour, un joueur a le choix entre deux actions :
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Déplacer son pion :</strong> d’une case orthogonalement — haut, bas, gauche ou droite — ou sauter selon la règle de face à face.</li>
            <li><strong>Poser un mur :</strong> pour ralentir les autres joueurs. Chaque joueur dispose de 10 murs en duel et de 5 murs dans une partie à 3 ou 4 joueurs.</li>
          </ul>

          <h3 className="text-xl font-serif text-[var(--color-brass)] mt-4 mb-2">Règles des murs</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Un mur bloque deux passages adjacents.</li>
            <li>Il est interdit d’enfermer totalement un joueur : un chemin vers sa cible doit toujours rester possible, y compris vers la case centrale.</li>
          </ul>

          <h3 className="text-xl font-serif text-[var(--color-brass)] mt-4 mb-2">Face à face</h3>
          <p>
            Si un pion se trouve juste devant le joueur actif sans mur entre eux, le joueur peut sauter par-dessus. Si un mur ou un autre pion se trouve derrière, il peut se déplacer en diagonale autour du pion adjacent.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
