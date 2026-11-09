#!/usr/bin/env python3
"""Regenerate the three Jalon 4 comparison figures from the notebook tables.

This script intentionally uses only the Python standard library plus the local
ImageMagick executable, so it can run even when matplotlib is unavailable.
It updates both the notebook's embedded PNG outputs and the React presentation
assets without re-running the TensorFlow training cells.
"""

from __future__ import annotations

import base64
import html
import json
import shutil
import subprocess
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
NOTEBOOK = ROOT / "notebooks" / "uc4_jalon4.ipynb"
FIGURES = ROOT / "solardraa-presentation" / "public" / "figures"
WIDTH, HEIGHT = 1300, 520


def esc(value: object) -> str:
    return html.escape(str(value), quote=True)


def text(x: float, y: float, value: object, size: int = 16, anchor: str = "middle", weight: int = 400, color: str = "#111827") -> str:
    return f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}" font-family="DejaVu Sans, sans-serif" font-size="{size}" font-weight="{weight}" fill="{color}">{esc(value)}</text>'


def panel_title(x: float, y: float, width: float, value: str) -> str:
    return text(x + width / 2, y - 15, value, 18, weight=700)


def bar_panel(x: float, y: float, width: float, height: float, labels: list[str], values: list[float], title_value: str, ylabel: str, threshold: tuple[float, str] | None = None, colors: list[str] | None = None, percent: bool = False) -> str:
    colors = colors or ["#94a3b8", "#f59e0b", "#2563eb", "#10b981"]
    low = min(0.0, *(values + ([threshold[0]] if threshold else [])))
    high = max(*(values + ([threshold[0]] if threshold else [])))
    pad = max((high - low) * 0.18, 0.03)
    if low < 0:
        low -= pad * 0.15
    high += pad
    plot_x, plot_y = x + 75, y + 20
    plot_w, plot_h = width - 95, height - 75

    def sy(v: float) -> float:
        return plot_y + plot_h - (v - low) / (high - low) * plot_h

    out = [panel_title(x, y, width, title_value)]
    for i in range(6):
        v = low + (high - low) * i / 5
        yy = sy(v)
        out.append(f'<line x1="{plot_x}" y1="{yy:.1f}" x2="{plot_x + plot_w}" y2="{yy:.1f}" stroke="#d1d5db" stroke-width="1" opacity="0.75"/>')
        label = f"{v * 100:.0f}%" if percent else f"{v:.2f}"
        out.append(text(plot_x - 10, yy + 5, label, 13, "end", color="#374151"))
    out.append(f'<line x1="{plot_x}" y1="{plot_y}" x2="{plot_x}" y2="{plot_y + plot_h}" stroke="#111827" stroke-width="1.5"/>')
    out.append(f'<line x1="{plot_x}" y1="{sy(0):.1f}" x2="{plot_x + plot_w}" y2="{sy(0):.1f}" stroke="#111827" stroke-width="1.5"/>')
    step = plot_w / len(values)
    bar_w = step * 0.52
    for i, (label, value) in enumerate(zip(labels, values)):
        cx = plot_x + step * (i + 0.5)
        top, zero = sy(value), sy(0)
        yy, hh = min(top, zero), abs(zero - top)
        out.append(f'<rect x="{cx - bar_w / 2:.1f}" y="{yy:.1f}" width="{bar_w:.1f}" height="{hh:.1f}" rx="3" fill="{colors[i % len(colors)]}"/>')
        value_label = f"{value * 100:.1f}%" if percent else f"{value:.3f}"
        out.append(text(cx, yy - 8, value_label, 14, weight=700))
        out.append(text(cx, plot_y + plot_h + 24, label, 14))
    if threshold:
        yy = sy(threshold[0])
        out.append(f'<line x1="{plot_x}" y1="{yy:.1f}" x2="{plot_x + plot_w}" y2="{yy:.1f}" stroke="#dc2626" stroke-width="2" stroke-dasharray="8 6"/>')
        out.append(text(plot_x + plot_w - 4, yy - 7, threshold[1], 13, "end", 600, "#b91c1c"))
    out.append(f'<text transform="translate({x + 20:.1f},{plot_y + plot_h / 2:.1f}) rotate(-90)" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="14" font-weight="600" fill="#374151">{esc(ylabel)}</text>')
    return "".join(out)


