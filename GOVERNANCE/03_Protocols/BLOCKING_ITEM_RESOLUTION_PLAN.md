# Blocking Item Resolution Plan
## MCI Boundary-Confined Remediation for CIA-SIE-PURE Integration Eligibility

**Document ID:** MCI-RESOLUTION-001  
**Date:** 2026-01-29  
**Classification:** RESOLUTION PLANNING (Documentation Only)  
**Execution Status:** 🔒 DOCUMENTATION ONLY — NO CODE EXECUTION AUTHORIZED

---

## Preamble

This document specifies how MCI will address the four blocking items identified in the CIA-SIE-PURE Integration Eligibility Attestation. All remediation is:

- **Confined to MCI boundaries only**
- **Does not modify CIA-SIE-PURE in any way**
- **Does not create runtime coupling, streaming, or lifecycle binding**
- **Explicit, verifiable, and reversible**

---

## Governing Constraints

| Constraint | Status |
|------------|--------|
| CIA-SIE-PURE modification | ❌ PROHIBITED |
| Runtime integration | ❌ PROHIBITED |
| Data streaming | ❌ PROHIBITED |
| Command coupling | ❌ PROHIBITED |
| Lifecycle binding | ❌ PROHIBITED |
| MCI boundary documentation | ✅ AUTHORIZED |
| MCI boundary specification | ✅ AUTHORIZED |

---

## BLOCK-001: INV-006 Violation — Input Sanitization

### Blocker Summary

CIA-SIE-PURE does not implement control character rejection at system boundaries. Characters `\x00-\x1F` (excluding standard whitespace `\x09`, `\x0A`, `\x0D`) are not rejected. CRLF injection prevention is not implemented.

### Principal Decision

**B) Authorize MCI boundary sanitization**

CIA-SIE-PURE shall remain unchanged. All control-character rejection and sanitization will be enforced at the MCI boundary.

### Resolution Specification

#### Invariant Addressed

**INV-006: Input Sanitization & Boundary Cleanliness**

#### MCI Boundary Location

All data received from CIA-SIE-PURE must pass through a sanitization layer before:
- Being stored in MCI state (Zustand stores)
- Being displayed in MCI UI components
- Being used in MCI logging
- Being passed to MCI error handlers

**Boundary Entry Points (where sanitization applies):**

| Entry Point | Data Type | Sanitization Required |
|-------------|-----------|----------------------|
| `cia-sie.ts` service responses | All string fields | ✅ YES |
| Health check responses | Status strings | ✅ YES |
| Error responses | Error messages, details | ✅ YES |
| Signal data | Direction, indicators, raw_payload | ✅ YES |
| Narrative content | AI-generated text | ✅ YES |

#### Sanitization Rules

The following sanitization rules SHALL be applied at MCI boundary:

```
CONTROL_CHAR_PATTERN = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g

For each string field received from CIA-SIE-PURE:
  1. Reject if contains NULL byte (\x00) — throw ValidationError
  2. Strip control characters matching CONTROL_CHAR_PATTERN
  3. Normalize CRLF sequences to LF only
  4. Trim leading/trailing whitespace
  5. Validate maximum length per field type
```

#### Implementation Location in MCI

| Component | File | Purpose |
|-----------|------|---------|
| `sanitizeCiaSieResponse()` | `src/shared/validation.ts` | Central sanitization function |
| Response interceptor | `src/server/services/cia-sie.ts` | Apply sanitization to all responses |
| Type guard | `src/shared/types/cia-sie.ts` | Type-safe sanitized response |

#### Validation Method

| Validation | Method | Pass Criteria |
|------------|--------|---------------|
| Unit tests | Test sanitization function with malformed input | All control chars removed |
| Integration tests | Mock CIA-SIE-PURE responses with control chars | MCI rejects/sanitizes correctly |
| Boundary test | Inject `\x00`, `\x0B`, `\x1F` in mock responses | No control chars reach UI or logs |
| Regression | Add to CI pipeline | 100% pass rate |

#### Reversibility

This remediation is fully reversible:
- Sanitization function can be disabled via feature flag
- No CIA-SIE-PURE changes to revert
- MCI boundary code can be removed without affecting CIA-SIE-PURE

---

## BLOCK-002: Crash Recovery Non-Determinism

### Blocker Summary

CIA-SIE-PURE has no automatic recovery mechanism. Crashes are detected and logged, but manual intervention is required for restart.

### Principal Decision

**A) Deploy with external supervision**

CIA-SIE-PURE shall be treated as an externally supervised process (Docker/systemd/K8s). MCI shall not implement restart authority.

### Resolution Specification

#### Invariant Addressed

**INV-002: System Lifecycle Discipline** (Crash Recovery aspect)

#### MCI Boundary Location

