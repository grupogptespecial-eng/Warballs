#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

ALLOWED_STATUS = {"PASS", "BLOCKED", "NOT_TESTED", "IMPLEMENTED", "FAIL"}


def main() -> int:
    parser = argparse.ArgumentParser(description="Record a Libre Remote release evidence transition")
    parser.add_argument("--evidence", type=Path, default=Path("release/evidence.json"))
    parser.add_argument("--gate", required=True)
    parser.add_argument("--status", choices=sorted(ALLOWED_STATUS), required=True)
    parser.add_argument("--evidence-ref", default="", help="workflow URL, artifact reference, document/section, or other reviewable evidence")
    parser.add_argument("--source-commit", default="", help="exact candidate/source commit this evidence applies to")
    parser.add_argument("--note", default="")
    args = parser.parse_args()

    data = json.loads(args.evidence.read_text(encoding="utf-8"))
    matches = [gate for gate in data.get("gates", []) if gate.get("id") == args.gate]
    if len(matches) != 1:
        raise SystemExit(f"expected exactly one gate named {args.gate!r}, found {len(matches)}")

    if args.status == "PASS":
        if not args.evidence_ref.strip():
            raise SystemExit("PASS requires --evidence-ref")
        if not args.source_commit.strip() or len(args.source_commit.strip()) < 7:
            raise SystemExit("PASS requires --source-commit identifying the candidate/source revision")

    gate = matches[0]
    gate["status"] = args.status
    if args.evidence_ref.strip():
        gate["evidence_ref"] = args.evidence_ref.strip()
    else:
        gate.pop("evidence_ref", None)
    if args.source_commit.strip():
        gate["source_commit"] = args.source_commit.strip()
    else:
        gate.pop("source_commit", None)
    if args.note.strip():
        gate["note"] = args.note.strip()
    else:
        gate.pop("note", None)
    gate["recorded_at"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    args.evidence.write_text(json.dumps(data, indent=2, sort_keys=False) + "\n", encoding="utf-8")
    print(f"recorded {args.gate}={args.status}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
