"""Render the five original line icons used by WeChat's native tab bar."""

from pathlib import Path
from PIL import Image, ImageDraw
import math


SIZE = 81
SCALE = 4
OUT = Path(__file__).resolve().parents[1] / "miniprogram" / "assets" / "tab"
OUT.mkdir(parents=True, exist_ok=True)


def xy(points):
    return [(round(x * SCALE), round(y * SCALE)) for x, y in points]


def line(draw, points, color, width=3.5, joint="curve"):
    draw.line(xy(points), fill=color, width=round(width * SCALE), joint=joint)
    radius = width * SCALE / 2
    for x, y in (points[0], points[-1]):
        cx, cy = x * SCALE, y * SCALE
        draw.ellipse((round(cx - radius), round(cy - radius), round(cx + radius), round(cy + radius)), fill=color)


def box(values):
    return tuple(round(value * SCALE) for value in values)


def draw_today(draw, color):
    draw.ellipse(box((30, 30, 51, 51)), outline=color, width=round(3.5 * SCALE))
    for n in range(8):
        angle = n * math.pi / 4
        line(draw, [(40.5 + 17 * math.cos(angle), 40.5 + 17 * math.sin(angle)),
                    (40.5 + 23 * math.cos(angle), 40.5 + 23 * math.sin(angle))], color, 3)


def draw_todo(draw, color):
    draw.rounded_rectangle(box((18, 19, 63, 62)), radius=round(8 * SCALE), outline=color, width=round(3.5 * SCALE))
    line(draw, [(28, 41), (37, 49), (53, 31)], color, 3.5)


def draw_reading(draw, color):
    line(draw, [(40.5, 58), (32, 54), (19, 54), (19, 24), (31, 24), (40.5, 28), (40.5, 58)], color, 3.2)
    line(draw, [(40.5, 58), (49, 54), (62, 54), (62, 24), (50, 24), (40.5, 28)], color, 3.2)


def draw_pause(draw, color):
    draw.ellipse(box((17, 17, 64, 64)), outline=color, width=round(3.5 * SCALE))
    line(draw, [(35, 31), (35, 50)], color, 4)
    line(draw, [(46, 31), (46, 50)], color, 4)


def draw_mine(draw, color):
    draw.ellipse(box((32, 20, 49, 37)), outline=color, width=round(3.5 * SCALE))
    draw.arc(box((21, 39, 60, 76)), 190, 350, fill=color, width=round(3.5 * SCALE))


for name, painter in {
    "today": draw_today,
    "todo": draw_todo,
    "reading": draw_reading,
    "pause": draw_pause,
    "mine": draw_mine,
}.items():
    for state, color in (("normal", "#60594f"), ("selected", "#4e553e")):
        image = Image.new("RGBA", (SIZE * SCALE, SIZE * SCALE), (0, 0, 0, 0))
        painter(ImageDraw.Draw(image), color)
        image.resize((SIZE, SIZE), Image.Resampling.LANCZOS).save(OUT / f"{name}-{state}.png", optimize=True)
