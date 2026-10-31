"""Démonstration Streamlit des modèles UC4 — Centrale solaire SolarDrâa.

Lancer depuis le dossier ``jalons`` :
    streamlit run app.py
"""

from pathlib import Path

import numpy as np
import pandas as pd
import streamlit as st
from PIL import Image

from utils.data_loader import (
    CAPACITE,
    H,
    infer_sky_image,
    infer_thermal_image,
    load_site_data,
    prepare_simulation_inputs,
)

ROOT = Path(__file__).resolve().parent
MODELS_DIR = ROOT / "models"

def find_data_file(filename: str) -> Path:
    candidates = [
        ROOT / "data" / filename,
        Path("data") / filename,
        ROOT.parent / "data_UC4" / filename,
        Path("../data_UC4") / filename,
    ]
    for c in candidates:
        if c.exists():
            return c
    return ROOT / "data" / filename

st.set_page_config(page_title="UC4 · SolarDrâa", page_icon="☀️", layout="wide")


def apply_design() -> None:
    """Habillage visuel sans modifier les calculs d'inférence."""
    st.markdown(
        """
        <style>
        .stApp { background: radial-gradient(circle at 88% -8%, #1f5363 0, #071523 38%, #06111c 100%); }
        [data-testid="stSidebar"] { background: linear-gradient(180deg, #0c2438 0%, #071523 100%); border-right: 1px solid #24445a; }
        [data-testid="stSidebar"] .stRadio label { border-radius: 10px; padding: .25rem .35rem; }
        .block-container { max-width: 1280px; padding-top: 2.2rem; padding-bottom: 3rem; }
        .hero { padding: 2.4rem 2.5rem; border: 1px solid rgba(247,183,51,.36); border-radius: 22px;
                background: linear-gradient(112deg, rgba(12,40,57,.96), rgba(21,73,82,.75));
                box-shadow: 0 22px 60px rgba(0,0,0,.24); margin-bottom: 1.4rem; }
        .eyebrow { color: #F7B733; font-size: .78rem; font-weight: 750; letter-spacing: .14em; text-transform: uppercase; }
        .hero h1 { color: #fff; font-size: clamp(2rem, 4vw, 3.5rem); line-height: 1.05; margin: .35rem 0 .65rem; }
        .hero p { color: #c9d8e5; font-size: 1.05rem; margin: 0; max-width: 760px; }
        .status-pill { display: inline-block; margin-top: 1.2rem; padding: .38rem .75rem; border: 1px solid rgba(128,227,164,.45);
                       border-radius: 99px; color: #a9e9bf; background: rgba(54,142,88,.17); font-size: .85rem; }
        .section-kicker { color: #8eb5c9; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; font-size: .75rem; margin-bottom: -.65rem; }
        [data-testid="stMetric"] { background: rgba(15,41,59,.72); border: 1px solid rgba(135,174,193,.22); padding: 1rem;
                                    border-radius: 14px; }
        [data-testid="stMetricLabel"] { color: #aac3d2; }
        [data-testid="stMetricValue"] { color: #f8c65a; }
        .info-card { background: rgba(15,41,59,.64); border: 1px solid rgba(135,174,193,.20); border-radius: 14px; padding: 1rem 1.1rem; }
        .info-card strong { color: #f8c65a; }
        .stTabs [data-baseweb="tab-list"] { gap: .45rem; }
        .stTabs [data-baseweb="tab"] { height: 42px; border-radius: 10px 10px 0 0; }
        </style>
        """,
        unsafe_allow_html=True,
    )


def hero(title: str, description: str, badge: str = "Modèles sauvegardés · Inférence locale") -> None:
    st.markdown(
        f"""<section class="hero"><div class="eyebrow">SolarDrâa · Intelligence Artificielle Avancée</div>
        <h1>{title}</h1><p>{description}</p><span class="status-pill">● {badge}</span></section>""",
        unsafe_allow_html=True,
    )


def card(label: str, value: str) -> None:
    st.markdown(f'<div class="info-card"><strong>{label}</strong><br>{value}</div>', unsafe_allow_html=True)


@st.cache_resource(show_spinner="Chargement du modèle de prévision…")
def load_forecast_model(filename: str):
    """Charge un modèle Keras sauvegardé, sans le réentraîner."""
    keras_mod = None
    try:
        import keras
        keras_mod = keras
    except ImportError:
        try:
            from tensorflow import keras
            keras_mod = keras
        except ImportError:
            st.error("Keras / TensorFlow n'a pas pu être importé. Vérifiez dans les paramètres de Streamlit Cloud que la version de Python est bien 3.11 ou 3.10.")
            return None

    path = MODELS_DIR / filename
    if not path.exists():
        return None
    try:
        return keras_mod.models.load_model(path)
    except Exception as e:
        st.error(f"Erreur de chargement du modèle {filename} : {e}")
        return None


