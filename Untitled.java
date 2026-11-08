# Étude de cas 4 : Centrale solaire — SolarDrâa (50 MW)
## Jalon 2 : Voir le ciel et les panneaux — CNN et auto-encodeurs
**M2 SDIA — Advanced Artificial Intelligence · Année universitaire 2026–2027**

### Objectifs et protocole

1. Estimer la couverture nuageuse et l'occultation avec un CNN, puis comparer aux règles simples.
2. Ajouter les estimations aux instants $t$ et $t-1$ au MLP et prédire directement l'occultation à $t+1$ avec la paire $(t-1,t)$.
3. Entraîner un auto-encodeur sur les modules sains, calibrer le seuil à 5 % de fausses alertes et mesurer la détection par défaut.
4. Comparer deux scores d'anomalie et trois tailles de goulot.
5. Vérifier à la main puis par le code les dimensions, paramètres, champs réceptifs et taux de compression.

> **Règle expérimentale :** toutes les comparaisons et tous les choix sont faits sur la validation. Le test réel n'est évalué qu'une fois, dans la cellule finale, après gel des choix. Pour sélectionner l'auto-encodeur sans consulter les défauts du test, la validation saine est complétée par des anomalies synthétiques déterministes servant uniquement de proxy de sélection.

### Exécution Colab

Placez `uc4_siteA.csv`, `uc4_ciel_A.npz` et `uc4_thermographie.npz` dans `MyDrive/SolarProject/`, dans `/content/data/`, ou dans un dossier local `data/`, puis choisissez **Exécuter tout**. La dernière cellule produit `jalon2_artifacts.zip`.


# 1. Environnement et reproductibilité
import os
import sys
import platform
import random
import shutil
from pathlib import Path

SEED = 42
os.environ["PYTHONHASHSEED"] = str(SEED)
os.environ.setdefault("TF_DETERMINISTIC_OPS", "1")
os.environ.setdefault("TF_CUDNN_DETERMINISTIC", "1")

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import sklearn
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, roc_auc_score, roc_curve

random.seed(SEED)
np.random.seed(SEED)
keras.utils.set_random_seed(SEED)
try:
    tf.config.experimental.enable_op_determinism()
except Exception as exc:
    print("Mode déterministe TensorFlow non activé :", exc)

def reset_seed(offset=0):
    value = SEED + int(offset)
    random.seed(value)
    np.random.seed(value)
    keras.utils.set_random_seed(value)

ARTIFACT_DIR = Path.cwd() / "jalon2_artifacts"
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
experiences = []

def journaliser(experience, variante, partition, metrique, valeur, statut, commentaire=""):
    experiences.append({
        "jalon": 2,
        "experience": experience,
        "variante": variante,
        "partition": partition,
        "metrique": metrique,
        "valeur": float(valeur),
        "statut": statut,
        "commentaire": commentaire,
        "seed": SEED,
    })

print("Python             :", platform.python_version())
print("TensorFlow         :", tf.__version__)
print("Keras              :", getattr(keras, "__version__", "intégrée à TensorFlow"))
print("NumPy              :", np.__version__)
print("pandas             :", pd.__version__)
print("scikit-learn       :", sklearn.__version__)
print("Seed               :", SEED)
print("Déterminisme TF    : activé lorsque supporté")


# 2. Chargement autonome des données — local ou Google Drive
required_files = ["uc4_siteA.csv", "uc4_ciel_A.npz", "uc4_thermographie.npz"]

if "google.colab" in sys.modules:
    try:
        from google.colab import drive
        if not Path("/content/drive/MyDrive").exists():
            drive.mount("/content/drive")
    except Exception as exc:
        print("Montage Drive ignoré :", exc)

candidates = [
    Path.cwd() / "data",
    Path("/content/data"),
    Path("/content/drive/MyDrive/SolarProject"),
    Path.cwd(),
]
DATA_DIR = next((p for p in candidates if all((p / f).exists() for f in required_files)), None)
if DATA_DIR is None:
    raise FileNotFoundError(
        "Données introuvables. Placez les trois fichiers dans data/, /content/data/ "
        "ou /content/drive/MyDrive/SolarProject/."
    )
print("Dossier de données :", DATA_DIR.resolve())

df = pd.read_csv(DATA_DIR / "uc4_siteA.csv")
CAPACITE = 50.0
H = 6

def ciel_clair(hauteur):
    alpha = np.maximum(hauteur, 0.0)
    sin_a = np.sin(np.radians(alpha))
    ghi = np.zeros_like(alpha)
    pos = sin_a > 0
    ghi[pos] = 1098.0 * sin_a[pos] * np.exp(-0.057 / sin_a[pos])
    return ghi

df["ghi_cs"] = ciel_clair(df["hauteur_soleil"].values)
df["jour"] = df["hauteur_soleil"].values > 0
df["dt"] = pd.to_datetime(df["horodatage"])

prod_norm = df["production"].values / CAPACITE
ghi_cs_norm = df["ghi_cs"].values / 1000.0
neb = df["nebulosite_prevue"].values
temp_norm = df["temperature_prevue"].values / 40.0
clean_norm = df["jours_depuis_nettoyage"].values / 30.0
h_val = df["dt"].dt.hour.values
doy = df["dt"].dt.dayofyear.values
sin_h = np.sin(2 * np.pi * h_val / 24.0)
cos_h = np.cos(2 * np.pi * h_val / 24.0)
sin_d = np.sin(2 * np.pi * doy / 365.25)
cos_d = np.cos(2 * np.pi * doy / 365.25)

