# DATA FILE CATALOG

**Generated:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
**Project:** MCI Terminal

## Overview

All data files (JSON, YAML, CSV) are preserved within the project structure as they are configuration, CI/CD, or dependency files.

## JSON Files (12 project files + 680 dependency)

### Project Configuration
| File | Location | Purpose |
|------|----------|---------|
| package.json | 12_APPLICATION_CODE/ | Node.js dependencies |
| package-lock.json | 12_APPLICATION_CODE/ | Dependency lockfile |
| tsconfig.json | 12_APPLICATION_CODE/ | TypeScript config |
| tsconfig.build.json | 12_APPLICATION_CODE/ | Build config |
| tsconfig.ci.json | 12_APPLICATION_CODE/ | CI config |
| tsconfig.node.json | 12_APPLICATION_CODE/ | Node config |

### Verification Data
| File | Location | Purpose |
|------|----------|---------|
| invariants.json | 99_INDEPENDENT_VERIFICATION/COMMON/ | System invariants |
| phase_contracts.json | 99_INDEPENDENT_VERIFICATION/COMMON/ | Phase contracts |
| expected_outputs.json | 99_INDEPENDENT_VERIFICATION/COMMON/ | Test expectations |
| scope.json | 99_INDEPENDENT_VERIFICATION/CLAUDE_CODE/ | Scope definition |
| vercel.json | 99_INDEPENDENT_VERIFICATION/VERCEL/ | Deployment config |

## YAML Files (13 project files + 69 dependency)

### GitHub Workflows
| File | Purpose |
|------|---------|
| ci.yml | Continuous integration |
| deploy.yml | Deployment pipeline |
| pr-checks.yml | Pull request validation |
| pad-gh1-*.yml | PAD test suites |
| pad-gh2-*.yml | PAD integration tests |
| independent_verification.yml | Verification workflow |

## Access

Navigate to: `PROJECTS/MCI_Terminal/`

---
*Cataloged per Holy Grail Protocol Phase 5*
