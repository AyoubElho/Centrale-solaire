# Drâa Solaire — Script de Présentation (Français Facile)

**Projet Master SDIA · Étude de cas 04**  
*Centrale solaire Drâa Solaire (Site A : 50 MW · Site B : 20 MW)*
*Texte oral simple et direct pour les 22 diapositives de la présentation.*

---

## Sommaire
- **01. Problème** (Slides 1 à 3)
- **02. Méthodologie** (Slides 4 à 5)
- **03. Matériel et méthodes** (Slides 6 à 9)
- **04. Expérimentations** (Slides 10 à 17)
- **05. Comparaison et constats** (Slides 18 à 20)
- **06. Conclusion** (Slides 21 à 22)

---

## 01 / Problème

### slide 1
Bonjour à tous. Nous vous présentons aujourd'hui notre projet Drâa Solaire : « Prévoir l'énergie, comprendre le ciel ».

Notre but est simple : utiliser l'intelligence artificielle pour mieux prévoir la production d'électricité solaire, surveiller l'état des panneaux avec des caméras, et adapter facilement nos modèles à une nouvelle centrale solaire.

Sur l'illustration, le soleil représente la source d'énergie et les panneaux représentent la centrale. Les deux idées mises en avant sont la **prévision** de la production et l'**inspection** des panneaux.

---

### slide 2
Notre projet répond à trois problèmes principaux :

1. **La météo qui change** : le soleil, les nuages et la température varient tout le temps, ce qui fait changer la production d'électricité.
2. **Les pannes sur les panneaux** : nous devons repérer vite les défauts, comme les points chauds ou les fissures, pour éviter les pertes d'énergie.
3. **Le passage d'un site à un autre** : nous voulons adapter le modèle du site A (50 MW) vers le site B (20 MW), même si le site B a très peu de données (seulement deux mois).
4. **Notre question de recherche** : comment prévoir la production sur 6 heures, détecter les pannes et faire fonctionner nos modèles sur un nouveau site sans perdre en précision ?

---

### slide 3
Dans ce slide, nous présentons ce qui entre et ce qui sort de notre système :