def date_label(df: pd.DataFrame, index: int) -> str:
    return pd.Timestamp(df.iloc[index]["horodatage"]).strftime("%d/%m/%Y %H:%M")


def forecast_from_dataset(model_filename: str, site: str, index: int, title: str) -> None:
    """Prépare les mêmes entrées que les notebooks et affiche les 6 horizons."""
    model = load_forecast_model(model_filename)
    if model is None:
        st.error(f"Modèle introuvable : `models/{model_filename}`.")
        st.info(
            "Exécutez la cellule de sauvegarde du notebook correspondant, puis placez "
            "le fichier dans `models/`. L'application ne remplace jamais un modèle par "
            "une heuristique."
        )
        return

    df = load_site_data(site)
    x_hist, x_fut, actual, persistence, timestamps = prepare_simulation_inputs(df, site, index)
    if x_hist is None:
        st.warning("Cet instant ne permet pas de constituer 48 h d'historique et 6 h de futur.")
        return

    prediction = np.asarray(model.predict([x_hist, x_fut], verbose=0)).reshape(-1)
    prediction_mw = np.clip(prediction, 0, 1) * CAPACITE[site]

    st.markdown('<p class="section-kicker">Résultat de l’inférence</p>', unsafe_allow_html=True)
    st.subheader(title)
    result = pd.DataFrame(
        {
            "Horizon": [f"t+{i} h" for i in range(1, H + 1)],
            "Date": pd.to_datetime(timestamps),
            "Prédiction (MW)": prediction_mw.round(2),
            "Réel (MW)": np.asarray(actual).round(2),
            "Persistance intelligente (MW)": np.asarray(persistence).round(2),
        }
    )
    mae = np.mean(np.abs(prediction_mw - actual))
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("MAE de cet exemple", f"{mae:.2f} MW")
    col2.metric("Pic prévu", f"{prediction_mw.max():.1f} MW")
    col3.metric("Production actuelle", f"{df.iloc[index]['production']:.1f} MW")
    col4.metric("Horizon", "6 heures")
    st.line_chart(result.set_index("Horizon")[["Prédiction (MW)", "Réel (MW)", "Persistance intelligente (MW)"]],
                  color=["#F7B733", "#8CD7E8", "#7F9AB2"])
    with st.expander("Voir le détail des six horizons", expanded=False):
        st.dataframe(result, hide_index=True, use_container_width=True)


def show_jalon_1() -> None:
    hero("Prévision solaire à 6 heures", "Un MLP transforme 47 variables météo, calendaires et historiques en une trajectoire de production exploitable.")
    df = load_site_data("A")
    valid = range(23, len(df) - H)
    example = st.selectbox(
        "Exemple de test (site A)", valid, index=min(1000, len(valid) - 1),
        format_func=lambda i: date_label(df, i), key="j1_example",
    )
    model = load_forecast_model("modele_solaire_jalon1.keras")
    if model is None:
        st.error("Le fichier `models/modele_solaire_jalon1.keras` manque dans ce dépôt.")
        st.code("# Dans notebooks/jalon1_prevoir_production_mlp.ipynb\nmlp_reg.save('../models/modele_solaire_jalon1.keras')")
        return

    # Prétraitement Jalon 1 : 24 productions + 6×(ciel clair, nébulosité,
    # température) + calendrier + nettoyage = 47 variables.
    cap = CAPACITE["A"]
    p = df["production"].to_numpy() / cap
    cs = df["ghi_cs"].to_numpy() / 1000.0
    neb = df["nebulosite_prevue"].to_numpy()
    temp = df["temperature_prevue"].to_numpy() / 40.0
    dt = pd.to_datetime(df["horodatage"])
    hour = dt.dt.hour.to_numpy()
    doy = dt.dt.dayofyear.to_numpy()
    calendar = [np.sin(2 * np.pi * hour[example] / 24), np.cos(2 * np.pi * hour[example] / 24),
                np.sin(2 * np.pi * doy[example] / 365.25), np.cos(2 * np.pi * doy[example] / 365.25)]
    features = np.concatenate([
        p[example - 23: example + 1], cs[example + 1: example + 1 + H],
        neb[example + 1: example + 1 + H], temp[example + 1: example + 1 + H],
        calendar, [df.iloc[example]["jours_depuis_nettoyage"] / 30.0],
    ]).reshape(1, -1).astype("float32")
    pred = np.clip(model.predict(features, verbose=0).reshape(-1), 0, 1) * cap
    real = p[example + 1: example + 1 + H] * cap
    col1, col2, col3 = st.columns(3)
    col1.metric("MAE", f"{np.mean(np.abs(pred - real)):.2f} MW")
    col2.metric("Pic prévu", f"{pred.max():.1f} MW")
    col3.metric("Variables d’entrée", "47")
    st.line_chart(pd.DataFrame({"MLP (MW)": pred, "Réel (MW)": real}, index=[f"t+{i} h" for i in range(1, H + 1)]), color=["#F7B733", "#8CD7E8"])
    st.caption("Prétraitement identique au notebook : 24 historiques + 18 prévisions météo + 4 variables calendaires + nettoyage.")