def line_panel(x: float, y: float, width: float, height: float, series: list[tuple[str, list[float], str, str]], title_value: str, threshold: tuple[float, str], ymin: float = -0.12, ymax: float = 0.75) -> str:
    plot_x, plot_y = x + 72, y + 20
    plot_w, plot_h = width - 92, height - 72

    def sx(i: int) -> float:
        return plot_x + plot_w * i / 5

    def sy(v: float) -> float:
        return plot_y + plot_h - (v - ymin) / (ymax - ymin) * plot_h

    out = [panel_title(x, y, width, title_value)]
    for i in range(9):
        v = ymin + (ymax - ymin) * i / 8
        yy = sy(v)
        out.append(f'<line x1="{plot_x}" y1="{yy:.1f}" x2="{plot_x + plot_w}" y2="{yy:.1f}" stroke="#d1d5db" stroke-width="1" opacity="0.75"/>')
        out.append(text(plot_x - 9, yy + 5, f"{v:.1f}", 12, "end", color="#374151"))
    for i in range(6):
        xx = sx(i)
        out.append(f'<line x1="{xx:.1f}" y1="{plot_y}" x2="{xx:.1f}" y2="{plot_y + plot_h}" stroke="#e5e7eb" stroke-width="1"/>')
        out.append(text(xx, plot_y + plot_h + 22, i + 1, 13))
    out.append(f'<line x1="{plot_x}" y1="{plot_y}" x2="{plot_x}" y2="{plot_y + plot_h}" stroke="#111827" stroke-width="1.5"/>')
    out.append(f'<line x1="{plot_x}" y1="{plot_y + plot_h}" x2="{plot_x + plot_w}" y2="{plot_y + plot_h}" stroke="#111827" stroke-width="1.5"/>')
    yy = sy(threshold[0])
    out.append(f'<line x1="{plot_x}" y1="{yy:.1f}" x2="{plot_x + plot_w}" y2="{yy:.1f}" stroke="#16a34a" stroke-width="2" stroke-dasharray="8 6"/>')

    for name, values, color, dash in series:
        points = " ".join(f"{sx(i):.1f},{sy(v):.1f}" for i, v in enumerate(values))
        dash_attr = f' stroke-dasharray="{dash}"' if dash else ""
        out.append(f'<polyline points="{points}" fill="none" stroke="{color}" stroke-width="2.5"{dash_attr}/>')
        for i, value in enumerate(values):
            out.append(f'<circle cx="{sx(i):.1f}" cy="{sy(value):.1f}" r="4.5" fill="{color}"/>')

    legend_x, legend_y = plot_x + 8, plot_y + 8
    legend_h = 22 * (len(series) + 1) + 8
    out.append(f'<rect x="{legend_x}" y="{legend_y}" width="268" height="{legend_h}" rx="4" fill="white" fill-opacity="0.9" stroke="#d1d5db"/>')
    for i, (name, _values, color, dash) in enumerate(series):
        ly = legend_y + 21 + i * 22
        dash_attr = f' stroke-dasharray="{dash}"' if dash else ""
        out.append(f'<line x1="{legend_x + 10}" y1="{ly}" x2="{legend_x + 38}" y2="{ly}" stroke="{color}" stroke-width="2.5"{dash_attr}/>')
        out.append(text(legend_x + 46, ly + 5, name, 12, "start"))
    ly = legend_y + 21 + len(series) * 22
    out.append(f'<line x1="{legend_x + 10}" y1="{ly}" x2="{legend_x + 38}" y2="{ly}" stroke="#16a34a" stroke-width="2" stroke-dasharray="8 6"/>')
    out.append(text(legend_x + 46, ly + 5, threshold[1], 12, "start"))
    out.append(text(plot_x + plot_w / 2, plot_y + plot_h + 45, "Horizon (heures)", 14, weight=600, color="#374151"))
    out.append(f'<text transform="translate({x + 18:.1f},{plot_y + plot_h / 2:.1f}) rotate(-90)" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="14" font-weight="600" fill="#374151">Gain (skill score)</text>')
    return "".join(out)