1. **Ce qui entre (données d'entrée)** :
   - Les prévisions météo.
   - L'historique de la production passée.
   - Les photos du ciel pour voir les nuages (images 32 × 32).
   - Les images thermiques des panneaux pour voir les pannes (images 24 × 40).
2. **Ce qui sort (résultats)** :
   - La prévision de production heure par heure pour les 6 prochaines heures.
   - L'état du ciel : présence de nuages et soleil caché ou non.
   - Une alerte en cas de panneau défectueux.
   - Un modèle prêt à être utilisé sur le site B.
3. **Nos objectifs de gain** :
   - Site A : améliorer la prévision d'au moins 30 %.
   - Site B : améliorer la prévision d'au moins 27 %.
4. **Nos contraintes** :
   - Prévoir jusqu'à 6 heures à l'avance.
   - Avoir un modèle léger : moins de 5 Mo.

**Comment lire le schéma** : à gauche se trouvent les données disponibles ; à droite, les décisions produites par les modèles. La couverture et l'occultation sont estimées par des valeurs comprises entre 0 et 1. Le score thermique est ensuite comparé à un seuil pour décider s'il faut déclencher une alerte.

---

## 02 / Méthodologie

### slide 4
Pour réussir ce projet, nous avons découpé notre travail en quatre étapes claires, appelées jalons :

1. **Jalon 1 – Prévision avec MLP** : créer un premier modèle de réseau de neurones pour prévoir la production solaire à partir des chiffres météo et de l'historique.
2. **Jalon 2 – Vision et diagnostic** : utiliser la vision par ordinateur avec un CNN pour regarder le ciel, et un auto-encodeur pour trouver les pannes sur les panneaux.
3. **Jalon 3 – Adaptation au site B** : transférer les connaissances du site A vers le site B en testant plusieurs méthodes : sans réentraînement (Zero-shot) ou avec réentraînement (Fine-tuning).
4. **Jalon 4 – Modèles avec notion du temps** : comparer plusieurs réseaux récurrents (SimpleRNN, LSTM, GRU) pour choisir le meilleur modèle pour les séries temporelles.

**Lecture des quatre blocs** : on part d'une prévision avec des données numériques, on ajoute les images, on étudie le passage à un autre site, puis on compare des modèles qui tiennent compte de l'ordre des mesures dans le temps.

---

### slide 5
Pour réaliser ce travail, nous suivons une méthode en cinq étapes :

1. **Collecte** : récupérer les mesures météo, la production et les images des sites A et B.
2. **Préparation** : nettoyer les données, les mettre à la même échelle et créer des fenêtres de temps.
3. **Modélisation** : entraîner nos modèles d'IA (MLP, CNN, auto-encodeurs, GRU).
4. **Évaluation** : mesurer les erreurs avec le RMSE, le MAE, et calculer notre gain par rapport à une méthode simple.
5. **Décision** : choisir les meilleurs modèles pour prévoir la production et surveiller les panneaux.

**Trois grands axes :**
- **Prévoir** : transformer les mesures passées en prévision d'énergie.
- **Voir** : regarder le ciel et inspecter les panneaux solaires.
- **Transférer** : appliquer ce qu'on a appris sur le site A vers le site B.

**Notre mesure principale (le Gain)** : elle montre à quel point notre modèle est meilleur qu'une méthode de base (la persistance intelligente). Plus le gain est grand, meilleur est le modèle.

**Lecture du schéma et de la formule** : les flèches vont de l'acquisition jusqu'à la décision. Le gain est égal à **1 − RMSE du modèle / RMSE de la persistance intelligente**, sur les heures de jour. La RMSE mesure l'erreur de prévision : plus elle est faible, mieux c'est. Un gain de 30 % signifie que la RMSE du modèle est 30 % plus faible que celle de la référence ; un gain négatif signifie que le modèle fait moins bien que cette référence.

---

## 03 / Matériel et méthodes

### slide 6
Pour le premier jalon, nous avons créé un réseau de neurones simple, un MLP, pour prévoir la production des 6 prochaines heures.

1. **La structure du modèle** :
   - 47 variables en entrée.
   - Deux couches cachées de 64 et 32 neurones.
   - 6 sorties (une pour chaque heure future).
   - C'est un modèle très léger avec 5 350 paramètres.
2. **L'entraînement** :
   - Entraîné sur les données du site A pendant 30 époques avec l'optimiseur Adam.
3. **Les 47 données en entrée** :
   - 24 heures d'historique de production.
   - 18 variables météo futures (ensoleillement, nuages, température).
   - 4 variables pour l'heure et la période de l'année.
   - 1 variable pour savoir quand les panneaux ont été nettoyés.

**Objectif** : avoir un premier modèle solide pour comparer ensuite les autres méthodes.

**Explication du schéma** : les flèches montrent le passage des 47 entrées dans deux couches de 64 puis 32 neurones, jusqu'aux 6 sorties. Les six heures sont prédites directement. La barre colorée répartit les entrées en 24 valeurs d'historique, 18 variables météo, 4 variables de temps et 1 variable de nettoyage. Le tableau rappelle que les données sont séparées chronologiquement entre entraînement, validation et test.

---

### slide 7
Pour le deuxième jalon, nous utilisons deux modèles de vision par ordinateur :

1. **Le CNN pour le ciel (27 490 paramètres)** :
   - Il analyse de petites images du ciel (32 × 32 pixels).
   - Il prédit deux choses : le pourcentage de nuages et si le soleil est caché ou non.
2. **L'auto-encodeur pour les panneaux** :
   - Il apprend à regarder uniquement des panneaux en bon état (images thermiques 24 × 40 pixels).
   - Quand il voit un panneau avec un défaut, il a du mal à le reconstruire, ce qui nous permet de détecter la panne.
3. **L'entraînement** :
   - 15 époques pour chaque modèle.
4. **Objectif** :
   - Détecter les pannes tout en ayant moins de 5 % de fausses alertes.

**En résumé** : le CNN regarde le ciel pour la météo, et l'auto-encodeur inspecte les panneaux pour trouver les pannes.

**Explication des deux schémas** : à gauche, l'image du ciel traverse des couches de convolution qui repèrent des motifs, puis deux sorties estiment la couverture et l'occultation. Le pooling moyen résume l'image et le pooling maximum conserve les signaux les plus forts. À droite, l'encodeur comprime l'image thermique dans un goulot de 32 valeurs ; le décodeur essaie de reconstruire l'image. Une grande différence entre l'image initiale et sa reconstruction peut signaler une anomalie.

---

### slide 8
Pour le troisième jalon, nous voulons adapter notre modèle au site B, qui est plus petit (20 MW) et qui n'a que deux mois de données.

1. **Comment transférer les connaissances ?** Nous comparons plusieurs façons de faire :
   - **Zero-shot** : utiliser directement le modèle du site A sans changer ses poids.
   - **Scratch** : tout réapprendre à zéro avec seulement les données du site B.
   - **Fine-tuning** : réajuster tout le modèle ou seulement une partie des couches.
2. **Le CNN multitâche** :
   - Un seul réseau qui prédit en même temps la couverture des nuages et le soleil caché, pour gagner du temps et de la mémoire.
3. **L'entraînement** :
   - Réentraînement doux avec un petit taux d'apprentissage ($10^{-4}$) pendant 30 époques.

**Objectif** : réussir à bien prévoir sur le site B sans avoir besoin d'attendre des années de données.

**Lecture des schémas** : la flèche A → B représente le transfert du modèle pré-entraîné. La production est normalisée par la capacité de chaque site pour rendre les valeurs comparables. À droite, les premières couches du CNN sont partagées, puis le réseau se divise en deux branches : une pour la couverture nuageuse et une pour l'occultation. Dans la formule, lambda règle le poids donné à l'erreur d'occultation pendant l'entraînement.

---

### slide 9
Pour le quatrième jalon, nous traitons la production comme une séquence dans le temps, et pas seulement comme de simples chiffres séparés.

1. **Le modèle GRU** :
   - Il prend les 48 dernières heures de production et les prévisions météo pour prédire les 6 prochaines heures.
2. **Les modèles comparés** :
   - Nous comparons SimpleRNN, LSTM, GRU direct et Seq2Seq.
3. **Un test équitable** :
   - Tous les modèles ont une taille comparable, autour de 6 000 paramètres.
   - Entraînés sur 25 époques avec l'optimiseur Adam.
4. **Le modèle retenu** :
   - Le GRU direct avec 32 unités (6 054 paramètres).

**Objectif** : trouver le modèle qui comprend le mieux l'évolution du temps tout en restant simple et rapide.

**Lecture du schéma GRU** : à gauche, l'entrée contient 48 heures avec 6 variables par heure. Le GRU résume cette séquence grâce à ses 32 unités ; cette information est combinée aux prévisions météo des 6 heures futures, puis le réseau produit directement les 6 prévisions. Dans les dimensions affichées, **N** désigne le nombre d'exemples : historique (N, 48, 6), météo (N, 6, 5) et sorties (N, 6).

---

## 04 / Expérimentations

### slide 10
Pour le premier jalon, les résultats montrent que le modèle MLP fonctionne bien et apprend correctement.

1. **L'apprentissage** :
   - L'erreur diminue rapidement et se stabilise, sans divergence importante entre les courbes d'entraînement et de validation.
2. **Comparaison avec la méthode de base** :
   - Le MLP fait beaucoup moins d'erreurs que la persistance sur les 6 heures à venir.
3. **Les résultats obtenus** :
   - Gain moyen en validation : 48,2 %.
   - Gain à 1 heure (t+1) : 14,4 %.
   - Gain moyen sur les données de test 2025 : 50,9 %.
4. **Point important** :
   - Le gain moyen dépasse largement notre objectif de 30 %.
   - En revanche, sur le test, le gain à la première heure (t+1) est de 10,2 %, un peu en dessous de l'objectif de 12 %.

**Conclusion** : le MLP donne une très bonne base, mais la prévision de la toute première heure reste difficile.

**Comment lire les trois graphiques** :

- À gauche, l'axe horizontal indique les époques et l'axe vertical l'erreur d'apprentissage. Les deux courbes baissent puis se stabilisent.
- Au centre, les barres indiquent l'erreur absolue moyenne à t+1 en mégawatts selon l'heure de la journée. Elle est la plus élevée vers 11 h, autour de 3,4 MW, et plus faible vers 16–17 h, autour de 1,1 MW.
- À droite, les barres montrent la même erreur par mois sur le test 2025 : mars est le mois le plus difficile, autour de 3,7 MW, tandis que juillet et novembre présentent des erreurs plus faibles. Ces graphiques montrent que la difficulté varie selon l'heure et la saison.

---

### slide 11
Ce slide présente une étude pour savoir quelles variables sont les plus importantes pour le modèle MLP.

1. **Le principe** :
   - On enlève un groupe de variables et on regarde de combien le gain baisse.
2. **Le résultat principal** :
   - **Les nuages (la nébulosité)** sont la variable la plus importante. Sans eux, le gain passe de 48,2 % à 32,5 %, soit une perte de 15,7 points.
3. **Les autres variables** :
   - Sans l'historique de production, le gain baisse à 38,9 %.
   - La température, l'heure et le nettoyage des panneaux ont un impact plus faible.
4. **Conclusion** :
   - Pour bien prévoir la production solaire, il faut avant tout connaître la nébulosité future et la production récente.

**Description des graphiques** :

- **Graphique des ablations, à gauche** : chaque barre indique le gain moyen en validation après le retrait d'un groupe de variables. Le modèle complet atteint 48,2 %. Sans nébulosité, le gain tombe à 32,5 % ; sans historique, il tombe à 38,9 %. Plus la barre est courte, plus le retrait dégrade le résultat.
- **Figure de l'ablation, en haut à droite** : elle présente les mêmes résultats sous une autre forme et montre l'importance des nuages et de l'historique. La perte liée à la nébulosité est de 15,6 points dans le notebook, ou 15,7 points si l'on soustrait les valeurs affichées arrondies.
- **Figure des horizons, en bas à droite** : l'axe horizontal indique les heures de prévision et le gain augmente de 14,4 % à t+1 jusqu'à 68,4 % à t+6. Le modèle prend plus d'avance sur la persistance lorsque l'horizon s'allonge.

---

### slide 12
Ici, nous montrons comment les photos du ciel aident à mieux prévoir la production.

1. **L'apprentissage du CNN (à gauche)** :
   - Le modèle apprend très vite en 15 étapes (époques).
   - Il sait reconnaître si le ciel est bleu, s'il y a des nuages, ou si le soleil est caché.
2. **Comparé à des règles simples (à droite)** :
   - La règle est meilleure pour la couverture (0,0166 contre 0,0252), mais le CNN est beaucoup plus précis pour l'occultation (0,0388 contre 0,1595).
3. **Le gain pour la prévision (au centre)** :
   - En validation, le gain à t+1 passe de **10,63 % à 14,84 %** (soit **+4,21 points**).
   - Le modèle retenu atteint **16,80 %** sur le test final et dépasse l'objectif de 12 %.
   - La paire d'images prédit directement l'occultation à t+1 avec une MAE de **0,0675**.
   - Pour les heures plus lointaines (après 3 heures), l'image du ciel sert moins car les nuages se déplacent vite : c'est la météo normale qui prend le relais.

Les deux figures situées sous les graphiques sont des sorties exactes du notebook : la comparaison CNN/règles et quatre exemples réels du test avec leurs valeurs vraies et leurs prédictions continues.

**Description des graphiques et des images** :

- **Apprentissage du CNN, à gauche** : l'axe horizontal indique les époques et l'axe vertical la perte. Les courbes d'entraînement et de validation baissent puis se stabilisent : le CNN apprend à partir des images.
- **Gain par horizon, au centre** : l'axe horizontal indique t+1 à t+6 et l'axe vertical le gain en pourcentage. À t+1, le gain passe de 10,63 % sans vision à 14,84 % avec vision en validation. La courbe de test correspond à une autre partition : elle atteint 16,80 % à t+1.
- **Comparaison CNN et règle simple, en bas** : les barres montrent la MAE ; plus une barre est basse, plus l'erreur est faible. La règle est meilleure pour la couverture, tandis que le CNN est meilleur pour l'occultation.
- **Quatre images du ciel** : les nombres au-dessus de chaque image comparent valeurs réelles et prédictions. Par exemple, pour le ciel totalement couvert, la couverture réelle vaut 1,00 et la prédiction 0,92.

**Conclusion** : regarder le ciel permet de corriger le retard de la météo sur la première heure, avec une traçabilité directe jusqu'aux sorties du notebook.

---
### Slide 13 – Détection des défauts par Auto-Encodeur (CAE)

Ici, nous utilisons un **Auto-Encodeur Convolutif (CAE)** pour détecter automatiquement les anomalies thermiques des panneaux solaires grâce à la thermographie.

**1. Le principe :**
- Le modèle apprend à reconstruire des images de panneaux en bon état.
- Lorsqu'il reçoit une image présentant une anomalie (hotspot, fissure, etc.), il la reconstruit moins correctement.
- L'erreur de reconstruction permet de détecter les anomalies.

**2. Sélection sans fuite du test :**
- Trois goulots (16, 32 et 128) et deux scores (MSE et maximum) sont comparés sur un proxy de validation.
- Le modèle retenu utilise un goulot de 32 et l'erreur maximale.
- Le seuil **0,2442** est le 95e percentile des scores de la validation saine.

**3. Les résultats sur le test :**

- **AUC thermique : 0,9859 — objectif atteint** (objectif : AUC ≥ 0,98). L'AUC mesure la capacité du modèle à distinguer les images saines des images défectueuses. Une valeur proche de 1 indique une excellente séparation entre les deux catégories.
- **Détection des fissures : 88 % — objectif atteint** (objectif : au moins 85 %). Parmi les images présentant des fissures, le modèle en détecte 88 %.
- **Fausses alertes : 4,92 % — objectif atteint** (objectif : au maximum 5 %). Parmi les images saines du test, 4,92 % sont incorrectement signalées comme anormales.
- **Méthode de référence : AUC de 0,9739.** Cette valeur provient de la méthode « maximum − médiane ». Notre auto-encodeur obtient 0,9859, soit une meilleure séparation des images saines et défectueuses.
- Les hotspots, diodes et sous-modules sont détectés à **100 %** dans ce test.

La figure située en bas est uniquement le panneau thermique exact du notebook ; les résultats CNN/règles ont été replacés sur le slide précédent.

**Description du graphique thermique** :

- **Axe horizontal** : les quatre types de défauts sont les points chauds, les fissures, les diodes et les sous-modules.
- **Axe vertical** : il indique le pourcentage de défauts détectés sur le test ; une barre plus haute indique une meilleure détection.
- **Barres vertes** : les fissures sont détectées à 88 %, et les trois autres types à 100 % dans ce test.
- **Ligne rouge pointillée** : elle représente la cible de 85 % pour les fissures ; la barre à 88 % la dépasse.
- **AUC** : la valeur de 0,9859 indique une bonne séparation entre images saines et anormales. Le seuil de 0,2442 est choisi sur la validation saine avant l'évaluation finale.

**Conclusion :**

Notre CAE détecte efficacement les anomalies thermiques. Le goulot et le score ont été choisis avant l'ouverture du test, et l'erreur maximale convient aux défauts localisés.
### slide 14
Pour le troisième jalon, nous testons comment le modèle s'adapte au site B avec différentes méthodes.

1. **Résultats en validation (sur le mois de mars)** :
   - Le Fine-tuning complet donne le meilleur résultat avec 43,4 % de gain.
   - Le Zero-shot (sans aucun réentraînement) donne 42,2 %.
   - Geler une partie des couches donne environ 43,2 % avec très peu de calculs.
   - Apprendre de zéro donne seulement 38,9 %.
2. **Résultats sur le test final (avril à juin 2025)** :
   - Surprise : c'est le **Zero-shot** qui gagne avec **40,3 % de gain**.
   - Le Fine-tuning baisse à 38,4 %.
   - L'apprentissage de zéro chute à 25,6 % (en dessous de l'objectif).
