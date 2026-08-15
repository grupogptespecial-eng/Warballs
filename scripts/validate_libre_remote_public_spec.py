#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC_DIR = ROOT / "specs" / "002-public-stable-1-0"
SPEC = SPEC_DIR / "spec.md"
PLAN = SPEC_DIR / "plan.md"
TASKS = SPEC_DIR / "tasks.md"
TRACE = SPEC_DIR / "traceability.md"

REQUIREMENT_RE = re.compile(r"^\*\*(LRP-(?:FR|NFR)-\d{3})\s+—\s+(.+?)\*\*", re.MULTILINE)
TASK_RE = re.compile(r"\*\*(P\d{3})\*\*")
REF_RE = re.compile(r"LRP-(?:FR|NFR)-\d{3}")
TASK_REF_RE = re.compile(r"P\d{3}")


def fail(message: str) -> None:
    print(f"PUBLIC-SPEC-INTEGRITY FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def read(path: Path) -> str:
    if not path.is_file():
        fail(f"missing required artifact: {path.relative_to(ROOT)}")
    return path.read_text(encoding="utf-8")


spec = read(SPEC)
plan = read(PLAN)
tasks = read(TASKS)
trace = read(TRACE)

requirements = {m.group(1): m.group(2) for m in REQUIREMENT_RE.finditer(spec)}
if not requirements:
    fail("no LRP requirements found")

must_requirements = {req for req, title in requirements.items() if "[MUST" in title}
if not must_requirements:
    fail("no MUST requirements found")

trace_refs = set(REF_RE.findall(trace))
missing_trace = sorted(set(requirements) - trace_refs)
if missing_trace:
    fail("requirements missing from traceability: " + ", ".join(missing_trace))

task_refs = set(REF_RE.findall(tasks))
unknown_task_refs = sorted(task_refs - set(requirements))
if unknown_task_refs:
    fail("tasks reference unknown requirements: " + ", ".join(unknown_task_refs))

missing_task_refs = sorted(must_requirements - task_refs)
if missing_task_refs:
    fail("MUST requirements missing direct task coverage: " + ", ".join(missing_task_refs))

task_ids = TASK_RE.findall(tasks)
duplicates = sorted({task for task in task_ids if task_ids.count(task) > 1})
if duplicates:
    fail("duplicate task IDs: " + ", ".join(duplicates))

trace_task_refs = set(TASK_REF_RE.findall(trace))
unknown_trace_tasks = sorted(trace_task_refs - set(task_ids))
if unknown_trace_tasks:
    fail("traceability references unknown tasks: " + ", ".join(unknown_trace_tasks))

for token in (
    "Public source boundary",
    "Licensing and supply chain",
    "Stable Candidate",
    "1.0",
    "Guarded publication",
):
    if token not in plan:
        fail(f"plan missing required workstream/token: {token}")

required_implementation_files = (
    ROOT / "LICENSE",
    ROOT / "NOTICE",
    ROOT / "THIRD_PARTY_NOTICES.md",
    ROOT / "PRIVACY.md",
    ROOT / "SUPPORT.md",
    ROOT / "STORE_METADATA.md",
    ROOT / "RELEASE_POLICY.md",
    ROOT / "VERSIONING.md",
    ROOT / "release" / "evidence.json",
    ROOT / "release" / "README.md",
    ROOT / "scripts" / "audit_public_release.py",
    ROOT / "scripts" / "audit_git_history.py",
    ROOT / "scripts" / "audit_third_party_licenses.py",
    ROOT / "scripts" / "generate_cyclonedx_sbom.py",
    ROOT / "scripts" / "export_libre_remote_public.py",
    ROOT / "scripts" / "record_release_evidence.py",
    ROOT / "scripts" / "check_release_evidence.py",
    ROOT / "public-repo" / ".github" / "workflows" / "ci.yml",
    ROOT / "public-repo" / ".github" / "workflows" / "promotion-gate.yml",
    ROOT / ".github" / "workflows" / "libre-remote-open-source-readiness.yml",
    ROOT / ".github" / "workflows" / "libre-remote-publish-public-repo.yml",
)
missing_files = [str(path.relative_to(ROOT)) for path in required_implementation_files if not path.is_file()]
if missing_files:
    fail("required implementation files missing: " + ", ".join(missing_files))

print(
    f"PUBLIC-SPEC-INTEGRITY PASS: {len(requirements)} requirements, "
    f"{len(must_requirements)} MUST requirements, {len(task_ids)} tasks"
)
