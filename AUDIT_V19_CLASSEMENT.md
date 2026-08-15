# Audit v19 — Suppression des puzzles et classement multijoueur

## Corrections réalisées

Le mode **Puzzles** a été supprimé de l’expérience utilisateur et du code actif : entrée de menu, route d’écran, état de navigation, mode moteur, composants, données et script dédié. Une recherche globale ne retrouve plus de référence active à `puzzle`, `Puzzle` ou `Puzzles`.

Les boutons de configuration **Bords** et **Centre** des parties locales et en ligne utilisent désormais une disposition verticale, un retour à la ligne explicite et une largeur minimale nulle. Cette correction supprime le chevauchement visible sur mobile lorsque quatre joueurs sont sélectionnés.

La hauteur de l’écran de jeu utilise `100dvh`, le conteneur de partie bloque les débordements horizontaux, et le socle global utilise `overscroll-behavior` et `scrollbar-gutter` pour réduire les sauts, rebonds et changements de largeur sur mobile.

En partie à 3 joueurs, la partie reste active après la première arrivée et se termine après **2 joueurs classés**. En partie à 4 joueurs, elle reste active après les deux premières arrivées et se termine après **3 joueurs classés**. Les joueurs déjà arrivés sont retirés de la rotation et ne peuvent plus jouer ni poser de mur.

Chaque nouvelle arrivée déclenche `playArrival(rank)` une seule fois par client connecté, grâce à une comparaison différentielle du classement précédent et du classement synchronisé. Le son est donc produit pour chaque rang, et pas uniquement pour le dernier état final.

L’overlay final affiche le **classement complet** : rang et couleur pour les joueurs arrivés, puis les participants non classés avec le statut correspondant. Le format Centre et le format Bords restent indiqués dans le contexte de partie.

## Vérifications

```text
pnpm run typecheck                          OK
pnpm exec tsx scripts/smoke-local.ts       OK — local 3/4 joueurs, Centre, seuils 2/3
pnpm exec tsx scripts/smoke-multiplayer.ts OK — tours, classement et seuils 3/4
pnpm exec tsx scripts/smoke-ai.ts          OK — IA classic/blitz/survival
pnpm run build                              OK
pnpm exec grep puzzle                        OK — aucune référence active
 git diff --check                           OK
```

## Vérification visuelle

Le preview local a confirmé que le menu ne contient plus de bouton Puzzles. Après sélection de quatre joueurs, le panneau Format de la cible affiche **Bords** et **Centre** dans deux boutons verticaux, sans chevauchement de texte. Le parcours local et la configuration du format restent accessibles.

## Limite de validation

Le son Web Audio peut rester silencieux jusqu’au premier geste utilisateur, conformément aux restrictions des navigateurs mobiles. Une fois le plateau touché ou un bouton utilisé, les arrivées synchronisées déclenchent leur jingle respectif.
