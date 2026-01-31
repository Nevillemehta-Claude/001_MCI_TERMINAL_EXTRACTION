# SILO 1: Telemetry Contract Alignment
## Field-by-Field MCI ↔ CIA-SIE-PURE Comparison

**Document ID:** SILO-1-TELEMETRY-001  
**Date:** 2026-01-29  
**Classification:** ANALYSIS ONLY — NO CODE CHANGES AUTHORIZED  
**Execution Status:** 🔒 DOCUMENTATION ONLY

---

## Governing Constraints

| Constraint | Status |
|------------|--------|
| Code changes | ❌ PROHIBITED |
| Adapter implementation | ❌ PROHIBITED |
| Mock creation | ❌ PROHIBITED |
| Assumptions of compatibility | ❌ PROHIBITED |

---

## 1. SOURCE AUTHORITY

### MCI Types (Authoritative)
**File:** `src/shared/types.ts`

### CIA-SIE Service Types (Current MCI Expectation)
**File:** `src/server/services/cia-sie.ts`

### CIA-SIE-PURE Schemas (Target)
**Source:** `CIA_SIE_PURE_CANONICAL_STATE_RECONSTITUTION.md` Section 1.3

---

## 2. ENGINE STATUS CONTRACT

### MCI Interface: `EngineStatus`

```typescript
export interface EngineStatus {
  running: boolean;
  mode: 'idle' | 'active' | 'paused' | 'error';
  strategy: string | null;
  uptime: number;
  lastHeartbeat: number;
}
```

### CIA-SIE-PURE Expected Response

| Field | MCI Type | CIA-SIE-PURE Type | Alignment |
|-------|----------|-------------------|-----------|
| `running` | `boolean` | **[UNKNOWN]** | ⚠️ UNKNOWN — No explicit status endpoint documented |
| `mode` | `'idle' \| 'active' \| 'paused' \| 'error'` | **[UNKNOWN]** | ⚠️ UNKNOWN — Enum values not verified |
| `strategy` | `string \| null` | **[UNKNOWN]** | ⚠️ UNKNOWN — Strategy concept not confirmed in PURE |
| `uptime` | `number` | **[UNKNOWN]** | ⚠️ UNKNOWN — Field not confirmed |
| `lastHeartbeat` | `number` (epoch ms) | **[UNKNOWN]** | ⚠️ UNKNOWN — Field not confirmed |

**Verdict:** ⚠️ **UNKNOWN** — CIA-SIE-PURE does not expose `/api/engine/status`. This is an MCI-designed interface with no verified counterpart.

### Required Verification
- [ ] Confirm if CIA-SIE-PURE has an engine status concept
- [ ] Determine actual endpoint and response schema
- [ ] Map mode values to CIA-SIE-PURE operational states

---

## 3. ENGINE POSITION CONTRACT

### MCI Interface: `EnginePosition`

```typescript
export interface EnginePosition {
  symbol: string;
  exchange: 'NSE' | 'BSE';
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
}
```

### MCI Types.ts Interface: `Position`

```typescript
export interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  backend: BackendId;
  hasConflict?: boolean;
  conflictDetails?: string;
}
```

### Alignment Analysis

| Field | MCI `EnginePosition` | MCI `Position` | CIA-SIE-PURE | Alignment |
|-------|---------------------|----------------|--------------|-----------|
| `symbol` | `string` | `string` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `exchange` | `'NSE' \| 'BSE'` | — (missing) | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `quantity` | `number` | `number` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `averagePrice` | `number` | `number` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `currentPrice` | `number` | `number` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `unrealizedPnl` | `number` | — | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `realizedPnl` | `number` | — | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `pnl` | — | `number` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `pnlPercent` | — | `number` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `backend` | — | `BackendId` | N/A | ⚠️ MCI-ONLY FIELD |
| `hasConflict` | — | `boolean?` | N/A | ⚠️ MCI-ONLY FIELD (CR-002) |
| `conflictDetails` | — | `string?` | N/A | ⚠️ MCI-ONLY FIELD (CR-002) |

