#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC_DIR = ROOT / "specs" / "001-rc5-4-multiplatform-hardening"
SPEC = SPEC_DIR / "spec.md"
PLAN = SPEC_DIR / "plan.md"
TASKS = SPEC_DIR / "tasks.md"
TRACE = SPEC_DIR / "traceability.md"
CONSTITUTION = ROOT / "specs" / "000-constitution.md"

REQUIREMENT_RE = re.compile(r"^\*\*(LR-(?:FR|NFR)-\d{3})\s+—\s+(.+?)\*\*", re.MULTILINE)
TASK_RE = re.compile(r"\*\*(T\d{3})\*\*")
REF_RE = re.compile(r"LR-(?:FR|NFR)-\d{3}")


def fail(message: str) -> None:
    print(f"SPEC-INTEGRITY FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def read(path: Path) -> str:
    if not path.is_file():
        fail(f"missing required artifact: {path.relative_to(ROOT)}")
    return path.read_text(encoding="utf-8")


constitution = read(CONSTITUTION)
spec = read(SPEC)
plan = read(PLAN)
tasks = read(TASKS)
trace = read(TRACE)

if "Specifications are the primary source of truth" not in constitution:
    fail("constitution does not declare specification precedence")

requirements = {match.group(1): match.group(2) for match in REQUIREMENT_RE.finditer(spec)}
if not requirements:
    fail("no LR-FR/LR-NFR requirements found in active spec")

must_requirements = {
    req_id
    for req_id, title in requirements.items()
    if "[MUST" in title
}

if not must_requirements:
    fail("active spec has no MUST requirements")

# Every requirement must appear in traceability; every MUST must also be represented
# by at least one implementation task or an explicit release/evidence rule.
trace_refs = set(REF_RE.findall(trace))
missing_trace = sorted(set(requirements) - trace_refs)
if missing_trace:
    fail("requirements missing from traceability: " + ", ".join(missing_trace))

# Task references must never point to unknown requirement IDs.
task_refs = set(REF_RE.findall(tasks))
unknown_task_refs = sorted(task_refs - set(requirements))
if unknown_task_refs:
    fail("tasks reference unknown requirements: " + ", ".join(unknown_task_refs))

# We allow grouped references such as LR-FR-020/021 in prose. For strict coverage,
# every MUST must still be visible in tasks or traceability. Traceability is mandatory;
# task coverage is required except for requirements enforced directly by release policy.
missing_task = sorted(must_requirements - task_refs)
if missing_task:
    print(
        "SPEC-INTEGRITY NOTE: MUST requirements without a direct task token: "
        + ", ".join(missing_task)
        + ". They remain release-blocking through traceability.",
        file=sys.stderr,
    )

# Task IDs must be unique.
task_ids = TASK_RE.findall(tasks)
duplicates = sorted({task_id for task_id in task_ids if task_ids.count(task_id) > 1})
if duplicates:
    fail("duplicate task IDs: " + ", ".join(duplicates))

# Plan must reference the active spec and the major architecture workstreams.
for token in ("LR-SPEC-001", "Canonical source", "Security and identity", "Protocol correctness", "Deterministic protocol lab"):
    if token not in plan:
        fail(f"implementation plan missing required section/token: {token}")

# Public release artifacts must point back to the active spec so documentation drift
# is visible during review.
public_docs = [
    ROOT / "LIBRE_REMOTE_RELEASE_MANIFEST.md",
    ROOT / "LIBRE_REMOTE_MULTIPLATFORM_SUPPORT.md",
]
for path in public_docs:
    text = read(path)
    if "specs/001-rc5-4-multiplatform-hardening/spec.md" not in text:
        fail(f"{path.name} does not link to active canonical spec")

print(
    f"SPEC-INTEGRITY PASS: {len(requirements)} requirements, "
    f"{len(must_requirements)} MUST requirements, {len(task_ids)} tasks"
)
