# Submission path budget

Hard cap: 8,388,608 bytes for the complete submission bundle.

| Paths | Budget (bytes) | Purpose |
| --- | ---: | --- |
| `.gitignore` | 512 | Exclude generated dependency/cache directories at every depth and disposable scratch checks. Does not exclude `dist/`, source, lockfile, or evidence. |
| `src/`, `index.html`, `public/`, `tests/`, `scripts/` | 120,000 | Complete editable implementation and meaningful calculation/export tests. |
| `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts` | 120,000 | Reproducible dependency and build configuration. |
| `dist/` | 150,000 | Complete relative production export. |
| `README.md`, `DESIGN.md`, `artifacts/*.md`, `artifacts/*.json`, `artifacts/*.txt`, `artifacts/*.log` | 100,000 | Documentation, licenses and validation results. |
| `artifacts/*.png`, `artifacts/*.webp` | 2,000,000 | Rendered evidence at representative sizes and states. |

Dependencies and npm cache used for this assignment live outside the repository under `/tmp/`. No vendored registry, archives, submodules, or generated dependency tree is delivered. `.imd/reads/` is supplied input and removed by the task runner. Git metadata and protected paths are untouched by implementation commands. Final actual size is recorded in `artifacts/submission.json`.
