import os
import warnings
from functools import lru_cache
import numpy as np
import pandas as pd
from PIL import Image

DATA_DIR = "data" if os.path.exists("data/uc4_siteA.csv") else "../data_UC4"
CAPACITE = {"A": 50.0, "B": 20.0}
H = 6

def ciel_clair(hauteur):
    alpha = np.maximum(hauteur, 0.0)
    sin_a = np.sin(np.radians(alpha))
    ghi = np.zeros_like(alpha)
    pos = sin_a > 0
    ghi[pos] = 1098.0 * sin_a[pos] * np.exp(-0.057 / sin_a[pos])
    return ghi

@lru_cache(maxsize=4)
def load_site_data(site="A"):
    path = os.path.join(DATA_DIR, f"uc4_site{site}.csv")
    if not os.path.exists(path):
        alt_path = f"data_UC4/uc4_site{site}.csv"
        path = alt_path if os.path.exists(alt_path) else path
    df = pd.read_csv(path)
    df["horodatage"] = pd.to_datetime(df["horodatage"])
    df["ghi_cs"] = ciel_clair(df["hauteur_soleil"].values)
    df["jour"] = df["hauteur_soleil"].values > 0
    return df

@lru_cache(maxsize=8)
def load_experiments(jalon_num):
    path = f"experiments/journal_experiences_jalon{jalon_num}.csv"
    if os.path.exists(path):
        return pd.read_csv(path)
    return pd.DataFrame()

@lru_cache(maxsize=2)
def load_ciel_data(max_samples=2000):
    path = os.path.join(DATA_DIR, "uc4_ciel_A.npz")
    if not os.path.exists(path):
        path = "data_UC4/uc4_ciel_A.npz"
    if not os.path.exists(path):
        return None
    data = np.load(path)
    n = min(len(data["heure"]), max_samples)
    return {
        "X": data["X"][:n],
        "heure": data["heure"][:n],
        "couverture": data["couverture"][:n],
        "occultation": data["occultation"][:n]
    }

@lru_cache(maxsize=2)
def load_thermographie_data():
    path = os.path.join(DATA_DIR, "uc4_thermographie.npz")
    if not os.path.exists(path):
        path = "data_UC4/uc4_thermographie.npz"
    if not os.path.exists(path):
        return None
    data = np.load(path)
    return {
        "X_train": data["X_train"],
        "X_val": data["X_val"],
        "X_test": data["X_test"],
        "defaut_test": data["defaut_test"]
    }

@lru_cache(maxsize=1)
def load_keras_model():
    model_path = "models/modele_recurrent_solaire_jalon4.keras"
    if not os.path.exists(model_path):
        model_path = "modele_recurrent_solaire_jalon4.keras"
    if not os.path.exists(model_path):
        return None
    try:
        import keras
        model = keras.models.load_model(model_path)
        return model
    except Exception as e:
        warnings.warn(f"Impossible de charger le modèle Keras: {e}")
        return None

@lru_cache(maxsize=1)
def load_cnn_ciel_model():
    path = "models/cnn_ciel.keras"
    if not os.path.exists(path):
        return None
    try:
        import keras
        return keras.models.load_model(path)
    except Exception:
        return None

@lru_cache(maxsize=1)
def load_autoencoder_model():
    path = "models/autoencodeur_thermographie.keras"
    if not os.path.exists(path):
        return None
    try:
        import keras
        return keras.models.load_model(path)
    except Exception:
        return None

@lru_cache(maxsize=1)
def load_thermographie_stats():
    path = "models/thermographie_stats.npz"
    if os.path.exists(path):
        stats = np.load(path)
        return float(stats["mean"]), float(stats["std"])
    return 47.58, 4.48

