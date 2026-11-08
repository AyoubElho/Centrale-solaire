
# Jalon 2 — Page de décisions

## Protocole

- Seed : 42; sélection sur validation uniquement.
- Le test réel est ouvert une fois dans la cellule finale après gel des choix.
- Le proxy synthétique thermique sert uniquement à sélectionner le goulot et le score, jamais à annoncer la performance finale.

## Choix retenus

| Tâche | Choix | Validation | Test final |
|---|---|---:|---:|
| État du ciel | CNN Dual Pooling | MAE couverture 0.0333; occultation 0.0527 | MAE couverture 0.0252; occultation 0.0388 |
| Prévision | MLP enrichi 51 variables | gain t+1 14.84%; t+6 68.14% | gain t+1 16.80%; t+6 72.47% |
| Occultation t+1 | CNN paire | MAE 0.0870 | MAE 0.0675 |
| Thermographie | AE goulot 32, score max | AUC proxy 1.0000 | AUC 0.9859 |
| Référence thermographie | Maximum − médiane | AUC proxy 1.0000 | AUC 0.9739 |

## Écarts aux cibles du sujet

| Cible PDF | Résultat test final | Verdict |
|---|---:|---|
| Gain Site A à t+1 ≥ 12 % | 16.80 % | atteinte |
| MAE occultation t+1 ≤ 0,10 | 0.0675 | atteinte |
| AUC thermique ≥ 0,98 | 0.9859 | atteinte |
| Détection fissures à 5 % FA ≥ 85 % | 88.00 % | atteinte |

## Justifications

1. Un auto-encodeur sans goulot étroit peut apprendre l'identité et reconstruire aussi les défauts ; son erreur d'anomalie devient peu discriminante.
2. L'erreur maximale est adaptée aux défauts localisés, car une moyenne dilue quelques pixels anormaux parmi 960 pixels.
3. Le seuil est le 95e percentile de la validation saine : il fixe environ 5 % de fausses alertes sans fuite du test.
4. Le CNN Dual Pooling combine une information globale pour la couverture et une information localisée pour l'occultation.
5. Les références imposées par le sujet sont conservées telles quelles : seuil de pixels pour la couverture, luminosité au point du soleil pour l'occultation et maximum − médiane pour la thermographie.

## Vérifications théoriques

- CNN ciel : 27 490 paramètres; champ réceptif 18×18 avant pooling global 32×32.
- Thermographie : 24×40×1 → 12×20×16 → 6×10×32; goulot 32 = compression 60× depuis le tenseur convolutif et 30× depuis l'image.

## Limites

- Les anomalies synthétiques ne remplacent pas les défauts réels; elles évitent seulement d'utiliser le test pour régler le modèle.
- Les résultats finaux doivent être confirmés sur d'autres saisons et plusieurs répétitions de seed.
