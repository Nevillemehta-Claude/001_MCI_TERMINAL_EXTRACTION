# Canonical and Taxonomical Study — 001_MCI_TERMINAL_EXTRACTION

**Study date:** 2026-01-31  
**Scope:** Full workspace and every subfolder to the lowest level  
**Criterion for “contains data”:** At least one file present (including hidden files, e.g. `.DS_Store`). Empty = no files in that folder or any descendant.

---

## 1. Executive summary

| Metric | Value |
|--------|--------|
| Total directories (all levels) | 3,468 |
| Total files (all types, including hidden) | 24,407 |
| **Directories with no data** | **65** |
| Top-level roots | 12 (including root `.`) |

The majority of files live under `PROJECTS/MCI_Terminal` (including `.git` and `node_modules`). Several top-level domains (ARCHIVES, TEMPLATES) and many leaf folders are purely structural and contain no files.

---

## 2. Canonical taxonomy (top-level)

Root: `001_MCI_TERMINAL_EXTRACTION` (workspace)

| Tier 1 | Purpose (inferred) | File count | Contains data? |
|--------|--------------------|------------|----------------|
| **ARCHIVES** | Backups, compressed, versioned artifacts | 0 | No |
| **ASSETS** | Fonts, images, source maps, media | 4 | Yes |
| **COMMUNICATIONS** | Correspondence, records, transcripts | 3 | Yes |
| **DATA** | Serialized, tabular, persistent data | 2 | Yes |
| **DOCUMENTATION** | Instructional, operational, reference, technical | 20 | Yes |
| **EXECUTABLES** | Binaries, installers, packages | 2 | Yes |
| **GOVERNANCE** | Directives, principles, protocols, standards, frameworks | 14 | Yes |
| **PROJECTS** | Application and project code (MCI_Terminal) | 24,355 | Yes |
| **RESEARCH** | Articles, papers, publications, reference | 1 | Yes |
| **TEMPLATES** | Code, configurations, documents | 0 | No |
| **UNCLASSIFIED** | Unclassified materials | 1 | Yes |

Root-level files (outside any of the above): `GOVERNANCE_INDEX.md`, `MIGRATION_LOG.md`, and any hidden files count as “data” at root.

---

## 3. Directories that do NOT contain any data

The following **65** directories contain **no files** in themselves or in any subfolder (including hidden). Subfolders may exist; they are empty of files as well.

### 3.1 Root-level domains (fully empty)

| Path | Notes |
|------|--------|
| `./ARCHIVES` | Entire tree empty (Backups, Compressed, Versioned) |
| `./TEMPLATES` | Entire tree empty (Code, Configurations, Documents) |

### 3.2 ASSETS

| Path |
|------|
| `./ASSETS/Audio` |
| `./ASSETS/Diagrams` |
| `./ASSETS/Screenshots` |
| `./ASSETS/Videos` |

### 3.3 COMMUNICATIONS

| Path |
|------|
| `./COMMUNICATIONS/Correspondence` |
| `./COMMUNICATIONS/Records` |

### 3.4 DATA

| Path |
|------|
| `./DATA/Persistent` |
| `./DATA/Spreadsheets` |
| `./DATA/Tabular` |

### 3.5 DOCUMENTATION

| Path |
|------|
| `./DOCUMENTATION/Instructional` |
| `./DOCUMENTATION/Operational` |
| `./DOCUMENTATION/Reference` |

### 3.6 EXECUTABLES

| Path |
|------|
| `./EXECUTABLES/Installers` |
| `./EXECUTABLES/Packages` |

### 3.7 GOVERNANCE

| Path |
|------|
| `./GOVERNANCE/06_Meta` |
| `./GOVERNANCE/07_Archive` |

### 3.8 PROJECTS/MCI_Terminal — Git and refs

| Path |
|------|
| `./PROJECTS/MCI_Terminal/.git/objects/info` |
| `./PROJECTS/MCI_Terminal/.git/objects/pack` |
| `./PROJECTS/MCI_Terminal/.git/refs/tags` |