ciel_a = np.load(DATA_DIR / "uc4_ciel_A.npz")
X_ciel = ciel_a["X"][..., None].astype("float32") / 255.0
y_couv = ciel_a["couverture"].astype("float32")
y_occ = ciel_a["occultation"].astype("float32")
Y_ciel = np.column_stack([y_couv, y_occ])
h_ciel = ciel_a["heure"]
t_img = pd.to_datetime(df["horodatage"].values[h_ciel])
tr_c = t_img <= "2024-09-30 23:00:00"
va_c = (t_img >= "2024-10-01 00:00:00") & (t_img <= "2024-12-31 23:00:00")
te_c = t_img >= "2025-01-01 00:00:00"

thermo = np.load(DATA_DIR / "uc4_thermographie.npz")
X_th_tr = thermo["X_train"].astype("float32")
X_th_va = thermo["X_val"].astype("float32")
X_th_te = thermo["X_test"].astype("float32")
y_th_te = thermo["defaut_test"].astype("int32")
mu_th, sd_th = X_th_tr.mean(), X_th_tr.std()
X_th_tr_n = ((X_th_tr - mu_th) / sd_th)[..., None]
X_th_va_n = ((X_th_va - mu_th) / sd_th)[..., None]
X_th_te_n = ((X_th_te - mu_th) / sd_th)[..., None]

print(f"Site A : {len(df)} heures")
print(f"Ciel A : {len(X_ciel)} images — train {tr_c.sum()}, validation {va_c.sum()}, test {te_c.sum()}")
print(f"Thermographie : {len(X_th_tr)} train sains, {len(X_th_va)} validation sains, {len(X_th_te)} test final")


## Question 1 — CNN du ciel et règles simples

Conformément au sujet, la couverture de référence utilise la fraction de pixels dépassant un seuil de luminosité, tandis que l'occultation utilise la luminosité d'un voisinage autour de la position calculée du Soleil. Une régression linéaire calibrée sur le train transforme chacune de ces caractéristiques physiques en estimation $[0,1]$. Le CNN combine un `GlobalAveragePooling2D` pour la couverture diffuse et un `GlobalMaxPooling2D` pour les phénomènes localisés. Dans cette étape, seuls le train et la validation sont mesurés ; le test reste fermé.


# 3. Règles simples officielles et CNN ciel — validation uniquement
PIXEL_CLOUD_THRESHOLD = 0.65

def fraction_pixels_clairs(images):
    # Fraction de pixels lumineux, règle-seuil demandée pour la couverture.
    return np.mean(images[..., 0] >= PIXEL_CLOUD_THRESHOLD, axis=(1, 2))

sun_altitude = df["hauteur_soleil"].values[h_ciel]
sun_azimuth = df["azimut"].values[h_ciel]

def luminosite_point_soleil(images, altitudes, azimuths, patch_radius=1):
    # Luminosité moyenne autour de la position solaire dans la projection hémisphérique.
    center = (images.shape[1] - 1) / 2.0
    max_radius = center
    radial = np.clip((90.0 - altitudes) / 90.0, 0.0, 1.0) * max_radius
    azimuth_rad = np.radians(azimuths)
    x_sun = center + radial * np.sin(azimuth_rad)
    y_sun = center - radial * np.cos(azimuth_rad)
    values = []
    for image, x_coord, y_coord in zip(images[..., 0], x_sun, y_sun):
        x = int(np.clip(round(x_coord), 0, image.shape[1] - 1))
        y = int(np.clip(round(y_coord), 0, image.shape[0] - 1))
        x0, x1 = max(0, x - patch_radius), min(image.shape[1], x + patch_radius + 1)
        y0, y1 = max(0, y - patch_radius), min(image.shape[0], y + patch_radius + 1)
        values.append(float(image[y0:y1, x0:x1].mean()))
    return np.asarray(values)

coverage_feature = fraction_pixels_clairs(X_ciel)
sun_feature = luminosite_point_soleil(X_ciel, sun_altitude, sun_azimuth)
reg_couv = LinearRegression().fit(coverage_feature[tr_c, None], y_couv[tr_c])
reg_occ = LinearRegression().fit(sun_feature[tr_c, None], y_occ[tr_c])
pred_couv_heur_va = np.clip(reg_couv.predict(coverage_feature[va_c, None]), 0, 1)
pred_occ_heur_va = np.clip(reg_occ.predict(sun_feature[va_c, None]), 0, 1)

def build_cnn_ciel():
    inp = layers.Input(shape=(32, 32, 1), name="input_ciel")
    x = layers.Conv2D(16, 3, activation="relu", padding="same", name="conv1")(inp)
    x = layers.MaxPooling2D(2, name="pool1")(x)
    x = layers.Conv2D(32, 3, activation="relu", padding="same", name="conv2")(x)
    x = layers.MaxPooling2D(2, name="pool2")(x)
    x = layers.Conv2D(64, 3, activation="relu", padding="same", name="conv3")(x)
    gap = layers.GlobalAveragePooling2D(name="global_avg_pool")(x)
    gmp = layers.GlobalMaxPooling2D(name="global_max_pool")(x)
    dense = layers.Dense(32, activation="relu", name="dense_feat")(
        layers.Concatenate(name="concat_pool")([gap, gmp])
    )
    out = layers.Dense(2, activation="sigmoid", name="output_ciel")(dense)
    return models.Model(inp, out, name="CNN_Ciel")

