# Drâa Solaire — Script de présentation (français)

**Projet Master SDIA · Étude de cas 04**  
*Centrale solaire Drâa Solaire · 22 diapositives*  
*Texte oral en points, avec explications des graphiques et noms des fichiers.*

Les chemins des figures ci-dessous sont relatifs au dossier `solardraa-presentation/figures/`. Les graphiques interactifs sont construits par la présentation React avec les valeurs de `src/data.ts` ; ils n’ont pas de fichier PNG séparé, sauf indication contraire.

## Sommaire

- **01. Problème** (slides 1 à 3)
- **02. Méthodologie** (slides 4 à 5)
- **03. Matériel et méthodes** (slides 6 à 9)
- **04. Expérimentations** (slides 10 à 17)
- **05. Comparaison et constats** (slides 18 à 20)
- **06. Conclusion** (slides 21 à 22)

## 01 / Problème

### slide 1 — La centrale, les données, la décision

- Bonjour à toutes et à tous. Nous allons vous présenter notre étude de cas sur la centrale solaire fictive Drâa Solaire.
- Notre projet porte sur trois besoins : prévoir la production électrique, analyser des images du ciel et des panneaux, puis transférer les modèles vers une deuxième centrale.
- L’objectif est de transformer les données en informations utiles à la décision et de vérifier les performances sur des données jamais utilisées pendant l’entraînement.
- **Visuel :** l’illustration de couverture représente une centrale solaire et rappelle la capacité du site A, soit 50 MW. C’est une illustration intégrée à la diapositive, pas un graphique de résultats.

### slide 2 — Pourquoi anticiper la production solaire ?

- La météo fait varier rapidement la production : un nuage peut réduire le rayonnement reçu par les panneaux.
- L’état des équipements compte aussi. Un point chaud ou une fissure peut diminuer les performances d’un panneau.
- Enfin, nous voulons réutiliser les connaissances acquises sur le site A pour le site B, qui dispose de peu d’historique et d’un climat différent.
- Notre question est donc : comment prévoir les prochaines heures, détecter les anomalies visuelles et adapter les modèles à un nouveau site de façon fiable ?
- **Visuel :** les trois cartes illustrent les enjeux météo, matériels et de transfert. Ce sont des schémas explicatifs, pas des résultats expérimentaux.

### slide 3 — Des données vers une décision opérationnelle

- Le système reçoit des séries horaires, des prévisions météo, des images du ciel de 32 × 32 pixels et des thermographies de 24 × 40 pixels.
- Il produit une prévision de puissance pour les six prochaines heures, une estimation de la couverture nuageuse et de l’occultation du soleil, ainsi qu’un score d’anomalie pour les panneaux.
- Les cibles de gain moyen sont de 30 % sur le site A et de 27 % sur le site B. Le modèle doit également rester assez léger pour être déployé.
- **Visuel :** le bloc « Entrées » décrit les données fournies aux modèles ; le bloc « Sorties » présente leurs prédictions. Les indicateurs du bas rappellent les horizons et les contraintes. Aucun graphique de résultats n’est présenté ici.

## 02 / Méthodologie

### slide 4 — Quatre jalons, une démarche

- Le premier jalon construit une référence de prévision avec un MLP.
- Le deuxième ajoute la vision : un CNN pour analyser le ciel et un auto-encodeur pour repérer les anomalies thermiques.
- Le troisième compare des stratégies de transfert vers le site B.
- Le quatrième étudie des réseaux récurrents qui traitent explicitement l’ordre des données dans le temps.
- **Visuel :** les quatre cartes constituent la feuille de route du projet. Elles ne présentent pas de mesures expérimentales.

### slide 5 — Du signal brut à la décision

- Le pipeline va de l’acquisition des données à la décision : préparation, modélisation, évaluation, puis choix du modèle.
- Nous séparons les partitions d’entraînement, de validation et de test pour évaluer la généralisation.
- Le gain vaut un moins l’erreur du modèle divisée par celle de la persistance intelligente. Un gain positif signifie que le modèle réduit l’erreur par rapport à cette référence.
- **Visuel :** le schéma en cinq étapes montre l’ordre du travail. La formule en bas définit le gain ; ce n’est pas un graphique.

## 03 / Matériel et méthodes

### slide 6 — MLP : une référence tabulaire explicable

