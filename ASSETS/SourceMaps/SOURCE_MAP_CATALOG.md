# SOURCE MAP CATALOG

**Generated:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
**Project:** MCI Terminal

## Overview

Source maps (.map files) are preserved within the project structure to maintain their relationship with corresponding JavaScript files.

## Distribution

| Location | Count | Purpose |
|----------|-------|---------|
| PROJECTS/MCI_Terminal/12_APPLICATION_CODE/node_modules/ | 4,832 | Dependency source maps |
| PROJECTS/MCI_Terminal/12_APPLICATION_CODE/dist/ | 1 | Build output source map |
| **TOTAL** | **4,833** | |

## Why Not Moved

Source maps must remain co-located with their .js files because:
1. Browsers resolve .map files relative to the .js file path
2. Moving them breaks the `//# sourceMappingURL=` reference
3. Debug tooling depends on this relationship

## Access

To access source maps, navigate to:
```
PROJECTS/MCI_Terminal/12_APPLICATION_CODE/
├── node_modules/  ← 4,832 dependency maps
└── dist/          ← 1 build map
```

---
*Cataloged per Holy Grail Protocol Phase 4*
