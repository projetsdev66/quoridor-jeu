# Rapport d’audit et d’amélioration — Quoridor v17

## Périmètre

Cette version couvre le moteur de jeu, les parties locales à 2, 3 et 4 joueurs, les salles Firebase à 2, 3 et 4 joueurs, les puzzles, les états de victoire, les fins de partie, les statistiques, l’ergonomie mobile et le déploiement GitHub Pages.

## Format 4 joueurs « Centre »

Un nouveau format `center` est disponible uniquement avec quatre joueurs. Les quatre pions démarrent aux coins du plateau, chaque joueur conserve cinq murs, et la victoire est obtenue lorsque le pion atteint la case centrale `(4,4)`. Le moteur réutilise cette même règle pour les déplacements, la recherche de chemin, la validation des murs et l’état de victoire.

Le menu local et le configurateur de salle proposent désormais deux formats explicites : « Bords » et « Centre ». Le format de la salle est conservé dans l’état Firebase et est montré au joueur avant la jonction. La barre supérieure, l’écran d’attente, la ligne d’information et les règles rappellent également la cible active.

La case centrale est rendue avec une bordure dorée, un fond contrasté et une icône de viseur `Crosshair`. Elle conserve ses interactions de déplacement, et son libellé accessible est « Cible centrale ».

## Victoires et fins de partie

`isGoalPosition` prend en charge les objectifs nord, sud, est et ouest ainsi que la case centrale. `applyMove` attribue le gagnant au moment exact où la position cible est atteinte, puis bloque la rotation du tour. Les coups et les murs ultérieurs sont refusés lorsqu’un gagnant existe.

L’overlay de fin utilise le vrai nom et la vraie couleur du gagnant. Chaque joueur dispose d’une présentation distincte : icône associée à son identité, bordure et particules dans sa couleur. Les effets sont désactivés en mode « réduire les animations ». L’overlay possède maintenant un rôle de dialogue, un titre accessible et des boutons tactiles avec focus visible.

En local pass-and-play, le texte annonce clairement le joueur gagnant et aucune victoire/défaite personnelle n’est enregistrée. En solo et en ligne, les statistiques du joueur local sont enregistrées une seule fois par partie grâce à un garde-fou de session. Une partie terminée affiche le gagnant dans la ligne de statut et empêche l’écran d’attente de réapparaître.

## Puzzles

Les dix puzzles ont été vérifiés. Les descriptions et conseils ont été reformulés pour indiquer l’objectif sans révéler toute la solution. Les coups invalides ne consomment pas de tentative. Une réussite affiche le compteur final, le message « Puzzle résolu en X coup(s) ! », le bord doré du plateau, ainsi que les boutons « Réessayer » et « Suivant ». La navigation réinitialise correctement l’état du niveau suivant.

## Parties locales et salles

Le mode local initialise les joueurs actifs, les positions, les couleurs, la rotation des tours et le stock de murs correspondant au nombre choisi. Les scénarios 3 et 4 joueurs standards, ainsi que le format Centre à 4 joueurs, ont été ajoutés aux tests de fumée.

Les salles en ligne utilisent des transactions pour la création, la jonction, les coups, les murs, le chat, les redémarrages et les sorties. L’attribution des places est atomique, les couleurs sont uniques, les salles complètes sont refusées et la suppression de l’hôte est signalée aux autres clients. Le code de salle est normalisé et copiable depuis l’interface.

## Ergonomie et textes

Les commandes importantes restent accessibles sur mobile via une barre fixe basse, avec prise en compte de la zone sûre de l’appareil. Les boutons principaux ont des tailles tactiles adaptées, les actions de murs peuvent demander confirmation, les modes et la cible active sont rappelés dans l’interface, et les messages de statut distinguent le tour, l’attente et la fin.

## Validation automatisée

| Validation | Résultat |
|---|---|
| `pnpm run typecheck` | OK |
| `pnpm exec tsx scripts/audit-puzzles.ts` | OK — 10 puzzles et objectifs 2/3/4 joueurs |
| `pnpm exec tsx scripts/smoke-local.ts` | OK — local 3/4 joueurs, victoires de bord et format Centre |
| `pnpm exec tsx scripts/smoke-multiplayer.ts` | OK — scénarios en ligne 2/3/4 joueurs |
| `pnpm run build` | OK — bundle applicatif 409,33 kB ; chunks Firebase, animations et icônes séparés |
| `git diff --check` | OK |

## Vérification navigateur

Le configurateur local affiche le format Centre uniquement après la sélection de quatre joueurs. Le lancement produit le badge « Centre · 4 joueurs », quatre joueurs aux coins et une cible centrale dorée. Le premier puzzle a été résolu dans le navigateur avec un coup valide ; le compteur, l’overlay de réussite et la navigation vers le puzzle 2 ont été vérifiés.

## Livraison

L’archive v17 doit être poussée manuellement par l’utilisateur sur GitHub. Aucun push automatique n’a été effectué. Le workflow GitHub Pages utilise pnpm, Node 22, le chemin de base `/quoridor-jeu/` et le répertoire de sortie `dist/public`.