3. **Pourquoi ce résultat ?**
   - Une explication possible est que le fine-tuning s'est trop adapté à la courte période disponible avant le test de printemps.
   - Le Zero-shot, entraîné sur davantage de données du site A, généralise mieux dans ce test ; les résultats seuls ne prouvent pas la cause exacte.
4. **Objectif atteint** :
   - Avec 40,3 % de gain, le Zero-shot dépasse largement l'objectif de 27 %.

**Conclusion** : nous pouvons utiliser directement le modèle du site A sur le site B dès le premier jour, sans avoir besoin de réentraînement.

**Description des graphiques** :

- **Gain par horizon, à gauche** : les cinq courbes représentent les stratégies de transfert en validation. L'axe horizontal indique les heures de prévision et l'axe vertical le gain. À t+1, le modèle appris de zéro a un gain négatif ; les courbes montent ensuite jusqu'à environ 70 % à t+6.
- **Ligne rouge** : elle rappelle l'objectif de 27 % de gain moyen sur B ; ce n'est pas une obligation pour chaque horizon séparément.
- **Tableau central** : il donne les gains sur le test final, une partition différente de la validation : 40,3 % en zero-shot, 38,4 % après fine-tuning et 25,6 % depuis zéro.
- **Profil journalier, à droite** : les courbes comparent la production normalisée des deux sites selon l'heure. Leurs profils ne sont pas identiques.
- **Histogramme de clarté matinale** : il compare la fréquence des niveaux de clarté. La ligne rouge marque le seuil de brouillard ; le site B présente davantage de situations brumeuses.