- Pour le premier jalon, le MLP utilise 47 variables : l’historique de production, les prévisions météo, des variables temporelles et l’information sur le nettoyage.
- Deux couches cachées de 64 puis 32 neurones alimentent six sorties, une par horizon futur. Le réseau compte 5 350 paramètres.
- Cette référence permet de mesurer ensuite l’apport des images et des modèles séquentiels.
- **Visuel :** le schéma du réseau suit l’information des 47 entrées jusqu’aux six prédictions. Le diagramme segmenté détaille les groupes de variables ; il ne montre pas une performance.

### slide 7 — Deux modèles de vision complémentaires

- Le CNN analyse les images du ciel et estime la couverture nuageuse ainsi que l’occultation du soleil.
- L’auto-encodeur thermique apprend à reconstruire des images de panneaux sains. Une reconstruction moins fidèle peut signaler une anomalie.
- Le seuil d’alerte est fixé avec les images saines de validation pour viser 5 % de fausses alertes sur cette partition. Le test est réservé à l’évaluation finale.
- **Visuels et fichiers :**
  - `figures/jalon2_ciel_input_thumbnail.png` : vignette réelle de la caméra du ciel.
  - `figures/jalon2_thermique_input_thumbnail.png` : vignette de thermographie.
  - `figures/jalon2_ciel_32x32_sample.png` et `figures/jalon2_thermique_24x40_sample.png` : images d’exemple disponibles dans les figures du projet.
  - Les schémas du CNN et de l’auto-encodeur montrent les couches et la circulation de l’information, pas leurs résultats.

### slide 8 — Transfert de domaine et apprentissage multitâche

- Le site B ne dispose que de deux mois de données pour l’entraînement local. Nous comparons cinq stratégies : zero-shot, apprentissage depuis zéro, fine-tuning complet et deux niveaux de gel des couches.
- Le zero-shot réutilise directement le modèle du site A. Le fine-tuning ajuste ses poids ; le gel protège une partie des couches contre les modifications.
- Le CNN multitâche partage un tronc commun et prédit à la fois la couverture nuageuse et l’occultation. Le paramètre lambda règle l’importance de la tâche d’occultation dans la fonction de perte.
- **Visuel :** le diagramme A → B explique le transfert. Le schéma multitâche part de `figures/jalon2_ciel_input_thumbnail.png`, puis montre un tronc partagé et deux sorties. Ce sont des schémas conceptuels.

### slide 9 — La production comme une séquence

- Le MLP traite un vecteur de variables ; un réseau récurrent tient compte de leur ordre dans le temps.
- Nous comparons SimpleRNN, LSTM, GRU direct et encodeur-décodeur.
- Le GRU retenu reçoit 48 heures d’historique et prédit directement les six horizons.
- **Visuel :** le schéma du GRU illustre l’entrée séquentielle, la couche récurrente et les six sorties. Les cartes décrivent les tenseurs, l’entraînement et les modèles comparés ; elles ne sont pas des graphiques de résultats.

## 04 / Expérimentations

### slide 10 — Le MLP franchit la cible moyenne

- Le premier graphique montre l’évolution de la perte pendant l’entraînement. Les pertes d’entraînement et de validation baissent puis se stabilisent, ce qui indique que le modèle apprend.
- Les deux figures suivantes détaillent l’erreur à t+1 : la première selon l’heure de la journée en validation, la seconde selon les mois sur le test 2025.
- Le gain moyen atteint 48,2 % en validation et 50,9 % sur le test. Le gain t+1 sur le test est de 10,2 %, donc sous la cible de 12 %.
- **Graphiques et fichiers :**
  - « Convergence du MLP de référence » : graphique React fondé sur `j1Learning` dans `src/data.ts`. Axe horizontal : époques ; axe vertical : perte. Pas de PNG séparé.
  - `figures/jalon1_prevoir_production_mlp_cell11_img0.png` : erreur de prévision t+1 selon l’heure, sur la validation du site A.
  - `figures/jalon1_prevoir_production_mlp_cell16_img1.png` : erreur t+1 par mois sur le test 2025.

### slide 11 — Quelles variables expliquent la prévision ?

- L’ablation retire un groupe de variables à la fois et mesure le gain moyen en validation.
- Les barres montrent que retirer la nébulosité fait passer le gain de 48,2 % à 32,5 %, la baisse la plus importante. Sans l’historique, le gain tombe à 38,9 %.
- Cela indique que les informations sur les nuages et l’historique de production sont particulièrement utiles au modèle. Ce résultat montre une association avec la performance, pas une preuve de causalité.
- **Graphiques et fichiers :**
  - « Ablation des 47 variables » : graphique React fondé sur `ablations` dans `src/data.ts`. La longueur de chaque barre représente le gain moyen en pourcentage.
  - `figures/jalon1_ablation_study.png` : visualisation dérivée du tableau d’ablation.
  - `figures/jalon1_gains_horizons.png` : visualisation des gains selon l’horizon.
  - Les deux PNG sont dérivés des résultats exécutés ; le notebook affiche un tableau texte pour l’ablation.

