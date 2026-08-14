#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

BOUNDS = re.compile(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]")

parser = argparse.ArgumentParser()
parser.add_argument("xml", type=Path)
parser.add_argument("--width", type=int, required=True)
parser.add_argument("--height", type=int, required=True)
parser.add_argument("--density", type=int, required=True, help="Android density dpi")
parser.add_argument("--report", type=Path, required=True)
args = parser.parse_args()

root = ET.parse(args.xml).getroot()
overflow = []
small_critical = []
small_warning = []
clickable_count = 0
scale = args.density / 160.0

for node in root.iter("node"):
    raw = node.attrib.get("bounds", "")
    match = BOUNDS.fullmatch(raw)
    if not match:
        continue
    x1, y1, x2, y2 = map(int, match.groups())
    if x2 <= x1 or y2 <= y1:
        continue
    label = node.attrib.get("text") or node.attrib.get("content-desc") or node.attrib.get("class") or "node"
    if x1 < 0 or y1 < 0 or x2 > args.width or y2 > args.height:
        overflow.append((label, raw))

    if node.attrib.get("clickable") == "true":
        clickable_count += 1
        width_dp = (x2 - x1) / scale
        height_dp = (y2 - y1) / scale
        if width_dp < 36 or height_dp < 36:
            small_critical.append((label, width_dp, height_dp, raw))
        elif width_dp < 48 or height_dp < 48:
            small_warning.append((label, width_dp, height_dp, raw))

args.report.parent.mkdir(parents=True, exist_ok=True)
with args.report.open("w", encoding="utf-8") as handle:
    handle.write(f"screen={args.width}x{args.height} density={args.density}\n")
    handle.write(f"clickable_nodes={clickable_count}\n")
    handle.write(f"overflow_nodes={len(overflow)}\n")
    handle.write(f"critical_small_targets={len(small_critical)}\n")
    handle.write(f"warning_small_targets={len(small_warning)}\n")
    for label, bounds in overflow:
        handle.write(f"OVERFLOW {label!r} {bounds}\n")
    for label, w, h, bounds in small_critical:
        handle.write(f"CRITICAL_TARGET {label!r} {w:.1f}x{h:.1f}dp {bounds}\n")
    for label, w, h, bounds in small_warning:
        handle.write(f"WARN_TARGET {label!r} {w:.1f}x{h:.1f}dp {bounds}\n")

if overflow:
    print(f"UI audit failed: {len(overflow)} node(s) outside the viewport", file=sys.stderr)
    raise SystemExit(1)
if small_critical:
    print(f"UI audit failed: {len(small_critical)} clickable target(s) below 36dp", file=sys.stderr)
    raise SystemExit(1)

print(
    f"UI audit pass: {clickable_count} clickable, "
    f"{len(small_warning)} target(s) below recommended 48dp"
)
