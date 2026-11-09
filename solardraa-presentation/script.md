# Drâa Solaire — Script de Présentation (Français Facile)

**Projet Master SDIA · Étude de cas 04**  
*Centrale solaire Drâa Solaire (Site A : 50 MW · Site B : 20 MW)*
*Texte oral simple et direct pour les 25 diapositives de la présentation.*

---

## Sommaire
- **01. Problème** (Slides 1 à 3)
- **02. Méthodologie** (Slides 4 à 5)
- **03. Matériel et méthodes** (Slides 6 à 9)
- **04. Expérimentations** (Slides 10 à 20)
- **05. Comparaison et constats** (Slides 21 à 23)
- **06. Conclusion** (Slides 24 à 25)

---

## 01 / Problème

### slide 1
Bonjour à tous. Nous vous présentons aujourd'hui notre projet Drâa Solaire : « Prévoir l'énergie, comprendre le ciel ».

Notre but est simple : utiliser l'intelligence artificielle pour mieux prévoir la production d'électricité solaire, surveiller l'état des panneaux avec des caméras, et adapter facilement nos modèles à une nouvelle centrale solaire.

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

---

## 02 / Méthodologie

### slide 4
Pour réussir ce projet, nous avons découpé notre travail en quatre étapes claires, appelées jalons :

1. **Jalon 1 – Prévision avec MLP** : créer un premier modèle de réseau de neurones pour prévoir la production solaire à partir des chiffres météo et de l'historique.
2. **Jalon 2 – Vision et diagnostic** : utiliser la vision par ordinateur avec un CNN pour regarder le ciel, et un auto-encodeur pour trouver les pannes sur les panneaux.
3. **Jalon 3 – Adaptation au site B** : transférer les connaissances du site A vers le site B en testant plusieurs méthodes : sans réentraînement (Zero-shot) ou avec réentraînement (Fine-tuning).
4. **Jalon 4 – Modèles avec notion du temps** : comparer plusieurs réseaux récurrents (SimpleRNN, LSTM, GRU) pour choisir le meilleur modèle pour les séries temporelles.

---

### slide 5
Pour réaliser ce travail, nous suivons une méthode en cinq étapes :

1. **Collecte** : récupérer les mesures météo, la production et les images des sites A et B.
2. **Préparation** : nettoyer les données, les mettre à la même échelle et créer des fenêtres de temps.
3. **Modélisation** : entraîner nos modèles d'IA (MLP, CNN, auto-encodeurs, GRU).
4. **Évaluation** : mesurer les erreurs avec le RMSE, le MAE, et calculer notre gain par rapport à une méthode simple.
5. **Décision** : choisir les meilleurs modèles pour prévoir la production et surveiller les panneaux.

**Comment lire le gain** : il est égal à **1 − RMSE du modèle / RMSE de la persistance intelligente**, sur les heures de jour. Un gain de 30 % signifie que l'erreur RMSE est 30 % plus faible que celle de la référence ; un gain négatif signifie que le modèle fait moins bien que cette référence.

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

Le tableau montre une séparation chronologique entre entraînement, validation et test ; les six heures sont prédites directement.

---

### slide 7
Pour le deuxième jalon, nous utilisons deux modèles de vision par ordinateur :

1. **Le CNN pour le ciel (27 490 paramètres)** :
   - Il analyse de petites images du ciel (32 × 32 pixels).
   - Il estime deux valeurs continues : la couverture nuageuse et l'occultation du soleil.
2. **L'auto-encodeur pour les panneaux** :
   - Il apprend à regarder uniquement des panneaux en bon état (images thermiques 24 × 40 pixels).
   - Quand il voit un panneau avec un défaut, il a du mal à le reconstruire, ce qui nous permet de détecter la panne.
3. **L'entraînement** :
   - 15 époques pour chaque modèle.
4. **Objectif** :
   - Détecter les pannes tout en ayant moins de 5 % de fausses alertes.

**Lecture des schémas** : le CNN combine un pooling moyen et un pooling maximum ; l'auto-encodeur comprime l'image dans un goulot de 32 valeurs avant de la reconstruire.

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

**Lecture des schémas** : la production est normalisée par la capacité de chaque site. Dans la formule à droite, lambda règle le poids donné à l'erreur d'occultation pendant l'entraînement.

