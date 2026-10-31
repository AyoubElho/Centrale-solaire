# Étude de cas 4 : Centrale solaire — SolarDrâa (50 MW)
## Jalon 3 : Un nouveau site, deux tâches
### Page de Décisions et Synthèse Exécutive
**Master 2 SDIA — Advanced Artificial Intelligence (2026–2027)**

---

### 1. Tableau Récapitulatif des Performances et Cibles Contractuelles

| Exigence Métier | Mesure (Ensemble de Test) | Cible Contractuelle | Résultat Obtenu | Statut |
| :--- | :--- | :---: | :---: | :---: |
| **Prévision de production (Site B)** | Gain moyen sur les six horizons ($t+1$ à $t+6$) | **$\ge 0,27$** | **$0,420$** *(Zero-Shot)* / **$0,380$** *(FT Full)* | ✅ **ATTEINTE** |
| **Occultation du soleil (caméra)** | Erreur absolue moyenne (MAE) | **$\le 0,10$** | **$0,0748$** *(Fine-Tuned)* | ✅ **ATTEINTE** |

---

### 2. Décisions Stratégiques Métier

#### A. Choix du modèle déployé au Site B le jour de sa mise en service (Day 0)
- **Décision :** Déployer le **Modèle A tel quel (*Zero-Shot Transfer*)**, avec la production normalisée par la capacité crête du Site B ($20\text{ MW}$).
- **Justification technique et économique :**
  - Au jour de la mise en service, aucun historique local n'est disponible.
  - Le modèle A, entraîné sur 2 ans d'historique varié (15 313 heures), généralise remarquablement bien et atteint un gain moyen de **$0,420$** sur le test (avril à juin), dépassant largement le seuil requis de $0,27$.
  - Il surpasse même les modèles ajustés sur les deux mois d'hiver ($0,380$ pour le Fine-Tuning complet), car il conserve une compréhension robuste des dynamiques solaires estivales.

#### B. Stratégie recommandée pour un 3e site (Site C) disposant de deux semaines de données
- **Décision :** Déployer le modèle pré-entraîné du Site A avec un **ajustement fin partiel très ciblé (*Feature Extractor*, 2 couches gelées)**.
- **Justification technique :**
  - Deux semaines représentent seulement 336 heures de données.
  - Un entraînement *from scratch* ou un fine-tuning complet conduirait à un surapprentissage sévère (*overfitting*) et à un oubli catastrophique des régularités globales.
  - En gelant les deux couches denses cachées ($5\,152$ paramètres gelés) et en n'adaptant que la couche de sortie finale ($198$ paramètres entraînables) avec un faible taux d'apprentissage ($\eta = 10^{-4}$), on calibre le modèle aux spécificités locales sans dégrader ses représentations universelles.

---

### 3. Réponses aux Questions Clés & Vérifications Théoriques

#### Question clé : L'ajustement fin sur deux mois d'hiver aide-t-il à prévoir le printemps ?
- **Réponse :** **Non, pas sur le long terme.**
- **Explication (*Seasonal Covariate Shift*) :** En hiver (janvier-février), l'élévation maximale du soleil ne dépasse pas $48^\circ$ et les journées sont courtes. Réentraîner les poids du modèle sur ce régime hivernal réduit sa capacité à anticiper les fortes élévations estivales ($> 80^\circ$) rencontrées entre avril et juin. Ainsi, le modèle A *zero-shot* (ayant vu toutes les saisons) obtient un gain test de **$0,420$**, contre seulement **$0,380$** pour le fine-tuning complet et **$0,258$** pour le modèle entraîné sur B seul (échec contractuel).

#### Décompte formel des paramètres du MLP de référence (47 entrées, 64 et 32 neurones, 6 sorties) :
- Couche 1 : $47 \times 64 + 64 = 3\,072$
- Couche 2 : $64 \times 32 + 32 = 2\,080$
- Couche sortie : $32 \times 6 + 6 = 198$
- Total absolu : **$5\,350$ paramètres**.

1. **(a) Sans rien geler :** **$5\,350$** paramètres entraînables ($0$ gelé).
2. **(b) En gelant la 1re couche cachée :** **$2\,278$** paramètres entraînables ($3\,072$ gelés).
3. **(c) En gelant les 2 couches cachées :** **$198$** paramètres entraînables ($5\,152$ gelés).
*(Validé programmatiquement par assertions dans le notebook).*

#### Effet de $\lambda$ sur les gradients du tronc commun :
$$\nabla_{\theta_{\text{tronc}}} \mathcal{L}_{\text{MT}} = \nabla_{\theta_{\text{tronc}}} \mathcal{L}_{\text{couv}} + \lambda \cdot \nabla_{\theta_{\text{tronc}}} \mathcal{L}_{\text{occ}}$$
- **$\lambda = 0,3$ (Optimal) :** La tâche d'occultation enrichit la représentation latente partagée en guidant l'attention spatiale du CNN vers la région solaire, agissant comme un biais inductif régularisateur. La MAE de couverture passe de $0,0200$ (mono-tâche) à **$0,0199$**, et l'occultation est maîtrisée (**MAE test $= 0,0748 \le 0,10$**).
- **$\lambda = 3,0$ (Interférence négative) :** Le gradient d'occultation domine par un facteur 3, provoquant un conflit de gradient qui dégrade fortement la couverture nuageuse (**MAE $= 0,0393$**).
