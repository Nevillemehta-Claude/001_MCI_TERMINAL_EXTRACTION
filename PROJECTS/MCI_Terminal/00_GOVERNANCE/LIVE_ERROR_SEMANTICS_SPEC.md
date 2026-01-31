# SILO 2: Live Error Semantics Specification
## CR-003 Compliant Error Mapping Design

**Document ID:** SILO-2-ERROR-001  
**Date:** 2026-01-29  
**Classification:** DESIGN ONLY — NO IMPLEMENTATION AUTHORIZED  
**Execution Status:** 🔒 DOCUMENTATION ONLY

---

## Governing Constraints

| Constraint | Status |
|------------|--------|
| Runtime hooks | ❌ PROHIBITED |
| Code generation | ❌ PROHIBITED |
| Code changes | ❌ PROHIBITED |

---

## 1. SOURCE AUTHORITY

### MCI Error Contract (CR-003)
**Location:** `src/shared/types.ts`, `src/shared/errors/ciaSieErrorTranslator.ts`

### CIA-SIE-PURE Exception Taxonomy
**Source:** `CIA_SIE_PURE_CANONICAL_STATE_RECONSTITUTION.md` Section 5.1

---

## 2. MCI ERROR FORMAT (CR-003 MANDATORY)

### WHAT / WHY / HOW Structure

```typescript
export interface ErrorDetails {
  what: string;  // Brief statement of what went wrong
  why: string;   // Explanation of why it went wrong
  how: string;   // Actionable guidance on how to fix
}
```

### MCI Error Response Format

```typescript
export interface MciError {
  code: string;           // Machine-readable code
  what: string;           // Human: What went wrong
  why: string;            // Human: Why it went wrong
  how: string;            // Human: How to fix it
  details?: Record<string, unknown>;  // Technical details
  httpStatus: number;     // Original HTTP status
  isUnavailable: boolean; // Triggers degraded mode
  isRecoverable: boolean; // Retry may succeed
}
```

---

## 3. CIA-SIE-PURE EXCEPTION TAXONOMY

### Native Exception Classes

| Exception Class | Purpose | HTTP Status | WHAT/WHY/HOW |
|-----------------|---------|-------------|--------------|
| `CIASIEError` | Base exception | 500 | ❌ None |
| `InstrumentNotFoundError` | Missing entity | 404 | ❌ None |
| `ValidationError` | Invalid input | 400 | ❌ None |
| `InvalidWebhookPayloadError` | Bad webhook | 400 | ❌ None |
| `WebhookNotRegisteredError` | Unknown webhook | 404 | ❌ None |
| `DatabaseError` | DB operation failed | 500 | ❌ None |
| `AIProviderError` | Claude API failed | 500/503 | ❌ None |
| `ConstitutionalViolationError` | CR violation | 500 | ⚠️ Partial (has details dict) |
| `AggregationAttemptError` | CR-001 violation | 500 | ❌ None |
| `RecommendationAttemptError` | CR-001 violation | 500 | ❌ None |
| `ContradictionResolutionAttemptError` | CR-002 violation | 500 | ❌ None |

### CIA-SIE-PURE Native Error Format

```python
# FastAPI default format
{
    "detail": "Error message string"
}
```

**Finding:** CIA-SIE-PURE errors do NOT conform to WHAT/WHY/HOW format.

---

## 4. ERROR CLASSIFICATION SCHEME

### User-Facing vs Operator-Facing

| Classification | Audience | Display Location | Content Rules |
|----------------|----------|------------------|---------------|
| **USER-FACING** | End user (trader) | Cockpit toast/modal | Simple, actionable, non-technical |
| **OPERATOR-FACING** | System operator | Logs, Sentry | Technical, diagnostic, verbose |

### Error Severity Levels

| Level | User Impact | Operator Action | Cockpit Indicator |
|-------|-------------|-----------------|-------------------|
| **CRITICAL** | System unusable | Immediate | 🔴 Red + modal |
| **ERROR** | Feature broken | Urgent | 🔴 Red + toast |
| **WARNING** | Degraded experience | Monitor | 🟡 Yellow + toast |
| **INFO** | No impact | None | 🔵 Blue (optional) |

