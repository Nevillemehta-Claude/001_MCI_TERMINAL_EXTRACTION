# Runtime Boundary Contract v1.0
## SILO 9: Frozen & Sealed Runtime Contracts

**Document ID:** BOUNDARY-CONTRACT-001  
**Date:** 2026-01-29  
**Directive:** PAD-QL3 (LEAP 3)  
**Version:** 1.0.0  
**Status:** ✅ **FROZEN**

---

## Purpose

This document freezes and seals all runtime contracts at the MCI boundary. No runtime ambiguity can exist at the boundary.

---

## Contract Overview

| Contract ID | Name | Direction | Status |
|-------------|------|-----------|--------|
| CONTRACT-HEALTH-001 | Health Response | Inbound | ✅ FROZEN |
| CONTRACT-SIGNAL-001 | Signal Data | Inbound | ✅ FROZEN |
| CONTRACT-NARRATIVE-001 | Narrative Data | Inbound | ✅ FROZEN |
| CONTRACT-ERROR-001 | Error Response | Inbound | ✅ FROZEN |

---

## CONTRACT-HEALTH-001: Health Response

**Purpose:** Health check response from CIA-SIE-PURE  
**Direction:** CIA-SIE-PURE → MCI  
**Fingerprint:** `HEALTH-v1.0.0-2026-01-29`

### Allowed Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | ✅ YES | "ok" or "error" |
| `app` | string | ❌ NO | Application name |
| `version` | string | ❌ NO | Version string |
| `message` | string | ❌ NO | Status message |
| `uptime` | number | ❌ NO | Uptime in seconds |
| `timestamp` | number | ❌ NO | Unix timestamp |

### Forbidden Fields

| Field | Reason |
|-------|--------|
| `_internal` | Internal debugging |
| `__debug` | Debug information |
| `secrets` | Security risk |
| `credentials` | Security risk |

### Timing Semantics

| Metric | Value |
|--------|-------|
| Max Latency | 500ms |
| Timeout | 5000ms |
| Stale After | 30000ms |

---

## CONTRACT-SIGNAL-001: Signal Data

**Purpose:** Trading signals from CIA-SIE-PURE  
**Direction:** CIA-SIE-PURE → MCI  
**Fingerprint:** `SIGNAL-v1.0.0-2026-01-29`

### Allowed Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ YES | Signal ID |
| `chartId` | string | ✅ YES | Chart reference |
| `direction` | string | ✅ YES | "buy" / "sell" / "hold" |
| `timestamp` | string | ✅ YES | ISO timestamp |
| `indicator` | string | ❌ NO | Indicator name |
| `freshness` | string | ❌ NO | "fresh" / "stale" |
| `confidence` | number | ❌ NO | Confidence score |
| `rawPayload` | object | ❌ NO | Raw indicator data |

### Forbidden Fields

| Field | Reason |
|-------|--------|
| `_raw` | Internal data |
| `__internal` | Internal data |
| `debug` | Debug information |
| `apiKey` | Security risk |

### Timing Semantics

| Metric | Value |
|--------|-------|
| Max Latency | 2000ms |
| Timeout | 10000ms |
| Stale After | 60000ms |

---

## CONTRACT-NARRATIVE-001: Narrative Data

**Purpose:** AI-generated narratives from CIA-SIE-PURE  
**Direction:** CIA-SIE-PURE → MCI  
**Fingerprint:** `NARRATIVE-v1.0.0-2026-01-29`

### Allowed Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ YES | Narrative ID |
| `chartId` | string | ❌ NO | Chart reference |
| `siloId` | string | ❌ NO | Silo reference |
| `text` | string | ✅ YES | Narrative text |
| `generatedAt` | string | ✅ YES | ISO timestamp |
| `model` | string | ❌ NO | AI model used |
| `tokensUsed` | number | ❌ NO | Token count |
| `latencyMs` | number | ❌ NO | Generation time |

### Forbidden Fields

| Field | Reason |
|-------|--------|
| `apiKey` | Security risk |
| `prompt` | Prompt injection risk |
| `systemPrompt` | Security risk |
| `__raw` | Internal data |

### Timing Semantics

| Metric | Value |
|--------|-------|
| Max Latency | 30000ms |
| Timeout | 60000ms |
| Stale After | 300000ms |

---

## CONTRACT-ERROR-001: Error Response

**Purpose:** Error responses from CIA-SIE-PURE  
**Direction:** CIA-SIE-PURE → MCI  
**Fingerprint:** `ERROR-v1.0.0-2026-01-29`

### Allowed Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `detail` | string | ✅ YES | Error detail |
| `status_code` | number | ❌ NO | HTTP status |
| `type` | string | ❌ NO | Error type |
| `loc` | array | ❌ NO | Location array |
| `msg` | string | ❌ NO | Message |
| `ctx` | object | ❌ NO | Context |

### Forbidden Fields

| Field | Reason |
|-------|--------|
| `stack` | Security risk |
| `trace` | Security risk |
| `internal` | Internal data |

### Timing Semantics

| Metric | Value |
|--------|-------|
| Max Latency | 500ms |
| Timeout | 5000ms |
| Stale After | N/A |

---

## Rejection Rules

### Unknown Fields

Any field not in the `allowedFields` list:
- **Action:** Flag as violation
- **Severity:** Warning (not blocking)
- **Logged:** Yes

### Forbidden Fields

Any field in the `forbiddenFields` list:
- **Action:** REJECT entire payload
- **Severity:** Critical
- **Logged:** Yes, with alert

### Missing Required Fields

Any field in `requiredFields` not present:
- **Action:** REJECT entire payload
- **Severity:** Critical
- **Logged:** Yes

### Type Mismatch

Field type doesn't match `fieldTypes`:
- **Action:** REJECT entire payload
- **Severity:** Critical
- **Logged:** Yes

### Schema Drift

Contract fingerprint mismatch:
- **Action:** Alert operator
- **Severity:** High
- **Logged:** Yes

---

## Versioned Fingerprinting

Each contract has a fingerprint for drift detection:

```
{CONTRACT-NAME}-v{MAJOR}.{MINOR}.{PATCH}-{DATE}
```

Example: `HEALTH-v1.0.0-2026-01-29`

### Fingerprint Verification

```typescript
function verifyContractFingerprint(
  contractId: string,
  expectedFingerprint: string
): boolean {
  const contract = getContract(contractId);
  return contract?.fingerprint === expectedFingerprint;
}
```

---

## Contract Freeze Statement

These contracts are FROZEN as of 2026-01-29:

| Contract | Fingerprint | Frozen |
|----------|-------------|--------|
| Health | HEALTH-v1.0.0-2026-01-29 | ✅ YES |
| Signal | SIGNAL-v1.0.0-2026-01-29 | ✅ YES |
| Narrative | NARRATIVE-v1.0.0-2026-01-29 | ✅ YES |
| Error | ERROR-v1.0.0-2026-01-29 | ✅ YES |

**No changes to these contracts without new version and explicit authorization.**

---

## Attestation

Runtime boundary contracts are FROZEN and SEALED:

| Guarantee | Status |
|-----------|--------|
| All data types defined | ✅ COMPLETE |
| All flow directions specified | ✅ COMPLETE |
| All timing semantics declared | ✅ COMPLETE |
| All forbidden fields listed | ✅ COMPLETE |
| Rejection rules explicit | ✅ COMPLETE |
| Versioned fingerprints assigned | ✅ COMPLETE |
| No runtime ambiguity | ✅ VERIFIED |

---

*End of Runtime Boundary Contract v1.0*