---

### slide 15
Ce slide présente notre CNN multitâche pour estimer à la fois les nuages et le soleil caché, et son test sur la caméra du site B.

1. **Le compromis multitâche (site A)** :
   - Nous utilisons un paramètre lambda pour équilibrer les deux tâches.
   - Sans occultation ($\lambda = 0$), le modèle ne sait pas voir si le soleil est caché (erreur de 0,430).
   - La valeur $\lambda = 0,3$ donne le meilleur équilibre : une petite erreur sur les nuages (0,030) et sur le soleil (0,102).
2. **Le test sur la caméra du site B** :
   - En validation, le Fine-tuning aide bien le modèle.
   - Mais sur le test, l'erreur sur le soleil caché remonte à 0,1534 (au-dessus de notre cible de 0,10).
3. **Pourquoi ?**
   - La caméra du site B est différente : l'angle, l'éclairage et la qualité de l'image changent, ce qui perturbe le modèle.

**Conclusion** : le modèle multitâche est pratique pour faire deux choses à la fois, mais changer de caméra demande un réglage plus poussé.

**Description des graphiques et des images** :

- **Compromis multitâche, à gauche** : l'axe horizontal représente lambda et l'axe vertical la MAE. Plus la MAE est faible, meilleure est la prédiction.
- **Deux courbes** : quand lambda passe de 0 à 0,3, l'erreur d'occultation chute fortement et celle de couverture augmente légèrement. À lambda 1, l'occultation s'améliore encore, mais la couverture devient moins précise.
- **Tableau central** : il compare les erreurs sur la caméra B avant et après adaptation, d'abord en validation puis sur le test final.
- **Images à droite** : les valeurs au-dessus des images comparent le vrai et le prédit. Par exemple, une valeur réelle de 0,28 est prédite à 0,21. Ces quelques exemples illustrent les écarts sans résumer tout le test.