---

## 5. MAPPING TABLE: CIA-SIE-PURE → MCI

### HTTP Status-Based Mapping (Already Implemented)

| Status | MCI Code | WHAT | Classification |
|--------|----------|------|----------------|
| 400 | `CIA_SIE_VALIDATION_ERROR` | Request validation failed | USER |
| 401 | `CIA_SIE_AUTH_FAILED` | Authentication failed | USER |
| 403 | `CIA_SIE_FORBIDDEN` | Access denied | USER |
| 404 | `CIA_SIE_NOT_FOUND` | Resource not found | USER |
| 409 | `CIA_SIE_CONFLICT` | Resource conflict | USER |
| 429 | `CIA_SIE_RATE_LIMITED` | Rate limit exceeded | USER |
| 500 | `CIA_SIE_INTERNAL_ERROR` | CIA-SIE-PURE internal error | OPERATOR |
| 502 | `CIA_SIE_BAD_GATEWAY` | CIA-SIE-PURE connection failed | OPERATOR |
| 503 | `CIA_SIE_UNAVAILABLE` | CIA-SIE-PURE is unavailable | USER |
| 504 | `CIA_SIE_TIMEOUT` | CIA-SIE-PURE request timed out | USER |

### Exception-Specific Mapping (Design for Live Mode)

| CIA-SIE-PURE Exception | MCI Code | WHAT | WHY | HOW |
|------------------------|----------|------|-----|-----|
| `InstrumentNotFoundError` | `CIA_SIE_INSTRUMENT_NOT_FOUND` | Instrument not found | The requested trading instrument does not exist in CIA-SIE-PURE | Verify the instrument symbol and exchange are correct |
| `ValidationError` | `CIA_SIE_VALIDATION_ERROR` | Request validation failed | The request contains invalid or missing fields | Check the request format and ensure all required fields are provided |
| `InvalidWebhookPayloadError` | `CIA_SIE_WEBHOOK_INVALID` | Invalid webhook payload | The webhook payload failed signature verification or format validation | Verify webhook configuration and HMAC secret |
| `WebhookNotRegisteredError` | `CIA_SIE_WEBHOOK_NOT_FOUND` | Webhook not registered | The webhook source is not recognized by CIA-SIE-PURE | Register the webhook in CIA-SIE-PURE configuration |
| `DatabaseError` | `CIA_SIE_DATABASE_ERROR` | Database operation failed | CIA-SIE-PURE database is unavailable or corrupted | Check CIA-SIE-PURE database connectivity and integrity |
| `AIProviderError` | `CIA_SIE_AI_UNAVAILABLE` | AI service unavailable | The Anthropic Claude API is not responding or budget exhausted | Check AI service configuration and budget allocation |
| `ConstitutionalViolationError` | `CIA_SIE_CONSTITUTIONAL_VIOLATION` | AI response validation failed | The AI generated prohibited content that was rejected | Automatic retry will occur; if persistent, check prompt configuration |
| `AggregationAttemptError` | `CIA_SIE_AGGREGATION_BLOCKED` | Aggregation attempt blocked | An attempt to aggregate signals was detected and blocked (CR-001) | This is expected behavior; signals are displayed individually |
| `RecommendationAttemptError` | `CIA_SIE_RECOMMENDATION_BLOCKED` | Recommendation attempt blocked | An attempt to provide trading recommendations was detected and blocked (CR-001) | This is expected behavior; only observations are provided |
| `ContradictionResolutionAttemptError` | `CIA_SIE_CONTRADICTION_RESOLUTION_BLOCKED` | Contradiction resolution attempt blocked | An attempt to resolve contradictions was detected and blocked (CR-002) | This is expected behavior; contradictions are exposed, not resolved |

---

## 6. NETWORK ERROR MAPPING (Already Implemented)