---

### slide 9
Pour le quatrième jalon, nous traitons la production comme une séquence dans le temps, et pas seulement comme de simples chiffres séparés.

1. **Le modèle GRU** :
   - Il prend les 48 dernières heures de production et les prévisions météo pour prédire les 6 prochaines heures.
2. **Les modèles comparés** :
   - Nous comparons SimpleRNN, LSTM, GRU direct et Seq2Seq.
3. **Un test équitable** :
   - Les trois cellules SimpleRNN, LSTM et GRU sont comparées autour de 6 000 paramètres.
   - Entraînés sur 25 époques avec l'optimiseur Adam.
4. **Le modèle retenu** :
   - Le GRU direct avec 32 unités (6 054 paramètres).

**Lecture du schéma GRU** : chaque heure d'historique contient 6 variables. Dans les dimensions affichées, **N** désigne le nombre d'exemples : historique (N, 48, 6), météo (N, 6, 5) et sorties (N, 6).

---

## 04 / Expérimentations

### slide 10
Pour le premier jalon, les résultats montrent que le modèle MLP fonctionne bien et apprend correctement.

1. **L'apprentissage** :
   - L'erreur diminue rapidement et se stabilise, sans divergence importante entre les courbes d'entraînement et de validation.
2. **Les résultats obtenus** :
   - Gain moyen en validation : 48,2 %.
   - Gain à 1 heure (t+1) : 14,4 %.
   - Gain moyen sur les données de test 2025 : 50,9 %.
3. **Point important** :
   - Le gain moyen dépasse largement notre objectif de 30 %.
   - En revanche, sur le test, le gain à la première heure (t+1) est de 10,2 %, un peu en dessous de l'objectif de 12 %.

**Comment lire les deux autres graphiques** :

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
**Description des graphiques** :

- **Graphique des ablations, à gauche** : plus la barre est courte, plus le retrait dégrade le résultat. La figure en haut à droite représente les mêmes données ; le notebook indique une perte de 15,6 points, contre 15,7 avec les valeurs affichées arrondies.
- **Figure des horizons, en bas à droite** : l'axe horizontal indique les heures de prévision et le gain augmente de 14,4 % à t+1 jusqu'à 68,4 % à t+6. Le modèle prend plus d'avance sur la persistance lorsque l'horizon s'allonge.

---

### slide 12
Ici, nous montrons comment les photos du ciel aident à mieux prévoir la production.

1. **L'apprentissage du CNN (à gauche)** :
   - Les courbes d'entraînement et de validation baissent pendant les 15 époques.
2. **Comparé à des règles simples (figure en bas)** :
   - La règle est meilleure pour la couverture (0,0166 contre 0,0252), mais le CNN est beaucoup plus précis pour l'occultation (0,0388 contre 0,1595).
3. **Le gain pour la prévision (au centre)** :
   - En validation, le gain à t+1 passe de **10,63 % à 14,84 %** (soit **+4,21 points**).
   - Le modèle retenu atteint **16,80 %** sur le test final et dépasse l'objectif de 12 %.
   - La paire d'images prédit directement l'occultation à t+1 avec une MAE de **0,0675**, inférieure à la cible de **0,10** : cette condition est atteinte.
   - La MAE **0,0388** concerne l'occultation estimée sur l'image du ciel ; **0,0675** concerne sa prévision à t+1.

**Lecture des figures** : le graphique central indique le gain pour chaque horizon. En bas, les barres comparent les erreurs des deux méthodes et les quatre images montrent des exemples réels avec leurs prédictions.

---
### Slide 13 – Détection des défauts par Auto-Encodeur (CAE)

Ici, nous utilisons un **Auto-Encodeur Convolutif (CAE)** pour détecter automatiquement les anomalies thermiques des panneaux solaires grâce à la thermographie.

**1. Sélection sans fuite du test :**
- Trois goulots (16, 32 et 128) et deux scores (MSE et maximum) sont comparés sur un proxy de validation.
- Le modèle retenu utilise un goulot de 32 et l'erreur maximale.
- Le seuil **0,2442** est le 95e percentile des scores de la validation saine.

**2. Les résultats sur le test :**