### 3.9 PROJECTS/MCI_Terminal — Governance and structure

| Path |
|------|
| `./PROJECTS/MCI_Terminal/00_GOVERNANCE/CLASSIFICATION` |
| `./PROJECTS/MCI_Terminal/00_GOVERNANCE/PROTOCOLS` |
| `./PROJECTS/MCI_Terminal/01_DECISIONS/ARCHITECTURE` |
| `./PROJECTS/MCI_Terminal/01_DECISIONS/TECHNOLOGY` |
| `./PROJECTS/MCI_Terminal/01_DECISIONS/TRADE_OFFS` |
| `./PROJECTS/MCI_Terminal/02_ARCHITECTURE/INTEGRATION` |
| `./PROJECTS/MCI_Terminal/03_SPECIFICATIONS/API` |
| `./PROJECTS/MCI_Terminal/03_SPECIFICATIONS/DATA_MODELS` |
| `./PROJECTS/MCI_Terminal/03_SPECIFICATIONS/FEATURES` |
| `./PROJECTS/MCI_Terminal/03_SPECIFICATIONS/UI_UX` |
| `./PROJECTS/MCI_Terminal/04_IMPLEMENTATION/CODE_SNIPPETS/COMPONENTS` |
| `./PROJECTS/MCI_Terminal/04_IMPLEMENTATION/CODE_SNIPPETS/SERVICES` |
| `./PROJECTS/MCI_Terminal/04_IMPLEMENTATION/CODE_SNIPPETS/STORES` |
| `./PROJECTS/MCI_Terminal/04_IMPLEMENTATION/CODE_SNIPPETS/UTILITIES` |
| `./PROJECTS/MCI_Terminal/04_IMPLEMENTATION/CONFIG` |
| `./PROJECTS/MCI_Terminal/05_PROBLEMS_SOLVED/BUGS` |
| `./PROJECTS/MCI_Terminal/05_PROBLEMS_SOLVED/ERRORS` |
| `./PROJECTS/MCI_Terminal/05_PROBLEMS_SOLVED/TROUBLESHOOTING` |
| `./PROJECTS/MCI_Terminal/08_CERTIFICATION/GATE_REPORTS` |

### 3.10 PROJECTS/MCI_Terminal — Application code (node_modules / src)

| Path |
|------|
| `./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/node_modules/.bin` |
| `./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/node_modules/@babel/core/node_modules/.bin` |
| `./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/node_modules/@babel/helper-compilation-targets/node_modules/.bin` |
| `./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/node_modules/vite/node_modules` |
| `./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/src/__tests__` |
| `./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/src/client/__tests__` |
| `./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/src/client/components/dashboard` |
| `./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/src/client/components/ignition` |
| `./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/src/client/components/scanner` |
| `./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/src/client/components/shutdown` |
| `./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/src/client/components/token` |
| `./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/src/client/lib/__tests__` |

### 3.11 RESEARCH

| Path |
|------|
| `./RESEARCH/Articles` |
| `./RESEARCH/Papers` |
| `./RESEARCH/Publications` |
| `./RESEARCH/Reference` |

### 3.12 TEMPLATES (all empty)

| Path |
|------|
| `./TEMPLATES` |
| `./TEMPLATES/Code` |
| `./TEMPLATES/Configurations` |
| `./TEMPLATES/Documents` |

---

## 4. Flat list of all 65 no-data directories (for scripts/grep)

