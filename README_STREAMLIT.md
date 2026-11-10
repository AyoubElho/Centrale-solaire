# Démonstration Streamlit · SolarDrâa

L'application `app.py` présente les quatre jalons du cas UC4. Chaque page indique l'objectif, la méthode, le résultat du test final et la principale limite. Les figures et les scores de synthèse viennent des notebooks exécutés.

## Lancement

Depuis le dossier `jalons` :

```bash
.venv/bin/python -m streamlit run app.py
```

Si l'environnement virtuel n'est pas disponible, installez d'abord les dépendances de `requirements.txt` dans un environnement Python compatible.

Le menu latéral ouvre la vue d'ensemble ou un jalon :

1. **Jalon 1** : MLP, 47 variables et prévision de production sur le site A ; exemple de test avec le modèle sauvegardé.
2. **Jalon 2** : CNN ciel, prévision d'occultation et auto-encodeur thermique ; figures du notebook et exemples d'images de test.
3. **Jalon 3** : transfert du site A vers le site B, comparaison des stratégies et adaptation de la caméra. Un test interactif applique le MLP exporté du site A aux données de test du site B, avec comparaison à la production réelle et à la persistance intelligente.
4. **Jalon 4** : comparaison des modèles séquentiels, bilan des cibles et exemple de prévision avec le GRU sauvegardé.

Les exemples interactifs sont des prédictions individuelles. Ils ne remplacent pas les métriques globales de test affichées au-dessus. La page Jalon 2 recalcule le seuil thermique au 95e percentile des images saines de validation pour le modèle sauvegardé.

Le MLP zero-shot du Jalon 3 est enregistré dans `models/modele_zero_shot_jalon3.keras`. Pour le recréer selon le protocole du notebook, exécutez `.venv/bin/python -m scripts.export_jalon3_model` depuis la racine du dépôt. La réexécution exportée obtient 40,6 % de gain moyen sur le test B ; les 40,3 % du tableau correspondent à l'exécution du notebook.

Dans l'état actuel du dépôt, ce seuil du modèle exporté diffère du seuil `0,2442` retenu par le notebook final. L'application signale l'écart sur la page Jalon 2 afin de ne pas attribuer les métriques du notebook à ce fichier modèle.

Sources principales : `notebooks/jalon1_prevoir_production_mlp.ipynb`, `notebooks/uc4_jalon2.ipynb`, `notebooks/uc4_jalon3.ipynb` et `notebooks/uc4_jalon4.ipynb`.
