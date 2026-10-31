# Centrale Solaire SolarDrâa (50 MW) — Plateforme IA & Jalons

Ce dossier regroupe l'ensemble des études, notebooks, modèles, données expérimentales et pipelines développés pour l'Étude de cas 4 (Master 2 SDIA — Intelligence Artificielle Avancée, 2026–2027).

---

## 📁 Organisation du Dossier `jalons/`

Le dossier est structuré en sous-dossiers dédiés :

```text
jalons/
├── README.md                   # Guide d'organisation et d'exécution
├── data -> ../data_UC4         # Lien symbolique vers les données météo et images
├── utils/                      # Fonctions utilitaires et inférence
│   ├── __init__.py
│   └── data_loader.py          # Fonctions de chargement et d'inférence directe
├── models/                     # Modèles Keras entraînés et statistiques
│   ├── autoencodeur_thermographie.keras   # Détection d'anomalies thermiques
│   ├── cnn_ciel.keras                     # Prédiction de couverture et d'occultation
│   ├── modele_recurrent_solaire_jalon4.keras # Modèle récurrent GRU déployé (106 Ko)
│   └── thermographie_stats.npz            # Moyenne et écart-type de normalisation
├── notebooks/                  # Les 4 Notebooks Jupyter interactifs
│   ├── jalon1_prevoir_production_mlp.ipynb
│   ├── uc4_jalon2.ipynb
│   ├── uc4_jalon3.ipynb
│   └── uc4_jalon4.ipynb
├── docs/                       # Documentation, sujets et décisions
│   ├── decisions/              # Synthèses décisionnelles exécutives Markdown
│   │   ├── PAGE_DE_DECISIONS_JALON3.md
│   │   └── PAGE_DE_DECISIONS_JALON4.md
│   └── pdfs/                   # Sujets officiels d'étude de cas (PDF)
│       ├── Étude de cas 4 - Jalon 1 - Prévoir la production avec un MLP.pdf
│       ├── Étude de cas 4 - Jalon 2 - Voir le ciel et les panneaux.pdf
│       ├── Étude de cas 4 - Jalon 3 - Un nouveau site, deux tâches.pdf
│       └── Étude de cas 4 - Jalon 4 - La série comme une séquence.pdf
└── experiments/                # Journaux de suivi des benchmarks expérimentaux (CSV)
    ├── journal_experiences_jalon3.csv
    └── journal_experiences_jalon4.csv
```

---

## 🌟 Les 4 Jalons du Projet

| Jalon | Titre & Thématique | Modèles & Technologies | Performance Clé | Statut Contractuel |
| :--- | :--- | :--- | :---: | :---: |
| **Jalon 1** | Prévoir la production avec un MLP | Tabulaire 47 variables, Persistance Intelligente | Gain moyen 6h = **+40.0%** ($t+6 = +68.4\%$) | ✅ Conforme |
| **Jalon 2** | Voir le ciel et les panneaux | CNN Dual-Pooling (Ciel) + Auto-encodeur (CAE) | Occultation MAE = **0.0414** / AUC Anom = **0.9850** | ✅ **ATTEINTE** (Cible $\le 0.10$ & $\ge 0.98$) |
| **Jalon 3** | Un nouveau site, deux tâches | Transfert Zero-Shot Site B (20 MW) & Multi-Tâche ($\lambda$) | Gain Site B = **+42.0%** / MAE Occultation = **0.0748** | ✅ **ATTEINTE** (Cible $\ge 0.27$) |
| **Jalon 4** | La série comme une séquence | GRU Direct $L=48\text{ h}$, LSTM, SimpleRNN, Seq2Seq | Gain moyen Site A = **+49.0%** / Taille = **106 Ko** | ✅ **ATTEINTE (+63% de marge)** |

---

## Bonus facultatif — Démonstration interactive

Le fichier `app.py` fournit une application Streamlit locale. Elle charge les modèles Keras sauvegardés, applique les mêmes prétraitements que les notebooks et permet de sélectionner des exemples de test issus des jeux de données UC4.

Fonctionnalités :

- **Jalon 1** : prévision MLP à 6 h avec les 47 variables du notebook (dès que `modele_solaire_jalon1.keras` est exporté).
- **Jalon 2** : CNN de ciel (couverture/occultation) et auto-encodeur thermique (reconstruction, erreur, décision d'anomalie).
- **Jalon 3** : démonstration zero-shot sur le site B avec les entrées séquentielles ; le code signale explicitement si l'artefact Jalon 3 dédié n'a pas été sauvegardé.
- **Jalon 4** : GRU direct, comparaison avec la production réelle et la persistance intelligente sur les 6 horizons.

### Lancement local

Depuis le dossier `jalons/` :

```bash
./.venv/bin/python -m pip install -r requirements-demo.txt
./.venv/bin/streamlit run app.py
```

Puis ouvrir l'adresse affichée par Streamlit (habituellement `http://localhost:8501`).

Les modèles déjà présents sont dans `models/`. Le modèle Jalon 1 peut être régénéré de façon reproductible par :

```bash
./.venv/bin/python -m utils.export_jalon1_model
```

Pour rendre l'écran Jalon 3 strictement autonome, exporter son MLP de transfert depuis le notebook vers `models/modele_solaire_jalon3.keras`. L'application n'invente jamais de prédiction si un artefact est absent.