| Network Error | MCI Code | WHAT | WHY | HOW |
|---------------|----------|------|-----|-----|
| `AbortError` (timeout) | `CIA_SIE_TIMEOUT` | CIA-SIE-PURE request timed out | The request took too long to complete | Retry with a simpler request or wait for system load to decrease |
| `Failed to fetch` | `CIA_SIE_NETWORK_ERROR` | Network connection failed | Unable to reach CIA-SIE-PURE | Check network connectivity and verify the service URL |
| Connection refused | `CIA_SIE_NETWORK_ERROR` | Network connection failed | CIA-SIE-PURE is not accepting connections | Verify CIA-SIE-PURE is running and listening on the correct port |
| DNS resolution failure | `CIA_SIE_NETWORK_ERROR` | Network connection failed | Unable to resolve CIA-SIE-PURE hostname | Check DNS configuration and hostname spelling |

---

## 7. FAILURE VISIBILITY GUARANTEES

### Guarantee 1: Every Error Has WHAT/WHY/HOW

| Requirement | Implementation |
|-------------|----------------|
| Every error surfaced to cockpit MUST have WHAT | Translation layer provides fallback WHAT |
| Every error surfaced to cockpit MUST have WHY | Translation layer extracts from `detail` or provides default |
| Every error surfaced to cockpit MUST have HOW | Translation layer provides actionable guidance |

### Guarantee 2: No Silent Failures

| Requirement | Implementation |
|-------------|----------------|
| Network errors are surfaced | `translateNetworkError()` handles all network errors |
| Timeout errors are surfaced | AbortError detection with specific messaging |
| Unknown errors are surfaced | Fallback to `CIA_SIE_UNKNOWN_ERROR` with generic guidance |

### Guarantee 3: Degraded Mode Triggers

| Error Code | Triggers Degraded Mode | Reason |
|------------|------------------------|--------|
| `CIA_SIE_UNAVAILABLE` | ✅ YES | Service completely unavailable |
| `CIA_SIE_BAD_GATEWAY` | ✅ YES | Cannot reach service |
| `CIA_SIE_TIMEOUT` | ✅ YES | Service not responding |
| `CIA_SIE_NETWORK_ERROR` | ✅ YES | Network path broken |
| `CIA_SIE_DATABASE_ERROR` | ⚠️ CONDITIONAL | If persistent (3+ failures) |
| `CIA_SIE_AI_UNAVAILABLE` | ⚠️ CONDITIONAL | Narratives unavailable, other features OK |
| `CIA_SIE_VALIDATION_ERROR` | ❌ NO | User error, not system issue |
| `CIA_SIE_NOT_FOUND` | ❌ NO | Specific resource issue |

### Guarantee 4: Recovery Guidance

| Error Type | Recoverable | Retry Delay | User Guidance |
|------------|-------------|-------------|---------------|
| Validation errors | ❌ NO | — | Fix input and retry |
| Auth errors | ❌ NO | — | Re-authenticate |
| Not found errors | ❌ NO | — | Verify resource exists |
| Rate limited | ✅ YES | 60s | Wait before retrying |
| Internal errors | ✅ YES | 30s | Retry later |
| Unavailable | ✅ YES | 10s | Wait for recovery |
| Timeout | ✅ YES | 5s | Retry immediately |
| Network errors | ✅ YES | 5s | Check connectivity |

---

## 8. ERROR DISPLAY LOCATIONS

### Cockpit Toast (Transient Errors)

| Error Class | Toast Type | Duration | Content |
|-------------|------------|----------|---------|
| Validation errors | Warning | 5s | WHAT only |
| Not found errors | Warning | 5s | WHAT only |
| Rate limited | Warning | 10s | WHAT + retry time |
| Timeout | Error | 5s | WHAT + retry suggestion |

### Cockpit Modal (Blocking Errors)

