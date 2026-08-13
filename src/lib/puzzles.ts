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
    maxMoves: 5,
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
  {
    id: 'p6',
    title: 'Zigzag',
    description: 'Deux paires de murs décalées vous forcent à changer de direction deux fois.',
    maxMoves: 5,
    walls: [
      { row: 6, col: 3, orientation: 'H' },
      { row: 6, col: 5, orientation: 'H' },
      { row: 4, col: 1, orientation: 'H' },
      { row: 4, col: 3, orientation: 'H' },
    ],
    p1Start: { r: 6, c: 4 },
    p2Start: { r: 0, c: 4 },
  },
  {
    id: 'p7',
    title: 'Couloir étroit',
    description: 'Un passage resserré des deux côtés : trouvez la seule brèche.',
    maxMoves: 6,
    walls: [
      { row: 5, col: 3, orientation: 'H' },
      { row: 5, col: 5, orientation: 'H' },
      { row: 3, col: 3, orientation: 'H' },
      { row: 3, col: 5, orientation: 'H' },
    ],
    p1Start: { r: 5, c: 4 },
    p2Start: { r: 0, c: 4 },
  },
  {
    id: 'p8',
    title: "L'escalier",
    description: 'Une rangée de murs presque complète : un seul créneau vous laisse passer.',
    maxMoves: 6,
    walls: [
      { row: 6, col: 2, orientation: 'H' },
      { row: 6, col: 4, orientation: 'H' },
      { row: 6, col: 6, orientation: 'H' },
    ],
    p1Start: { r: 6, c: 4 },
    p2Start: { r: 0, c: 4 },
  },
  {
    id: 'p9',
    title: 'La forteresse',
    description: 'Deux rangées de murs presque continues. Aucune marge d\'erreur.',
    maxMoves: 6,
    walls: [
      { row: 6, col: 2, orientation: 'H' },
      { row: 6, col: 4, orientation: 'H' },
      { row: 6, col: 6, orientation: 'H' },
      { row: 4, col: 0, orientation: 'H' },
      { row: 4, col: 2, orientation: 'H' },
      { row: 4, col: 4, orientation: 'H' },
      { row: 4, col: 6, orientation: 'H' },
    ],
    p1Start: { r: 6, c: 4 },
    p2Start: { r: 0, c: 4 },
  },
  {
    id: 'p10',
    title: 'Le labyrinthe',
    description: 'Trois rangées de murs à traverser d\'affilée. Le défi ultime.',
    maxMoves: 5,
    walls: [
      { row: 7, col: 2, orientation: 'H' },
      { row: 7, col: 4, orientation: 'H' },
      { row: 7, col: 6, orientation: 'H' },
      { row: 5, col: 0, orientation: 'H' },
      { row: 5, col: 2, orientation: 'H' },
      { row: 5, col: 4, orientation: 'H' },
      { row: 5, col: 6, orientation: 'H' },
      { row: 3, col: 2, orientation: 'H' },
      { row: 3, col: 4, orientation: 'H' },
      { row: 3, col: 6, orientation: 'H' },
    ],
    p1Start: { r: 7, c: 4 },
    p2Start: { r: 0, c: 4 },
  },
];