MCI does NOT implement restart authority. MCI's responsibility is limited to:
- **Detection**: Identify when CIA-SIE-PURE is unavailable
- **Reporting**: Surface unavailability truthfully in cockpit
- **Degradation**: Operate in degraded mode without CIA-SIE-PURE

**Boundary Definition:**

| Responsibility | Owner | MCI Role |
|----------------|-------|----------|
| Process supervision | External (Docker/systemd/K8s) | NONE |
| Restart on crash | External (Docker/systemd/K8s) | NONE |
| Health monitoring | MCI | DETECTION ONLY |
| Unavailability display | MCI | TRUTHFUL REPORTING |

#### MCI Behavior Specification

When CIA-SIE-PURE is unavailable:

```
State: CIA-SIE-PURE health check fails
  → Set `ciaSieAvailable: false` in MCI state
  → Display degraded mode indicator in cockpit
  → Disable CIA-SIE-PURE dependent features
  → Log with severity: WARNING
  → Continue polling health at configured interval

State: CIA-SIE-PURE health check recovers
  → Set `ciaSieAvailable: true` in MCI state
  → Clear degraded mode indicator
  → Re-enable CIA-SIE-PURE dependent features
  → Log recovery event
```

#### Implementation Location in MCI

| Component | File | Purpose |
|-----------|------|---------|
| `ciaSieHealthStore` | `src/client/stores/ciaSieHealthStore.ts` | Track CIA-SIE-PURE availability |
| Health poller | `src/client/hooks/useCiaSieHealth.ts` | Periodic health checks |
| Degraded mode indicator | `src/client/components/cockpit/CiaSieStatus.tsx` | Truthful cockpit display |

#### Validation Method

| Validation | Method | Pass Criteria |
|------------|--------|---------------|
| Unit tests | Mock health check failure | State correctly reflects unavailable |
| UI tests | Render with `ciaSieAvailable: false` | Degraded mode indicator visible |
| Integration tests | Stop mock CIA-SIE-PURE | MCI continues operating, displays degraded |
| Recovery tests | Restart mock CIA-SIE-PURE | MCI detects recovery, clears degraded state |

#### Reversibility

This remediation is fully reversible:
- Health monitoring can be disabled
- No CIA-SIE-PURE changes involved
- External supervision is independent of MCI

#### External Supervision Documentation

MCI documentation SHALL include:

```markdown
## CIA-SIE-PURE Deployment Requirement

CIA-SIE-PURE MUST be deployed with external process supervision:

Supported supervision methods:
- Docker with restart policy: `restart: unless-stopped`
- systemd with `Restart=on-failure`
- Kubernetes with `restartPolicy: Always`

MCI does NOT restart CIA-SIE-PURE.
MCI only DETECTS and REPORTS unavailability.
```

---

## BLOCK-003: Error Format Incompatibility

### Blocker Summary

CIA-SIE-PURE error responses do not conform to MCI's WHAT/WHY/HOW standard. Error details are lost during HTTP response generation. No error codes are provided.

### Principal Decision

**B) Authorize MCI translation layer**

CIA-SIE-PURE native errors will be translated at the MCI boundary into CR-003 compliant WHAT/WHY/HOW format.

### Resolution Specification

#### Invariant Addressed

**INV-005: Failure Visibility** (WHAT/WHY/HOW aspect)
**CR-003: Cockpit Truthfulness** (Error display aspect)

#### MCI Boundary Location

All errors received from CIA-SIE-PURE must pass through a translation layer before:
- Being displayed in MCI UI (ErrorDisplay, Toast)
- Being logged by MCI
- Being stored in MCI error state

**Boundary Entry Point:**

| Entry Point | Native Format | Translated Format |
|-------------|---------------|-------------------|
| HTTP 4xx responses | `{ "detail": "string" }` | `{ error: { code, what, why, how } }` |
| HTTP 5xx responses | `{ "detail": "string" }` | `{ error: { code, what, why, how } }` |
| Network errors | Exception | `{ error: { code, what, why, how } }` |
| Timeout errors | Exception | `{ error: { code, what, why, how } }` |

#### Translation Rules

