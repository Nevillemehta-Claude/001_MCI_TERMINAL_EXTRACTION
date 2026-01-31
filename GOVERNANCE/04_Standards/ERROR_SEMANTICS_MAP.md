# CIA-SIE-PURE Error Semantics Map
## Native vs Required Error Semantics Analysis

**Document ID:** CIA-SIE-PURE-ERROR-001  
**Date:** 2026-01-29  
**Classification:** FORENSIC ANALYSIS  
**Execution Status:** 🔒 RESTRAINED — ANALYSIS ONLY

---

## 1. Error Taxonomy

### 1.1 Native Exception Hierarchy

```
Exception
└── CIASIEError (Base)
    ├── Domain Exceptions
    │   ├── InstrumentNotFoundError
    │   ├── SiloNotFoundError
    │   ├── ChartNotFoundError
    │   ├── SignalNotFoundError
    │   └── BasketNotFoundError
    │
    ├── Validation Exceptions
    │   ├── ValidationError
    │   ├── DuplicateError
    │   ├── InvalidWebhookPayloadError
    │   └── WebhookNotRegisteredError
    │
    ├── Infrastructure Exceptions
    │   ├── DatabaseError
    │   ├── AIProviderError
    │   └── PlatformAdapterError
    │
    └── Constitutional Exceptions
        ├── ConstitutionalViolationError
        ├── AggregationAttemptError
        ├── RecommendationAttemptError
        └── ContradictionResolutionAttemptError
```

### 1.2 HTTP Status Code Mapping

| Exception Type | HTTP Status | Category |
|----------------|-------------|----------|
| `*NotFoundError` | 404 | Client Error |
| `ValidationError` | 400 | Client Error |
| `InvalidWebhookPayloadError` | 400 | Client Error |
| `DuplicateError` | 409 | Client Error |
| `DatabaseError` | 500 | Server Error |
| `AIProviderError` | 500/503 | Server Error |
| `ConstitutionalViolationError` | 500 | Server Error |
| Rate Limit Exceeded | 429 | Client Error |
| Webhook Auth Failed | 401 | Client Error |

---

## 2. Native Error Format

### 2.1 Exception Structure

**[FACT]** From `exceptions.py`:
```python
class CIASIEError(Exception):
    def __init__(self, message: str, details: Optional[dict] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)
```

**Native Format:**
```json
{
  "message": "string",
  "details": {}
}
```

### 2.2 HTTP Response Format

**[FACT]** From route handlers:
```python
raise HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail=f"Webhook validation failed: {e.message}",
)
```

**HTTP Error Response:**
```json
{
  "detail": "Webhook validation failed: Missing required fields: webhook_id"
}
```

---

## 3. Required Error Format (MCI Standard)

### 3.1 WHAT / WHY / HOW Structure

MCI expects errors to contain:

| Component | Description | Example |
|-----------|-------------|---------|
| **WHAT** | What went wrong | "Webhook validation failed" |
| **WHY** | Why it went wrong | "Missing required field: webhook_id" |
| **HOW** | How to fix it | "Include 'webhook_id' in payload" |

**MCI Expected Format:**
```json
{
  "error": {
    "code": "WEBHOOK_VALIDATION_ERROR",
    "what": "Webhook validation failed",
    "why": "The required field 'webhook_id' is missing from the payload",
    "how": "Ensure your TradingView alert includes webhook_id in the JSON payload",
    "details": {
      "missing_fields": ["webhook_id"]
    }
  }
}
```

---

## 4. Semantic Gap Analysis

### 4.1 Component Coverage

| Exception | WHAT | WHY | HOW | Gap |
|-----------|------|-----|-----|-----|
| `InstrumentNotFoundError` | ✅ Message | ⚠️ Implicit | ❌ None | **PARTIAL** |
| `ValidationError` | ✅ Message | ⚠️ Details | ❌ None | **PARTIAL** |
| `InvalidWebhookPayloadError` | ✅ Message | ✅ Details | ❌ None | **PARTIAL** |
| `DatabaseError` | ✅ Message | ⚠️ Details | ❌ None | **PARTIAL** |
| `AIProviderError` | ✅ Message | ⚠️ Details | ❌ None | **PARTIAL** |
| `ConstitutionalViolationError` | ✅ Message | ✅ Details | ❌ None | **PARTIAL** |
| Rate Limit (429) | ✅ Message | ⚠️ Headers | ⚠️ Headers | **PARTIAL** |