| Error Class | Modal Type | Dismissable | Content |
|-------------|------------|-------------|---------|
| Auth failure | Error | Yes | WHAT + WHY + HOW |
| Service unavailable | Error | No | WHAT + WHY + status indicator |
| Constitutional violation | Warning | Yes | WHAT + WHY (informational) |

### Status Bar Indicator

| State | Indicator | Error Display |
|-------|-----------|---------------|
| Connected | 🟢 | None |
| Degraded | 🟡 | Last error WHAT in tooltip |
| Disconnected | 🔴 | Error WHAT + consecutive failures in tooltip |

---

## 9. CONSTITUTIONAL ERROR SPECIAL HANDLING

### ConstitutionalViolationError

This error type requires special handling as it represents the system working correctly (blocking prohibited content).

| Aspect | Handling |
|--------|----------|
| User visibility | Minimal — "AI response regenerating" |
| Operator visibility | Full details + prompt + response |
| Retry behavior | Automatic (up to 3x) |
| Degraded mode trigger | ❌ NO — System is functioning correctly |
| Logging | Enhanced — Constitutional violation details |

### User-Facing Message (CR-001/CR-002 Violations)

```
WHAT: AI narrative is being regenerated
WHY: The initial response required refinement to meet quality standards
HOW: Please wait a moment; this is automatic
```

**Note:** User should NOT be informed of constitutional specifics. This is internal quality control.

---

## 10. ERROR LOGGING STRATEGY

### Operator Log Format

```
[ERROR] [CIA_SIE_VALIDATION_ERROR] Request validation failed
  → Status: 400
  → Detail: Missing required field: chart_id
  → Endpoint: /api/v1/charts
  → Request ID: abc-123
  → Timestamp: 2026-01-29T12:00:00.000Z
```

### Sentry Error Grouping

| Error Code | Fingerprint | Alerting |
|------------|-------------|----------|
| `CIA_SIE_UNAVAILABLE` | `[cia-sie, unavailable]` | Immediate |
| `CIA_SIE_DATABASE_ERROR` | `[cia-sie, database]` | Immediate |
| `CIA_SIE_AI_UNAVAILABLE` | `[cia-sie, ai]` | 5-minute delay |
| `CIA_SIE_VALIDATION_ERROR` | `[cia-sie, validation, ${endpoint}]` | Batch (hourly) |
| `CIA_SIE_CONSTITUTIONAL_VIOLATION` | `[cia-sie, constitutional]` | Daily summary |

---

## 11. ASSUMPTIONS (EXPLICIT)

| Assumption | Basis | Risk |
|------------|-------|------|
| CIA-SIE-PURE returns `{ detail: string }` for errors | FastAPI default behavior | LOW |
| HTTP status codes are meaningful | Standard HTTP semantics | LOW |
| Exception class names are stable | Code analysis | MEDIUM |
| Constitutional violations are logged in PURE | Forensic analysis | LOW |

---

## 12. NON-ASSUMPTIONS (EXPLICIT)

| Non-Assumption | Statement |
|----------------|-----------|
| Custom error handlers | We do NOT assume CIA-SIE-PURE has custom exception handlers |
| Structured error responses | We do NOT assume errors include structured metadata |
| Exception message consistency | We do NOT assume exception messages are consistent |
| Error codes in response | We do NOT assume CIA-SIE-PURE provides error codes |

---

## ATTESTATION

This Live Error Semantics Specification was prepared under the Multi-Silo Execution Directive dated 2026-01-29.

**Compliance Verification:**

| Prohibition | Status |
|-------------|--------|
| ❌ No runtime hooks | ✅ COMPLIANT |
| ❌ No code generation | ✅ COMPLIANT |
| ❌ No code changes | ✅ COMPLIANT |

**Design Summary:**

> This specification defines the complete mapping from CIA-SIE-PURE native exceptions to MCI's CR-003 compliant WHAT/WHY/HOW format. All errors are classified as user-facing or operator-facing, with appropriate display locations, retry strategies, and degraded mode triggers. Constitutional violations receive special handling to avoid exposing internal quality control to end users.

---

*End of Live Error Semantics Specification*