def infer_thermal_image(img_input):
    """
    Accepte une image PIL ou un tableau NumPy 2D (24, 40) et retourne:
    - original_2d (24, 40)
    - recon_2d (24, 40)
    - diff_2d (24, 40)
    - mse (float)
    - max_err (float)
    - is_anomaly (bool)
    """
    model = load_autoencoder_model()
    mean_th, std_th = load_thermographie_stats()

    if isinstance(img_input, Image.Image):
        # Resize to (40, 24) -> (width=40, height=24)
        gray = img_input.convert("L").resize((40, 24), Image.Resampling.BILINEAR)
        arr = np.array(gray, dtype=np.float32)
        # Scale to realistic thermal range [30, 60]°C
        arr = (arr / 255.0) * 35.0 + 30.0
    else:
        arr = np.array(img_input, dtype=np.float32)
        if arr.shape != (24, 40):
            pil = Image.fromarray(arr).resize((40, 24))
            arr = np.array(pil, dtype=np.float32)

    # Normalize
    arr_norm = (arr - mean_th) / std_th
    tensor = arr_norm.reshape(1, 24, 40, 1)

    if model is not None:
        recon_norm = model.predict(tensor, verbose=0)[0, :, :, 0]
        recon = recon_norm * std_th + mean_th
    else:
        # Fallback if model not found
        recon = np.full((24, 40), mean_th)

    diff = np.abs(arr - recon)
    mse = float(np.mean((arr - recon) ** 2))
    max_err = float(np.max(diff))
    # Threshold from Jalon 2 calibrated at 95th percentile
    seuil_max = 0.2393 * std_th if std_th < 10 else 2.5
    is_anomaly = max_err > seuil_max

    return arr, recon, diff, mse, max_err, is_anomaly, seuil_max

def infer_sky_image(img_input):
    """
    Accepte une image PIL ou un tableau NumPy et prédit couverture nuageuse et occultation.
    """
    model = load_cnn_ciel_model()
    if isinstance(img_input, Image.Image):
        img_resized = img_input.convert("L").resize((32, 32), Image.Resampling.BILINEAR)
        arr = np.array(img_resized, dtype=np.float32) / 255.0
    else:
        arr = np.array(img_input, dtype=np.float32)
        if arr.max() > 1.0:
            arr = arr / 255.0
        if arr.shape != (32, 32):
            arr = np.array(Image.fromarray((arr * 255).astype(np.uint8)).resize((32, 32))) / 255.0

    tensor = arr.reshape(1, 32, 32, 1)
    if model is not None:
        preds = model.predict(tensor, verbose=0)[0]
        couv = float(np.clip(preds[0], 0.0, 1.0))
        occ = float(np.clip(preds[1], 0.0, 1.0))
    else:
        couv = float(np.mean(arr))
        occ = float(np.max(arr))

    return arr, couv, occ

def prepare_simulation_inputs(df, site="A", idx=100, L=48):
    cap = CAPACITE[site]
    p = df["production"].values / cap
    cs = ciel_clair(df["hauteur_soleil"].values) / 1000.0
    neb = df["nebulosite_prevue"].values
    tp = df["temperature_prevue"].values / 40.0
    h = df["horodatage"].dt.hour.values
    sh = np.sin(2 * np.pi * h / 24.0)
    ch = np.cos(2 * np.pi * h / 24.0)

    passe = np.column_stack([p, cs, neb, tp, sh, ch]).astype("float32")
    connu = np.column_stack([cs, neb, tp, sh, ch]).astype("float32")

    if idx < L or idx + H >= len(df):
        return None, None, None, None, None

    x_hist = passe[idx - L : idx].reshape(1, L, 6)
    x_fut = connu[idx + 1 : idx + 1 + H].reshape(1, H, 5)
    y_true = p[idx + 1 : idx + 1 + H] * cap

    p_t = p[idx]
    cs_t = df["ghi_cs"].values[idx]
    cs_fut = df["ghi_cs"].values[idx + 1 : idx + 1 + H]
    if cs_t > 10.0:
        ratio = p_t / (cs_t / 1000.0)
        y_pi = np.clip(ratio * (cs_fut / 1000.0), 0.0, 1.0) * cap
    else:
        y_pi = np.zeros(H)

    timestamps_fut = df["horodatage"].iloc[idx + 1 : idx + 1 + H].tolist()

    return x_hist, x_fut, y_true, y_pi, timestamps_fut