---

### slide 16
Pour le quatrième jalon, nous comparons les modèles temporels (RNN, LSTM, GRU) avec le MLP, à taille égale (environ 6 000 paramètres).

1. **Avantage aux modèles séquentiels** :
   - Dans cette comparaison, tous les modèles récurrents obtiennent un meilleur gain moyen que le MLP. Ils prennent en compte l'ordre des heures, même si l'expérience ne prouve pas à elle seule que c'est l'unique cause de l'amélioration.
2. **Comparaison des modèles en validation** :
   - SimpleRNN : 44,5 % de gain.
   - LSTM : 45,0 % de gain.
   - GRU direct avec 24 h d'historique : 46,4 % de gain (et 11 % à t+1).
   - GRU direct avec 48 h : 44,9 % de gain.
   - Seq2Seq (Encodeur-Décodeur) : 44,3 % de gain, mais plus lourd (7 617 paramètres).
3. **Temps de calcul** :
   - Les modèles récurrents directs prennent environ 15 à 53 secondes ; l'encodeur-décodeur prend environ 62 secondes.

**Conclusion** : le GRU direct à 24 h obtient le meilleur gain de cette comparaison en validation. La version à 48 h est retenue comme compromis pour disposer de deux cycles jour/nuit, malgré un gain de validation plus faible et un coût plus élevé.