- **AUC thermique : 0,9859 — objectif atteint** (objectif : AUC ≥ 0,98). L'AUC mesure la capacité du modèle à distinguer les images saines des images défectueuses. Une valeur proche de 1 indique une excellente séparation entre les deux catégories.
- **Détection des fissures : 88 %**, pour une cible d'au moins 85 %, avec **4,92 % de fausses alertes** sur le test : objectif atteint.
- **Méthode de référence : AUC de 0,9739**, avec le score « maximum − médiane ».
- Les hotspots, diodes et sous-modules sont détectés à **100 %** dans ce test.

**Description du graphique thermique** :

- Les barres représentent le pourcentage détecté par type de défaut ; la ligne rouge indique la cible pour les fissures. Avec les deux conditions de la slide précédente, les quatre cibles du Jalon 2 sont atteintes sur ce test.

---

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
4. **Objectif** : la cible moyenne sur B est de 27 % ; seuls le zero-shot et le fine-tuning l'atteignent parmi les trois résultats de test affichés.

**Description des graphiques** :

- **Gain par horizon, à gauche** : les cinq courbes représentent les stratégies de transfert en validation. L'axe horizontal indique les heures de prévision et l'axe vertical le gain. À t+1, le modèle appris de zéro a un gain négatif ; les courbes montent ensuite jusqu'à environ 70 % à t+6.
- **Ligne rouge** : elle rappelle l'objectif de 27 % de gain moyen sur B ; ce n'est pas une obligation pour chaque horizon séparément.
- **Tableau central** : il donne les gains sur le test final, une partition différente de la validation.
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
   - Le changement de caméra et de conditions peut contribuer à la difficulté ; ces résultats ne suffisent pas à établir la cause exacte.

**Description des graphiques et des images** :

- **Compromis multitâche, à gauche** : l'axe horizontal représente lambda et l'axe vertical la MAE. Plus la MAE est faible, meilleure est la prédiction.
- **Deux courbes** : à lambda 1, l'occultation s'améliore encore, mais la couverture devient moins précise.
- **Tableau central** : il compare les erreurs sur la caméra B avant et après adaptation, d'abord en validation puis sur le test final.
- **Images à droite** : les valeurs au-dessus des images comparent le vrai et le prédit. Par exemple, une valeur réelle de 0,28 est prédite à 0,21. Ces quelques exemples illustrent les écarts sans résumer tout le test.

---

### slide 16
Pour commencer le quatrième jalon, nous comparons le MLP de référence avec le GRU direct utilisant 24 heures d'historique, sur la validation du site A.

1. **Gain moyen sur six horizons** :
   - MLP : **40,0 %**.
   - GRU : **46,4 %**.
2. **Gain à t+1** :
   - MLP : **−23,3 %**, donc moins bon que la persistance intelligente.
   - GRU : **+11,0 %**.
3. **Taille des modèles** :
   - Le MLP possède 5 350 paramètres et le GRU 6 054.

**Description des graphiques** :

- **Courbes de perte, à gauche** : elles montrent l'évolution de l'erreur de validation pendant l'entraînement du MLP et du GRU.
- **Gains par horizon, à droite** : elles comparent les gains des deux modèles de t+1 à t+6. Le tableau reprend les résultats à t+1 et le gain moyen.

---

### slide 17
Nous comparons maintenant trois cellules récurrentes avec un budget proche de 6 000 paramètres.

1. **SimpleRNN** : gain à t+1 de **3,3 %** et gain moyen de **44,5 %**.
2. **LSTM** : gain à t+1 de **4,4 %** et gain moyen de **45,0 %**.
3. **GRU** : gain à t+1 de **11,0 %** et gain moyen de **46,4 %**, avec 6 054 paramètres.

**Description des graphiques** : les barres de gauche comparent les gains à t+1 ; celles de droite comparent les gains moyens. Les lignes pointillées rappellent les cibles de 12 % à une heure et de 30 % en moyenne.

**Conclusion** : le GRU est le meilleur des trois dans ce comparatif de validation. Aucun des trois n'atteint la cible t+1 de 12 % dans cette expérience.

---

### slide 18
Ce slide montre l'effet de la durée de l'historique sur les performances du modèle GRU direct, en validation.