reset_seed(1)
cnn_ciel = build_cnn_ciel()
cnn_ciel.summary()
cnn_ciel.compile(optimizer=keras.optimizers.Adam(1e-3), loss="mse", metrics=["mae"])
history_ciel = cnn_ciel.fit(
    X_ciel[tr_c], Y_ciel[tr_c],
    validation_data=(X_ciel[va_c], Y_ciel[va_c]),
    epochs=15, batch_size=64, verbose=1,
)

# Les prédictions de test sont créées comme caractéristiques de déploiement,
# mais aucune étiquette de test n'est consultée avant la cellule finale.
preds_ciel_all = cnn_ciel.predict(X_ciel, batch_size=128, verbose=0)
preds_ciel_va = preds_ciel_all[va_c]

df_ciel_val = pd.DataFrame([
    ["Règle simple", "Couverture", mean_absolute_error(y_couv[va_c], pred_couv_heur_va)],
    ["CNN Dual Pooling", "Couverture", mean_absolute_error(y_couv[va_c], preds_ciel_va[:, 0])],
    ["Règle simple", "Occultation", mean_absolute_error(y_occ[va_c], pred_occ_heur_va)],
    ["CNN Dual Pooling", "Occultation", mean_absolute_error(y_occ[va_c], preds_ciel_va[:, 1])],
], columns=["Méthode", "Grandeur", "MAE validation"])
print(df_ciel_val.round(4).to_string(index=False))

for methode, grandeur, valeur in df_ciel_val.itertuples(index=False, name=None):
    journaliser("cnn_ciel", f"{methode}_{grandeur}", "validation", "MAE", valeur, "comparé")


## Question 2 — Prévision enrichie et paire d'images

Le MLP enrichi reçoit quatre variables supplémentaires : couverture et occultation estimées aux instants $t$ et $t-1$. Le CNN spatio-temporel reçoit la paire d'images comme deux canaux. Les choix sont encore effectués uniquement sur la validation.


# 4. MLP de prévision : 47 variables vs 51 variables visuelles
N_ser = len(df)
ligne_vers_image = np.full(N_ser, -1)
ligne_vers_image[h_ciel] = np.arange(len(h_ciel))
X_base_l, X_cnn_l, Y_mlp_l, J_mlp_l, T_mlp_l = [], [], [], [], []

for t in range(24, N_ser - H):
    hist = prod_norm[t-23:t+1]
    cs = ghi_cs_norm[t+1:t+1+H]
    nb = neb[t+1:t+1+H]
    tp = temp_norm[t+1:t+1+H]
    base_f = np.concatenate([
        hist, cs, nb, tp,
        [sin_h[t], cos_h[t], sin_d[t], cos_d[t]],
        [clean_norm[t]],
    ])
    it, itm1 = ligne_vers_image[t], ligne_vers_image[t-1]
    f_t = preds_ciel_all[it] if it >= 0 else np.zeros(2, dtype=np.float32)
    f_tm1 = preds_ciel_all[itm1] if itm1 >= 0 else np.zeros(2, dtype=np.float32)
    X_base_l.append(base_f)
    X_cnn_l.append(np.concatenate([base_f, f_t, f_tm1]))
    Y_mlp_l.append(prod_norm[t+1:t+1+H])
    J_mlp_l.append(df["jour"].values[t+1:t+1+H])
    T_mlp_l.append(df["dt"].values[t])

X_base = np.asarray(X_base_l, dtype=np.float32)
X_cnn = np.asarray(X_cnn_l, dtype=np.float32)
Y_mlp = np.asarray(Y_mlp_l, dtype=np.float32)
J_mlp = np.asarray(J_mlp_l, dtype=bool)
T_mlp = pd.to_datetime(T_mlp_l)
tr_mlp = np.where(T_mlp <= "2024-09-30 23:00:00")[0]
va_mlp = np.where((T_mlp >= "2024-10-01") & (T_mlp <= "2024-12-31 23:00:00"))[0]
te_mlp = np.where(T_mlp >= "2025-01-01")[0]

ref_pi = np.zeros_like(Y_mlp)
ghi_cs_raw = df["ghi_cs"].values
indices = np.arange(24, N_ser - H)
for h_step in range(H):
    p_t = prod_norm[indices]
    ratio = np.zeros_like(p_t)
    mask = ghi_cs_raw[indices] > 10.0
    ratio[mask] = p_t[mask] / ghi_cs_raw[indices][mask]
    ref_pi[:, h_step] = np.clip(ratio * ghi_cs_raw[indices + 1 + h_step], 0.0, 1.0)

def rmse_h(y_true, y_pred, daylight):
    values = []
    for h_step in range(H):
        mask = daylight[:, h_step]
        error = (y_true[mask, h_step] - y_pred[mask, h_step]) * CAPACITE
        values.append(np.sqrt(np.mean(error ** 2)))
    return np.asarray(values)

def gains(y_true, y_pred, daylight, reference):
    return 1.0 - rmse_h(y_true, y_pred, daylight) / rmse_h(y_true, reference, daylight)