def show_jalon_2() -> None:
    hero("Voir le ciel. Diagnostiquer les panneaux.", "Deux modèles de vision transforment les images en indicateurs immédiatement compréhensibles pour l’exploitation.")
    tab_sky, tab_thermal = st.tabs(["Image du ciel", "Thermographie panneau"])
    with tab_sky:
        data = np.load(find_data_file("uc4_ciel_A.npz"))
        sample = st.selectbox("Exemple de test ciel", range(len(data["X"])), index=0, key="sky_sample")
        image = Image.fromarray(data["X"][sample].astype(np.uint8))
        arr, cover, occultation = infer_sky_image(image)
        col1, col2, col3 = st.columns([1.35, 1, 1])
        col1.image(arr, caption="Image normalisée 32×32", clamp=True)
        col2.metric("Couverture nuageuse", f"{cover:.1%}")
        col3.metric("Occultation", f"{occultation:.1%}")
        card("Lecture du modèle", "Image en niveaux de gris · 32×32 · normalisation [0, 1]")
    with tab_thermal:
        data = np.load(find_data_file("uc4_thermographie.npz"))
        sample = st.selectbox("Exemple de test thermique", range(len(data["X_test"])), index=0, key="thermal_sample")
        original, reconstruction, diff, mse, max_error, anomaly, threshold = infer_thermal_image(data["X_test"][sample])
        c1, c2, c3 = st.columns(3)
        c1.image(original, caption="Mesure (°C)", clamp=True)
        c2.image(reconstruction, caption="Reconstruction", clamp=True)
        c3.image(diff, caption="Erreur absolue", clamp=True)
        verdict, emoji = ("Anomalie détectée", "⚠️") if anomaly else ("Panneau sain", "✓")
        st.markdown(f"<div class='info-card'><strong>{emoji} {verdict}</strong><br>Décision issue de l'écart entre mesure et reconstruction.</div>", unsafe_allow_html=True)
        st.caption(f"MSE = {mse:.4f} · erreur maximale = {max_error:.3f} · seuil calibré = {threshold:.3f}.")


def show_jalon_3() -> None:
    hero("Un nouveau site, une prédiction immédiate", "Évaluation zero-shot sur la centrale B : le modèle est appliqué sans réentraînement pour mesurer sa capacité de transfert.", "Zero-shot · Site B · Modèle chargé")
    df = load_site_data("B")
    valid = range(48, len(df) - H)
    example = st.selectbox("Exemple de test (site B)", valid, index=min(100, len(valid) - 1),
                           format_func=lambda i: date_label(df, i), key="j3_example")
    forecast_from_dataset("modele_recurrent_solaire_jalon4.keras", "B", example, "Prévision transférée")
    st.info("Pour une démonstration strictement Jalon 3, sauvegardez aussi le MLP de transfert sous `models/modele_solaire_jalon3.keras` et remplacez le nom de fichier ci-dessus.")


def show_jalon_4() -> None:
    hero("La production comme une séquence", "Le GRU relie les 48 dernières heures au contexte météo des 6 prochaines pour anticiper la courbe de production.", "GRU direct · Horizon 6 h · Déployé")
    site = st.radio("Site", ["A", "B"], horizontal=True)
    df = load_site_data(site)
    valid = range(48, len(df) - H)
    example = st.selectbox("Exemple de test", valid, index=min(1000, len(valid) - 1),
                           format_func=lambda i: date_label(df, i), key="j4_example")
    forecast_from_dataset("modele_recurrent_solaire_jalon4.keras", site, example, "Prévision des six prochaines heures")


apply_design()
with st.sidebar:
    st.markdown("## ☀️ SolarDrâa")
    st.caption("Plateforme IA · UC4")
    st.markdown("---")
    jalon = st.radio("Explorer un jalon", ["Jalon 1 · MLP", "Jalon 2 · Vision", "Jalon 3 · Transfert", "Jalon 4 · GRU"])
    st.markdown("---")
    st.success("Modèles locaux chargés")
    st.caption("Choisissez un exemple réel ; aucune prédiction n’est simulée.")
    st.markdown("<div class='info-card'><strong>4 jalons</strong><br>Prévision · Vision · Transfert · Séquence</div>", unsafe_allow_html=True)
if jalon.startswith("Jalon 1"):
    show_jalon_1()
elif jalon.startswith("Jalon 2"):
    show_jalon_2()
elif jalon.startswith("Jalon 3"):
    show_jalon_3()
else:
    show_jalon_4()
