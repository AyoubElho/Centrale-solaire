"""Démonstration Streamlit des modèles UC4 — Centrale solaire SolarDrâa.

Lancer depuis le dossier ``jalons`` :
    streamlit run app.py
"""

from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import streamlit as st
from PIL import Image

CENTRAL_NAME = "SolarDrâa"

from utils.data_loader import (
    CAPACITE,
    H,
    infer_sky_image,
    infer_thermal_image,
    load_autoencoder_model,
    load_cnn_ciel_model,
    load_site_data,
    load_thermal_threshold,
    prepare_mlp_47_inputs,
    prepare_simulation_inputs,
)

ROOT = Path(__file__).resolve().parent
MODELS_DIR = ROOT / "models"
FIGURES_DIR = ROOT / "docs" / "figures"

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

st.set_page_config(page_title=f"UC4 · {CENTRAL_NAME}", page_icon="☀️", layout="wide")


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
        f"""<section class="hero"><div class="eyebrow">{CENTRAL_NAME} · Intelligence Artificielle Avancée</div>
        <h1>{title}</h1><p>{description}</p><span class="status-pill">● {badge}</span></section>""",
        unsafe_allow_html=True,
    )


def card(label: str, value: str) -> None:
    st.markdown(f'<div class="info-card"><strong>{label}</strong><br>{value}</div>', unsafe_allow_html=True)


def explain_jalon(objective: str, method: str, finding: str, limit: str) -> None:
    """Four short prompts that give each jalon the same presentation structure."""
    left, right = st.columns(2)
    with left:
        card("Objectif", objective)
        st.write("")
        card("Méthode", method)
    with right:
        card("Résultat principal · test final", finding)
        st.write("")
        card("Point de vigilance", limit)


def notebook_figure(filename: str, caption: str) -> None:
    """Display a figure exported from the executed notebook, if present."""
    path = FIGURES_DIR / filename
    if path.is_file():
        st.image(str(path), caption=caption, width="stretch")
    else:
        st.warning(f"Figure absente : docs/figures/{filename}")


def show_overview() -> None:
    hero(
        "Quatre jalons, une centrale solaire",
        "De la prévision sur le site A à la vision, au transfert vers le site B et aux modèles séquentiels.",
        "Parcours de présentation · résultats issus des notebooks exécutés",
    )
    st.subheader("Le parcours en un coup d'œil")
    overview = [
        ("01 · Prévoir", "MLP et 47 variables", "Site A · gain moyen test : 50,9 %"),
        ("02 · Observer", "CNN du ciel et auto-encodeur", "Test · AUC thermique : 0,9859"),
        ("03 · Transférer", "Modèle A appliqué au site B", "Site B · gain zero-shot test : 40,3 %"),
        ("04 · Modéliser le temps", "RNN, LSTM et GRU", "Site A · gain moyen GRU test : 49,0 %"),
    ]
    columns = st.columns(4)
    for column, (title, method, result) in zip(columns, overview):
        with column:
            card(title, f"{method}<br><small>{result}</small>")
    st.write("")
    st.info("Les métriques correspondent à des tâches et à des tests différents. Ouvrez chaque jalon pour voir son objectif, son protocole, ses résultats et ses limites.")
    st.caption("Sources : notebooks/jalon1_prevoir_production_mlp.ipynb, notebooks/uc4_jalon2.ipynb, notebooks/uc4_jalon3.ipynb et notebooks/uc4_jalon4.ipynb.")


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
        st.dataframe(result, hide_index=True, width="stretch")


