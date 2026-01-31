# SILO 4: Latency and Degradation Policy
## First-Class Visibility for Latency Conditions

**Document ID:** SILO-4-LATENCY-001  
**Date:** 2026-01-29  
**Classification:** POLICY ONLY — NO IMPLEMENTATION AUTHORIZED  
**Execution Status:** 🔒 DOCUMENTATION ONLY

---

## Governing Constraints

| Constraint | Status |
|------------|--------|
| Performance tuning | ❌ PROHIBITED |
| Retry logic changes | ❌ PROHIBITED |
| Code changes | ❌ PROHIBITED |

---

## 1. PRINCIPLE: LATENCY AS FIRST-CLASS CITIZEN

Latency is not a hidden implementation detail. It is a **user-visible condition** that affects trading decisions.

| Principle | Statement |
|-----------|-----------|
| **Transparency** | Users MUST know when the system is slow |
| **Truthfulness** | Latency indicators MUST reflect actual measurements |
| **Actionability** | Users MUST understand the impact of latency |
| **No Hiding** | High latency MUST NOT be masked or averaged away |

---

## 2. LATENCY ENVELOPES

### Health Check Latency

| Threshold | Status | Indicator | User Impact |
|-----------|--------|-----------|-------------|
| ≤ 100ms | OK | 🟢 Green | Normal operation |
| 101ms - 500ms | WARN | 🟡 Yellow | Slight delay possible |
| 501ms - 2000ms | SLOW | 🟠 Orange | Noticeable delay |
| > 2000ms | FAIL | 🔴 Red | Degraded experience |
| Timeout (5000ms) | UNAVAILABLE | 🔴 Red (pulsing) | Feature unavailable |

### Telemetry Delivery Latency

| Threshold | Status | Indicator | User Impact |
|-----------|--------|-----------|-------------|
| ≤ 500ms | OK | 🟢 Green | Real-time updates |
| 501ms - 2000ms | DELAYED | 🟡 Yellow | Updates may be stale |
| 2001ms - 5000ms | STALE | 🟠 Orange | Data staleness warning |
| > 5000ms | UNACCEPTABLE | 🔴 Red | Data unreliable |
| No update for 30s | STALE DATA | 🔴 Red | Explicit staleness warning |

### AI Narrative Generation Latency

| Threshold | Status | Indicator | User Impact |
|-----------|--------|-----------|-------------|
| ≤ 3000ms | OK | 🟢 Green | Narrative available |
| 3001ms - 10000ms | GENERATING | 🟡 Yellow (spinner) | Narrative loading |
| 10001ms - 30000ms | SLOW | 🟠 Orange | Extended wait |
| > 30000ms | TIMEOUT | 🔴 Red | Fallback narrative may be used |
| Retry in progress | REGENERATING | 🟡 Yellow | Constitutional retry |

---

## 3. COCKPIT INDICATOR BEHAVIOR

### Health Check Indicator

| State | Visual | Text | Tooltip |
|-------|--------|------|---------|
| OK (≤100ms) | 🟢 | Xms | "Health check: Xms (Excellent)" |
| WARN (≤500ms) | 🟡 | Xms | "Health check: Xms (Acceptable)" |
| SLOW (≤2000ms) | 🟠 | Xms | "Health check: Xms (Slow - may affect responsiveness)" |
| FAIL (>2000ms) | 🔴 | Xms | "Health check: Xms (Critical - significant delays expected)" |
| TIMEOUT | 🔴 pulsing | TIMEOUT | "Health check timed out - engine may be unavailable" |

### Display Rules

| Rule | Implementation |
|------|----------------|
| Always show actual latency | Never round or average |
| Color indicates severity | Green → Yellow → Orange → Red |
| Tooltip provides context | Explain user impact |
| Pulsing indicates active issue | Timeout or checking |

### Latency Trend Indicator (Optional)

| Trend | Visual | Meaning |
|-------|--------|---------|
| Improving | ↘ | Latency decreasing |
| Stable | → | Latency consistent |
| Degrading | ↗ | Latency increasing |
| Volatile | ↕ | Latency unstable |

---

## 4. DEGRADED MODE TRIGGERS