def train_mlp(X, name, offset):
    reset_seed(offset)
    inp = layers.Input(shape=(X.shape[1],))
    x = layers.Dense(64, activation="relu")(inp)
    x = layers.Dropout(0.1)(x)
    x = layers.Dense(32, activation="relu")(x)
    x = layers.Dropout(0.1)(x)
    out = layers.Dense(H, activation="sigmoid")(x)
    model = models.Model(inp, out, name=name)
    model.compile(optimizer=keras.optimizers.Adam(1e-3), loss="mse")
    history = model.fit(
        X[tr_mlp], Y_mlp[tr_mlp],
        validation_data=(X[va_mlp], Y_mlp[va_mlp]),
        epochs=30, batch_size=64, verbose=0,
    )
    return model, history

m_base, history_mlp_base = train_mlp(X_base, "MLP_Base_47", 10)
m_cnn, history_mlp_cnn = train_mlp(X_cnn, "MLP_Enrichi_CNN_51", 11)
p_base_va = m_base.predict(X_base[va_mlp], verbose=0)
p_cnn_va = m_cnn.predict(X_cnn[va_mlp], verbose=0)
g_base_va = gains(Y_mlp[va_mlp], p_base_va, J_mlp[va_mlp], ref_pi[va_mlp])
g_cnn_va = gains(Y_mlp[va_mlp], p_cnn_va, J_mlp[va_mlp], ref_pi[va_mlp])

print("--- VALIDATION : GAINS PAR HORIZON ---")
for h_idx in range(H):
    print(f"t+{h_idx+1}: base={g_base_va[h_idx]*100:.2f}% | CNN={g_cnn_va[h_idx]*100:.2f}%")
print(f"Moyenne 6 h: base={g_base_va.mean()*100:.2f}% | CNN={g_cnn_va.mean()*100:.2f}%")

mlp_retenu_nom = "MLP enrichi 51 variables" if g_cnn_va[0] >= g_base_va[0] else "MLP base 47 variables"
mlp_retenu = m_cnn if g_cnn_va[0] >= g_base_va[0] else m_base
X_mlp_retenu = X_cnn if g_cnn_va[0] >= g_base_va[0] else X_base
print("Choix gelé avant test :", mlp_retenu_nom)

for name, values in [("MLP_base_47", g_base_va), ("MLP_enrichi_51", g_cnn_va)]:
    journaliser("prevision_6h", name, "validation", "gain_t1", values[0], "retenu" if name in mlp_retenu_nom.replace(" ", "_") else "comparé")
    journaliser("prevision_6h", name, "validation", "gain_t6", values[-1], "comparé")
    journaliser("prevision_6h", name, "validation", "gain_moyen", values.mean(), "comparé")


# 5. CNN sur la paire (t-1, t) — validation uniquement
pairs_X, targets_tp1, occ_t_base, t_p = [], [], [], []
for t in range(1, N_ser - 1):
    i_tm1, i_t, i_tp1 = ligne_vers_image[t-1], ligne_vers_image[t], ligne_vers_image[t+1]
    if i_tm1 >= 0 and i_t >= 0 and i_tp1 >= 0:
        pairs_X.append(np.concatenate([X_ciel[i_tm1], X_ciel[i_t]], axis=-1))
        targets_tp1.append(y_occ[i_tp1])
        occ_t_base.append(y_occ[i_t])
        t_p.append(df["horodatage"].iloc[t])

pairs_X = np.asarray(pairs_X, dtype=np.float32)
targets_tp1 = np.asarray(targets_tp1, dtype=np.float32)
occ_t_base = np.asarray(occ_t_base, dtype=np.float32)
t_p = pd.to_datetime(t_p)
tr_p = t_p <= "2024-09-30 23:00:00"
va_p = (t_p >= "2024-10-01") & (t_p <= "2024-12-31 23:00:00")
te_p = t_p >= "2025-01-01"

def build_cnn_paire():
    inp = layers.Input(shape=(32, 32, 2))
    x = layers.Conv2D(16, 3, activation="relu", padding="same")(inp)
    x = layers.MaxPooling2D(2)(x)
    x = layers.Conv2D(32, 3, activation="relu", padding="same")(x)
    x = layers.MaxPooling2D(2)(x)
    x = layers.Conv2D(64, 3, activation="relu", padding="same")(x)
    merged = layers.Concatenate()([
        layers.GlobalAveragePooling2D()(x),
        layers.GlobalMaxPooling2D()(x),
    ])
    out = layers.Dense(1, activation="sigmoid")(layers.Dense(32, activation="relu")(merged))
    return models.Model(inp, out, name="CNN_Paire_SpatioTemporel")

reset_seed(20)
cnn_paire = build_cnn_paire()
cnn_paire.compile(optimizer=keras.optimizers.Adam(1e-3), loss="mse", metrics=["mae"])
history_paire = cnn_paire.fit(
    pairs_X[tr_p], targets_tp1[tr_p],
    validation_data=(pairs_X[va_p], targets_tp1[va_p]),
    epochs=15, batch_size=64, verbose=0,
)
p_p_va = cnn_paire.predict(pairs_X[va_p], verbose=0).ravel()
mae_pair_va = mean_absolute_error(targets_tp1[va_p], p_p_va)
mae_pers_va = mean_absolute_error(targets_tp1[va_p], occ_t_base[va_p])
paire_retenue = mae_pair_va <= mae_pers_va
print(f"Validation : CNN paire MAE={mae_pair_va:.4f} | persistance MAE={mae_pers_va:.4f}")
print("Choix gelé avant test :", "CNN paire" if paire_retenue else "persistance")
journaliser("occultation_t1", "CNN_paire", "validation", "MAE", mae_pair_va, "retenu" if paire_retenue else "non_retenu")
journaliser("occultation_t1", "persistance", "validation", "MAE", mae_pers_va, "retenu" if not paire_retenue else "référence")