```
./ARCHIVES
./ARCHIVES/Backups
./ARCHIVES/Compressed
./ARCHIVES/Versioned
./ASSETS/Audio
./ASSETS/Diagrams
./ASSETS/Screenshots
./ASSETS/Videos
./COMMUNICATIONS/Correspondence
./COMMUNICATIONS/Records
./DATA/Persistent
./DATA/Spreadsheets
./DATA/Tabular
./DOCUMENTATION/Instructional
./DOCUMENTATION/Operational
./DOCUMENTATION/Reference
./EXECUTABLES/Installers
./EXECUTABLES/Packages
./GOVERNANCE/06_Meta
./GOVERNANCE/07_Archive
./PROJECTS/MCI_Terminal/.git/objects/info
./PROJECTS/MCI_Terminal/.git/objects/pack
./PROJECTS/MCI_Terminal/.git/refs/tags
./PROJECTS/MCI_Terminal/00_GOVERNANCE/CLASSIFICATION
./PROJECTS/MCI_Terminal/00_GOVERNANCE/PROTOCOLS
./PROJECTS/MCI_Terminal/01_DECISIONS/ARCHITECTURE
./PROJECTS/MCI_Terminal/01_DECISIONS/TECHNOLOGY
./PROJECTS/MCI_Terminal/01_DECISIONS/TRADE_OFFS
./PROJECTS/MCI_Terminal/02_ARCHITECTURE/INTEGRATION
./PROJECTS/MCI_Terminal/03_SPECIFICATIONS/API
./PROJECTS/MCI_Terminal/03_SPECIFICATIONS/DATA_MODELS
./PROJECTS/MCI_Terminal/03_SPECIFICATIONS/FEATURES
./PROJECTS/MCI_Terminal/03_SPECIFICATIONS/UI_UX
./PROJECTS/MCI_Terminal/04_IMPLEMENTATION/CODE_SNIPPETS/COMPONENTS
./PROJECTS/MCI_Terminal/04_IMPLEMENTATION/CODE_SNIPPETS/SERVICES
./PROJECTS/MCI_Terminal/04_IMPLEMENTATION/CODE_SNIPPETS/STORES
./PROJECTS/MCI_Terminal/04_IMPLEMENTATION/CODE_SNIPPETS/UTILITIES
./PROJECTS/MCI_Terminal/04_IMPLEMENTATION/CONFIG
./PROJECTS/MCI_Terminal/05_PROBLEMS_SOLVED/BUGS
./PROJECTS/MCI_Terminal/05_PROBLEMS_SOLVED/ERRORS
./PROJECTS/MCI_Terminal/05_PROBLEMS_SOLVED/TROUBLESHOOTING
./PROJECTS/MCI_Terminal/08_CERTIFICATION/GATE_REPORTS
./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/node_modules/.bin
./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/node_modules/@babel/core/node_modules/.bin
./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/node_modules/@babel/helper-compilation-targets/node_modules/.bin
./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/node_modules/vite/node_modules
./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/src/__tests__
./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/src/client/__tests__
./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/src/client/components/dashboard
./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/src/client/components/ignition
./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/src/client/components/scanner
./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/src/client/components/shutdown
./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/src/client/components/token
./PROJECTS/MCI_Terminal/12_APPLICATION_CODE/src/client/lib/__tests__
./RESEARCH/Articles
./RESEARCH/Papers
./RESEARCH/Publications
./RESEARCH/Reference
./TEMPLATES
./TEMPLATES/Code
./TEMPLATES/Configurations
./TEMPLATES/Documents
```

---

## 5. Methodology

- **Traversal:** `find . -type d` (all directories to lowest level).
- **“Contains data”:** A directory is considered to contain data if `find <dir> -type f` returns at least one path (any file, including hidden, e.g. `.DS_Store`).
- **“No data”:** Directories for which that count is zero (themselves and all descendants have no files).
- **Tooling:** Shell `find`; no `.gitignore` exclusion—all files counted.

---

## 6. Recommendations

1. **ARCHIVES / TEMPLATES** — Either add placeholder or README files so the structure is documented, or remove if not needed.
2. **GOVERNANCE 06_Meta / 07_Archive** — Already documented as reserved in `GOVERNANCE_INDEX.md`; consider adding a short README in each.
3. **Empty ASSETS subfolders** (Audio, Diagrams, Screenshots, Videos) — Align with ASSETS catalogs or add “no content yet” markers.
4. **Empty PROJECTS slots** (e.g. CODE_SNIPPETS, CONFIG, __tests__, component stubs) — Either populate or document as intentional placeholders.
5. **RESEARCH subfolders** — Add at least a README or catalog per folder if the taxonomy is to be used.

---

*End of canonical and taxonomical study.*
