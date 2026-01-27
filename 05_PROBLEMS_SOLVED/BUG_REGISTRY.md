# MCI BUG REGISTRY & SOLUTIONS

**Extracted from:** Session b8937bc2-ac10-4287-8ced-af96ac5f6f0b
**Extraction Date:** 2026-01-25
**Classification:** PROBLEMS SOLVED

---

## BUG-001: Backend Mode Mismatch

**Status:** RESOLVED

**WHAT:** Backend expecting 'paper'/'live' but receiving 'zerodha'/'icici'

**WHY:** API contract mismatch between frontend (sending broker name) and backend (expecting mode)

**HOW:** Updated the ignition endpoint to accept broker names instead of modes, or map broker names to modes correctly.

**Files Affected:**
- `src/server/routes/ignition.ts`
- `src/client/components/phase2/BackendSelector.tsx`

---

## BUG-002: Autonomous Reference Contamination

**Status:** RESOLVED

**WHAT:** 123 occurrences of "autonomous" across 22 files violating SUPERVISED model

**WHY:** Initial development used autonomous execution model before governance change

**HOW:** Systematic purge using replace_all across all affected files

**Files Updated:**
| File | Occurrences Removed |
|------|-------------------|
| KITE_EXECUTION_GUIDE.md | 46 |
| KITE_IMPLEMENTATION_REPORT.md | 22 |
| SESSION_SUMMARY_2026-01-20.md | 11 |
| IMPLEMENTATION_REPORT.md | Multiple |
| UI_UX_DESIGN_SYSTEM.md | Multiple |
| PROTOTYPE_REVIEW.md | 1 |
| And more... | Various |

**Remaining (Intentional):** 7 occurrences in SUPERVISED_MISSION_DIRECTIVE (explaining the transition FROM autonomous TO supervised)

---

## BUG-003: Wrong Specification Build

**Status:** RESOLVED via RETROFIT

**WHAT:** MCI project was built following the WRONG specification (`COMPLETE_EXECUTION_GUIDE`)

**WHY:** Multiple specification documents existed, developer used incorrect one

**HOW:** RETROFIT decision - existing code at 97% compliance, updated to align with correct specification

**Key Insight:**
> Clean Slate = Design supersession, not code destruction

---

## BUG-004: File Size Overflow in Session Reading

**Status:** DOCUMENTED

**WHAT:** Cannot read session files larger than 256KB directly

**WHY:** Tool limitation on file read size

**HOW:** Use offset and limit parameters, or grep for specific content

**Affected Files:**
- Large JSONL session files (4-32MB)
- Session archives

---

## TROUBLESHOOTING PATTERNS

### Pattern: Token Expiry Handling

**Symptom:** Operations fail after 6:00 AM IST

**Cause:** Kite tokens expire daily at 6:00 AM IST

**Solution:**
1. Check token expiry time
2. Redirect to Phase 0 if expired
3. Capture new token

### Pattern: Scanner Check Failure

**Symptom:** Cannot proceed to ignition

**Cause:** One or more of 12 pre-ignition checks failed

**Solution:**
1. Identify which check failed
2. Resolve underlying issue (network, API, etc.)
3. Re-run scanner

### Pattern: WebSocket Connection Lost

**Symptom:** Telemetry stops updating

**Cause:** WebSocket connection dropped

**Solution:**
1. Auto-reconnect logic
2. Fallback to SSE
3. Polling as last resort

---

## ERROR FORMAT (CR-003)

All errors should follow:

```
WHAT: [What went wrong]
WHY:  [Root cause]
HOW:  [Recovery action taken]
```

Example:
```
WHAT: Token validation failed
WHY:  Token expired at 06:00 AM IST (daily expiry per CR-004)
HOW:  Redirecting user to token capture flow (Phase 0)
```