```typescript
interface CiaSieNativeError {
  detail: string;
  status: number;
}

interface MciError {
  code: string;
  what: string;
  why: string;
  how: string;
  details?: Record<string, unknown>;
}

function translateCiaSieError(native: CiaSieNativeError): MciError {
  // Error code mapping
  const codeMap: Record<number, string> = {
    400: 'CIA_SIE_VALIDATION_ERROR',
    401: 'CIA_SIE_AUTH_FAILED',
    404: 'CIA_SIE_NOT_FOUND',
    429: 'CIA_SIE_RATE_LIMITED',
    500: 'CIA_SIE_INTERNAL_ERROR',
    503: 'CIA_SIE_UNAVAILABLE',
  };

  // HOW templates by error type
  const howTemplates: Record<string, string> = {
    'CIA_SIE_VALIDATION_ERROR': 'Check the request format against API documentation.',
    'CIA_SIE_AUTH_FAILED': 'Verify webhook credentials are correctly configured.',
    'CIA_SIE_NOT_FOUND': 'Verify the requested resource exists in CIA-SIE-PURE.',
    'CIA_SIE_RATE_LIMITED': 'Wait before retrying. Reduce request frequency.',
    'CIA_SIE_INTERNAL_ERROR': 'This is a server error. Try again later or contact support.',
    'CIA_SIE_UNAVAILABLE': 'CIA-SIE-PURE is temporarily unavailable. MCI is in degraded mode.',
  };

  const code = codeMap[native.status] || 'CIA_SIE_UNKNOWN_ERROR';

  return {
    code,
    what: `CIA-SIE-PURE request failed (${native.status})`,
    why: native.detail,
    how: howTemplates[code] || 'Review the error details and retry.',
  };
}
```

#### Implementation Location in MCI

| Component | File | Purpose |
|-----------|------|---------|
| `translateCiaSieError()` | `src/shared/errors/ciaSieErrorTranslator.ts` | Central translation function |
| Error interceptor | `src/server/services/cia-sie.ts` | Apply translation to all errors |
| Error type | `src/shared/types/errors.ts` | MciError interface |

#### Validation Method

| Validation | Method | Pass Criteria |
|------------|--------|---------------|
| Unit tests | Test translator with all status codes | Correct code/what/why/how for each |
| Snapshot tests | Capture translated error outputs | No regression in format |
| UI tests | Render ErrorDisplay with translated errors | WHAT/WHY/HOW visible |
| E2E tests | Trigger CIA-SIE-PURE errors | MCI displays CR-003 compliant messages |

#### Reversibility

This remediation is fully reversible:
- Translation layer can be bypassed
- No CIA-SIE-PURE changes involved
- MCI can display native errors if translation disabled

---

## BLOCK-004: Health Check Incompleteness

### Blocker Summary

The CIA-SIE-PURE `/health` endpoint returns "healthy" without verifying database connectivity or AI service availability.

### Principal Decision

**B) Authorize MCI deep health probes**

MCI may implement extended health checks (DB + AI readiness) without modifying CIA-SIE-PURE.

### Resolution Specification

#### Invariant Addressed

**INV-002: System Lifecycle Discipline** (Health aspect)
**INV-005: Failure Visibility** (Truthful status aspect)

#### MCI Boundary Location

MCI implements deep health probes that go beyond CIA-SIE-PURE's `/health` endpoint:

**Probe Endpoints:**

| Probe | CIA-SIE-PURE Endpoint | What It Verifies |
|-------|----------------------|------------------|
| Basic health | `GET /health` | Process running, FastAPI responding |
| Database health | `GET /api/v1/instruments` | Database accessible (returns list or empty) |
| AI health | `GET /api/v1/ai/models` | AI configuration accessible |
| Webhook health | `GET /api/v1/webhook/health` | Webhook subsystem operational |

#### Deep Health Logic

```typescript
interface CiaSieHealthStatus {
  process: 'healthy' | 'unhealthy' | 'unknown';
  database: 'healthy' | 'unhealthy' | 'unknown';
  ai: 'healthy' | 'unhealthy' | 'unknown';
  webhook: 'healthy' | 'unhealthy' | 'unknown';
  overall: 'healthy' | 'degraded' | 'unhealthy';
}

async function checkCiaSieDeepHealth(): Promise<CiaSieHealthStatus> {
  const status: CiaSieHealthStatus = {
    process: 'unknown',
    database: 'unknown',
    ai: 'unknown',
    webhook: 'unknown',
    overall: 'unknown',
  };

  // Basic health (process)
  try {
    const healthResp = await fetch('/health');
    status.process = healthResp.ok ? 'healthy' : 'unhealthy';
  } catch {
    status.process = 'unhealthy';
  }

  // Database health (via instruments endpoint)
  try {
    const dbResp = await fetch('/api/v1/instruments');
    status.database = dbResp.ok ? 'healthy' : 'unhealthy';
  } catch {
    status.database = 'unhealthy';
  }

  // AI health (via models endpoint)
  try {
    const aiResp = await fetch('/api/v1/ai/models');
    status.ai = aiResp.ok ? 'healthy' : 'unhealthy';
  } catch {
    status.ai = 'unhealthy';
  }

  // Webhook health
  try {
    const webhookResp = await fetch('/api/v1/webhook/health');
    status.webhook = webhookResp.ok ? 'healthy' : 'unhealthy';
  } catch {
    status.webhook = 'unhealthy';
  }

  // Overall status
  if (status.process === 'unhealthy') {
    status.overall = 'unhealthy';
  } else if (
    status.database === 'unhealthy' ||
    status.ai === 'unhealthy' ||
    status.webhook === 'unhealthy'
  ) {
    status.overall = 'degraded';
  } else {
    status.overall = 'healthy';
  }

  return status;
}
```

