# Audit de la version publiée

## Source contrôlée

URL : https://projetsdev66.github.io/quoridor-jeu/

## Constatations

La page GitHub Pages charge correctement le document initial et les ressources de l’application. L’écran d’onboarding est visible, avec les sections « Déplacez ou bloquez », « Traversez le plateau » et « Seul ou à plusieurs ». Le texte publié annonce les parties locales à 2, 3 ou 4 joueurs et les salles en ligne jusqu’à 4 joueurs.

Le champ « Votre nom » et le bouton « Commencer à jouer » sont présents et utilisables dans la viewport de contrôle. Le rendu mobile utilise le thème bois/laiton et ne montre pas d’erreur de ressource au chargement initial.

Date du contrôle : 2026-08-14.

## Test puzzle publié

Le menu publié ouvre correctement le mode Puzzle 1/10. Le puzzle « Premier pas » affiche 0/1 coup, le déplacement valide peut être touché sur le plateau, puis l’état passe à 1/1 avec « Puzzle résolu ! » et les boutons « Réessayer » et « Suivant ». Aucun blocage n’a été observé sur ce parcours.

## Test configurateur local publié

Le menu ouvre un configurateur « Partie locale 2–4 joueurs » avec trois choix distincts et un bouton de lancement. Le texte du stock de murs est dynamique : 10 murs pour 2 joueurs, puis 5 murs après sélection de 3 ou 4 joueurs. Les choix sont visibles et utilisables dans la viewport contrôlée.

## Test partie locale à quatre joueurs

La partie locale à quatre joueurs s’ouvre avec quatre pions, trois cartes adverses, cinq murs par joueur et un statut « Au tour de Audit Mobile ». Après le premier déplacement de p1, le statut passe bien à « Au tour de Joueur 2 » et l’historique enregistre `Audit Mobile case (1, 4)`. Le plateau et le contrôle tactile fonctionnent dans cette viewport.

## Test lobby en ligne publié

Après sortie de la partie locale, le lobby en ligne s’ouvre correctement. Il affiche les choix 2, 3 et 4 joueurs, le bouton « Créer une salle », un champ de code à 4 lettres et le bouton « Rejoindre ». Le texte explique que la partie démarre lorsque la salle est complète et annonce les couleurs et stocks de murs adaptés.

## Test réel Firebase publié

La création d’une salle à quatre joueurs fonctionne depuis GitHub Pages. Firebase a généré la salle temporaire `QNRF`; l’écran affiche « Salle en préparation », « Partagez ce code avec 3 autres joueurs » et `1/4 joueurs présents`. La synchronisation de création et l’écran d’attente répondent correctement.

Cette salle de test devra être annulée depuis l’interface ou supprimée de la base après l’audit.

## Audit build locale corrigée — 14 août 2026

URL de prévisualisation : http://127.0.0.1:5000/ via le proxy temporaire.

La page d’accueil charge correctement et affiche les parcours IA, Blitz, Survie, Partie locale 2 à 4 joueurs, Puzzles et Multijoueur en ligne. Le puzzle 1/10 s’ouvre correctement ; le plateau et les contrôles Déplacer / Mur horizontal / Mur vertical sont visibles. Les corrections de compteur et de victoire sont présentes dans le code : seuls les états retournés par une action valide doivent désormais consommer un coup, et la victoire passe par isGoalPosition.

Le build de production réussit. La directive client inutile du composant tooltip a été retirée et le bundle a été séparé en chunks React, Firebase, animations et icônes. Le chunk applicatif principal est maintenant inférieur à 500 kB et aucun avertissement de sourcemap ne subsiste.

Les tests automatisés passent : 10 puzzles validés, smoke local 3/4 joueurs validé, smoke multiplayer 2/3/4 joueurs validé, typecheck validé, build de production validé et git diff --check validé.

## Corrections finales de fiabilité

Les actions Firebase utilisent des transactions pour les coups, murs, chat et redémarrages. La suppression d’une salle est maintenant signalée aux clients restants : lorsqu’un hôte ferme sa salle, les joueurs reçoivent un état « Salle fermée » et reviennent au menu au lieu de rester sur un plateau obsolète. Les codes saisis dans le lobby sont normalisés avant recherche et jonction. Les emplacements de murs utilisent des événements pointer, des zones tactiles stables et des libellés accessibles.