**Description des graphiques** :

- **Barres à gauche** : chaque barre représente le gain moyen d'une architecture en validation. Plus elle est longue, meilleur est le gain. Le GRU direct avec 24 h atteint 46,4 % dans cette comparaison.
- **Première figure à droite** : les courbes de perte des SimpleRNN, LSTM et GRU diminuent pendant les 25 époques. Le graphique voisin compare ensuite leurs gains à chaque horizon.
- **Deuxième figure à droite** : elle compare le MLP et le GRU. À t+1, le MLP a un gain négatif dans cette expérience, tandis que celui du GRU est positif.
- **Lignes horizontales** : elles rappellent les objectifs de gain moyen et de gain à une heure. Il faut distinguer une cible moyenne d'un résultat à un seul horizon.

---

### slide 17
Ce slide montre l'effet de la durée de l'historique sur les performances du modèle GRU direct.

1. **Comparaison des durées d'historique** :
   - 6 heures : 47,2 % de gain en 15 secondes.
   - 24 heures : 45,5 % de gain en 31 secondes.
   - 48 heures : 44,9 % de gain en 53 secondes.
   - 168 heures (une semaine entière) : le même gain (44,9 %), mais le temps d'entraînement triple (162 secondes).
2. **Pourquoi choisir 48 heures ?**
   - 48 heures permet au modèle de voir deux cycles complets jour/nuit et la météo de la veille, sans faire de calculs inutiles.
