# Recherche UI — Quoridor

## Décision

Pour améliorer Quoridor sans alourdir inutilement le bundle, l’intégration retient trois références complémentaires : **shadcn/ui** pour les primitives accessibles et personnalisables, **Magic UI** pour quelques micro-interactions sobres, et **Lucide** pour les icônes déjà cohérentes avec l’application. Les autres dépôts fournis resteront des références visuelles, mais ne seront pas ajoutés comme dépendances globales sans besoin concret.

| Référence | Usage retenu | Motif |
|---|---|---|
| shadcn/ui | Primitives locales de bouton, carte, badge, dialogue, onglets et infobulle si nécessaire | Les composants sont copiables et personnalisables, sans abstraction opaque. La documentation officielle indique une compatibilité Tailwind v4 et React 19. |
| Magic UI | Effets légers sur l’onboarding, le lobby et les états de partie | La bibliothèque propose des composants React/TypeScript/Tailwind animés, mais les effets seront limités pour préserver la lisibilité et les performances du jeu. |
| Lucide | Icônes d’actions, statut, salles et règles | Les icônes React sont des SVG inline optimisés, typés et tree-shakables ; le projet utilise déjà `lucide-react`. |
| daisyUI, Flowbite, Base UI, Radix UI, Primer, Carbon, USWDS, Ant Design | Références ponctuelles uniquement | Ajouter plusieurs systèmes complets créerait des tokens concurrents, des styles redondants et un bundle plus lourd. |

## Direction visuelle

Le thème bois sombre et laiton est conservé afin de ne pas casser l’identité de Quoridor. Les améliorations porteront surtout sur la hiérarchie des cartes, les états actifs/inactifs, les focus clavier, les contrastes, les micro-interactions et la lisibilité des salles à 3/4 joueurs.

## Sources

[1]: https://ui.shadcn.com/docs/tailwind-v4 "shadcn/ui — Tailwind v4"
[2]: https://magicui.design/ "Magic UI"
[3]: https://lucide.dev/guide/react/ "Lucide for React"
[4]: https://github.com/shadcn-ui/ui "shadcn/ui — GitHub"
[5]: https://github.com/magicuidesign/magicui "Magic UI — GitHub"
[6]: https://github.com/lucide-icons/lucide "Lucide — GitHub"

Les affirmations de compatibilité et de fonctionnement ci-dessus sont fondées sur les pages officielles [1] [2] [3].
