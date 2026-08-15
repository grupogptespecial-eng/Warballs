#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

PASS = "PASS"
ALLOWED_LEVELS = {"stable", "1.0"}


def main() -> int:
    p = argparse.ArgumentParser(description="Fail closed unless all Libre Remote release evidence gates for a level are PASS")
    p.add_argument("--evidence", type=Path, default=Path("release/evidence.json"))
    p.add_argument("--level", choices=sorted(ALLOWED_LEVELS), required=True)
    p.add_argument("--report", type=Path, default=Path("release-gate-report.json"))
    args = p.parse_args()

    data = json.loads(args.evidence.read_text(encoding="utf-8"))
    gates = data.get("gates", [])
    failures = []
    considered = []

    seen: set[str] = set()
    for gate in gates:
        gate_id = gate.get("id")
        if not isinstance(gate_id, str) or not gate_id:
            failures.append({"id": "INVALID", "status": "INVALID", "reason": "gate missing id"})
            continue
        if gate_id in seen:
            failures.append({"id": gate_id, "status": "INVALID", "reason": "duplicate gate id"})
            continue
        seen.add(gate_id)

        required_for = gate.get("required_for", [])
        if args.level not in required_for:
            continue
        status = str(gate.get("status", "MISSING"))
        item = {
            "id": gate_id,
            "status": status,
            "evidence": gate.get("evidence", ""),
        }
        considered.append(item)
        if status != PASS:
            failures.append(item)

    if not considered:
        failures.append({"id": "NO_GATES", "status": "INVALID", "reason": f"no gates found for level {args.level}"})

    report = {
        "release": data.get("release"),
        "source_lineage": data.get("source_lineage"),
        "level": args.level,
        "status": PASS if not failures else "BLOCKED",
        "considered": considered,
        "blocking": failures,
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    if failures:
        print(f"{args.level} promotion BLOCKED", file=sys.stderr)
        for item in failures:
            print(f"- {item.get('id')}: {item.get('status')} ({item.get('evidence', item.get('reason', ''))})", file=sys.stderr)
        return 1

    print(f"{args.level} promotion gate PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