**Verdict:** ⚠️ **MISMATCH POSSIBLE**

### Internal MCI Discrepancy

| Issue | Details |
|-------|---------|
| Dual definitions | `EnginePosition` (cia-sie.ts) vs `Position` (types.ts) |
| Unrealized/Realized split | `EnginePosition` splits; `Position` uses single `pnl` |
| Exchange field | Present in `EnginePosition`, absent in `Position` |
| Backend field | Present in `Position`, absent in `EnginePosition` |

### Required Transforms (Hypothetical)

```
CIA-SIE-PURE → MCI Position:
  - Map symbol format (verify: "NSE:RELIANCE" vs "RELIANCE")
  - Compute pnlPercent if not provided
  - Add exchange if not in response
  - Add backend from context (MCI-side enrichment)
  - hasConflict/conflictDetails: MCI-computed (CR-002)
```

---

## 4. ENGINE ORDER CONTRACT

### MCI Interface: `EngineOrder`

```typescript
export interface EngineOrder {
  id: string;
  symbol: string;
  exchange: 'NSE' | 'BSE';
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'SL';
  quantity: number;
  price: number | null;
  status: 'pending' | 'open' | 'filled' | 'cancelled' | 'rejected';
  filledQuantity: number;
  createdAt: number;
  updatedAt: number;
}
```

### MCI Types.ts Interface: `Order`

```typescript
export interface Order {
  orderId: string;
  symbol: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'sl' | 'sl-m';
  quantity: number;
  price: number;
  status: 'open' | 'executed' | 'cancelled' | 'rejected';
  backend: BackendId;
  placedAt: number;
  executedAt?: number;
}
```

### Alignment Analysis

| Field | MCI `EngineOrder` | MCI `Order` | Alignment |
|-------|------------------|-------------|-----------|
| `id` / `orderId` | `id: string` | `orderId: string` | ❌ MISMATCH — Key name differs |
| `symbol` | `string` | `string` | ✅ PASS |
| `exchange` | `'NSE' \| 'BSE'` | — (missing) | ⚠️ MISMATCH — Engine has it, types.ts doesn't |
| `side` / `type` | `side: 'BUY' \| 'SELL'` | `type: 'buy' \| 'sell'` | ❌ MISMATCH — Different key, different case |
| `type` / `orderType` | `type: 'MARKET' \| ...` | `orderType: 'market' \| ...` | ❌ MISMATCH — Different key, different case |
| `status` | `'pending' \| 'open' \| ...` | `'open' \| 'executed' \| ...` | ❌ MISMATCH — Different enum values |
| `filledQuantity` | `number` | — (missing) | ⚠️ MISMATCH |
| `createdAt` / `placedAt` | `createdAt: number` | `placedAt: number` | ❌ MISMATCH — Different key |
| `updatedAt` / `executedAt` | `updatedAt: number` | `executedAt?: number` | ❌ MISMATCH — Different semantics |

**Verdict:** ❌ **MISMATCH** — Significant differences between Engine and types.ts definitions.

### Internal MCI Discrepancy Summary

| Discrepancy | `EngineOrder` | `Order` |
|-------------|--------------|---------|
| ID field name | `id` | `orderId` |
| Side/direction field | `side` (uppercase) | `type` (lowercase) |
| Order type field | `type` | `orderType` |
| Case convention | UPPERCASE | lowercase |
| Status values | includes 'pending' | excludes 'pending', includes 'executed' |

---

## 5. ENGINE TELEMETRY CONTRACT

### MCI Interface: `EngineTelemetry`

```typescript
export interface EngineTelemetry {
  status: EngineStatus;
  positions: EnginePosition[];
  orders: EngineOrder[];
  account: {
    equity: number;
    cash: number;
    marginUsed: number;
    marginAvailable: number;
    dayPnl: number;
    totalPnl: number;
  };
  health: {
    cpu: number;
    memory: number;
    latency: number;
    errorRate: number;
  };
  timestamp: number;
}
```