3. **Résultats finaux sur le jeu de test** :
   - Site A : 49,0 % de gain (objectif de 30 % largement dépassé).
   - Site B (Zero-shot) : 40,0 % de gain (objectif de 27 % dépassé).
   - À la première heure (t+1) : 9,5 % (en progrès, mais un peu sous la cible de 12 %).

**Conclusion** : 48 heures est le compromis retenu pour observer deux cycles jour/nuit. Ce n'est pas le meilleur score brut de validation : 6 heures obtient ici un gain supérieur et coûte moins cher. Il faudra donc confirmer le choix sur d'autres périodes.

**Description des graphiques** :

- **Courbes à gauche** : l'axe horizontal indique l'horizon de prévision et l'axe vertical le gain. Chaque courbe correspond à un historique de 6, 24, 48 ou 168 heures.
- **Barres de temps à gauche** : elles comparent le coût d'entraînement. Une semaine d'historique prend environ 162 secondes, contre 53 secondes pour 48 heures, sans améliorer le gain moyen dans cette expérience.
- **Figure en haut à droite** : elle compare les prévisions directes à l'encodeur-décodeur sur les sites A et B en validation. Les courbes montrent leur gain à chaque horizon.
- **Figure en bas à droite** : elle montre les résultats sur les tests finaux. Le GRU obtient un gain moyen de 49,0 % sur A et de 40,0 % en zero-shot sur B ; le GRU ajusté sur B atteint environ 41,0 %.

**Attention aux comparaisons** : au slide 14, le zero-shot bat le fine-tuning pour le **MLP** sur le test B. Ici, ce sont des expériences avec le **GRU**, pour lesquelles le fine-tuning atteint environ 41,0 % contre 40,0 % en zero-shot. Les deux résultats concernent des modèles différents.

---

## 05 / Comparaison et constats

### slide 18
Ce slide résume les résultats des quatre jalons du projet :

1. **Bilan par jalon** :
   - **Jalon 1 (MLP)** : gain moyen de 50,9 % sur le site A en test. Une bonne base de départ.
   - **Jalon 2 (Vision)** : MAE d'occultation 0,0388, gain t+1 de 16,80 %, AUC thermique 0,9859 et 88 % des fissures détectées.
   - **Jalon 3 (Transfert)** : le Zero-shot fonctionne très bien sur le site B avec 40,3 % de gain en test, sans réentraînement.
   - **Jalon 4 (Séquentiel)** : le modèle GRU confirme de très bons résultats avec 49,0 % de gain sur le site A et 40,0 % sur le site B.
2. **Bilan des objectifs** :
   - Les objectifs de gain moyen (30 % sur A et 27 % sur B) sont tous les deux largement réussis.
   - Les anomalies sur les panneaux sont très bien détectées avec peu de fausses alertes (5 %).

**Limite constatée** : le GRU final reste sous l'objectif t+1, tandis que le MLP enrichi par la vision du Jalon 2 dépasse cette cible.

**Lecture du tableau** : chaque ligne correspond à un jalon et précise sa tâche, sa méthode, sa métrique, la partition utilisée et sa limite. On ne compare pas directement un gain de prévision à une MAE ou à une AUC : ces chiffres mesurent des problèmes différents.

---

### slide 19
Dans ce slide, nous expliquons nos choix pour une mise en place pratique sur le terrain :

1. **Respect du cahier des charges** :
   - Gain moyen sur 6 heures : 49 % sur le site A et 40 % sur le site B (objectifs largement dépassés).
   - Poids du modèle : seulement 0,1 Mo, ce qui respecte largement la limite imposée de 5 Mo.
   - Prévision à 1 heure : 9,5 % contre 12 % visés, point qui reste à améliorer.