### slide 12 — Le CNN rend le ciel utile au prévisionniste

- À gauche, la courbe montre l’apprentissage du CNN sur 15 époques. Au centre, le graphique compare les gains du MLP seul et du MLP enrichi par les estimations visuelles.
- À t+1, le gain de validation passe de 10,63 % à 14,84 %, soit une hausse de 4,21 points. Le modèle retenu atteint 16,80 % sur le test final.
- La comparaison CNN / règles est nuancée : la règle estime mieux la couverture nuageuse, mais le CNN est meilleur pour l’occultation solaire.
- La paire de deux images prédit l’occultation à t+1 avec une MAE de 0,0675. Les exemples caméra montrent les valeurs vraies et les prédictions continues ; une valeur proche de 0 ou de 1 signifie simplement une estimation près d’une extrémité de l’échelle.
- **Graphiques et fichiers :**
  - « Apprentissage du CNN ciel » : graphique React fondé sur `j2SkyLearning` dans `src/data.ts`. Axe horizontal : époques ; axe vertical : MSE d’entraînement et de validation.
  - « Impact sur chaque horizon » : graphique React fondé sur `j2Forecast`. Il compare le gain du MLP seul et du MLP avec vision en validation, puis le résultat du modèle retenu sur le test.
  - `figures/jalon2_cnn_vs_regles_notebook.png` : comparaison CNN / règles simples. Pour une MAE, plus la valeur est basse, meilleure est l’estimation ; la règle gagne sur la couverture, le CNN sur l’occultation.
  - `figures/jalon2_camera_examples_notebook.png` : images réelles du ciel, valeurs vraies et prédictions du CNN.

### slide 13 — Auto-encodeur : les quatre cibles sont atteintes

- L’auto-encodeur retenu a un goulot de 32 dimensions et utilise l’erreur maximale de reconstruction comme score.
- Un défaut localisé peut toucher peu de pixels ; l’erreur maximale aide à ne pas diluer ce signal dans une moyenne sur toute l’image.
- Le seuil 0,2442 correspond au 95e percentile des scores des images saines de validation. Sur le test final, l’AUC est de 0,9859, 88 % des fissures sont détectées et le taux de fausses alertes est de 4,92 %.
- Les hotspots, diodes et sous-modules atteignent 100 % de détection dans cette expérience.
- **Graphique et fichier :** `figures/jalon2_detection_thermique_notebook.png` montre la détection par type de défaut. L’AUC mesure la séparation entre cas sains et défectueux à travers plusieurs seuils ; une valeur proche de 1 indique une bonne séparation sur les données évaluées.
- La table de la diapositive compare les tailles de goulot et les scores proxy employés pour la sélection sans utiliser le test.

### slide 14 — Sur le site B, le zero-shot généralise mieux au test

- Le graphique de gauche compare le gain par horizon en validation B pour les stratégies de transfert. La figure de droite compare les profils climatiques des sites et illustre le décalage entre A et B.
- En validation de mars, le fine-tuning complet atteint 43,4 % de gain. Sur le test d’avril à juin, le zero-shot atteint 40,3 %, contre 38,4 % pour le fine-tuning et 25,6 % pour l’apprentissage depuis zéro.
- Ce résultat rappelle qu’une bonne performance en validation ne garantit pas la meilleure généralisation à une période ultérieure.
- **Graphiques et fichiers :**
  - `figures/jalon3_cell4_img2.png` : gain par horizon sur la validation B pour les cinq stratégies. Comparer les stratégies au même horizon.
  - `figures/jalon3_cell6_img2.png` : profils journaliers des sites A et B, qui illustrent le décalage climatique.
  - Le tableau sur le test affiche les trois stratégies évaluées dans ce comparatif final : zero-shot, scratch et fine-tuning complet.

### slide 15 — Deux tâches, une représentation partagée

