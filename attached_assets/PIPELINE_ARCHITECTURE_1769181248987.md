# Pipeline Architecture

## Flow (simplified)
1) Scenario is defined and stored as an ICDU.
2) One or more models generate outputs for the ICDU.
3) AI Judge produces quantitative scores and gates:
   - promote / pass
   - escalate
   - block
4) HITL Nuance Grader is applied to selected samples:
   - rubric-based scoring
   - aggregation + audit trail
5) Stress Engine generates systematic perturbations:
   - role, tone, constraints, channel, etc.
   - rerun steps 2–4 at scale

## Key design goals
- Auditability: every decision traceable to structured fields and scores
- Repeatability: same ICDU + same model → comparable results over time
- Governance: explicit thresholds and human escalation paths