## Questions 3 et 4 — Auto-encodeur thermique

Le seuil est toujours le 95e percentile des scores sur les modules sains de validation. Pour respecter le test caché, les tailles de goulot et les scores sont comparés sur un proxy de validation : des anomalies localisées, déterministes et documentées sont injectées dans des copies des modules sains. Cette validation synthétique ne remplace pas le test réel ; elle sert uniquement à geler le choix avant son ouverture.


# 6. Sélection validation-only de l'auto-encodeur
def build_ae(latent_dim=32):
    inp = layers.Input(shape=(24, 40, 1))
    x = layers.Conv2D(16, 3, strides=2, padding="same", activation="relu")(inp)
    x = layers.Conv2D(32, 3, strides=2, padding="same", activation="relu")(x)
    x = layers.Flatten()(x)
    latent = layers.Dense(latent_dim, activation="relu", name="bottleneck")(x)
    x = layers.Dense(6 * 10 * 32, activation="relu")(latent)
    x = layers.Reshape((6, 10, 32))(x)
    x = layers.Conv2DTranspose(16, 3, strides=2, padding="same", activation="relu")(x)
    out = layers.Conv2DTranspose(1, 3, strides=2, padding="same")(x)
    model = models.Model(inp, out, name=f"AE_lat_{latent_dim}")
    model.compile(optimizer=keras.optimizers.Adam(1e-3), loss="mse")
    return model

def inject_synthetic_defects(base_images, defect_type, seed):
    rng = np.random.default_rng(seed)
    altered = base_images.copy()
    for image in altered:
        if defect_type == 1:  # hotspot local
            r, c = rng.integers(3, 21), rng.integers(3, 37)
            image[r-2:r+2, c-2:c+2, 0] += 3.5
        elif defect_type == 2:  # fissure fine
            r0, c0 = rng.integers(3, 13), rng.integers(3, 25)
            for k in range(10):
                image[r0+k, c0+k, 0] += 3.0
        elif defect_type == 3:  # bande de diodes
            r = rng.integers(4, 20)
            image[r-1:r+2, 5:35, 0] += 2.5
        elif defect_type == 4:  # sous-module
            r, c = rng.integers(2, 16), rng.integers(2, 27)
            image[r:r+7, c:c+12, 0] += 2.0
    return altered

