import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Settings2, Sparkles, Volume2, Wand2, Footprints, Route } from 'lucide-react';
import type { GameSettings } from '@/hooks/useSettings';

interface SettingsPanelProps {
  open: boolean;
  settings: GameSettings;
  onClose: () => void;
  onToggle: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  onReset: () => void;
}

interface SettingRowProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

function SettingRow({ icon: Icon, title, description, checked, onChange }: SettingRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#3b2419] bg-[#180f0a]/70 px-4 py-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-brass)]/25 bg-[var(--color-brass)]/10 text-[var(--color-brass)]">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-semibold text-[var(--color-ivory)]">{title}</div>
        <div className="text-xs leading-relaxed text-[var(--color-ivory)]/55">{description}</div>
      </div>

      <button
        type="button"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full border transition-all ${
          checked
            ? 'border-[var(--color-brass)]/60 bg-[var(--color-brass)]/25'
            : 'border-[#3b2419] bg-[var(--color-wood-dark)]'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full transition-all ${
            checked
              ? 'left-8 bg-[var(--color-brass)] shadow-[0_0_12px_rgba(201,154,82,0.35)]'
              : 'left-1 bg-[var(--color-ivory)]/80'
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsPanel({ open, settings, onClose, onToggle, onReset }: SettingsPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-[28px] border border-[#5c3a24] bg-[var(--color-wood-dark)] p-5 shadow-2xl"
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--color-brass)]/30 bg-[var(--color-brass)]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-brass)]">
                  <Settings2 className="h-3.5 w-3.5" />
                  Paramètres
                </div>
                <h2 className="text-2xl text-[var(--color-ivory)]">Confort de jeu</h2>
                <p className="mt-1 text-sm text-[var(--color-ivory)]/60">
                  Réglez l’ambiance, la fluidité et l’assistance selon votre style.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#3b2419] px-3 py-1.5 text-sm font-semibold text-[var(--color-ivory)]/70 transition-colors hover:border-[#5c3a24] hover:text-[var(--color-ivory)]"
              >
                Fermer
              </button>
            </div>

            <div className="space-y-3">
              <SettingRow
                icon={Volume2}
                title="Sons du jeu"
                description="Active les bruitages de déplacement, de pose de mur et de victoire."
                checked={settings.soundEnabled}
                onChange={(next) => onToggle('soundEnabled', next)}
              />
              <SettingRow
                icon={Sparkles}
                title="Confirmation de mur"
                description="Évite les erreurs en demandant une confirmation avant la pose d’un mur."
                checked={settings.confirmWalls}
                onChange={(next) => onToggle('confirmWalls', next)}
              />
              <SettingRow
                icon={Wand2}
                title="Animations légères"
                description="Réduit les animations pour rendre le jeu plus fluide sur mobile."
                checked={settings.reducedMotion}
                onChange={(next) => onToggle('reducedMotion', next)}
              />
              <SettingRow
                icon={Route}
                title="Chemin conseillé au démarrage"
                description="Affiche automatiquement le chemin optimal au début des parties."
                checked={settings.showPathByDefault}
                onChange={(next) => onToggle('showPathByDefault', next)}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-[#3b2419] bg-[#180f0a]/70 p-4 text-sm text-[var(--color-ivory)]/65">
              <div className="mb-1 flex items-center gap-2 font-semibold text-[var(--color-ivory)]">
                <Footprints className="h-4 w-4 text-[var(--color-brass)]" />
                Astuce
              </div>
              Si vous jouez surtout sur smartphone, désactivez la confirmation de mur et activez les animations légères pour gagner en rapidité.
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#5c3a24] bg-[var(--color-wood-medium)] px-4 py-3 font-semibold text-[var(--color-ivory)] transition-colors hover:bg-[#4a2e1b]"
              >
                <RotateCcw className="h-4 w-4" />
                Réinitialiser
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brass)] px-4 py-3 font-bold text-[#180f0a] transition-colors hover:bg-[#e2a868]"
              >
                <Settings2 className="h-4 w-4" />
                Continuer la partie
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
