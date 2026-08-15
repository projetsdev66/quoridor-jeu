# Audit Quoridor

## Périmètre

L’audit couvre le modèle de partie, les règles de déplacement et de pose des murs, les tours, les modes solo et locaux, les salles Firebase, la synchronisation, les écrans d’attente et les textes visibles.

## Constats identifiés

| Zone | Constat | Priorité | État |
|---|---|---:|---|
| Duo local | Le menu lançait directement une partie à deux joueurs et ne permettait pas de choisir 3 ou 4 participants. | Haute | Corrigé |
| Duo local | La réinitialisation recréait les joueurs actifs avec zéro mur pour p2/p3/p4. | Haute | Corrigé |
| En ligne | La réinitialisation d’une salle complète pouvait également remettre les murs des joueurs rejoignants à zéro. | Haute | Corrigé |
| Statut de tour | Le statut affichait un adversaire singulier et ne décrivait pas correctement le passage de l’appareil en local multi-joueurs. | Moyenne | Corrigé |
| Fin de partie | L’overlay employait une notion de victoire/défaite personnelle qui n’est pas adaptée au mode local où les joueurs se relaient sur le même appareil. | Moyenne | Corrigé |
| Règles | La modale indiquait systématiquement 10 murs et ne documentait pas les objectifs latéraux des joueurs 3 et 4. | Moyenne | Corrigé |
| Validation | Une vérification TypeScript, un build de production, des tests de fumée locaux et en ligne, et des vérifications visuelles 3/4 joueurs ont été réalisés. | Haute | Terminé |

## Critères de validation

Une partie locale à 3 ou 4 joueurs doit afficher tous les pions actifs, faire tourner les tours dans l’ordre, permettre à chaque joueur de déplacer son pion et de poser ses murs, conserver les stocks après redémarrage et terminer sur le premier joueur qui atteint son objectif. Les salles en ligne doivent conserver la capacité, les places, les couleurs, les stocks de murs et l’état synchronisé après jonction et redémarrage.

## Vérifications complémentaires — 14 août 2026

- Le menu local affiche désormais « Partie locale — 2 à 4 joueurs · même appareil ».
- Le configurateur local propose 2, 3 et 4 joueurs et affiche 10 murs en duel, 5 murs à 3/4 joueurs.
- Vérification navigateur réussie en partie locale à 4 joueurs : quatre cartes/pions et cinq murs par joueur.
- Vérification navigateur réussie en partie locale à 3 joueurs : trois cartes/pions et cinq murs par joueur.
- Trois déplacements locaux successifs ont été exécutés visuellement : p1 → p2 → p3 → p1, avec historique des actions et changement du statut du tour.
- Le calcul du chemin optimal a été généralisé à tous les joueurs, notamment aux objectifs est/ouest de p3 et p4.
- Les écritures de coups, murs, chat et redémarrage des salles Firebase passent désormais par des transactions pour éviter les écrasements lors d’actions concurrentes.
- Le callback d’erreur de synchronisation de GameCore est mémorisé pour éviter de recréer l’abonnement Firebase à chaque rendu.
- `pnpm run typecheck`, `pnpm run build`, `pnpm exec tsx scripts/smoke-multiplayer.ts` et `pnpm exec tsx scripts/smoke-local.ts` passent. Le build conserve uniquement un avertissement de sourcemap et un avertissement de taille de bundle non bloquants.