- Le graphique montre le compromis entre l’erreur de couverture et celle d’occultation quand lambda change. À lambda = 0, le modèle apprend peu l’occultation ; à lambda = 0,3, l’occultation s’améliore avec une erreur de couverture encore modérée.
- À lambda = 1, l’erreur d’occultation baisse davantage, tandis que celle de couverture augmente. Le choix dépend donc de l’équilibre recherché entre les deux tâches.
- Après fine-tuning sur la caméra B, la MAE d’occultation remonte à 0,1534 sur le test, au-dessus de la cible de 0,10. Le changement de caméra et de conditions optiques limite le transfert visuel.
- **Graphiques et fichiers :**
  - « Compromis multitâche » : graphique React fondé sur `j3Multi` dans `src/data.ts`. Axe horizontal : lambda ; axe vertical : MAE. Plus la valeur est basse, meilleure est l’estimation.
  - `figures/jalon3_cell10_img2.png` : valeurs vraies et prédictions sur des images de la caméra B après fine-tuning.

### slide 16 — RNN, LSTM ou GRU à budget comparable ?

- Le graphique compare le gain moyen en validation des architectures récurrentes avec le MLP de référence. Les tableaux ajoutent le nombre de paramètres et le temps d’entraînement.
- Le GRU direct avec 24 heures atteint 46,4 % de gain en validation. Celui avec 48 heures atteint 44,9 % et est retenu comme compromis avec un historique plus long.
- Les figures à droite complètent la comparaison avec les sorties du notebook. Il faut lire chaque résultat avec sa partition et le budget de paramètres correspondant.
- **Graphiques et fichiers :**
  - « Gain moyen selon l’architecture » : graphique React fondé sur `j4Models` dans `src/data.ts`. Chaque barre représente le gain moyen en validation.
  - `figures/jalon4_cell6_img1.png` : comparaison SimpleRNN, LSTM et GRU à budget comparable.
  - `figures/jalon4_cell4_img1.png` : convergence et gains du MLP et du GRU.

### slide 17 — 48 heures : un choix de robustesse et de coût

- Le graphique principal compare des historiques de 6, 24, 48 et 168 heures. Six heures donnent le meilleur gain de validation et le temps d’entraînement le plus court dans cette expérience.
- La fenêtre de 168 heures n’améliore pas le gain observé et demande davantage de calcul. La fenêtre de 48 heures est retenue comme compromis de conception, sans prétendre qu’elle est optimale pour tous les usages.
- Sur le test, le GRU atteint 49,0 % de gain moyen sur A et 40,0 % en zero-shot sur B. Son gain à t+1 sur A est de 9,5 %, sous la cible de 12 %.
- **Graphiques et fichiers :**
  - `figures/jalon4_cell8_img1.png` : gain et coût selon la longueur d’historique. Comparer simultanément performance et durée ; une séquence plus longue n’est pas nécessairement meilleure.
  - `figures/jalon4_cell10_img1.png` : comparaison du modèle direct et de l’encodeur-décodeur.
  - `figures/jalon4_cell14_img1.png` : résultats finaux sur les tests cachés des sites A et B.

## 05 / Comparaison et constats

### slide 18 — Ce que démontre chaque jalon

- Cette synthèse rassemble quatre résultats, mais les métriques ne mesurent pas la même tâche : gain de prévision, AUC de détection ou performance de transfert. Elles ne doivent donc pas être comparées directement.
- Le tableau précise, pour chaque jalon, la méthode, la partition et la limite principale.
- Les objectifs de gain moyen sont dépassés sur les tests présentés. Les limites restent le gain t+1 du GRU, sous la cible, et la meilleure précision de la règle simple pour la couverture nuageuse.
- **Visuel :** les quatre valeurs du haut résument les jalons ; le tableau donne le contexte nécessaire à leur interprétation. Aucun graphique séparé n’est utilisé.

### slide 19 — La performance seule ne suffit pas

- La décision opérationnelle tient compte des objectifs, de la taille du modèle et de sa capacité à fonctionner sur un nouveau site.
- Le GRU retenu atteint 49,0 % de gain moyen sur six heures sur le test A et pèse environ 0,106 Mo. Son gain à t+1 est de 9,5 %, sous la cible de 12 %.
- Pour le site B, le zero-shot peut fonctionner sans ajuster un modèle à un historique très court. Il faudra toutefois continuer à suivre ses performances avec de nouvelles données.
- **Visuel :** les trois indicateurs comparent résultats et cibles ; les deux cartes du bas expliquent les choix du GRU direct et du zero-shot. Ce ne sont pas des graphiques statistiques.

### slide 20 — Lire les résultats sans surinterpréter