def show_jalon_1() -> None:
    hero("Jalon 1 · Prévoir sur le site A", "Un MLP transforme 47 variables historiques, météorologiques et calendaires en six prévisions horaires.")
    explain_jalon(
        "Prévoir la production du site A de t+1 à t+6 heures et battre la persistance intelligente.",
        "24 heures de production, 18 valeurs météo futures, 4 variables calendaires et le nettoyage alimentent le MLP.",
        "Gain moyen de 50,9 % sur le test 2025, au-dessus de la cible de 30 %.",
        "Le gain à t+1 est de 10,2 % sur le test, sous la cible de 12 %.",
    )
    st.subheader("Résultats du notebook")
    c1, c2, c3 = st.columns(3)
    c1.metric("Gain moyen · test A", "50,9 %")
    c2.metric("Gain t+1 · test A", "10,2 %")
    c3.metric("Taille du modèle", "0,09 Mo")
    st.caption("Cibles : gain moyen ≥ 30 % ; gain à t+1 ≥ 12 % ; taille ≤ 5 Mo.")
    fig_left, fig_right = st.columns(2)
    with fig_left:
        notebook_figure("jalon1_prevoir_production_mlp_cell11_img0.png", "Erreur à t+1 selon l'heure · validation du site A.")
    with fig_right:
        notebook_figure("jalon1_prevoir_production_mlp_cell16_img1.png", "Erreur à t+1 par mois · test 2025 du site A.")
    st.subheader("Explorer une prévision sur le test")
    st.caption("Cette prévision locale illustre un instant précis ; les gains ci-dessus sont calculés sur tout le jeu de test.")
    df = load_site_data("A")
    valid = [int(i) for i in np.flatnonzero((df["horodatage"] >= pd.Timestamp("2025-01-01")).to_numpy()) if 23 <= i < len(df) - H]
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
    st.caption("Source : notebooks/jalon1_prevoir_production_mlp.ipynb.")