### CIA-SIE-PURE Expected Response

| Field | MCI Type | CIA-SIE-PURE | Alignment |
|-------|----------|--------------|-----------|
| `status` | `EngineStatus` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `positions` | `EnginePosition[]` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `orders` | `EngineOrder[]` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `account.equity` | `number` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `account.cash` | `number` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `account.marginUsed` | `number` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `account.marginAvailable` | `number` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `account.dayPnl` | `number` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `account.totalPnl` | `number` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `health.cpu` | `number` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `health.memory` | `number` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `health.latency` | `number` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `health.errorRate` | `number` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| `timestamp` | `number` | **[UNKNOWN]** | ⚠️ UNKNOWN |

**Verdict:** ⚠️ **UNKNOWN** — `/api/engine/telemetry` is an MCI-designed endpoint. CIA-SIE-PURE may not have this composite endpoint.

### CIA-SIE-PURE Known Endpoints (from Forensic Analysis)

From `VERBATIM_API.md` and `CIA_SIE_PURE_CANONICAL_STATE_RECONSTITUTION.md`:

| Endpoint | Purpose | Schema |
|----------|---------|--------|
| `GET /health` | Process health | `{ status: "healthy", app, version, ... }` |
| `GET /api/v1/instruments` | List instruments | **[UNKNOWN]** |
| `GET /api/v1/silos` | List silos | **[UNKNOWN]** |
| `GET /api/v1/charts/{chart_id}` | Chart data | **[UNKNOWN]** |
| `POST /api/v1/webhook/signal` | Receive signals | **[UNKNOWN]** |

**Finding:** CIA-SIE-PURE appears to be a **signal aggregation/narrative system**, NOT a trading engine telemetry provider.

---

## 6. SIGNAL DATA CONTRACT (CIA-SIE-PURE NATIVE)

### CIA-SIE-PURE Signal Model (from Forensic Analysis)

Based on `core/models.py` (Pydantic) and `dal/models.py` (SQLAlchemy):

| Field | Type | Purpose |
|-------|------|---------|
| `id` | `UUID` | Unique identifier |
| `chart_id` | `UUID` | Parent chart reference |
| `direction` | `SignalDirection` | BUY / SELL / NEUTRAL |
| `timestamp` | `datetime` | Signal timestamp |
| `indicator` | `str` | Indicator name |
| `raw_payload` | `dict` | TradingView payload |
| `freshness` | `SignalFreshness` | FRESH / STALE |

### SignalDirection Enum (CIA-SIE-PURE)

```python
class SignalDirection(str, Enum):
    BUY = "buy"
    SELL = "sell"
    NEUTRAL = "neutral"
```

### MCI Has No Native Signal Type

**Finding:** MCI `types.ts` does NOT define a `Signal` type. This is a gap.

**Verdict:** ❌ **GAP** — MCI lacks signal type definition for CIA-SIE-PURE integration.

---

## 7. NARRATIVE DATA CONTRACT (CIA-SIE-PURE NATIVE)

### CIA-SIE-PURE Narrative Model (from Forensic Analysis)

From `response_validator.py` and `narrative_generator.py`:

| Field | Type | Purpose |
|-------|------|---------|
| `narrative` | `str` | AI-generated description |
| `disclaimer` | `str` | Constitutional disclaimer |
| `model_used` | `str` | AI model identifier |
| `usage` | `dict` | Token usage |

### MCI `AIObservation` Type

```typescript
export interface AIObservation {
  id: string;
  timestamp: number;
  type: 'observation' | 'status' | 'alert';
  message: string; // MUST be descriptive only, NEVER prescriptive
}
```

### Alignment Analysis