- Nous distinguons validation et test. Les réglages se font avec la validation ; le test mesure ensuite la généralisation finale.
- Une méthode peut être meilleure pour une tâche et moins bonne pour une autre : les règles simples gagnent pour la couverture, tandis que le CNN gagne pour l’occultation.
- L’adaptation visuelle au site B reste à améliorer, et le GRU n’atteint pas encore la cible à t+1. Présenter ces limites fait partie de l’interprétation scientifique.
- **Visuel :** les deux colonnes présentent les résultats établis et les points de vigilance. Pas de graphique distinct sur cette diapositive.

## 06 / Conclusion

### slide 21 — Un système, quatre contributions

- Le projet apporte quatre contributions : une référence de prévision avec le MLP, une analyse visuelle du ciel et des panneaux, une étude du transfert entre sites et une comparaison des modèles séquentiels.
- Les expériences montrent qu’une prévision moyenne robuste sur six heures est possible.
- Deux défis restent ouverts : l’horizon immédiat et la généralisation de la vision entre les caméras.
- **Visuel :** les quatre cartes résument les contributions du projet sans ajouter de nouvelle mesure.

### slide 22 — Vers une supervision solaire plus fiable

- Les prochaines étapes sont de fusionner le CNN et le GRU pour améliorer la prévision à t+1 et d’évaluer le site B sur davantage de saisons.
- Il faudra aussi répéter les expériences avec plusieurs graines et recalibrer le modèle de vision pour la caméra B.
- Le dépôt indiqué sur la diapositive donne accès au code, aux notebooks et aux journaux d’expériences. L’application en ligne permet de démontrer les quatre jalons.
- Merci pour votre attention. Nous sommes prêts à répondre à vos questions.
- **Visuel :** la colonne de gauche présente les perspectives ; celle de droite contient les liens vers la démonstration et les ressources du projet. Aucun graphique de résultats n’est montré.

## Repères rapides pour expliquer les graphiques

- **Loss / MSE :** mesure l’écart entre prédictions et valeurs attendues. Plus bas est généralement meilleur. Comparer entraînement et validation pour repérer un éventuel surapprentissage.
- **MAE :** moyenne des écarts absolus. Plus bas est meilleur. Sur une échelle normalisée de 0 à 1, une MAE de 0,04 représente environ quatre centièmes d’erreur moyenne.
- **Gain :** réduction de RMSE par rapport à la persistance intelligente. Plus haut est meilleur ; préciser toujours l’horizon et la partition, validation ou test.
- **AUC :** mesure la séparation entre exemples sains et défectueux à travers différents seuils. Une valeur proche de 1 indique une bonne séparation sur les données évaluées, sans garantir à elle seule les performances futures.
- **Courbe par époque :** l’axe horizontal indique les époques ; l’axe vertical indique la perte. Si la perte de validation remonte alors que celle d’entraînement baisse, cela peut signaler du surapprentissage.
- **Erreurs par horizon :** chaque point ou barre correspond à un délai de t+1 à t+6. Le résultat à t+1 n’est pas la moyenne des six horizons.
- **Ablation :** chaque barre correspond au retrait d’un groupe de variables. Une baisse du gain indique que le groupe est utile au modèle, sans prouver à elle seule une causalité.
- **Compromis multitâche :** lambda règle le poids relatif des tâches. Les erreurs peuvent évoluer en sens opposé ; pour la MAE, plus bas est meilleur.
- **Historique et durée :** lire ensemble performance et temps de calcul. Ajouter davantage d’heures augmente le coût et ne garantit pas un meilleur résultat.

## Fichiers des figures

- **Slides 7–8 :** `jalon2_ciel_input_thumbnail.png`, `jalon2_thermique_input_thumbnail.png`, `jalon2_ciel_32x32_sample.png`, `jalon2_thermique_24x40_sample.png`.
- **Slide 10 :** `jalon1_prevoir_production_mlp_cell11_img0.png`, `jalon1_prevoir_production_mlp_cell16_img1.png`.
- **Slide 11 :** `jalon1_ablation_study.png`, `jalon1_gains_horizons.png`.
- **Slide 12 :** `jalon2_cnn_vs_regles_notebook.png`, `jalon2_camera_examples_notebook.png`.
- **Slide 13 :** `jalon2_detection_thermique_notebook.png`.
- **Slide 14 :** `jalon3_cell4_img2.png`, `jalon3_cell6_img2.png`.
- **Slide 15 :** `jalon3_cell10_img2.png`.
- **Slide 16 :** `jalon4_cell6_img1.png`, `jalon4_cell4_img1.png`.
- **Slide 17 :** `jalon4_cell8_img1.png`, `jalon4_cell10_img1.png`, `jalon4_cell14_img1.png`.