def show_jalon_2() -> None:
    hero("Jalon 2 · Voir le ciel et les panneaux", "Un CNN extrait l'état du ciel ; un auto-encodeur apprend à reconstruire les thermographies saines pour signaler les défauts.")
    explain_jalon(
        "Améliorer la prévision grâce aux images du ciel et détecter les anomalies thermiques des panneaux.",
        "CNN ciel, MLP enrichi et CNN sur la paire d'images (t−1, t) ; auto-encodeur thermique à goulot 32.",
        "Les quatre cibles du jalon 2 sont atteintes sur le test final.",
        "Sur l'image courante, la règle simple reste meilleure pour la couverture (MAE 0,0166 contre 0,0252 pour le CNN).",
    )
    st.subheader("Quatre cibles vérifiées sur le test final")
    st.dataframe(pd.DataFrame([
        {"Exigence": "Gain site A à t+1", "Résultat": "16,80 %", "Cible": "≥ 12 %", "Statut": "Atteinte"},
        {"Exigence": "MAE occultation à t+1", "Résultat": "0,0675", "Cible": "≤ 0,10", "Statut": "Atteinte"},
        {"Exigence": "AUC thermique", "Résultat": "0,9859", "Cible": "≥ 0,98", "Statut": "Atteinte"},
        {"Exigence": "Fissures à ≤ 5 % de fausses alertes", "Résultat": "88 % · FA 4,92 %", "Cible": "≥ 85 %", "Statut": "Atteinte"},
    ]), hide_index=True, width="stretch")
    st.caption("La MAE 0,0388 mesure l'occultation de l'image courante ; 0,0675 mesure la prévision à t+1. Les deux tâches sont distinctes.")
    fig_left, fig_right = st.columns(2)
    with fig_left:
        notebook_figure("jalon2_cnn_vs_regles_notebook.png", "CNN vs règles simples sur le test : le CNN réduit surtout l'erreur d'occultation.")
    with fig_right:
        notebook_figure("jalon2_detection_thermique_notebook.png", "Détection thermique sur le test : 88 % des fissures détectées.")
    st.subheader("Explorer les images de test")
    st.caption("Les exemples ci-dessous utilisent les modèles sauvegardés ; les scores globaux ci-dessus proviennent des notebooks exécutés.")
    if load_cnn_ciel_model() is None or load_autoencoder_model() is None:
        st.warning("Les modèles de vision sauvegardés ne peuvent pas être chargés ici. Les résultats et figures des notebooks restent consultables ci-dessus.")
        return
    saved_thermal_threshold = load_thermal_threshold()
    if saved_thermal_threshold is not None and abs(saved_thermal_threshold - 0.2442) > 0.001:
        st.info(
            f"Démo thermique : le seuil recalibré du modèle exporté est {saved_thermal_threshold:.4f}, "
            "contre 0,2442 dans le notebook final. Les prédictions locales illustrent le fichier exporté ; "
            "les métriques de test ci-dessus restent celles du notebook."
        )
    tab_sky, tab_thermal = st.tabs(["Image du ciel", "Thermographie panneau"])
    with tab_sky:
        sky_data = np.load(find_data_file("uc4_ciel_A.npz"))
        site_a = load_site_data("A")
        image_times = site_a["horodatage"].iloc[sky_data["heure"].astype(int)].reset_index(drop=True)
        test_samples = np.flatnonzero((image_times >= pd.Timestamp("2025-01-01")).to_numpy()).tolist()
        sample = st.selectbox(
            "Exemple de test ciel",
            test_samples,
            index=0,
            format_func=lambda i: f"{image_times.iloc[i]:%d/%m/%Y %H:%M} · image #{i} (couv. {float(sky_data['couverture'][i]):.1%}, occ. {float(sky_data['occultation'][i]):.1%})",
            key="sky_sample",
        )
        image = Image.fromarray(sky_data["X"][sample].astype(np.uint8))
        arr, cover, occultation = infer_sky_image(image)
        real_cover = float(sky_data["couverture"][sample])
        real_occ = float(sky_data["occultation"][sample])
        image_time = image_times.iloc[sample]

        col1, col2, col3 = st.columns([1.4, 1, 1])
        with col1:
            fig, ax = plt.subplots(figsize=(4.5, 3.6), dpi=120)
            fig.patch.set_facecolor("#0b1e2d")
            ax.set_facecolor("#0b1e2d")
            im = ax.imshow(arr, cmap="Blues_r", vmin=0.0, vmax=1.0)
            ax.set_title(f"Image Ciel (32×32) · {image_time:%d/%m/%Y %H:%M}", color="#f8c65a", fontsize=11, fontweight="bold", pad=8)
            ax.tick_params(colors="#8eb5c9", labelsize=8)
            for spine in ax.spines.values():
                spine.set_color("#24445a")
            cbar = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
            cbar.ax.tick_params(colors="#8eb5c9", labelsize=8)
            cbar.set_label("Intensité normalisée [0, 1]", color="#8eb5c9", fontsize=8)
            fig.tight_layout()
            st.pyplot(fig, width="stretch")
            plt.close(fig)

        with col2:
            st.metric("Couverture nuageuse", f"{cover:.1%}", delta=f"Écart: {cover - real_cover:+.1%}")
            card("Cible terrain réelle", f"Couverture mesurée : <strong>{real_cover:.1%}</strong>")
        with col3:
            st.metric("Occultation solaire", f"{occultation:.1%}", delta=f"Écart: {occultation - real_occ:+.1%}")
            card("Cible terrain réelle", f"Occultation mesurée : <strong>{real_occ:.1%}</strong>")

        card(
            "Lecture du modèle CNN Ciel",
            f"Image 32×32 pixels · Prétraitement [0, 1] · Dual-Pooling (Moyenne + Max) · Échantillon #{sample} du {image_time:%d/%m/%Y %H:%M}.",
        )

    with tab_thermal:
        thermal_data = np.load(find_data_file("uc4_thermographie.npz"))
        def_names = {
            0: "Panneau sain",
            1: "D1 : Point chaud (Hotspot)",
            2: "D2 : Fissure de cellule",
            3: "D3 : Défaillance diode by-pass",
            4: "D4 : Déconnexion sous-module",
        }
        st.markdown(
            "**Sélection rapide :** "
            "Échantillons d'intérêt : "
            "• **#0** (Sain) • **#19** (Hotspot D1) • **#1** (Fissure D2) • **#13** (Diodes D3) • **#15** (Sous-module D4)"
        )
        def label_thermal_sample(i: int) -> str:
            d_val = int(thermal_data["defaut_test"][i])
            return f"Échantillon #{i} — {def_names.get(d_val, f'Défaut {d_val}')}"

        sample = st.selectbox(
            "Exemple de test thermique",
            range(len(thermal_data["X_test"])),
            index=0,
            format_func=label_thermal_sample,
            key="thermal_sample",
        )
        original, reconstruction, diff, mse, max_error, anomaly, score, threshold = infer_thermal_image(thermal_data["X_test"][sample])
        defaut_reel = int(thermal_data["defaut_test"][sample])

        # Échelle de température commune pour comparaison directe
        t_min = min(float(np.min(original)), float(np.min(reconstruction)))
        t_max = max(float(np.max(original)), float(np.max(reconstruction)))

        c1, c2, c3 = st.columns(3)
        with c1:
            fig1, ax1 = plt.subplots(figsize=(4.2, 3.2), dpi=120)
            fig1.patch.set_facecolor("#0b1e2d")
            ax1.set_facecolor("#0b1e2d")
            im1 = ax1.imshow(original, cmap="inferno", vmin=t_min, vmax=t_max, aspect="auto")
            ax1.set_title("Mesure thermique (°C)", color="#f8c65a", fontsize=11, fontweight="bold", pad=8)
            ax1.tick_params(colors="#8eb5c9", labelsize=8)
            for spine in ax1.spines.values():
                spine.set_color("#24445a")
            cb1 = fig1.colorbar(im1, ax=ax1, fraction=0.046, pad=0.04)
            cb1.ax.tick_params(colors="#8eb5c9", labelsize=8)
            cb1.set_label("Température (°C)", color="#8eb5c9", fontsize=8)
            fig1.tight_layout()
            st.pyplot(fig1, width="stretch")
            plt.close(fig1)

        with c2:
            fig2, ax2 = plt.subplots(figsize=(4.2, 3.2), dpi=120)
            fig2.patch.set_facecolor("#0b1e2d")
            ax2.set_facecolor("#0b1e2d")
            im2 = ax2.imshow(reconstruction, cmap="inferno", vmin=t_min, vmax=t_max, aspect="auto")
            ax2.set_title("Reconstruction saine (°C)", color="#f8c65a", fontsize=11, fontweight="bold", pad=8)
            ax2.tick_params(colors="#8eb5c9", labelsize=8)
            for spine in ax2.spines.values():
                spine.set_color("#24445a")
            cb2 = fig2.colorbar(im2, ax=ax2, fraction=0.046, pad=0.04)
            cb2.ax.tick_params(colors="#8eb5c9", labelsize=8)
            cb2.set_label("Température (°C)", color="#8eb5c9", fontsize=8)
            fig2.tight_layout()
            st.pyplot(fig2, width="stretch")
            plt.close(fig2)

        with c3:
            fig3, ax3 = plt.subplots(figsize=(4.2, 3.2), dpi=120)
            fig3.patch.set_facecolor("#0b1e2d")
            ax3.set_facecolor("#0b1e2d")
            vmax_diff = max(float(np.max(diff)), 2.5)
            im3 = ax3.imshow(diff, cmap="hot", vmin=0.0, vmax=vmax_diff, aspect="auto")
            ax3.set_title("Erreur absolue |M - R| (°C)", color="#f8c65a", fontsize=11, fontweight="bold", pad=8)
            ax3.tick_params(colors="#8eb5c9", labelsize=8)
            for spine in ax3.spines.values():
                spine.set_color("#24445a")
            cb3 = fig3.colorbar(im3, ax=ax3, fraction=0.046, pad=0.04)
            cb3.ax.tick_params(colors="#8eb5c9", labelsize=8)
            cb3.set_label("Écart (°C)", color="#8eb5c9", fontsize=8)
            fig3.tight_layout()
            st.pyplot(fig3, width="stretch")
            plt.close(fig3)

        verdict, emoji = ("Anomalie détectée", "⚠️") if anomaly else ("Panneau sain", "✓")
        status_color = "#e74c3c" if anomaly else "#2ecc71"
        etat_reel = def_names.get(defaut_reel, f"Défaut {defaut_reel}")
        
        st.markdown(
            f"<div class='info-card' style='border-left: 4px solid {status_color};'>"
            f"<strong>{emoji} Diagnostic IA : {verdict}</strong> — Vérité terrain : <strong>{etat_reel}</strong><br>"
            f"Score d'anomalie : <strong>{score:.4f}</strong> (seuil de validation saine : <strong>{threshold:.4f}</strong>)."
            f"</div>",
            unsafe_allow_html=True,
        )
        st.caption(f"MSE résiduelle = {mse:.4f} °C² · Écart thermique maximal = {max_error:.3f} °C · Score = maximum de l'erreur quadratique normalisée · Seuil = 95e percentile de la validation saine · Matrice 24×40 capteurs.")
    st.caption("Source des résultats globaux : notebooks/uc4_jalon2.ipynb.")


