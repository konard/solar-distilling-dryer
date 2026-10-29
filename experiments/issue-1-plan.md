# Issue 1 execution checklist

Objective: implement and verify every requirement of issue #1 and its comments in PR #2; keep the PR unmerged. Native JavaScript only; no Rust port, translation, or native adapters are introduced.

1. [x] Read AGENTS.md, contributing and JavaScript-first instructions, complete issue and comments, all three PR comment/review types, and sub-issue inventory (none).
2. [x] Confirm prepared branch and clean initial tree; inspect existing scene, CI and test conventions.
3. [x] Capture the existing desktop and mobile rendering; reproduce missing fabrication definitions in an automated acceptance test.
4. [x] Define a single native JavaScript assembly specification: dimensions in mm, tolerances, materials, quantities, sanitary interfaces, two perpendicular support sheets, short vertical drain, independent cage and overlapping lid.
5. [x] Replace conceptual blocks with inspectable hollow geometry; orbit/zoom/pan, part selection, standard camera views, exploded assembly, section view and dimension controls.
6. [x] Add responsive accessible fabrication workspace with synchronized BOM, part details, assembly/cleaning procedure and downloadable CSV/JSON/dimensioned SVG/parametric CAD and cutting drawings.
7. [x] Document all design assumptions, fabrication interfaces and verification requirements; avoid claims of verified food/water safety or guaranteed yield. Keep acceptance assertions intact.
8. [x] Add meaningful native tests for specification invariants, drain and clearances, part/cut lists and exports, plus reproducible browser verification of interactions and mobile layout.
9. [x] Add changeset; run all local tests and required lint/format/duplication/syntax/line limits/changeset/docs checks within the 2.92 GiB memory limit. Preserve verbose logs in ci-logs. Run heavy checks sequentially.
10. [ ] Fetch/merge latest default branch, review the whole diff, commit atomic steps and validate exact candidate revision. Only this coordinator pushes, once per batch, only to issue-1-5e79aea78387.
11. [ ] Update PR title/body with requirement/evidence inventory, reproduction, assumptions and committed before/after screenshots. Preserve `Fixes #1`.
12. [ ] List CI runs with timestamps and head SHAs; preserve every failed same-revision workflow log, inspect errors with line numbers and batch all fixes before another push. Wait for all required same-revision CI.
13. [ ] Review gh pr diff, confirm no requested behavior removed, clean working tree, default branch included, all checks passing; mark PR #2 ready. Never merge/release/deploy as part of this task.

Evidence collected locally: baseline and final desktop/mobile screenshots; twelve native blueprint tests; Chromium orbit/pan/zoom, camera views, geometry/BOM selection, section/explode/reset, keyboard tabs, five completed downloads, responsive widths and fallback without 3D; OpenSCAD full CSG plus manifold chamber/stand/drain/vessel STL. DXF profiles also import/extrude in OpenSCAD (its parser ignores standard TEXT labels).

Repository Pages API returned HTTP 404 on 2026-10-29. Public launch remains an external prerequisite: enable GitHub Actions as Pages source and authorize the separate merge/deployment. Keep this criterion unfinished until deployment evidence exists. Physical manufacturing/process commissioning is documented rather than claimed as performed.

Local full-suite results: Node 925/925, Bun 925/925, Deno 924 passed and one existing runtime-specific ignored test. Lint/format/duplication, syntax, file limits, docs, workflow policy, actionlint and focused architecture gates pass. The Git comparison guards run after the commit so they inspect the candidate rather than unrelated existing changeset fragments.

Final refinement: retained optional automatic orbit and added a reproducing regression for eight 8 mm pins fitting the specified Ø8.5 drillings. Focused native tests pass in Node, Bun and Deno; the preceding full-suite counts predate this additional regression.