### Automatic Degraded Mode Entry

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Health check timeout | 3 consecutive | Enter degraded mode |
| Health check slow | 5 consecutive > 2000ms | Enter degraded mode |
| Subsystem unhealthy | Any subsystem fails | Enter partial degraded mode |
| All subsystems unhealthy | All fail | Enter full degraded mode |

### Degraded Mode Levels

| Level | Description | Cockpit Display |
|-------|-------------|-----------------|
| **LEVEL 0: NORMAL** | All systems operational | No special indicator |
| **LEVEL 1: PARTIAL** | Some features degraded | 🟡 "Some features may be slow" |
| **LEVEL 2: SIGNIFICANT** | Core features affected | 🟠 "Reduced functionality" |
| **LEVEL 3: SEVERE** | Most features unavailable | 🔴 "Operating in limited mode" |
| **LEVEL 4: DISCONNECTED** | Engine unreachable | 🔴 "Engine disconnected" |

### Feature Availability by Degraded Level

| Feature | LEVEL 0 | LEVEL 1 | LEVEL 2 | LEVEL 3 | LEVEL 4 |
|---------|---------|---------|---------|---------|---------|
| Health visibility | ✅ | ✅ | ✅ | ✅ | ✅ |
| Signal display | ✅ | ✅ | ⚠️ Stale | ❌ | ❌ |
| Narrative display | ✅ | ⚠️ Slow | ⚠️ Fallback | ❌ | ❌ |
| Position display | ✅ | ✅ | ⚠️ Stale | ❌ | ❌ |
| Order display | ✅ | ✅ | ⚠️ Stale | ❌ | ❌ |
| Contradiction detection | ✅ | ✅ | ⚠️ Limited | ❌ | ❌ |

---

## 5. USER IMPACT STATEMENTS

### Health Check Latency Impacts

| Latency | User Impact Statement |
|---------|----------------------|
| OK | "System is responding normally." |
| WARN | "System is slightly slower than usual. Operations may take a moment longer." |
| SLOW | "System is experiencing delays. Please allow extra time for updates." |
| FAIL | "System is very slow. Data may be significantly delayed." |
| TIMEOUT | "Cannot reach CIA-SIE-PURE. Some features are unavailable." |

### Telemetry Latency Impacts

| Latency | User Impact Statement |
|---------|----------------------|
| OK | "Data is up-to-date." |
| DELAYED | "Data may be up to a few seconds old." |
| STALE | "Data is noticeably old. Consider refreshing manually." |
| UNACCEPTABLE | "Data is significantly outdated. Trading decisions may be affected." |

### AI Narrative Latency Impacts

| Latency | User Impact Statement |
|---------|----------------------|
| OK | "Narrative is current." |
| GENERATING | "Generating narrative, please wait..." |
| SLOW | "Narrative generation is taking longer than usual." |
| TIMEOUT | "Narrative generation timed out. Displaying fallback." |
| REGENERATING | "Refining narrative for quality. Please wait..." |

---

## 6. LATENCY MEASUREMENT PROTOCOL

### Health Check Measurement

```
Start timer at: Request initiation (fetch call)
Stop timer at: Response received OR timeout
Include: Network round-trip, server processing
Exclude: MCI-side processing after response

Measurement precision: Milliseconds
Update frequency: Every health check (default: 10s)
```

### Telemetry Measurement

```
Start timer at: Telemetry request initiation
Stop timer at: Data received and parsed
Include: Network, server processing, parsing
Exclude: UI rendering

Measurement precision: Milliseconds
Update frequency: Every telemetry request
```

### AI Narrative Measurement

```
Start timer at: Narrative request initiation
Stop timer at: Narrative received
Include: Network, Claude API call, retries
Exclude: UI rendering

Measurement precision: Milliseconds
Note: May include 1-3 retries (constitutional validation)
```

---

## 7. STALENESS DETECTION

### Data Staleness Rules

| Data Type | Fresh Threshold | Stale Threshold | Expired Threshold |
|-----------|----------------|-----------------|-------------------|
| Health status | ≤ 15s | 15s - 60s | > 60s |
| Signal data | ≤ 5min | 5min - 15min | > 15min |
| Position data | ≤ 30s | 30s - 2min | > 2min |
| Order data | ≤ 30s | 30s - 2min | > 2min |
| Narrative | ≤ 10min | 10min - 30min | > 30min |

