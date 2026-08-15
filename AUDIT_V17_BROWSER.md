# Audit navigateur v17 — constats intermédiaires

Date : 14 août 2026

Le menu d’accueil affiche les parcours IA, blitz, survie, local, puzzles et multijoueur, avec la mention local 2 à 4 joueurs.

Le configurateur local affiche 2, 3 et 4 joueurs. Lorsque 4 joueurs est sélectionné, le sélecteur de format apparaît avec « Bords — Chaque joueur vise son côté » et « Centre — Le premier au centre gagne ».

Le lancement du format Centre à 4 joueurs fonctionne dans le navigateur local. La barre supérieure affiche « Centre · 4 joueurs », chaque joueur actif commence avec 5 murs, la partie démarre avec Testeur au tour, et la case (4,4) apparaît au milieu du plateau avec un marqueur doré et une icône de cible. Le panneau de statut répète « Centre · 4 joueurs » et « Murs sécurisés ».

Le DOM conserve les boutons de jeu et le texte du format Centre après lancement. Le parcours visuel n’a pas généré d’erreur d’interface pendant ces vérifications.

À poursuivre : tester l’écran puzzle, les états de fin, les effets de victoire individuels et les scénarios de salle en ligne, puis relancer le build et les audits automatisés.

## Résultats techniques déjà obtenus

- `pnpm run typecheck` : OK.
- `pnpm exec tsx scripts/audit-puzzles.ts` : OK — 10 puzzles et objectifs validés.
- `pnpm exec tsx scripts/smoke-local.ts` : OK — local 3/4 joueurs, victoires de bord et format Centre.
- `pnpm exec tsx scripts/smoke-multiplayer.ts` : OK — en ligne 2/3/4 joueurs.
- `pnpm run build` : OK — bundle applicatif 408.85 kB, Firebase 156.69 kB, animations 127.15 kB.

## Note d’accessibilité

Le test DOM n’a trouvé aucune cellule avec `role="gridcell"` ou attribut `data-cell`; le plateau reste toutefois rendu et interactif visuellement. La cible centrale est accessible via son libellé interne au composant Cell, mais une vérification complémentaire des attributs rendus du marqueur est recommandée.

## Note technique

Le serveur de développement utilisé pendant le test navigateur tourne sur le port 5173.


## Vérification visuelle des puzzles

L’ouverture de l’écran puzzle fonctionne depuis le menu. Le premier niveau affiche « Puzzle 1 / 10 », le titre « Premier pas », une description précise, un encadré « Conseil », le compteur « 0 / 1 · 1 restant » et les trois modes d’action Déplacer, Mur horizontal et Mur vertical. Les boutons précédent/suivant sont visibles et désactivés lorsqu’ils ne s’appliquent pas.

La mise en page reste lisible sur le viewport de test ; les commandes sont regroupées en bas pour l’usage tactile.

## État de réussite puzzle vérifié

Le clic sur le marqueur valide de la case cible du puzzle 1 met bien à jour le compteur à « 1 / 1 · 0 restant », affiche « Puzzle résolu en 1 coup ! », masque les commandes de jeu et présente « Réessayer » ainsi que « Suivant ». Le plateau passe en état visuel de réussite avec bord doré.

Le premier test de clic direct sur la cellule parente n’a pas déclenché d’action, ce qui est normal : le composant Cell attache l’action au marqueur de mouvement interne (`motion.div`) lorsque le déplacement est valide. Le test suivant sur cet élément interactif a réussi.