| CIA-SIE-PURE | MCI `AIObservation` | Alignment |
|--------------|---------------------|-----------|
| `narrative` | `message` | ⚠️ POSSIBLE — Requires mapping |
| `disclaimer` | — (missing) | ❌ MISMATCH — MCI drops disclaimer |
| `model_used` | — (missing) | ⚠️ MISMATCH — Not surfaced |
| `usage` | — (missing) | ⚠️ MISMATCH — Not surfaced |
| — | `id` | ⚠️ MISMATCH — MCI generates |
| — | `timestamp` | ⚠️ MISMATCH — MCI may differ |
| — | `type` | ⚠️ MISMATCH — MCI categorizes |

**Verdict:** ⚠️ **MISMATCH** — MCI simplifies narrative, drops metadata.

---

## 8. SUMMARY: CONTRACT ALIGNMENT MATRIX

| Data Type | MCI Definition | CIA-SIE-PURE Definition | Alignment Status |
|-----------|---------------|------------------------|------------------|
| Engine Status | `EngineStatus` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| Engine Telemetry | `EngineTelemetry` | **[UNKNOWN]** | ⚠️ UNKNOWN |
| Position | `EnginePosition` / `Position` | **[UNKNOWN]** | ⚠️ UNKNOWN + INTERNAL MISMATCH |
| Order | `EngineOrder` / `Order` | **[UNKNOWN]** | ⚠️ UNKNOWN + INTERNAL MISMATCH |
| Signal | **[GAP]** | `Signal` model | ❌ GAP — MCI missing |
| Narrative | `AIObservation` | Narrative response | ⚠️ MISMATCH |
| Health | `HealthCheckResponse` | `{ status: "healthy", ... }` | ⚠️ PARTIAL MATCH |

---

## 9. ASSUMPTIONS (EXPLICIT)

| Assumption | Basis | Risk |
|------------|-------|------|
| CIA-SIE-PURE provides trading telemetry | MCI interface design | **HIGH** — May be false |
| Endpoint paths match MCI expectations | MCI interface design | **HIGH** — May differ |
| Field names are consistent | None | **HIGH** — Evidence suggests otherwise |
| Enum values use same case | None | **MEDIUM** — Evidence suggests uppercase/lowercase mix |

---

## 10. NON-ASSUMPTIONS (EXPLICIT)

| Non-Assumption | Statement |
|----------------|-----------|
| Compatibility | We do NOT assume MCI and CIA-SIE-PURE types are compatible |
| Endpoint existence | We do NOT assume `/api/engine/*` endpoints exist in CIA-SIE-PURE |
| Automatic mapping | We do NOT assume response shapes match interface definitions |
| Field semantics | We do NOT assume same-named fields have same meaning |

---

## 11. REQUIRED VERIFICATION BEFORE LIVE INGESTION

| Item | Verification Method |
|------|-------------------|
| CIA-SIE-PURE actual API endpoints | Inspect FastAPI routes in `api/routes/*.py` |
| CIA-SIE-PURE response schemas | Inspect Pydantic models in `core/models.py` |
| Enum value casing | Compare Python enums to TypeScript types |
| Field name mapping | Document field-by-field correspondence |
| Composite endpoint availability | Confirm if telemetry is composite or individual endpoints |
| Timestamp format | Verify epoch ms vs ISO string vs datetime |

---

## ATTESTATION

This Telemetry Contract Alignment document was prepared under the Multi-Silo Execution Directive dated 2026-01-29.

**Compliance Verification:**

| Prohibition | Status |
|-------------|--------|
| ❌ No adapters | ✅ COMPLIANT |
| ❌ No mocks | ✅ COMPLIANT |
| ❌ No assumptions of compatibility | ✅ COMPLIANT |
| ❌ No code changes | ✅ COMPLIANT |

**Finding Summary:**

> The MCI-defined telemetry interfaces (`EngineStatus`, `EngineTelemetry`, `EnginePosition`, `EngineOrder`) appear to be **speculative designs** without verified CIA-SIE-PURE counterparts. CIA-SIE-PURE, based on forensic analysis, is a **signal aggregation and narrative generation system**, not a trading engine telemetry provider. Significant contract alignment work is required before live ingestion can occur.

---

*End of Telemetry Contract Alignment*