### Staleness Indicators

| Staleness | Visual | Text |
|-----------|--------|------|
| FRESH | No indicator | (none) |
| STALE | 🕐 | "Updated X minutes ago" |
| EXPIRED | ⚠️ | "Data may be outdated (last update: X)" |

---

## 8. ALERTING AND NOTIFICATION

### User Notifications

| Condition | Notification Type | Content |
|-----------|-------------------|---------|
| Entering degraded mode | Toast (warning) | "System entering degraded mode due to high latency" |
| Exiting degraded mode | Toast (success) | "System performance restored" |
| Data staleness warning | Inline badge | "Data is X minutes old" |
| Feature unavailable | Inline message | "This feature is temporarily unavailable" |

### Operator Notifications (Logs/Sentry)

| Condition | Log Level | Content |
|-----------|-----------|---------|
| Latency > WARN threshold | WARN | "Health check latency elevated: Xms" |
| Latency > FAIL threshold | ERROR | "Health check latency critical: Xms" |
| Degraded mode entry | WARN | "Entering degraded mode: [reason]" |
| Degraded mode exit | INFO | "Exiting degraded mode after X seconds" |
| Consecutive timeouts | ERROR | "X consecutive health check timeouts" |

---

## 9. RECOVERY POLICY

### Automatic Recovery Detection

| Condition | Recovery Criteria | Action |
|-----------|-------------------|--------|
| Degraded due to latency | 3 consecutive checks < threshold | Exit degraded mode |
| Degraded due to timeout | 1 successful health check | Exit degraded mode |
| Subsystem degraded | Subsystem probe succeeds | Restore feature |

### Recovery Display

| Recovery Event | User Notification |
|----------------|-------------------|
| Latency normalized | Toast: "System performance restored" |
| Connection restored | Toast: "Engine connection restored" |
| Feature restored | Inline: Feature re-enabled |

---

## 10. LATENCY BUDGET ALLOCATION

### Total Acceptable Latency (User Perception)

| Operation | Target | Maximum | User Perception |
|-----------|--------|---------|-----------------|
| Health check display | 100ms | 500ms | Instant |
| Signal refresh | 500ms | 2000ms | Quick |
| Narrative load | 3000ms | 10000ms | Expected wait |
| Position update | 500ms | 2000ms | Quick |
| Order update | 500ms | 2000ms | Quick |

### Latency Budget Breakdown

```
Total user-perceived latency = 
  Network latency (MCI → PURE) +
  Server processing time +
  Network latency (PURE → MCI) +
  MCI processing time +
  UI render time

Budget allocation:
  - Network: 60% (round-trip)
  - Server: 30%
  - MCI + UI: 10%
```

---

## 11. ASSUMPTIONS (EXPLICIT)

| Assumption | Basis | Risk |
|------------|-------|------|
| Network latency is measurable | HTTP fetch API | LOW |
| Latency is user-relevant information | UX principles | LOW |
| Users can act on latency information | Domain knowledge | MEDIUM |
| Thresholds are appropriate | Industry standards | MEDIUM — May need tuning |

---

## 12. NON-ASSUMPTIONS (EXPLICIT)

| Non-Assumption | Statement |
|----------------|-----------|
| Latency is constant | We do NOT assume latency remains stable |
| Network is reliable | We do NOT assume network is always available |
| Recovery is automatic | We do NOT assume system will recover without intervention |
| Thresholds are final | We do NOT assume current thresholds are optimal |

---

## ATTESTATION

This Latency and Degradation Policy was prepared under the Multi-Silo Execution Directive dated 2026-01-29.

**Compliance Verification:**

| Prohibition | Status |
|-------------|--------|
| ❌ No performance tuning | ✅ COMPLIANT |
| ❌ No retry logic changes | ✅ COMPLIANT |
| ❌ No code changes | ✅ COMPLIANT |

**Policy Summary:**

> This policy defines latency as a first-class, visible condition with explicit thresholds (OK/WARN/SLOW/FAIL) for health checks, telemetry delivery, and AI narrative generation. Cockpit indicators reflect actual measurements with appropriate color coding and user impact statements. Degraded mode triggers are clearly defined with feature availability matrices. All latency measurements include clear protocols and staleness detection rules.

---

*End of Latency and Degradation Policy*
