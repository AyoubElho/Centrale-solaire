"""Réentraîne et exporte le MLP A utilisé en zero-shot au Jalon 3.

Lancer depuis la racine du dépôt : .venv/bin/python -m scripts.export_jalon3_model
"""

from pathlib import Path

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

from utils.data_loader import CAPACITE, H, load_site_data, prepare_mlp_47_inputs


def main() -> None:
    np.random.seed(42)
    tf.random.set_seed(42)

    site_a = load_site_data("A")
    indices_a = np.arange(23, len(site_a) - H)
    times_a = site_a["horodatage"].to_numpy()[indices_a]
    train = times_a <= np.datetime64("2024-09-30T23:00:00")
    validation = (times_a >= np.datetime64("2024-10-01")) & (times_a <= np.datetime64("2024-12-31T23:00:00"))
    x_a = prepare_mlp_47_inputs(site_a, "A", indices_a)
    normalized_a = site_a["production"].to_numpy() / CAPACITE["A"]
    y_a = normalized_a[indices_a[:, None] + np.arange(1, H + 1)].astype(np.float32)

    input_layer = keras.Input(shape=(47,))
    hidden = layers.Dense(64, activation="relu")(input_layer)
    hidden = layers.Dense(32, activation="relu")(hidden)
    model = keras.Model(input_layer, layers.Dense(H, activation="sigmoid")(hidden))
    model.compile(optimizer=keras.optimizers.Adam(1e-3), loss="mse")
    model.fit(
        x_a[train], y_a[train], epochs=30, batch_size=128,
        validation_data=(x_a[validation], y_a[validation]), verbose=2,
    )

    destination = Path(__file__).resolve().parent.parent / "models" / "modele_zero_shot_jalon3.keras"
    model.save(destination)

    site_b = load_site_data("B")
    indices_b = np.arange(23, len(site_b) - H)
    test = site_b["horodatage"].to_numpy()[indices_b] >= np.datetime64("2025-04-01")
    indices_b = indices_b[test]
    predictions = model.predict(prepare_mlp_47_inputs(site_b, "B", indices_b), verbose=0)
    normalized_b = site_b["production"].to_numpy() / CAPACITE["B"]
    actual = normalized_b[indices_b[:, None] + np.arange(1, H + 1)]
    ghi_cs = site_b["ghi_cs"].to_numpy()
    future_ghi = ghi_cs[indices_b[:, None] + np.arange(1, H + 1)]
    ratio = np.divide(normalized_b[indices_b], ghi_cs[indices_b],
                      out=np.zeros(len(indices_b)), where=ghi_cs[indices_b] > 10)
    baseline = np.clip(ratio[:, None] * future_ghi, 0, 1)
    daylight = site_b["jour"].to_numpy()[indices_b[:, None] + np.arange(1, H + 1)]
    model_rmse = np.array([np.sqrt(np.mean((actual[daylight[:, h], h] - predictions[daylight[:, h], h]) ** 2)) for h in range(H)])
    baseline_rmse = np.array([np.sqrt(np.mean((actual[daylight[:, h], h] - baseline[daylight[:, h], h]) ** 2)) for h in range(H)])
    gain = 1 - model_rmse / baseline_rmse
    print(f"Modèle exporté : {destination}")
    print(f"Gain moyen sur le test B (modèle exporté) : {gain.mean():.4f}")
    print(f"Gain par horizon : {np.round(gain, 4)}")


if __name__ == "__main__":
    main()