2. **Pourquoi choisir le GRU direct ?**
   - Il comprend la chronologie sur deux jours.
   - Il est très rapide, simple et très léger (6 054 paramètres seulement).
3. **Pourquoi garder le Zero-shot pour le site B ?**
   - Il fonctionne tout de suite, dès le premier jour de la centrale.
   - Il évite de mal apprendre sur un historique trop court de seulement deux mois.

**Lecture des cartes** : les deux nombres de chaque carte sont le résultat obtenu et l'objectif : 0,095 contre 0,12 pour t+1, puis 0,490 contre 0,30 pour le gain moyen. La dernière carte affiche une taille de 0,106 Mo contre une limite de 5 Mo.

**Conclusion** : la solution est légère et respecte la cible de gain moyen. Avant un déploiement industriel, il reste notamment à améliorer t+1 et à mesurer les performances en conditions réelles.

---

### slide 20
Ce slide montre notre démarche de rigueur scientifique et d'honnêteté :

1. **Des résultats fiables et vérifiés** :
   - La détection des pannes fonctionne très bien (AUC de 0,9859).
   - Dans l'expérience de transfert du MLP, le Zero-shot est plus solide sur le test B que le modèle réentraîné.
   - Le GRU donne un gain robuste de 49 % sur le test du site A.
2. **Ce qu'il faut retenir avec prudence** :
   - **Attention à ne pas confondre validation et test** : un modèle peut sembler meilleur au début (en validation) puis perdre en performance sur de nouvelles données (en test).
   - **Transparence sur les chiffres** : nous donnons les vrais chiffres calculés par nos programmes, même quand ils sont un peu en dessous des attentes (comme pour la caméra du site B).
   - Ne pas comparer deux entraînements différents sans préciser les conditions.

**Principe** : tous les chiffres présentés viennent directement de nos notebooks exécutés, sans rien inventer.

**Lecture des deux colonnes** : à gauche, les résultats obtenus ; à droite, leurs limites, notamment l'écart entre validation et test, la meilleure couverture obtenue par la règle simple, la caméra B et le gain t+1 du GRU. Cette présentation évite de retenir seulement les meilleurs chiffres.

---

## 06 / Conclusion

### slide 21
Pour conclure, notre projet Drâa Solaire apporte quatre réussites concrètes pour les centrales solaires :

1. **Prévoir** : le MLP a montré que les nuages et la production récente sont les éléments les plus importants.
2. **Observer** : le CNN analyse l'état du ciel et l'auto-encodeur surveille l'état physique des panneaux.
3. **Transférer** : le modèle s'utilise directement sur une nouvelle centrale avec plus de 40 % de gain, sans attendre d'avoir un long historique.
4. **Gérer le temps** : le modèle GRU prend en compte deux jours d'historique avec un modèle ultra-léger de seulement 106 Ko.

**En résumé** : nous avons construit un système complet qui sait à la fois prévoir l'énergie et surveiller les panneaux solaires, tout en restant simple, rapide et efficace.

---

### slide 22
Pour terminer, voici les pistes pour prolonger ce projet :

1. **Pistes d'amélioration** :
   - **Combiner images et temps** : lier directement les images du ciel (CNN) avec le modèle temporel (GRU) pour tenter d'améliorer la première heure.
   - **Tester sur une année entière** : évaluer le site B sur 12 mois pour observer toutes les saisons.
   - **Répéter les expériences** : faire plusieurs entraînements pour vérifier la stabilité des résultats.
   - **Améliorer la vision** : adapter le CNN pour qu'il soit moins sensible aux changements de caméra entre centrales.
   - **Mesurer l'inférence** : chronométrer les prévisions sur une machine documentée afin de vérifier la faisabilité réelle sur CPU ou GPU.
2. **Reproductibilité** :
   - Tout notre code, nos carnets de calculs (notebooks) et nos résultats sont disponibles en accès libre sur GitHub.
   - La diapositive présente aussi l'application de démonstration à l'adresse **centrale-solaire.streamlit.app** et les liens vers les résultats des quatre jalons.

**Remerciements** : nous vous remercions pour votre attention et nous sommes à votre disposition pour répondre à vos questions !