def show_jalon_3() -> None:
    hero("Jalon 3 · Transférer vers le site B", "Le site B dispose de peu d'historique local : cinq stratégies de transfert sont comparées, puis évaluées sur avril–juin 2025.")
    explain_jalon(
        "Prévoir la production sur le site B et adapter l'analyse de sa caméra du ciel.",
        "Comparer le MLP A appliqué tel quel, un apprentissage sur B, un ajustement complet et deux niveaux de couches gelées.",
        "Le zero-shot atteint 40,3 % de gain moyen sur le test B et dépasse la cible de 27 %.",
        "La caméra B reste difficile : MAE d'occultation 0,1534 sur le test, au-dessus de la cible 0,10.",
    )
    st.subheader("Stratégies de prévision · test B, avril–juin 2025")
    st.dataframe(pd.DataFrame([
        {"Stratégie": "Modèle A tel quel · zero-shot", "Gain moyen": "40,3 %", "Cible": "≥ 27 %", "Statut": "Atteinte"},
        {"Stratégie": "Entraînement sur B seul", "Gain moyen": "25,6 %", "Cible": "≥ 27 %", "Statut": "Non atteinte"},
        {"Stratégie": "Ajustement fin complet", "Gain moyen": "38,4 %", "Cible": "≥ 27 %", "Statut": "Atteinte"},
    ]), hide_index=True, width="stretch")
    st.caption("En validation de mars, l'ajustement complet atteint 43,4 %. Sur le test d'avril–juin, le zero-shot généralise mieux.")
    fig_left, fig_right = st.columns(2)
    with fig_left:
        notebook_figure("jalon3_cell4_img2.png", "Gain par horizon des cinq stratégies · validation du site B.")
    with fig_right:
        notebook_figure("jalon3_cell6_img2.png", "Différences de profil solaire et de clarté matinale entre les sites A et B.")
    with st.expander("Voir l'adaptation de la caméra B"):
        notebook_figure("jalon3_cell10_img2.png", "Valeurs vraies et prédictions après adaptation de la caméra B.")
        st.warning("Occultation sur le test B : MAE 0,1534 > 0,10. Cette cible n'est pas atteinte.")
    st.subheader("Tester le transfert sur le site B")
    st.caption("Le MLP a été entraîné sur le site A puis appliqué au site B sans ajustement. Choisissez un instant du test d'avril à juin 2025.")
    model = load_forecast_model("modele_zero_shot_jalon3.keras")
    if model is None:
        st.warning("Le modèle Jalon 3 est absent. Exécutez `.venv/bin/python -m scripts.export_jalon3_model` pour le créer.")
    else:
        site_b = load_site_data("B")
        test_times = site_b["horodatage"]
        candidates = np.flatnonzero((test_times >= pd.Timestamp("2025-04-01")).to_numpy())
        valid = [int(i) for i in candidates if 23 <= i < len(site_b) - H and site_b["jour"].iloc[i + 1:i + 1 + H].any()]
        if not valid:
            st.warning("Aucun instant de test diurne du site B n'est disponible.")
        else:
            default = next((pos for pos, i in enumerate(valid) if test_times.iloc[i].hour == 10), 0)
            example = st.selectbox("Instant de prévision · site B", valid, index=default,
                                   format_func=lambda i: date_label(site_b, i), key="j3_example")
            x = prepare_mlp_47_inputs(site_b, "B", [example])
            prediction = np.clip(np.asarray(model.predict(x, verbose=0)).reshape(-1), 0, 1) * CAPACITE["B"]
            future = np.arange(example + 1, example + 1 + H)
            actual = site_b["production"].to_numpy()[future]
            ghi_cs = site_b["ghi_cs"].to_numpy()
            ratio = site_b.iloc[example]["production"] / ghi_cs[example] if ghi_cs[example] > 10 else 0.0
            baseline = np.clip(ratio * ghi_cs[future], 0, CAPACITE["B"])
            result = pd.DataFrame({
                "Horizon": [f"t+{h} h" for h in range(1, H + 1)],
                "Date": test_times.iloc[future].to_numpy(),
                "MLP A → B (MW)": prediction.round(2),
                "Réel (MW)": actual.round(2),
                "Persistance intelligente (MW)": baseline.round(2),
            })
            c1, c2, c3 = st.columns(3)
            c1.metric("MAE · modèle", f"{np.mean(np.abs(prediction - actual)):.2f} MW")
            c2.metric("MAE · persistance", f"{np.mean(np.abs(baseline - actual)):.2f} MW")
            c3.metric("Puissance du site B", "20 MW")
            st.line_chart(result.set_index("Horizon")[["MLP A → B (MW)", "Réel (MW)", "Persistance intelligente (MW)"]],
                          color=["#F7B733", "#8CD7E8", "#7F9AB2"])
            with st.expander("Voir les six prévisions", expanded=False):
                st.dataframe(result, hide_index=True, width="stretch")
            st.caption("Cet exemple couvre six heures et ne représente pas le gain moyen du test. Le modèle exporté a obtenu 40,6 % sur tout le test B lors de sa réexécution, contre 40,3 % pour l'exécution du notebook.")
    st.caption("Source des résultats du tableau et des figures : notebooks/uc4_jalon3.ipynb.")


