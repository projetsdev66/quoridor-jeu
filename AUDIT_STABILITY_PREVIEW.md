# Audit stabilité et preview — 15 août 2026

## Preview local

- URL testée : http://127.0.0.1:5173/
- Le serveur Vite était déjà actif sur les ports 5173 et 5000 ; le preview utilisé est celui du port 5173.
- Le menu s’affiche avec le nouveau libellé « IA active · choisissez la difficulté ».
- Le bouton principal IA ne déborde plus visiblement dans la carte sur le viewport de test.
- La navigation vers la difficulté IA fonctionne.
- Une partie Classique IA Facile démarre correctement.
- Le panneau de partie affiche « IA (Facile) », 10 murs pour le joueur IA et « C’est à vous de jouer ».
- Le plateau affiche bien les deux pions ; p2 est actif dans le rendu après correction.
- Le preview a confirmé que le bug principal venait de `buildSoloState` : `getFreshState()` initialisait seulement p1 comme joueur actif, puis `normalizeGameState` désactivait p2, ce qui empêchait `useAI` et `applyMove/applyWall` de jouer le tour IA.

## Corrections intégrées avant ce test

- Activation explicite de p2 et attribution de 10 murs dans `GamePage.buildSoloState`.
- Ajout de `scripts/smoke-ai.ts` couvrant classic, blitz et survival pour les difficultés easy, medium, hard et expert.
- Refonte mobile de `TopBar` en deux niveaux pour éviter les collisions entre titre, actions, mode et code de salle.
- Renforcement du menu responsive avec `min-w-0`, libellés contenus et titre adaptatif.
- Stabilisation globale de `html`, `body` et `#root`, fond viewport et prévention du débordement horizontal.
- Refonte de `WaitingOverlay` avec roster des places, état prêt/libre, partage de code avec fallback et erreur visible.

## Validations déjà passées

- `pnpm run typecheck` : OK.
- `pnpm exec tsx scripts/smoke-ai.ts` : OK pour 3 modes et 4 difficultés.
- `pnpm run build` : OK, bundle applicatif principal 412,27 kB.

## Vérification de salle en ligne

Le parcours en ligne permet de sélectionner quatre joueurs puis le format Centre avant la création. Une salle de test a été créée avec le code temporaire `AJT4`, puis fermée proprement par l’hôte. L’écran d’attente affichait le format Centre, le nombre `1/4 joueurs présents`, les quatre places avec leurs couleurs, le code copiable et une action « Quitter la salle ». Après la fermeture, l’application est revenue au menu et a affiché le message « Salle fermée — La salle n’est plus disponible. Retour au menu. », ce qui confirme que l’état de fermeture n’est pas silencieux.

La composition de l’overlay reste lisible : le code est dans un bloc séparé, le roster est en grille deux colonnes, les informations de cible sont au-dessus, et le bouton de sortie est pleine largeur. Le jeu derrière l’overlay est correctement assombri et non interactif.

## Vérification du preview public

Le preview public est accessible et charge le menu principal sans fond blanc ni débordement visible. Le parcours « Jouer contre l’IA » ouvre les quatre difficultés, puis démarre une partie avec `IA (Facile)` comme joueur p2 et dix murs. Après un déplacement humain valide, l’historique affiche deux actions consécutives : `Audit local case (1, 4)` puis `IA (Facile) case (9, 6)`. Le passage de tour est donc effectif et l’IA joue réellement.

Le nouveau rendu de la barre supérieure est réparti sur plusieurs lignes à largeur réduite ; le plateau, les contrôles de déplacement et la zone d’historique restent séparés. Les cellules valides sont désormais exposées comme éléments `role="button"` avec un libellé de ligne et colonne, ce qui permet aussi une interaction clavier.