1. **Comparaison des durées d'historique** :
   - 6 heures : 47,2 % de gain moyen en 15,1 secondes.
   - 24 heures : 45,5 % en 30,9 secondes.
   - 48 heures : 44,9 % en 53,1 secondes.
   - 168 heures : 44,9 % en 162,2 secondes.
2. **Pourquoi choisir 48 heures ?**
   - 48 heures permet au modèle de voir deux cycles jour/nuit, pour un coût inférieur à 168 heures.

**Limite** : 6 heures obtient ici un gain supérieur et coûte moins cher ; il faudra donc confirmer le choix sur d'autres périodes.

**Description des graphiques** :

- **Courbes à gauche** : l'axe horizontal indique l'horizon de prévision et l'axe vertical le gain. Chaque courbe correspond à une durée d'historique.
- **Barres à droite** : elles comparent les temps d'entraînement.

---

### slide 19
Nous comparons le GRU à **sortie directe**, qui prédit les six horizons en une fois, avec l'architecture **encodeur-décodeur**.

1. **Site A, validation** : gain moyen de **44,9 %** en sortie directe, contre **44,3 %** avec encodeur-décodeur.
2. **Site B, zero-shot** : **42,3 %** contre **40,0 %**.
3. **Site B, fine-tuning** : **44,3 %** contre **41,8 %**.

**Description des graphiques** : à gauche, les courbes comparent les gains par horizon sur A ; à droite, elles montrent les résultats sur B avant et après adaptation. Le tableau détaille aussi les gains à t+1.

**Conclusion** : la sortie directe obtient le meilleur gain moyen dans les trois conditions présentées.

---

### slide 20
Nous vérifions maintenant le GRU retenu sur les jeux de test et les cibles du cahier des charges.

1. **Site A à t+1** : gain de **9,5 %**, inférieur à la cible de **12 %** : **non atteinte**.
2. **Site A, moyenne des six horizons** : **49,0 %**, supérieur à **30 %** : **atteinte**.
3. **Site B en zero-shot** : gain moyen de **40,0 %**, supérieur à **27 %** : **atteinte**.
4. **Taille du modèle** : **0,106 Mo**, inférieure à **5 Mo** : **conforme**.

**Description de la figure** : elle présente les résultats sur les tests finaux ; le tableau à droite les compare aux cibles.

---

## 05 / Comparaison et constats

### slide 21
Ce tableau rassemble les résultats et les limites des quatre jalons déjà présentés.

- Chaque ligne précise la tâche, la méthode, la partition et la limite principale.
- Un gain de prévision, une MAE et une AUC mesurent des choses différentes : il ne faut donc pas les comparer directement.

---

### slide 22
Dans ce slide, nous expliquons nos choix pour une mise en place pratique sur le terrain :

1. **Pourquoi choisir le GRU direct ?**
   - Il comprend la chronologie sur deux jours.
   - Il est léger avec 6 054 paramètres ; le temps d'inférence reste à mesurer.
2. **Pourquoi garder le Zero-shot pour le site B ?**
   - Il fonctionne tout de suite, dès le premier jour de la centrale.
   - Il évite de dépendre d'un réentraînement sur un historique local court.

Les cartes rappellent les résultats du GRU et leurs cibles, présentés à la slide 20.

---

### slide 23
Ce slide montre notre démarche de rigueur scientifique et d'honnêteté :

- **Validation et test** : un modèle meilleur en validation ne le reste pas forcément sur de nouvelles données.
- **Transparence** : nous montrons aussi les limites observées, notamment sur la caméra B et à l'horizon t+1 du GRU.
- **Traçabilité** : chaque résultat doit être lu avec son modèle, sa métrique et sa partition.

---

## 06 / Conclusion

### slide 24
Pour conclure, notre projet Drâa Solaire apporte quatre réussites concrètes pour les centrales solaires :

1. **Prévoir** : le MLP a montré que les nuages et la production récente sont les éléments les plus importants.
2. **Observer** : le CNN analyse l'état du ciel et l'auto-encodeur surveille l'état physique des panneaux.
3. **Transférer** : le modèle s'utilise directement sur une nouvelle centrale avec plus de 40 % de gain, sans attendre d'avoir un long historique.
4. **Gérer le temps** : le modèle GRU prend en compte deux jours d'historique avec un modèle ultra-léger de seulement 106 Ko.

---

### slide 25
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
