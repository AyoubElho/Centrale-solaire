"""Entraîne puis exporte le MLP du Jalon 1 dans ``models/``.

Usage (depuis ``jalons/``) :
    ./.venv/bin/python -m utils.export_jalon1_model
"""

from pathlib import Path

import keras
import numpy as np
import tensorflow as tf

from utils.data_loader import CAPACITE, H, load_site_data

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "models" / "modele_solaire_jalon1.keras"


def make_examples():
    """Reproduit les 47 entrées et les partitions temporelles du notebook Jalon 1."""
    df = load_site_data("A").copy()
    capacity = CAPACITE["A"]
    production = df["production"].to_numpy() / capacity
    clear_sky = df["ghi_cs"].to_numpy() / 1000.0
    cloudiness = df["nebulosite_prevue"].to_numpy()
    temperature = df["temperature_prevue"].to_numpy() / 40.0
    cleaning = df["jours_depuis_nettoyage"].to_numpy() / 30.0
    dates = df["horodatage"]
    hours = dates.dt.hour.to_numpy()
    day_of_year = dates.dt.dayofyear.to_numpy()
    sin_hour, cos_hour = np.sin(2 * np.pi * hours / 24.0), np.cos(2 * np.pi * hours / 24.0)
    sin_day, cos_day = np.sin(2 * np.pi * day_of_year / 365.25), np.cos(2 * np.pi * day_of_year / 365.25)

    x_values, y_values, timestamps = [], [], []
    for t in range(23, len(df) - H):
        x_values.append(np.concatenate((
            production[t - 23:t + 1], clear_sky[t + 1:t + 1 + H],
            cloudiness[t + 1:t + 1 + H], temperature[t + 1:t + 1 + H],
            [sin_hour[t], cos_hour[t], sin_day[t], cos_day[t], cleaning[t]],
        )))
        y_values.append(production[t + 1:t + 1 + H])
        timestamps.append(dates.iloc[t])

    x = np.asarray(x_values, dtype="float32")
    y = np.asarray(y_values, dtype="float32")
    timestamps = np.asarray(timestamps, dtype="datetime64[ns]")
    train = timestamps <= np.datetime64("2024-09-30T23:00:00")
    validation = (timestamps >= np.datetime64("2024-10-01T00:00:00")) & (timestamps <= np.datetime64("2024-12-31T23:00:00"))
    return x, y, train, validation


def build_model():
    inputs = keras.Input(shape=(47,))
    x = keras.layers.Dense(64, activation="relu")(inputs)
    x = keras.layers.Dropout(0.1)(x)
    x = keras.layers.Dense(32, activation="relu")(x)
    x = keras.layers.Dropout(0.1)(x)
    outputs = keras.layers.Dense(H, activation="sigmoid")(x)
    model = keras.Model(inputs=inputs, outputs=outputs, name="MLP_Jalon1")
    model.compile(optimizer=keras.optimizers.Adam(1e-3), loss="mse")
    return model


def main():
    tf.keras.utils.set_random_seed(42)
    x, y, train, validation = make_examples()
    model = build_model()
    early_stop = keras.callbacks.EarlyStopping(monitor="val_loss", patience=8, restore_best_weights=True)
    model.fit(x[train], y[train], validation_data=(x[validation], y[validation]),
              epochs=50, batch_size=128, callbacks=[early_stop], verbose=2)
    OUTPUT_PATH.parent.mkdir(exist_ok=True)
    model.save(OUTPUT_PATH)
    print(f"Modèle Jalon 1 exporté : {OUTPUT_PATH} ({OUTPUT_PATH.stat().st_size / 1024:.1f} Ko)")


if __name__ == "__main__":
    main()