def show_jalon_4() -> None:
    hero("Jalon 4 · Prévoir avec une séquence", "Le GRU exploite 48 heures ordonnées et la météo des six prochaines heures pour prévoir la production sur les sites A et B.", "GRU direct · six horizons")
    explain_jalon(
        "Tester si l'ordre temporel améliore la prévision par rapport au MLP tabulaire.",
        "Comparer SimpleRNN, LSTM, GRU direct et encodeur-décodeur ; étudier 6, 24, 48 et 168 heures d'historique.",
        "GRU direct 48 h : gain moyen test 49,0 % sur A et 40,0 % sur B en zero-shot.",
        "Sur le test A, le gain à t+1 est de 9,5 %, sous la cible de 12 %.",
    )
    st.subheader("Bilan du modèle retenu · test final")
    st.dataframe(pd.DataFrame([
        {"Exigence": "Site A · gain à t+1", "Résultat": "9,5 %", "Cible": "≥ 12 %", "Statut": "Non atteinte"},
        {"Exigence": "Site A · gain moyen 6 h", "Résultat": "49,0 %", "Cible": "≥ 30 %", "Statut": "Atteinte"},
        {"Exigence": "Site B · gain moyen zero-shot", "Résultat": "40,0 %", "Cible": "≥ 27 %", "Statut": "Atteinte"},
        {"Exigence": "Taille du modèle", "Résultat": "0,106 Mo", "Cible": "≤ 5 Mo", "Statut": "Conforme"},
    ]), hide_index=True, width="stretch")
    fig_left, fig_right = st.columns(2)
    with fig_left:
        notebook_figure("jalon4_cell6_img1.png", "Comparaison SimpleRNN, LSTM et GRU à budget de paramètres proche · validation A.")
    with fig_right:
        notebook_figure("jalon4_cell14_img1.png", "Bilan final des cibles sur les tests des sites A et B.")
    st.subheader("Explorer le GRU sauvegardé")
    st.caption("La courbe suivante montre un exemple individuel, pas le gain moyen du notebook.")
    site = st.radio("Site", ["A", "B"], horizontal=True)
    df = load_site_data(site)
    test_start = pd.Timestamp("2025-01-01" if site == "A" else "2025-04-01")
    valid = [int(i) for i in np.flatnonzero((df["horodatage"] >= test_start).to_numpy()) if 48 <= i < len(df) - H]
    example = st.selectbox("Exemple de test", valid, index=min(1000, len(valid) - 1),
                           format_func=lambda i: date_label(df, i), key="j4_example")
    forecast_from_dataset("modele_recurrent_solaire_jalon4.keras", site, example, "Prévision des six prochaines heures")
    st.caption("Source des résultats globaux : notebooks/uc4_jalon4.ipynb.")


apply_design()
with st.sidebar:
    st.markdown(f"## ☀️ {CENTRAL_NAME}")
    st.caption("Plateforme IA · UC4")
    st.markdown("---")
    jalon = st.radio("Explorer", ["Vue d'ensemble", "Jalon 1 · MLP", "Jalon 2 · Vision", "Jalon 3 · Transfert", "Jalon 4 · GRU"])
    st.markdown("---")
    st.caption("Résultats et figures issus des notebooks exécutés ; démonstrations locales sur les modèles sauvegardés.")
    st.markdown("<div class='info-card'><strong>4 jalons</strong><br>Prévision · Vision · Transfert · Séquence</div>", unsafe_allow_html=True)
if jalon == "Vue d'ensemble":
    show_overview()
elif jalon.startswith("Jalon 1"):
    show_jalon_1()
elif jalon.startswith("Jalon 2"):
    show_jalon_2()
elif jalon.startswith("Jalon 3"):
    show_jalon_3()
else:
    show_jalon_4()
