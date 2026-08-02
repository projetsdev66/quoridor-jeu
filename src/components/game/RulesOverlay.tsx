import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface RulesOverlayProps {
  onClose: () => void;
}

export function RulesOverlay({ onClose }: RulesOverlayProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--color-wood-dark)] border border-[#5c3a24] p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-lg relative max-h-[80vh] overflow-y-auto"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-ivory)]/50 hover:text-[var(--color-brass)] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-3xl font-serif font-bold text-[var(--color-brass)] mb-6">
          Règles du Quoridor
        </h2>
        
        <div className="space-y-4 text-[var(--color-ivory)]/80 text-sm md:text-base leading-relaxed">
          <p>
            <strong>But du jeu :</strong> Être le premier à atteindre n'importe quelle case de la ligne opposée à sa ligne de départ.
          </p>
          
          <h3 className="text-xl font-serif text-[var(--color-brass)] mt-4 mb-2">Déroulement</h3>
          <p>
            À son tour, un joueur a le choix entre deux actions :
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Déplacer son pion :</strong> D'une case orthogonalement (haut, bas, gauche, droite).</li>
            <li><strong>Poser un mur :</strong> Pour ralentir l'adversaire. Chaque joueur dispose de 10 murs.</li>
          </ul>

          <h3 className="text-xl font-serif text-[var(--color-brass)] mt-4 mb-2">Règles des murs</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Un mur bloque deux cases.</li>
            <li>Il est interdit d'enfermer totalement un joueur. Il doit toujours exister un chemin vers son but.</li>
          </ul>

          <h3 className="text-xl font-serif text-[var(--color-brass)] mt-4 mb-2">Face à face</h3>
          <p>
            Si deux pions se retrouvent face à face sans mur entre eux, le joueur dont c'est le tour peut sauter par-dessus l'adversaire. Si un mur se trouve derrière l'adversaire, le joueur peut sauter en diagonale.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
