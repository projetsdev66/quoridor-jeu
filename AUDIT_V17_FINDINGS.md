# Audit approfondi — constats avant corrections

## Moteur et victoires

Le moteur gère actuellement uniquement les objectifs de bord. `GameState.mode` ne possède pas encore de format central, et `applyMove` appelle `isGoalPosition` sans contexte de mode. Les chemins et la validation des murs doivent donc recevoir le mode de partie pour que la cible centrale soit cohérente partout.

La rotation des tours s’appuie sur les joueurs actifs et fonctionne pour 2, 3 et 4 joueurs. Le flux d’arrêt sur `state.winner` est correct, mais les tests existants ne couvrent pas encore la victoire de chaque joueur ni le redémarrage après une victoire.

## Fin de partie et effets

`GameCore` enregistre correctement une victoire ou une défaite personnelle pour les parties solo et en ligne, tout en excluant le pass-and-play local. L’overlay est affiché sur tous les clients, mais son effet est globalement couleur laiton et ne distingue pas encore le joueur gagnant. Il faut transmettre sa couleur et son identité graphique à l’overlay.

## Puzzles

Les coups invalides ne sont pas comptés, mais l’état de puzzle force manuellement `winner = null` et ne centralise pas totalement le résultat. Les textes sont courts et les dix configurations sont structurellement accessibles selon l’audit existant. La navigation doit être rendue plus explicite, notamment pour le dernier puzzle et les états réussite/échec.

## Salles et ergonomie

Les transactions Firebase protègent la création, la jonction, les coups, les murs, le chat et les redémarrages. La disparition d’une salle est signalée aux clients. Il faut ajouter des tests de cycle de vie de salle et clarifier les textes d’attente, de copie du code, de salle complète et de sortie.

## Plan de correction

1. Ajouter le mode `center` limité à 4 joueurs, avec cible commune `(4,4)` et départs aux quatre bords.
2. Rendre la cible centrale visible dans le plateau et documentée dans le menu et les règles.
3. Transmettre le mode à toutes les validations de chemin et de victoire.
4. Ajouter un effet de victoire propre à chaque joueur, basé sur sa couleur et son icône.
5. Renforcer les écrans puzzle, les textes et les actions de navigation.
6. Ajouter des tests moteur pour les quatre gagnants, le format central, les redémarrages et les coups invalides.
7. Relancer typecheck, audits, tests smoke et build.