### 4.2 Detailed Gap Examples

**Example 1: Webhook Validation Error**

CIA-SIE-PURE Native:
```json
{
  "detail": "Webhook validation failed: Missing required fields: webhook_id"
}
```

MCI Required:
```json
{
  "error": {
    "code": "WEBHOOK_VALIDATION_FAILED",
    "what": "Webhook validation failed",
    "why": "The payload is missing required fields",
    "how": "Ensure your payload includes: webhook_id, direction",
    "details": {
      "missing_fields": ["webhook_id"]
    }
  }
}
```

**Gap:** No structured error code, no HOW component.

---

**Example 2: Constitutional Violation**

CIA-SIE-PURE Native (when raised):
```python
ConstitutionalViolationError(
    message="AI response violates constitutional principles",
    details={
        "violations": ["Contains 'you should' - implies recommendation"],
        "response_preview": "Based on the signals, you should..."
    }
)
```

HTTP Response:
```json
{
  "detail": "AI response violates constitutional principles"
}
```

MCI Required:
```json
{
  "error": {
    "code": "CONSTITUTIONAL_VIOLATION",
    "what": "AI narrative generation failed",
    "why": "The generated response contained prescriptive language prohibited by CR-001",
    "how": "This is an internal error. The system will retry with stricter constraints. If persistent, contact support.",
    "details": {
      "violations": ["Contains 'you should' - implies recommendation"],
      "retry_attempted": true
    }
  }
}
```

**Gap:** Details are lost in HTTP response. No structured code. No HOW.

---

**Example 3: Rate Limit Exceeded**

CIA-SIE-PURE Native:
```json
{
  "detail": "Rate limit exceeded. Please try again later."
}
```
```
Headers:
  Retry-After: 60
  X-RateLimit-Limit: 60
  X-RateLimit-Remaining: 0
```

MCI Required:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "what": "Too many requests",
    "why": "You have exceeded the webhook rate limit of 60 requests per minute",
    "how": "Wait 60 seconds before retrying. Consider reducing request frequency.",
    "details": {
      "limit": 60,
      "remaining": 0,
      "retry_after_seconds": 60
    }
  }
}
```

**Gap:** Information exists in headers but not in structured body.

---

## 5. Error Propagation Analysis

### 5.1 Exception Flow

```
[Business Logic Layer]
        ↓ raises CIASIEError
[Repository Layer]
        ↓ propagates
[API Route Handler]
        ↓ catches, converts to HTTPException
[FastAPI Exception Handler]
        ↓ generates JSON response
[HTTP Response]
```

### 5.2 Information Loss Points

| Point | Information Lost | Reason |
|-------|------------------|--------|
| Exception → HTTPException | `details` dict | Not passed to HTTPException |
| HTTPException → Response | Stack trace | Security (appropriate) |
| Response → Client | Error code | Not implemented |

**[FACT]** From route handlers:
```python
except InvalidWebhookPayloadError as e:
    logger.warning(f"Invalid webhook payload: {e.message}")
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Webhook validation failed: {e.message}",
    )
```

**Finding:** `e.details` is NOT included in the HTTPException. Information is lost.

---

## 6. Security Event Logging

### 6.1 Logged Security Events

| Event Type | Logged | Severity | Details Included |
|------------|--------|----------|------------------|
| AUTH_SUCCESS | ✅ | INFO | IP, endpoint |
| AUTH_FAILURE | ✅ | WARNING | IP, endpoint |
| INVALID_SIGNATURE | ✅ | WARNING | IP, endpoint |
| MISSING_SIGNATURE | ✅ | WARNING | IP, headers list |
| TIMESTAMP_EXPIRED | ✅ | WARNING | IP, timestamps |
| RATE_LIMIT_EXCEEDED | ✅ | WARNING | IP, endpoint, limit type |
| WEBHOOK_RECEIVED | ✅ | INFO | IP, webhook_id |
| SUSPICIOUS_REQUEST | ✅ | WARNING | IP, reason |

### 6.2 Log Sanitization

**[FACT]** From `security.py`:
```python
safe_ip = str(ip_address).replace("\n", "").replace("\r", "").replace("\t", "")[:45]
safe_val = str(v).replace("\n", "").replace("\r", "").replace("\t", "")[:200]
```

**Finding:** Log injection is prevented for security events. However, this sanitization is NOT applied to business logic errors.

---

## 7. Constitutional Enforcement Errors

### 7.1 Validation Failure Path

```
[Claude API Response]
        ↓
