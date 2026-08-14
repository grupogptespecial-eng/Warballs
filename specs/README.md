# Libre Remote — Spec-Driven Development

The `specs/` tree is the canonical engineering intent for Libre Remote.

## Precedence

When artifacts disagree, resolve them in this order:

1. `000-constitution.md` — non-negotiable engineering principles.
2. Feature/release `spec.md` — required product behavior and acceptance criteria.
3. `plan.md` — implementation design chosen to satisfy the spec.
4. `contracts/` — stable interfaces and cross-platform semantics.
5. `tasks.md` — executable work derived from the plan.
6. Evidence/validation documents and workflows.
7. General README/roadmap prose.
8. Existing implementation.

Code that conflicts with an approved MUST requirement is considered implementation drift, not a reason to silently rewrite the requirement.

## Active specification

- `001-rc5-4-multiplatform-hardening/` — Libre Remote 2.1.3 RC5.4 multiplatform hardening.

## Change workflow

1. Change the spec first when product behavior, support claims or invariants change.
2. Update the implementation plan if architecture changes.
3. Add/update task IDs.
4. Add acceptance tests/evidence before considering the task complete.
5. Update `traceability.md` so every MUST has evidence.
6. Update public documentation only after evidence supports the claim.

## Requirement language

- **MUST** — release-blocking when in scope.
- **SHOULD** — expected unless a documented decision explains why not.
- **MAY** — optional.

## Status language

- `TODO` — not implemented.
- `IMPLEMENTED` — code/config exists, evidence not yet executed.
- `PASS` — required evidence executed successfully.
- `FAIL` — executed and failed.
- `BLOCKED` — cannot execute because of an external prerequisite.
- `NOT TESTED` — no evidence yet.

`IMPLEMENTED` is never equivalent to `PASS`.
