#!/usr/bin/env python3
from __future__ import annotations

import argparse
import collections
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

BOUNDS = re.compile(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]")
GENERIC_LABELS = {"button", "image", "icon", "view", "android.view.view", "android.widget.imageview"}

parser = argparse.ArgumentParser()
parser.add_argument("xml", type=Path)
parser.add_argument("--width", type=int, required=True)
parser.add_argument("--height", type=int, required=True)
parser.add_argument("--density", type=int, required=True, help="Android density dpi")
parser.add_argument("--report", type=Path, required=True)
args = parser.parse_args()

root = ET.parse(args.xml).getroot()
overflow: list[tuple[str, str]] = []
small_critical: list[tuple[str, float, float, str]] = []
small_warning: list[tuple[str, float, float, str]] = []
unlabeled: list[tuple[str, str, str]] = []
unfocusable: list[tuple[str, str]] = []
clickable_labels: list[str] = []
clickable_count = 0
scale = args.density / 160.0


def semantic_label(node: ET.Element) -> str:
    text = (node.attrib.get("text") or "").strip()
    desc = (node.attrib.get("content-desc") or "").strip()
    hint = (node.attrib.get("hint") or "").strip()
    return desc or text or hint


for node in root.iter("node"):
    raw = node.attrib.get("bounds", "")
    match = BOUNDS.fullmatch(raw)
    if not match:
        continue
    x1, y1, x2, y2 = map(int, match.groups())
    if x2 <= x1 or y2 <= y1:
        continue

    cls = (node.attrib.get("class") or "node").strip()
    label = semantic_label(node) or cls
    if x1 < 0 or y1 < 0 or x2 > args.width or y2 > args.height:
        overflow.append((label, raw))

    clickable = node.attrib.get("clickable") == "true" or node.attrib.get("long-clickable") == "true"
    visible = node.attrib.get("visible-to-user", "true") != "false"
    enabled = node.attrib.get("enabled", "true") != "false"
    if not (clickable and visible and enabled):
        continue

    clickable_count += 1
    semantic = semantic_label(node)
    width_dp = (x2 - x1) / scale
    height_dp = (y2 - y1) / scale

    if width_dp < 36 or height_dp < 36:
        small_critical.append((semantic or cls, width_dp, height_dp, raw))
    elif width_dp < 48 or height_dp < 48:
        small_warning.append((semantic or cls, width_dp, height_dp, raw))

    # An interactive control must expose a user-facing semantic name. Class names
    # are implementation detail and are not accepted as accessibility labels.
    normalized = semantic.casefold().strip() if semantic else ""
    if not normalized or normalized in GENERIC_LABELS:
        unlabeled.append((cls, raw, node.attrib.get("resource-id", "")))
    else:
        clickable_labels.append(normalized)

    if node.attrib.get("focusable") == "false":
        unfocusable.append((semantic or cls, raw))

label_counts = collections.Counter(clickable_labels)
# Repeated labels can be legitimate (for example two contextual Back controls),
# so duplicates are evidence/warnings rather than a hard failure.
duplicate_labels = sorted((label, count) for label, count in label_counts.items() if count > 1)

args.report.parent.mkdir(parents=True, exist_ok=True)
with args.report.open("w", encoding="utf-8") as handle:
    handle.write(f"screen={args.width}x{args.height} density={args.density}\n")
    handle.write(f"clickable_nodes={clickable_count}\n")
    handle.write(f"overflow_nodes={len(overflow)}\n")
    handle.write(f"critical_small_targets={len(small_critical)}\n")
    handle.write(f"warning_small_targets={len(small_warning)}\n")
    handle.write(f"unlabeled_interactive_nodes={len(unlabeled)}\n")
    handle.write(f"explicitly_unfocusable_interactive_nodes={len(unfocusable)}\n")
    handle.write(f"duplicate_accessible_labels={len(duplicate_labels)}\n")
    for label, bounds in overflow:
        handle.write(f"OVERFLOW {label!r} {bounds}\n")
    for label, w, h, bounds in small_critical:
        handle.write(f"CRITICAL_TARGET {label!r} {w:.1f}x{h:.1f}dp {bounds}\n")
    for label, w, h, bounds in small_warning:
        handle.write(f"WARN_TARGET {label!r} {w:.1f}x{h:.1f}dp {bounds}\n")
    for cls, bounds, resource_id in unlabeled:
        handle.write(f"UNLABELED_CONTROL class={cls!r} resource={resource_id!r} bounds={bounds}\n")
    for label, bounds in unfocusable:
        handle.write(f"WARN_UNFOCUSABLE {label!r} {bounds}\n")
    for label, count in duplicate_labels:
        handle.write(f"WARN_DUPLICATE_LABEL {label!r} count={count}\n")

hard_failures = []
if overflow:
    hard_failures.append(f"{len(overflow)} node(s) outside the viewport")
if small_critical:
    hard_failures.append(f"{len(small_critical)} clickable target(s) below 36dp")
if unlabeled:
    hard_failures.append(f"{len(unlabeled)} interactive control(s) without accessible text/content description")

if hard_failures:
    print("UI/accessibility audit failed: " + "; ".join(hard_failures), file=sys.stderr)
    raise SystemExit(1)

print(
    f"UI/accessibility audit pass: {clickable_count} interactive controls, "
    f"{len(small_warning)} target(s) below recommended 48dp, "
    f"{len(unfocusable)} explicit focus warning(s), "
    f"{len(duplicate_labels)} duplicate-label warning(s)"
)
