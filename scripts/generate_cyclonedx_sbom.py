#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

COORD = re.compile(r"(?<![\w.-])([A-Za-z0-9_.-]+):([A-Za-z0-9_.-]+):([A-Za-z0-9_.+\-]+)")


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate a deterministic CycloneDX SBOM from Gradle dependency output")
    parser.add_argument("--dependencies", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path("sbom.cdx.json"))
    parser.add_argument("--project-name", default="Libre Remote")
    parser.add_argument("--project-version", default="UNRELEASED")
    parser.add_argument("--source-commit", default="UNKNOWN")
    args = parser.parse_args()

    text = args.dependencies.read_text(encoding="utf-8", errors="replace")
    coordinates = sorted(set(COORD.findall(text)))

    components = []
    for group, name, version in coordinates:
        purl = f"pkg:maven/{group}/{name}@{version}"
        components.append(
            {
                "type": "library",
                "bom-ref": purl,
                "group": group,
                "name": name,
                "version": version,
                "purl": purl,
            }
        )

    dependency_sha256 = hashlib.sha256(text.encode("utf-8")).hexdigest()
    serial_seed = f"{args.project_name}\0{args.project_version}\0{args.source_commit}\0{dependency_sha256}"
    serial_hex = hashlib.sha256(serial_seed.encode("utf-8")).hexdigest()[:32]
    serial = f"urn:uuid:{serial_hex[0:8]}-{serial_hex[8:12]}-{serial_hex[12:16]}-{serial_hex[16:20]}-{serial_hex[20:32]}"

    sbom = {
        "bomFormat": "CycloneDX",
        "specVersion": "1.6",
        "serialNumber": serial,
        "version": 1,
        "metadata": {
            "component": {
                "type": "application",
                "name": args.project_name,
                "version": args.project_version,
                "properties": [
                    {"name": "libre-remote:source-commit", "value": args.source_commit},
                    {"name": "libre-remote:gradle-dependency-output-sha256", "value": dependency_sha256},
                ],
            }
        },
        "components": components,
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(sbom, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"CycloneDX SBOM generated: components={len(components)} output={args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
