# Drâa Solaire | Présentation académique interactive

Site de présentation du projet Master SDIA, étude de cas 4, centrale solaire Drâa Solaire (50 MW). React + TypeScript + Tailwind CSS + Framer Motion + Recharts + Lucide React.

## Installation

```bash
npm install
npm run dev
```

Ouvrir l'URL indiquée par Vite. `npm run build` génère `dist/`, déployable comme site statique sur Vercel, Netlify ou GitHub Pages. `base: './'` facilite l'hébergement sous un sous-chemin.

## Présentation

22 écrans répartis **exactement en six parties** : Problème, Méthodologie, Matériel et méthodes, Expérimentations, Comparaison et constats, Conclusion. Navigation au clavier (flèches, espace, Home, End), barre de progression, sommaire interactif, plein écran, vue mobile.

## Sources / transparence scientifique

Source originale : https://github.com/AyoubElho/Centrale-solaire

- J1 : `notebooks/jalon1_prevoir_production_mlp.ipynb`, sorties exécutées ; pertes par époque et performances.
- J2 : `notebooks/uc4_jalon2.ipynb`, sorties exécutées ; CNN, MLP augmenté, auto-encodeur et scores d'anomalie.
- J3 : `notebooks/uc4_jalon3.ipynb` + `experiments/journal_experiences_jalon3.csv` ; validation et test distingués.
- J4 : `notebooks/uc4_jalon4.ipynb` + `experiments/journal_experiences_jalon4.csv` ; validation et test distingués.

**Attention aux divergences de source :** la page `docs/decisions/PAGE_DE_DECISIONS_JALON3.md` annonce un gain zero-shot test 0,420 et une MAE occultation test 0,0748, tandis que la cellule exécutée finale du notebook J3 retourne respectivement **0,403** et **0,1534**. Le site affiche les chiffres de la cellule exécutée et signale ce désaccord, à vérifier par l'équipe avant la soutenance. De même, le MLP J1 mesuré dans J1 (48,2 % en validation) diffère du MLP réentraîné comme référence J4 (40,0 % en validation) : il ne s'agit pas de la même exécution.

Les courbes d'entraînement sont retranscrites des logs imprimés des notebooks lorsque disponibles. Les figures portant le badge vert **« Sortie exacte du notebook »** sont les PNG intégrés dans les cellules exécutées, sans redessin ni modification. Les autres graphiques sont explicitement présentés comme des visualisations de tableaux ou de journaux exécutés.

Les images sont servies directement depuis `../docs/figures/` par Vite (`publicDir: '../docs'`). Le build copie donc les mêmes fichiers dans `dist/figures/` et reste entièrement utilisable hors ligne.

**Limites :** ce site présente les résultats pré-calculés de l'étude. Il n'exécute ni les modèles `.keras`, ni des prédictions en temps réel côté navigateur. Pour une démonstration d'inférence, utiliser l'application Streamlit du dépôt original. Les spécifications GPU/CPU exactes ne sont pas documentées dans les sorties consultées, donc elles ne sont pas inventées.
