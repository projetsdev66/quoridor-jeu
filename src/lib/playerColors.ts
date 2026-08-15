export interface PlayerColorOption {
  id: string;
  name: string;
  hex: string;
  darkHex: string; // for borders / shadows
}

export const PLAYER_COLORS: PlayerColorOption[] = [
  { id: 'ruby', name: 'Rubis', hex: '#c0392b', darkHex: '#7a2419' },
  { id: 'sapphire', name: 'Saphir', hex: '#3a6ea8', darkHex: '#1f3f61' },
  { id: 'emerald', name: 'Émeraude', hex: '#3f9142', darkHex: '#245526' },
  { id: 'amethyst', name: 'Améthyste', hex: '#8659b5', darkHex: '#4f3268' },
  { id: 'coral', name: 'Corail', hex: '#d2703f', darkHex: '#7d3f22' },
  { id: 'teal', name: 'Turquoise', hex: '#2f9e97', darkHex: '#1a5551' },
];

export const DEFAULT_P1_COLOR = PLAYER_COLORS[0].hex;
export const DEFAULT_P2_COLOR = PLAYER_COLORS[1].hex;

export function darkVariantFor(hex: string): string {
  return PLAYER_COLORS.find((c) => c.hex === hex)?.darkHex ?? '#241610';
}

export function colorNameFor(hex: string): string {
  return PLAYER_COLORS.find((c) => c.hex === hex)?.name ?? 'Personnalisée';
}
