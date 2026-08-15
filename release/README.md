# Libre Remote Release Evidence

`release/evidence.json` is the machine-readable promotion ledger for Stable Candidate and 1.0.

## Status meanings

- `IMPLEMENTED` — the source/configuration mechanism exists but has not produced accepted evidence.
- `BLOCKED` — evidence cannot currently complete because of infrastructure, credentials, approval, unresolved review, or another explicit blocker.
- `NOT_TESTED` — the required physical/manual scenario has not been performed.
- `FAIL` — the gate executed and failed.
- `PASS` — the gate executed/reviewed successfully **and** has a reviewable `evidence_ref` plus the exact `source_commit` the evidence applies to.

A plain textual edit to `"status": "PASS"` is insufficient. `scripts/check_release_evidence.py` rejects PASS entries without traceability fields.

## Recording evidence

Use the recorder instead of editing a PASS by hand:

```bash
python3 scripts/record_release_evidence.py \
  --gate rc5_spec_integrity \
  --status PASS \
  --evidence-ref 'https://github.com/OWNER/REPO/actions/runs/RUN_ID' \
  --source-commit COMMIT_SHA
```

For a physical/manual gate, the evidence reference can point to a committed evidence document/section, for example:

```bash
python3 scripts/record_release_evidence.py \
  --gate physical_lg_matrix \
  --status PASS \
  --evidence-ref 'LIBRE_REMOTE_HARDWARE_MATRIX.md#validated-lg-matrix' \
  --source-commit COMMIT_SHA \
  --note 'Representative advertised LG support matrix complete'
```

If a candidate changes after evidence was collected, re-run/review the affected gates and record them against the new source commit. Do not silently reuse stale evidence for materially changed code.

## Checking promotion

Stable Candidate:

```bash
python3 scripts/check_release_evidence.py --level stable --report stable-gate.json
```

1.0:

```bash
python3 scripts/check_release_evidence.py --level 1.0 --report 1.0-gate.json
```

Every required gate must be a traceable PASS.

## Licensing evidence

`third_party_license_review` may become PASS only after the generated dependency/license inventory and bundled assets have been reviewed and the canonical `THIRD_PARTY_NOTICES.md` is changed to:

`THIRD_PARTY_AUDIT_STATUS: COMPLETE`

## Publication

Passing the 1.0 checker does not itself publish a repository. Actual repository publication remains a separate guarded operation in `.github/workflows/libre-remote-publish-public-repo.yml` with explicit operator intent.