def svg_document(content: str) -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}">
<rect width="100%" height="100%" fill="white"/>{content}</svg>'''


def render_svg(svg: str, output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", suffix=".svg", encoding="utf-8", delete=False) as handle:
        handle.write(svg)
        source = Path(handle.name)
    try:
        subprocess.run(["convert", "-density", "120", str(source), "-resize", f"{WIDTH}x{HEIGHT}", str(output)], check=True)
    finally:
        source.unlink(missing_ok=True)


def make_figures(temp_dir: Path) -> dict[str, Path]:
    figures: dict[str, Path] = {}
    gap, panel_w = 42, (WIDTH - 80 - 42) / 2
    x1, x2, y, panel_h = 25, 25 + panel_w + gap, 45, 445

    content = bar_panel(x1, y, panel_w, panel_h, ["SimpleRNN", "LSTM", "GRU"], [0.033, 0.044, 0.110], "Gain à 1 heure — iso-budget", "Gain t+1", (0.12, "Cible t+1 = 0.12"))
    content += bar_panel(x2, y, panel_w, panel_h, ["SimpleRNN", "LSTM", "GRU"], [0.445, 0.450, 0.464], "Gain moyen sur 6 horizons", "Gain moyen", (0.30, "Cible moyenne = 0.30"))
    figures["# Comparaison SimpleRNN(54) vs LSTM(28) vs GRU(32)"] = temp_dir / "jalon4_cell6_img1.png"
    render_svg(svg_document(content), figures["# Comparaison SimpleRNN(54) vs LSTM(28) vs GRU(32)"])

    content = line_panel(x1, y, panel_w, panel_h, [
        ("L=6h (Moy=0.472)", [0.118, 0.320, 0.487, 0.590, 0.640, 0.671], "#2563eb", ""),
        ("L=24h (Moy=0.455)", [0.120, 0.305, 0.452, 0.578, 0.632, 0.667], "#16a34a", ""),
        ("L=48h (Moy=0.449)", [0.086, 0.290, 0.450, 0.575, 0.630, 0.662], "#f59e0b", ""),
        ("L=168h (Moy=0.449)", [0.094, 0.285, 0.433, 0.570, 0.635, 0.670], "#dc2626", ""),
    ], "Gains par horizon selon l'historique", (0.30, "Cible = 0.30"), ymin=0.0)
    content += bar_panel(x2, y, panel_w, panel_h, ["6h", "24h", "48h", "168h"], [15.1, 30.9, 53.1, 162.2], "Temps d'entraînement — 25 époques", "Secondes", colors=["#2563eb", "#16a34a", "#f59e0b", "#dc2626"])
    figures["# Étude des longueurs d'historique L"] = temp_dir / "jalon4_cell8_img1.png"
    render_svg(svg_document(content), figures["# Étude des longueurs d'historique L"])

    content = line_panel(x1, y, panel_w, panel_h, [
        ("Direct GRU(48) (Moy=0.449)", [0.086, 0.290, 0.450, 0.575, 0.630, 0.662], "#2563eb", ""),
        ("Enc-Dec GRU(48) (Moy=0.443)", [0.046, 0.285, 0.452, 0.565, 0.630, 0.681], "#9333ea", ""),
    ], "Site A — Direct vs Encodeur-Décodeur", (0.30, "Cible Site A = 0.30"), ymin=0.0)
    content += line_panel(x2, y, panel_w, panel_h, [
        ("Zero-Shot Direct (Moy=0.423)", [-0.042, 0.250, 0.425, 0.550, 0.650, 0.705], "#16a34a", ""),
        ("Zero-Shot Enc-Dec (Moy=0.400)", [-0.090, 0.220, 0.395, 0.525, 0.640, 0.708], "#0d9488", "4 3"),
        ("Fine-Tuned Direct (Moy=0.443)", [0.013, 0.275, 0.440, 0.565, 0.665, 0.716], "#ea580c", "8 4"),
        ("Fine-Tuned Enc-Dec (Moy=0.418)", [-0.061, 0.240, 0.418, 0.545, 0.650, 0.712], "#dc2626", "8 4"),
    ], "Site B — Direct vs Encodeur-Décodeur", (0.27, "Cible Site B = 0.27"))
    figures["# Modèle Direct vs Encodeur-Décodeur"] = temp_dir / "jalon4_cell10_img1.png"
    render_svg(svg_document(content), figures["# Modèle Direct vs Encodeur-Décodeur"])
    return figures


def update_outputs(figures: dict[str, Path]) -> None:
    parsed = json.loads(NOTEBOOK.read_text(encoding="utf-8"))
    raw = NOTEBOOK.read_text(encoding="utf-8")
    for marker, png_path in figures.items():
        cell = next(cell for cell in parsed["cells"] if cell["cell_type"] == "code" and marker in "".join(cell.get("source", [])))
        output = next(item for item in cell["outputs"] if "image/png" in item.get("data", {}))
        old = output["data"]["image/png"]
        if isinstance(old, list):
            old = "".join(old)
        new = base64.b64encode(png_path.read_bytes()).decode("ascii")
        if old not in raw:
            raise RuntimeError(f"Could not find embedded output for {marker}")
        raw = raw.replace(old, new, 1)
        shutil.copy2(png_path, FIGURES / png_path.name)
    NOTEBOOK.write_text(raw, encoding="utf-8")


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="jalon4-figures-") as directory:
        figures = make_figures(Path(directory))
        update_outputs(figures)
    print("Synchronized Jalon 4 notebook outputs and presentation figures.")


if __name__ == "__main__":
    main()