#### Cockpit Display

| Overall Status | Cockpit Indicator | User Message |
|----------------|-------------------|--------------|
| `healthy` | 🟢 Green | CIA-SIE-PURE operational |
| `degraded` | 🟡 Yellow | CIA-SIE-PURE partially available |
| `unhealthy` | 🔴 Red | CIA-SIE-PURE unavailable |

**Degraded Mode Details:**

| Subsystem | Status | Feature Impact |
|-----------|--------|----------------|
| Database unhealthy | 🟡 | Signal data unavailable |
| AI unhealthy | 🟡 | Narratives unavailable |
| Webhook unhealthy | 🟡 | Signal ingestion unavailable |
| Process unhealthy | 🔴 | All CIA-SIE-PURE features unavailable |

#### Implementation Location in MCI

| Component | File | Purpose |
|-----------|------|---------|
| `checkCiaSieDeepHealth()` | `src/server/services/cia-sie-health.ts` | Deep health check logic |
| `useCiaSieHealth()` | `src/client/hooks/useCiaSieHealth.ts` | React hook for health state |
| `CiaSieHealthIndicator` | `src/client/components/cockpit/CiaSieHealthIndicator.tsx` | Cockpit display |
| Health store | `src/client/stores/ciaSieHealthStore.ts` | Health state management |

#### Validation Method

| Validation | Method | Pass Criteria |
|------------|--------|---------------|
| Unit tests | Mock each subsystem healthy/unhealthy | Correct status computed |
| UI tests | Render indicator with each status | Correct color and message |
| Integration tests | Disable mock DB/AI | MCI shows degraded status |
| E2E tests | Full CIA-SIE-PURE up/down scenarios | Cockpit reflects reality |

#### Reversibility

This remediation is fully reversible:
- Deep health can be replaced with basic health check
- No CIA-SIE-PURE changes involved
- Polling can be disabled via configuration

---

## Resolution Summary

| Blocker | Resolution | MCI Location | CIA-SIE-PURE Impact |
|---------|------------|--------------|---------------------|
| BLOCK-001 | Boundary sanitization | `cia-sie.ts`, `validation.ts` | NONE |
| BLOCK-002 | External supervision assumption | Documentation, `ciaSieHealthStore.ts` | NONE |
| BLOCK-003 | Error translation layer | `ciaSieErrorTranslator.ts` | NONE |
| BLOCK-004 | Deep health probes | `cia-sie-health.ts`, `CiaSieHealthIndicator.tsx` | NONE |

---

## Verification Checklist

Before issuing updated eligibility attestation:

| Blocker | Verification Required | Method |
|---------|----------------------|--------|
| BLOCK-001 | Sanitization function tested | Unit tests + boundary tests |
| BLOCK-002 | External supervision documented | Documentation review |
| BLOCK-003 | Translation layer tested | Unit tests + UI tests |
| BLOCK-004 | Deep health probes tested | Integration tests |

---

## Constraints Reaffirmed

| Constraint | Status |
|------------|--------|
| CIA-SIE-PURE modification | ❌ NOT PERFORMED |
| Runtime integration | ❌ NOT PERFORMED |
| Data streaming | ❌ NOT PERFORMED |
| Command coupling | ❌ NOT PERFORMED |
| Lifecycle binding | ❌ NOT PERFORMED |
| Code execution | ❌ NOT AUTHORIZED |

---

## Next Steps (Pending Authorization)

1. ⏳ Principal reviews this resolution plan
2. ⏳ Principal authorizes or modifies approach
3. ⏳ Upon approval, code implementation may proceed (requires explicit authorization)
4. ⏳ Post-implementation verification against checklist
5. ⏳ Updated Integration Eligibility Attestation issued

---

## Attestation

This resolution plan was prepared under the Principal Directive — Resolution Authorization (Pre-Integration) dated 2026-01-29.

**Compliance Verification:**

| Requirement | Status |
|-------------|--------|
| Remediation confined to MCI boundaries | ✅ COMPLIANT |
| CIA-SIE-PURE unmodified | ✅ COMPLIANT |
| No runtime coupling | ✅ COMPLIANT |
| Explicit and verifiable | ✅ COMPLIANT |
| Reversible | ✅ COMPLIANT |
| References invariant/blocker | ✅ COMPLIANT |
| Specifies MCI boundary location | ✅ COMPLIANT |
| Defines validation method | ✅ COMPLIANT |

**Execution Status:**

> **DOCUMENTATION COMPLETE**  
> **CODE EXECUTION NOT AUTHORIZED**  
> **AWAITING PRINCIPAL REVIEW**

---

*End of Blocking Item Resolution Plan*
