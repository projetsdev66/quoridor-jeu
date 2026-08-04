import type { Position, Wall } from './gameLogic';

export interface Puzzle {
  id: string;
  title: string;
  description: string;
  maxMoves: number;
  walls: Wall[];
  p1Start: Position;
  p2Start: Position;
}

export const PUZZLES: Puzzle[] = [
  {
    id: 'p1',
    title: 'Premier pas',
    description: 'Atteignez la ligne adverse en un seul coup.',
    maxMoves: 1,
    walls: [],
    p1Start: { r: 7, c: 4 },
    p2Start: { r: 0, c: 4 },
  },
  {
    id: 'p2',
    title: 'Petit détour',
    description: "Un mur bloque la route directe : contournez-le.",
    maxMoves: 3,
    walls: [{ row: 6, col: 4, orientation: 'H' }],
    p1Start: { r: 6, c: 4 },
    p2Start: { r: 0, c: 4 },
  },
  {
    id: 'p3',
    title: 'Sous pression',
    description: 'Un mur vous coupe la route à mi-chemin.',
    maxMoves: 4,
    walls: [{ row: 4, col: 4, orientation: 'H' }],
    p1Start: { r: 4, c: 4 },
    p2Start: { r: 0, c: 4 },
  },
  {
    id: 'p4',
    title: 'Le long chemin',
    description: 'Deux murs vous forcent à ruser pour passer.',
    maxMoves: 5,
    walls: [
      { row: 6, col: 4, orientation: 'H' },
      { row: 6, col: 2, orientation: 'H' },
    ],
    p1Start: { r: 6, c: 4 },
    p2Start: { r: 0, c: 4 },
  },
  {
    id: 'p5',
    title: 'Le grand détour',
    description: 'Un mur double vous oblige à sortir des sentiers battus. Aucune marge d\'erreur.',
    maxMoves: 6,
    walls: [
      { row: 3, col: 4, orientation: 'H' },
      { row: 3, col: 6, orientation: 'H' },
    ],
    p1Start: { r: 3, c: 4 },
    p2Start: { r: 0, c: 4 },
  },
];