proxy_base = X_th_va_n[len(X_th_va_n)//2:]
proxy_parts = [X_th_va_n[:len(X_th_va_n)//2]]
proxy_labels = [np.zeros(len(proxy_parts[0]), dtype=int)]
for defect_type in range(1, 5):
    proxy_parts.append(inject_synthetic_defects(proxy_base, defect_type, SEED + defect_type))
    proxy_labels.append(np.full(len(proxy_base), defect_type, dtype=int))
X_proxy_val = np.concatenate(proxy_parts)
y_proxy_val = np.concatenate(proxy_labels)
y_proxy_bin = (y_proxy_val > 0).astype(int)

# Référence thermographique du sujet : maximum moins médiane.
def seuil_5FA(scores_sains):
    # Seuil fixé exclusivement sur la validation saine pour viser 5 % de fausses alertes.
    return float(np.percentile(scores_sains, 95))

def score_max_moins_mediane(images):
    flat = images.reshape(len(images), -1)
    return np.max(flat, axis=1) - np.median(flat, axis=1)

score_ref_healthy = score_max_moins_mediane(X_th_va_n)
score_ref_proxy = score_max_moins_mediane(X_proxy_val)
seuil_ref_thermo = seuil_5FA(score_ref_healthy)
auc_ref_proxy = roc_auc_score(y_proxy_bin, score_ref_proxy)
detection_ref_proxy = np.mean(score_ref_proxy[y_proxy_bin == 1] > seuil_ref_thermo)
journaliser(
    "thermographie_reference", "maximum_moins_mediane", "validation_proxy",
    "AUC", auc_ref_proxy, "référence",
    "Règle simple fournie par le sujet",
)
print(
    f"Référence maximum-médiane — AUC proxy={auc_ref_proxy:.4f}, "
    f"détection proxy={100*detection_ref_proxy:.1f}%, seuil={seuil_ref_thermo:.4f}"
)

ae_models = {}
ae_histories = {}
ae_rows = []
ae_thresholds = {}

for latent_dim in [16, 32, 128]:
    reset_seed(100 + latent_dim)
    model = build_ae(latent_dim)
    history = model.fit(
        X_th_tr_n, X_th_tr_n,
        validation_data=(X_th_va_n, X_th_va_n),
        epochs=15, batch_size=64, verbose=0,
    )
    rec_healthy = model.predict(X_th_va_n, verbose=0)
    rec_proxy = model.predict(X_proxy_val, verbose=0)
    ae_models[latent_dim] = model
    ae_histories[latent_dim] = history
    for score_name, reducer in [
        ("mse", lambda x: np.mean(x, axis=(1, 2, 3))),
        ("max", lambda x: np.max(x, axis=(1, 2, 3))),
    ]:
        scores_healthy = reducer((X_th_va_n - rec_healthy) ** 2)
        scores_proxy = reducer((X_proxy_val - rec_proxy) ** 2)
        threshold = seuil_5FA(scores_healthy)
        auc_proxy = roc_auc_score(y_proxy_bin, scores_proxy)
        detection_proxy = np.mean(scores_proxy[y_proxy_bin == 1] > threshold)
        ae_thresholds[(latent_dim, score_name)] = threshold
        ae_rows.append({
            "goulot": latent_dim,
            "score": score_name,
            "auc_validation_proxy": auc_proxy,
            "detection_validation_proxy": detection_proxy,
            "seuil_5FA": threshold,
            "val_loss_finale": history.history["val_loss"][-1],
        })

df_ae_val = pd.DataFrame(ae_rows)
best_auc = df_ae_val["auc_validation_proxy"].max()
eligible = df_ae_val[df_ae_val["auc_validation_proxy"] >= best_auc - 0.002].copy()
eligible["priorite_local"] = (eligible["score"] == "max").astype(int)
eligible["distance_32"] = (np.log2(eligible["goulot"] / 32).abs())
selected = eligible.sort_values(
    ["priorite_local", "distance_32", "auc_validation_proxy"],
    ascending=[False, True, False],
).iloc[0]

latent_retenu = int(selected["goulot"])
score_retenu = str(selected["score"])
seuil_retenu = float(selected["seuil_5FA"])
ae_retenu = ae_models[latent_retenu]

print(df_ae_val.round(4).to_string(index=False))
print(f"\nChoix gelé avant test : goulot={latent_retenu}, score={score_retenu}, seuil={seuil_retenu:.4f}")

for row in df_ae_val.itertuples(index=False):
    is_selected = row.goulot == latent_retenu and row.score == score_retenu
    journaliser(
        "autoencodeur", f"goulot_{row.goulot}_score_{row.score}", "validation_proxy",
        "AUC", row.auc_validation_proxy, "retenu" if is_selected else "non_retenu",
        "Sélection sans consultation du test réel",
    )


## Vérifications théoriques et décisions avant test

### CNN du ciel

- `Conv2D(16, 3×3, same)` : $32×32×16$, 160 paramètres.
- `MaxPool(2×2)` : $16×16×16$.
- `Conv2D(32, 3×3, same)` : $16×16×32$, 4 640 paramètres.
- `MaxPool(2×2)` : $8×8×32$.
- `Conv2D(64, 3×3, same)` : $8×8×64$, 18 496 paramètres.
- Double pooling : 128 valeurs ; `Dense(32)` : 4 128 paramètres ; sortie : 66 paramètres.
- Total : **27 490 paramètres**.
- Champs réceptifs successifs : $3$, $4$, $8$, $10$, puis $18$ pixels ; le pooling global couvre l'image $32×32$. Le soleil ($3$ à $5$ pixels) et les nuages ($10$ à $30$ pixels) sont donc couverts à différentes profondeurs.

### Auto-encodeur thermique

- $24×40×1 \rightarrow 12×20×16 \rightarrow 6×10×32$.
- Le tenseur convolutif contient 1 920 valeurs. Un goulot de 32 donne une compression de **60×** depuis ce tenseur et de **30×** depuis les 960 pixels d'entrée.

### Justifications demandées

1. **Sans goulot étroit**, l'auto-encodeur peut apprendre une quasi-identité et reconstruire également les défauts ; l'erreur d'anomalie devient trop faible.
2. **L'erreur maximale** conserve le signal d'un défaut localisé qu'une moyenne sur 960 pixels diluerait.
3. **Le seuil est calibré sur la validation saine** pour garantir environ 5 % de fausses alertes sans utiliser le test final.


# 7. Vérification programmatique des calculs théoriques
params_theoriques = (
    (3 * 3 * 1 + 1) * 16
    + (3 * 3 * 16 + 1) * 32
    + (3 * 3 * 32 + 1) * 64
    + (128 * 32 + 32)
    + (32 * 2 + 2)
)
params_reels = cnn_ciel.count_params()
assert params_theoriques == params_reels == 27490

taille_entree = 24 * 40
taille_conv1 = 12 * 20 * 16
taille_conv2 = 6 * 10 * 32
assert ae_retenu.input_shape[1:] == (24, 40, 1)

print("Paramètres CNN :", params_theoriques, "=", params_reels)
print("Après Conv1 : 12 × 20 × 16 =", taille_conv1)
print("Après Conv2 :  6 × 10 × 32 =", taille_conv2)
print("Compression avec goulot 32 :", taille_conv2 / 32, "× depuis le tenseur conv")
print("Compression avec goulot 32 :", taille_entree / 32, "× depuis l'image")


## Évaluation finale — ouverture unique du test

Les architectures, scores et seuils sont maintenant gelés. La cellule suivante ouvre le test une seule fois pour chaque tâche retenue, produit les figures réellement issues du notebook, écrit le journal d'expériences et génère la page de décisions.


# 8. ÉVALUATION FINALE — ne pas exécuter avant d'avoir gelé les choix ci-dessus

# 8.1 CNN du ciel retenu
preds_ciel_te = preds_ciel_all[te_c]
pred_couv_heur_te = np.clip(
    reg_couv.predict(coverage_feature[te_c, None]), 0, 1
)
pred_occ_heur_te = np.clip(
    reg_occ.predict(sun_feature[te_c, None]), 0, 1
)
sky_test = {
    "couverture_heur": mean_absolute_error(y_couv[te_c], pred_couv_heur_te),
    "couverture_cnn": mean_absolute_error(y_couv[te_c], preds_ciel_te[:, 0]),
    "occultation_heur": mean_absolute_error(y_occ[te_c], pred_occ_heur_te),
    "occultation_cnn": mean_absolute_error(y_occ[te_c], preds_ciel_te[:, 1]),
}

# 8.2 MLP retenu
p_mlp_te = mlp_retenu.predict(X_mlp_retenu[te_mlp], verbose=0)
g_mlp_te = gains(Y_mlp[te_mlp], p_mlp_te, J_mlp[te_mlp], ref_pi[te_mlp])

# 8.3 Méthode retenue pour l'occultation t+1
if paire_retenue:
    p_pair_te = cnn_paire.predict(pairs_X[te_p], verbose=0).ravel()
    mae_occ_test = mean_absolute_error(targets_tp1[te_p], p_pair_te)
    methode_occ_test = "CNN paire"
else:
    mae_occ_test = mean_absolute_error(targets_tp1[te_p], occ_t_base[te_p])
    methode_occ_test = "persistance"

# 8.4 Auto-encodeur et score retenus
rec_test = ae_retenu.predict(X_th_te_n, verbose=0)
sq_error_test = (X_th_te_n - rec_test) ** 2
if score_retenu == "max":
    anomaly_test = np.max(sq_error_test, axis=(1, 2, 3))
else:
    anomaly_test = np.mean(sq_error_test, axis=(1, 2, 3))
y_test_binary = (y_th_te > 0).astype(int)
auc_ae_test = roc_auc_score(y_test_binary, anomaly_test)
detection_test = {
    defect: np.mean(anomaly_test[y_th_te == defect] > seuil_retenu)
    for defect in range(1, 5)
}
false_alert_test = np.mean(anomaly_test[y_th_te == 0] > seuil_retenu)

# Référence thermographique fixe, évaluée elle aussi une seule fois à la fin.
score_ref_test = score_max_moins_mediane(X_th_te_n)
auc_ref_test = roc_auc_score(y_test_binary, score_ref_test)

print("=== RÉSULTATS FINAUX SUR TEST ===")
print("CNN ciel :", {k: round(v, 4) for k, v in sky_test.items()})
print("MLP retenu :", mlp_retenu_nom)
print("Gains test t+1...t+6 :", np.round(g_mlp_te, 4))
print(f"Occultation t+1 — {methode_occ_test}: MAE={mae_occ_test:.4f}")
print(f"AE retenu : goulot={latent_retenu}, score={score_retenu}, AUC test={auc_ae_test:.4f}")
print(f"Référence thermo maximum-médiane : AUC test={auc_ref_test:.4f}")
print("Détection test par défaut :", {k: round(v, 4) for k, v in detection_test.items()})
print(f"Fausses alertes test : {false_alert_test*100:.2f}%")

# Journal final
for key, value in sky_test.items():
    journaliser("cnn_ciel", key, "test_final", "MAE", value, "final")
for h_idx, value in enumerate(g_mlp_te, start=1):
    journaliser("prevision_6h", mlp_retenu_nom, "test_final", f"gain_t{h_idx}", value, "final")
journaliser("occultation_t1", methode_occ_test, "test_final", "MAE", mae_occ_test, "final")
journaliser("autoencodeur", f"goulot_{latent_retenu}_score_{score_retenu}", "test_final", "AUC", auc_ae_test, "final")
journaliser("thermographie_reference", "maximum_moins_mediane", "test_final", "AUC", auc_ref_test, "référence")
for defect, value in detection_test.items():
    journaliser("autoencodeur", f"defaut_{defect}", "test_final", "taux_detection", value, "final")

df_journal = pd.DataFrame(experiences)
journal_path = ARTIFACT_DIR / "journal_experiences_jalon2.csv"
df_journal.to_csv(journal_path, index=False)

# Figure réelle : exemples caméra issus du test et prédictions du CNN
test_indices = np.flatnonzero(te_c)
candidate_local = [
    int(np.argmin(y_couv[te_c])),
    int(np.argmin(np.abs(y_couv[te_c] - 0.50))),
    int(np.argmax(y_couv[te_c])),
    int(np.argmax(y_occ[te_c])),
]
selected_global = []
for local_idx in candidate_local:
    global_idx = int(test_indices[local_idx])
    if global_idx not in selected_global:
        selected_global.append(global_idx)
for global_idx in test_indices:
    if len(selected_global) == 4:
        break
    if int(global_idx) not in selected_global:
        selected_global.append(int(global_idx))

fig, axes = plt.subplots(1, 4, figsize=(16, 4.2))
for ax, idx in zip(axes, selected_global):
    ax.imshow(X_ciel[idx, :, :, 0], cmap="Blues_r", vmin=0, vmax=1)
    ax.set_title(
        f"Couv. vraie {y_couv[idx]:.2f} | préd. {preds_ciel_all[idx,0]:.2f}\n"
        f"Occ. vraie {y_occ[idx]:.2f} | préd. {preds_ciel_all[idx,1]:.2f}",
        fontsize=9,
    )
    ax.axis("off")
fig.suptitle("Exemples réels du test — CNN ciel", fontsize=14, fontweight="bold")
plt.tight_layout()
camera_figure_path = ARTIFACT_DIR / "jalon2_camera_examples_notebook.png"
plt.savefig(camera_figure_path, dpi=180, bbox_inches="tight")
plt.show()

# Figure de synthèse produite par le notebook
fig, axes = plt.subplots(1, 3, figsize=(18, 5))
labels = ["Couverture", "Occultation"]
heur = [sky_test["couverture_heur"], sky_test["occultation_heur"]]
cnn = [sky_test["couverture_cnn"], sky_test["occultation_cnn"]]
x = np.arange(2)
axes[0].bar(x - 0.18, heur, 0.36, label="Règle simple")
axes[0].bar(x + 0.18, cnn, 0.36, label="CNN")
axes[0].set_xticks(x, labels)
axes[0].set_ylabel("MAE test final")
axes[0].set_title("CNN ciel vs règles")
axes[0].legend()
axes[0].grid(axis="y", alpha=0.3)

defect_labels = ["Hotspot", "Fissure", "Diodes", "Sous-module"]
det_values = [100 * detection_test[d] for d in range(1, 5)]
axes[1].bar(defect_labels, det_values, color="#27ae60")
axes[1].axhline(85, color="red", linestyle="--", label="Cible fissures 85 %")
axes[1].set_ylim(0, 105)
axes[1].set_ylabel("Détection test (%)")
axes[1].set_title(
    f"AE goulot {latent_retenu} · {score_retenu}\n"
    f"AUC AE={auc_ae_test:.3f} · réf. max−médiane={auc_ref_test:.3f}"
)
axes[1].legend()
axes[1].grid(axis="y", alpha=0.3)

axes[2].bar(np.arange(H) - 0.18, 100 * g_base_va, 0.36, label="MLP base · validation")
axes[2].bar(np.arange(H) + 0.18, 100 * g_cnn_va, 0.36, label="MLP + CNN · validation")
axes[2].axhline(12, color="red", linestyle="--", label="Cible t+1")
axes[2].set_xticks(np.arange(H), [f"t+{i}" for i in range(1, 7)])
axes[2].set_ylabel("Gain (%)")
axes[2].set_title(f"Test final retenu : t+1={100*g_mlp_te[0]:.1f}%")
axes[2].legend(fontsize=8)
axes[2].grid(axis="y", alpha=0.3)
plt.tight_layout()
summary_figure_path = ARTIFACT_DIR / "jalon2_resultats_finaux_notebook.png"
plt.savefig(summary_figure_path, dpi=180, bbox_inches="tight")
plt.show()

# Page de décisions dynamique
decision_text = f'''# Jalon 2 — Page de décisions

## Protocole

- Seed : {SEED}; sélection sur validation uniquement.
- Le test réel est ouvert une fois dans la cellule finale après gel des choix.
- Le proxy synthétique thermique sert uniquement à sélectionner le goulot et le score, jamais à annoncer la performance finale.

## Choix retenus

| Tâche | Choix | Validation | Test final |
|---|---|---:|---:|
| État du ciel | CNN Dual Pooling | MAE couverture {df_ciel_val.iloc[1,2]:.4f}; occultation {df_ciel_val.iloc[3,2]:.4f} | MAE couverture {sky_test['couverture_cnn']:.4f}; occultation {sky_test['occultation_cnn']:.4f} |
| Prévision | {mlp_retenu_nom} | gain t+1 {100*max(g_base_va[0], g_cnn_va[0]):.2f}%; t+6 {100*max(g_base_va[5], g_cnn_va[5]):.2f}% | gain t+1 {100*g_mlp_te[0]:.2f}%; t+6 {100*g_mlp_te[5]:.2f}% |
| Occultation t+1 | {methode_occ_test} | MAE {min(mae_pair_va, mae_pers_va):.4f} | MAE {mae_occ_test:.4f} |
| Thermographie | AE goulot {latent_retenu}, score {score_retenu} | AUC proxy {selected['auc_validation_proxy']:.4f} | AUC {auc_ae_test:.4f} |
| Référence thermographie | Maximum − médiane | AUC proxy {auc_ref_proxy:.4f} | AUC {auc_ref_test:.4f} |

## Écarts aux cibles du sujet

| Cible PDF | Résultat test final | Verdict |
|---|---:|---|
| Gain Site A à t+1 ≥ 12 % | {100*g_mlp_te[0]:.2f} % | {'atteinte' if g_mlp_te[0] >= 0.12 else 'non atteinte'} |
| MAE occultation t+1 ≤ 0,10 | {mae_occ_test:.4f} | {'atteinte' if mae_occ_test <= 0.10 else 'non atteinte'} |
| AUC thermique ≥ 0,98 | {auc_ae_test:.4f} | {'atteinte' if auc_ae_test >= 0.98 else 'non atteinte'} |
| Détection fissures à 5 % FA ≥ 85 % | {100*detection_test[2]:.2f} % | {'atteinte' if detection_test[2] >= 0.85 else 'non atteinte'} |

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
'''
decision_path = ARTIFACT_DIR / "PAGE_DE_DECISIONS_JALON2.md"
decision_path.write_text(decision_text, encoding="utf-8")

print("\nArtefacts écrits :")
for path in [journal_path, decision_path, camera_figure_path, summary_figure_path]:
    print(" -", path)


# 9. Paquet à télécharger depuis Colab
archive_base = Path.cwd() / "jalon2_artifacts"
archive_path = shutil.make_archive(str(archive_base), "zip", root_dir=ARTIFACT_DIR)
print("Archive prête :", archive_path)
print("Téléchargez aussi ce notebook après Exécuter tout, puis renvoyez les deux fichiers.")
