# VERBATIM CODE SNIPPETS

**Source:** b8937bc2-ac10-4287-8ced-af96ac5f6f0b.jsonl
**Extraction Date:** 2026-01-25
**Purpose:** Preserve actual code blocks from session

---

## TypeScript Interfaces

```typescript
interface UXMIComponentProps {
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  disabledReason?: string; // REQUIRED if disabled=true
  ariaLabel?: string;
  shortcut?: string;
}
```

```typescript
interface ErrorDisplayProps {
  what: string;  // WHAT happened - Brief description
  why?: string;  // WHY it happened - Technical reason
  how?: string;  // HOW to fix it - Actionable steps
  // ...
}
```

```typescript
interface CheckResult {
  id: string;              // e.g., "PORT_8000"
  name: string;            // Human-readable name
  status: 'pass' | 'fail' | 'warn';
  latency_ms: number;      // Execution time
  details: string;         // Additional context
  timestamp: number;       // Unix timestamp
}
```

```typescript
interface CheckResult {
       id: string;
       name: string;
       status: 'pass' | 'fail' | 'warn';
       latency_ms: number;
       details: string;
     }
```

## FILE LINE REFERENCES (VERBATIM)

- **auth.ts**: Lines 38
- **shutdownStore.ts**: Lines 47
- **telemetry.ts**: Lines 31
- **tokenStore.ts**: Lines 108, 23, 38, 49, 75
- **types.ts**: Lines 152, 174