[AIResponseValidator.validate()]
        ↓ CRITICAL violation found
[ValidationResult(is_valid=False, violations=[...])]
        ↓
[ValidatedResponseGenerator.generate()]
        ↓ retry with stricter constraints
        ↓ (up to 3 retries)
[ConstitutionalViolationError raised]
        ↓
[NarrativeGenerator catches]
        ↓
[generate_fallback_narrative()]
        ↓
[Fallback Narrative returned (no AI)]
```

### 7.2 Error Recovery

| Failure Mode | Recovery | Error Visibility |
|--------------|----------|------------------|
| First validation failure | Retry with stricter prompt | Logged WARNING |
| Second validation failure | Retry with even stricter prompt | Logged WARNING |
| Third validation failure | Fallback narrative | Logged ERROR, but no exception |
| Fallback failure | Exception propagates | HTTP 500 |

**Finding:** Constitutional violations are handled gracefully with fallback. However, the fallback may not be obvious to the consumer.

---

## 8. Translation Requirements

For MCI to consume CIA-SIE-PURE errors, the following translations would be required:

### 8.1 Error Code Mapping

| CIA-SIE-PURE Exception | MCI Error Code |
|------------------------|----------------|
| `InstrumentNotFoundError` | `ENTITY_NOT_FOUND` |
| `ChartNotFoundError` | `ENTITY_NOT_FOUND` |
| `ValidationError` | `VALIDATION_ERROR` |
| `InvalidWebhookPayloadError` | `INVALID_PAYLOAD` |
| `WebhookNotRegisteredError` | `WEBHOOK_NOT_REGISTERED` |
| `DatabaseError` | `INTERNAL_ERROR` |
| `AIProviderError` | `AI_SERVICE_UNAVAILABLE` |
| `ConstitutionalViolationError` | `CONSTITUTIONAL_VIOLATION` |

### 8.2 HOW Component Generation

MCI would need to maintain a mapping of error types to remediation guidance:

| Error Type | HOW Template |
|------------|--------------|
| Entity not found | "Verify the {entity_type} ID exists before referencing" |
| Validation error | "Check input format against API documentation" |
| Rate limit | "Wait {retry_after} seconds before retrying" |
| AI unavailable | "AI features temporarily unavailable. Try again later." |

---

## 9. Summary

### 9.1 Error Format Compatibility

| Aspect | CIA-SIE-PURE | MCI Required | Compatible? |
|--------|--------------|--------------|-------------|
| Structured error body | ❌ String detail | ✅ JSON object | ❌ NO |
| Error codes | ❌ None | ✅ Required | ❌ NO |
| WHAT component | ✅ In message | ✅ Required | ✅ YES |
| WHY component | ⚠️ Sometimes | ✅ Required | ⚠️ PARTIAL |
| HOW component | ❌ Never | ✅ Required | ❌ NO |
| Details preservation | ❌ Lost in HTTP | ✅ Required | ❌ NO |

### 9.2 Integration Implications

**Option A: CIA-SIE-PURE Adapts**
- Implement custom exception handlers
- Generate structured error responses
- Add error codes
- Include HOW component

**Option B: MCI Translates**
- Parse error messages
- Map to error codes
- Generate HOW from templates
- Accept information loss

**Option C: Boundary Adapter**
- Intermediate layer between MCI and CIA-SIE-PURE
- Catches all errors
- Translates to MCI format
- Adds missing components

---

## Attestation

This error semantics analysis was produced under forensic examination with no remediation proposed.

**Analysis Rigor:**
- Exception hierarchy documented from source
- HTTP responses traced through code
- Information loss points identified
- Translation requirements enumerated

---

*End of Error Semantics Map*
