# MCI CONSTITUTIONAL FRAMEWORK
## Philosophical Principles (PP) + Constitutional Requirements (CR) + System Invariants (INV)

**Extracted from:** Session b8937bc2-ac10-4287-8ced-af96ac5f6f0b
**Updated:** 2026-01-28
**Classification:** GOVERNANCE - SACRED
**Version:** 4.0
**Subordinate to:** PROGRAM_DIRECTOR_DIRECTIVE.md

---

## FRAMEWORK OVERVIEW

The Mission Control Interface (MCI) operates under a three-tier constitutional framework:

| Tier | Type | Purpose | Count |
|------|------|---------|-------|
| **Tier 0** | Program Director Directive | Supreme operating law | 1 |
| **Tier 1** | Philosophical Principles (PP) | Design guidance, conceptual boundaries | 3 |
| **Tier 2** | Constitutional Requirements (CR) | Implementation mandates, technical specifications | 5 |
| **Tier 3** | System Invariants (INV) | Behavioral guarantees, operational constraints | 6 |

```
┌─────────────────────────────────────────────────────────────┐
│                    CONSTITUTIONAL FRAMEWORK                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TIER 0: PROGRAM DIRECTOR DIRECTIVE (Supreme Law)          │
│  ════════════════════════════════════════════════          │
│  See: PROGRAM_DIRECTOR_DIRECTIVE.md                        │
│  "Rocket-science precision, not functional adequacy"       │
│                                                             │
│         ▼ Governs ▼                                        │
│                                                             │
│  TIER 1: PHILOSOPHICAL PRINCIPLES (Design Guidance)        │
│  ════════════════════════════════════════════════          │
│  PP-001: Decision-Support NOT Decision-Making              │
│  PP-002: Expose Contradictions                             │
│  PP-003: Descriptive AI                                    │
│                                                             │
│         ▼ Informs ▼                                        │
│                                                             │
│  TIER 2: CONSTITUTIONAL REQUIREMENTS (Implementation)       │
│  ════════════════════════════════════════════════          │
│  CR-001: Token Validity                                    │
│  CR-002: Graceful Shutdown (6-Step)                        │
│  CR-003: Error Format (WHAT/WHY/HOW)                       │
│  CR-004: Token Expiry (6:00 AM IST)                        │
│  CR-005: UXMI 7-States                                     │
│                                                             │
│         ▼ Extended By ▼                                    │
│                                                             │
│  TIER 3: SYSTEM INVARIANTS (Operational Guarantees)        │
│  ════════════════════════════════════════════════          │
│  INV-001: Daily Credential Continuity                      │
│  INV-002: System Lifecycle Discipline                      │
│  INV-003: Time & Clock Authority                           │
│  INV-004: State Legality & Transition Control              │
│  INV-005: Failure Visibility & Recoverability              │
│  INV-006: Input Sanitization & Boundary Cleanliness        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# TIER 1: PHILOSOPHICAL PRINCIPLES

These principles guide design decisions and establish conceptual boundaries for MCI.

---

## PP-001: Decision-Support NOT Decision-Making

**Status:** SACRED | DESIGN GUIDANCE

### Definition
MCI exists to INFORM the human operator, never to DECIDE for them. MCI presents data, surfaces insights, and exposes risks — the human makes all trading decisions.

### Implications
| MCI DOES | MCI DOES NOT |
|----------|--------------|
| Display position status | Recommend buy/sell |
| Show profit/loss figures | Suggest position sizing |
| Present market data | Predict market direction |
| Alert on system issues | Auto-execute trades |
| Expose conflicting signals | Resolve conflicts |

### Design Test
> "Does this feature inform or decide?"
> - If INFORM → Proceed
> - If DECIDE → Redesign

### Relationship to CRs
- Reinforces CR-003: Errors inform with WHAT/WHY/HOW, enabling human decision
- Reinforces CR-005: UI states communicate status, not recommendations

---

## PP-002: Expose Contradictions

**Status:** SACRED | DESIGN GUIDANCE

### Definition
When data presents conflicting signals, MCI must expose the contradiction clearly rather than hide, resolve, or average it away.

### Implications
| Scenario | MCI Behavior |
|----------|--------------|
| Bullish and bearish indicators | Show BOTH prominently |
| Conflicting health metrics | Display ALL with visual distinction |
| Disagreement between sources | Present side-by-side |
| Uncertainty in data | Explicitly label uncertainty |

### Design Test
> "Are we hiding complexity to make the UI cleaner?"
> - If YES → Redesign to expose it
> - If NO → Proceed

### Relationship to CRs
- Reinforces CR-003: Errors must explain WHY, not hide root cause
- Reinforces PP-001: Exposed contradictions let human decide

---

## PP-003: Descriptive AI

**Status:** SACRED | DESIGN GUIDANCE

### Definition
Any AI assistance in MCI must be DESCRIPTIVE (explaining what is) not PRESCRIPTIVE (recommending what to do).

### Implications
| AI MAY | AI MAY NOT |
|--------|------------|
| "Position is down 5%" | "You should close this position" |
| "Volatility has increased" | "Consider reducing exposure" |
| "3 checks failed" | "You should not ignite" |
| "Token expires in 30 minutes" | "Renew your token now" |

### Design Test
> "Is the AI telling the user what to do?"
> - If YES → Reword to describe, not prescribe
> - If NO → Proceed

### Relationship to CRs
- Reinforces CR-003: Errors describe problem, explain cause, show options
- Reinforces PP-001: Description enables decision, prescription replaces it

---

# TIER 2: CONSTITUTIONAL REQUIREMENTS

These requirements are implementation mandates with specific technical specifications.

---

## CR-001: TOKEN VALIDITY

**Status:** SACRED | NON-NEGOTIABLE

### Definition
Every operation must validate token before execution. Invalid token = STOP everything. No token = No operation.

### Implementation Requirements
- Token validation MUST occur before any API call
- Failed validation MUST halt all operations immediately
- No fallback or retry without valid token
- Token state must be verifiable at all times

### Phase Applicability
- **Phase 0**: Token Capture - Initial acquisition and validation
- **All Phases**: Continuous validation requirement

### PP Alignment
- PP-001: Token status displayed (decision-support), not auto-renewed (decision-making)

---

## CR-002: GRACEFUL SHUTDOWN (6-Step Sequence)

**Status:** SACRED | NON-NEGOTIABLE

### Definition
All system shutdowns must follow the prescribed 6-step sequence to ensure data integrity and clean exit.

### The 6 Steps

| Step | Action | Purpose |
|------|--------|---------|
| 1 | Cancel all pending orders | Prevent orphaned orders |
| 2 | Close all open positions | Clean position exit |
| 3 | Disconnect from broker | Clean API disconnection |
| 4 | Stop telemetry streams | Close WebSockets |
| 5 | Clear session data | Security cleanup |
| 6 | Log shutdown complete | Audit trail |

### Implementation Requirements
- Sequence MUST execute in order (1 → 2 → 3 → 4 → 5 → 6)
- Each step must complete before next begins
- Emergency mode accelerates but still follows sequence
- Phase 4 (Shutdown) enforces this requirement

### PP Alignment
- PP-001: User initiates shutdown (decision), system executes sequence (support)

---

## CR-003: ERROR FORMAT (WHAT/WHY/HOW)

**Status:** SACRED | NON-NEGOTIABLE

### Definition
Every error must be presented in the standardized three-part format to enable informed human response.

### The Format

```
WHAT: [Brief description of what happened]
WHY:  [Explanation of why it happened]
HOW:  [Actionable steps to resolve]
```

### Implementation Requirements
- All error handlers MUST use this format
- User-facing errors must be human-readable
- Technical details available via toggle
- Backend logs capture full context

### Example
```
WHAT: Token validation failed
WHY:  Token expired at 06:00 AM IST (daily expiry)
HOW:  Return to Phase 0 to obtain a new token
```

### PP Alignment
- PP-001: Error explains situation (support), user decides action (decision)
- PP-002: Error exposes root cause, doesn't hide complexity
- PP-003: Error describes problem, doesn't prescribe "you must do X"

---

## CR-004: TOKEN EXPIRY AT 6:00 AM IST

**Status:** SACRED | NON-NEGOTIABLE

### Definition
Kite tokens expire at 6:00 AM IST daily. This timing is determined by Zerodha and is NON-NEGOTIABLE.

### Technical Details
- **6:00 AM IST = 00:30 UTC** (IST is UTC+5:30)
- Tokens are issued by Kite Connect (Zerodha)
- New token must be acquired after expiry
- System must handle transition gracefully

### Implementation Requirements
- Token timer must display countdown to expiry
- Warning at 15 minutes before expiry
- Automatic redirect to Phase 0 at expiry
- No operations permitted with expired token

### Phase Applicability
- **Phase 0**: Token Capture - Acquires new token
- **Phase 4**: May trigger if expiry occurs during session

### PP Alignment
- PP-001: Display countdown (support), user decides when to re-authenticate (decision)
- PP-003: "Token expires in X minutes" (descriptive), not "Renew now" (prescriptive)

---

## INV-001: DAILY CREDENTIAL CONTINUITY

**Status:** SYSTEM INVARIANT | REQUIRES PRINCIPAL APPROVAL TO MODIFY

### Definition
Credentials persist client-side across browser and system restarts within the daily validity window (until 6:00 AM IST), then are forcibly cleared.

### Technical Details
- **Storage:** localStorage (client-side only)
- **Persistence Window:** From authentication until `tokenExpiresAt`
- **Rehydration:** On app load, if `now >= tokenExpiresAt`, ALL credentials cleared
- **No Backend Storage:** Credentials never transmitted or stored server-side

### Behavioral Guarantees

| Scenario | Behavior |
|----------|----------|
| Browser closed and reopened (token valid) | Credentials restored, session continues |
| System rebooted (token valid) | Credentials restored, session continues |
| App loaded after 6:00 AM IST | Credentials cleared, re-authentication required |
| New tab opened (token valid) | Credentials shared via localStorage |

### Implementation Requirements
- `tokenStore.ts` must use `localStorage` for persistence
- `partialize` must include `kiteApiKey`, `kiteAccessToken`, `kiteUserId`
- `merge` function must enforce CR-004: clear ALL credentials if expired
- `localStorage.removeItem()` must be called on expiry to prevent stale data

### Verification
- **Code:** `src/client/stores/tokenStore.ts` lines 259-313
- **Test:** `bun run test src/client/stores/tokenStore.test.ts`
- **Manual:** Close browser, reopen, verify credentials restored (within window)

### Non-Negotiable Constraints
1. Expiry-based clearing is mandatory — no stale credentials permitted
2. No silent token renewal — expiry forces explicit re-authentication
3. No backend persistence — credentials remain strictly client-side
4. Any change to this invariant requires explicit Principal approval

### Relationship to CR-004
INV-001 extends CR-004 by defining persistence behavior within the validity window. CR-004 defines WHEN tokens expire; INV-001 defines HOW credentials are managed around that expiry.

---

## CR-005: UXMI 7-STATE MICRO-INTERACTIONS

**Status:** SACRED | NON-NEGOTIABLE

### Definition
All interactive UI components must implement the 7-state micro-interaction standard for consistent user experience.

### The 7 Components
1. **Button** - Interactive action trigger
2. **ErrorDisplay** - Error presentation with WHAT/WHY/HOW
3. **Input** - Text/data entry fields
4. **ProgressBar** - Progress visualization
5. **Spinner** - Loading indicator
6. **Toast** - Notification messages
7. **Tooltip** - Contextual help

### The 7 States
1. **idle** - Default resting state
2. **hover** - Mouse hover feedback
3. **active** - Click/press feedback
4. **loading** - Operation in progress
5. **success** - Operation completed successfully
6. **error** - Operation failed
7. **disabled** - Interaction not available

### Timing Constants (SACRED)

| Transition | Duration | Purpose |
|------------|----------|---------|
| Hover | 150ms | Visual hover feedback |
| Active | 100ms | Button press feedback |
| Tooltip Delay | 300ms | Delay before tooltip shows |
| Toast Duration | 5000ms | Auto-dismiss notification |

### Implementation Code Reference
```typescript
const TIMING = {
  hover: 150,    // ms - transition to hover state
  active: 100,   // ms - button press feedback
  tooltip: 300,  // ms - delay before tooltip shows
  toast: 5000    // ms - auto-dismiss duration
};
```

### PP Alignment
- PP-001: States communicate status (support), don't auto-proceed (decision-making)
- PP-002: Error state exposes problems, doesn't hide them

---

## COMPLIANCE MATRIX

### Tier 1: Philosophical Principles

| PP | Name | Status | Verification |
|----|------|--------|--------------|
| PP-001 | Decision-Support NOT Decision-Making | ACTIVE | Design review |
| PP-002 | Expose Contradictions | ACTIVE | Design review |
| PP-003 | Descriptive AI | ACTIVE | Copy review |

### Tier 2: Constitutional Requirements

| CR | Name | Status | Verification |
|----|------|--------|--------------|
| CR-001 | Token Validity | IMPLEMENTED | All API calls validate token |
| CR-002 | Graceful Shutdown | IMPLEMENTED | 6-step sequence in shutdownStore |
| CR-003 | Error Format | IMPLEMENTED | WHAT/WHY/HOW in ErrorDisplay |
| CR-004 | Token Expiry | IMPLEMENTED | TokenTimer with 6:00 AM IST |
| CR-005 | UXMI 7-States | IMPLEMENTED | All 7 components × 7 states |

### Tier 3: System Invariants

| INV | Name | Status | Verification |
|-----|------|--------|--------------|
| INV-001 | Daily Credential Continuity | IMPLEMENTED | localStorage persistence, CR-004 enforcement on rehydration |
| INV-002 | System Lifecycle Discipline | IMPLEMENTED | Unified start/stop scripts, deterministic launch/shutdown |
| INV-003 | Time & Clock Authority | IMPLEMENTED | UTC-based calculations, single expiry source |
| INV-004 | State Legality & Transition Control | IMPLEMENTED | Phase guards, transition matrix, entry/exit conditions |
| INV-005 | Failure Visibility & Recoverability | IMPLEMENTED | CR-003 format, no silent failures, recovery paths |
| INV-006 | Input Sanitization & Boundary Cleanliness | IMPLEMENTED | Centralized sanitization module, defense-in-depth |

---

## RELATIONSHIP MAP

```
PP-001 (Decision-Support)
   │
   ├──→ CR-001 (Token displayed, not auto-managed)
   ├──→ CR-002 (User initiates, system executes)
   ├──→ CR-003 (Error informs, user decides)
   ├──→ CR-004 (Countdown shown, user re-auths)
   └──→ CR-005 (States inform, don't auto-proceed)

PP-002 (Expose Contradictions)
   │
   ├──→ CR-003 (Root cause exposed in WHY)
   └──→ CR-005 (Error state visible, not hidden)

PP-003 (Descriptive AI)
   │
   ├──→ CR-003 (Describes problem, shows options)
   └──→ CR-004 (Describes expiry, doesn't command)

CR-004 (Token Expiry)
   │
   └──→ INV-001 (Daily Credential Continuity)
        └── Defines persistence behavior within validity window
        └── Enforces clearing on expiry
        └── No silent renewal permitted

CR-002 (Graceful Shutdown)
   │
   └──→ INV-002 (System Lifecycle Discipline)
        └── Deterministic application launch
        └── Deterministic application shutdown
        └── Cold-start integrity
        └── Tooling subordination

CR-001 (Token Validity) + CR-003 (Error Format) + INV-001 (Credentials)
   │
   └──→ INV-006 (Input Sanitization & Boundary Cleanliness)
        └── All inputs sanitized at entry point
        └── All API boundaries defensively sanitize
        └── No raw input in protocol construction
        └── Centralized validation module
```

---

## AUDIT STATUS

**Last Audit:** 2026-01-28
**Framework Version:** 4.1 (INV-006 added)
**Compliance Rating:** 100%

### Updates in v4.1 (2026-01-28)
- Added INV-006: Input Sanitization & Boundary Cleanliness
- Implemented centralized sanitization module at `src/shared/validation/sanitize.ts`
- Refactored all credential ingestion paths to use centralized module
- Incident INC-2026-01-28-001 closed at root class level

### Updates in v4.0 (2026-01-28)
- Added Tier 0: Program Director Directive as supreme operating law
- Added INV-003: Time & Clock Authority
- Added INV-004: State Legality & Transition Control
- Added INV-005: Failure Visibility & Recoverability
- Created PROGRAM_DIRECTOR_DIRECTIVE.md

### Updates in v3.1 (2026-01-28)
- Added INV-002: System Lifecycle Discipline
- Unified application start/stop scripts created
- Deterministic launch and shutdown formalized
- Cold-start integrity requirements documented
- Tooling subordination principle established

### Updates in v3.0 (2026-01-28)
- Added Tier 3: System Invariants (INV-001)
- INV-001: Daily Credential Continuity formalized
- CR-004 extended with persistence behavior
- Updated relationship map with CR-004 → INV-001 link

### Updates in v2.0 (2026-01-27)
- Added Tier 1: Philosophical Principles (PP-001, PP-002, PP-003)
- Documented PP ↔ CR relationships
- Updated CR-002 step descriptions for accuracy
- Added PP Alignment section to each CR

---

## INV-006: INPUT SANITIZATION & BOUNDARY CLEANLINESS

**Status:** SYSTEM INVARIANT | REQUIRES PRINCIPAL APPROVAL TO MODIFY

**Origin:** Incident INC-2026-01-28-001 (Credential Whitespace Validation Failure)

### Definition

All externally supplied string inputs must be sanitized at the point of entry. All API boundaries must defensively sanitize inputs regardless of upstream guarantees. No string may be used in protocol construction (headers, URLs, payloads) without validation.

### Technical Details

- **Centralized Module:** `src/shared/validation/sanitize.ts`
- **Entry Point Sanitization:** All user inputs sanitized before storage
- **API Boundary Sanitization:** All inputs re-sanitized at backend routes
- **Protocol Construction:** All header/URL values built via safe helpers
- **Rehydration Sanitization:** Persisted data sanitized on load

### Behavioral Guarantees

| Guarantee | Enforcement |
|-----------|-------------|
| **Whitespace Trimming** | All string inputs trimmed of leading/trailing whitespace |
| **Control Character Rejection** | ASCII 0-31 and 127 are forbidden |
| **Empty-After-Trim Handling** | Empty values detected and reported, never propagated silently |
| **Protocol Safety** | Header/URL values validated before use in construction |
| **Defense in Depth** | Every boundary sanitizes, never trusts upstream |

### Sanitization Points (Complete Inventory)

| Point | Location | Function |
|-------|----------|----------|
| **UI Entry** | `TokenCaptureForm.tsx` | `sanitizeKiteCredentials()` |
| **API Boundary** | `auth.ts` route | `sanitizeCredentialsFromRequest()` |
| **Header Construction** | `auth.ts` route | `buildKiteAuthHeader()` |
| **Storage Rehydration** | `tokenStore.ts` merge | `sanitizeString()` on each field |

### Forbidden Patterns

```typescript
// FORBIDDEN: Raw input in header construction
`token ${rawApiKey}:${rawToken}`  // ❌

// REQUIRED: Safe builder function
buildKiteAuthHeader(sanitizedApiKey, sanitizedToken)  // ✓

// FORBIDDEN: Trust upstream sanitization
const { apiKey } = body;  // ❌ (raw from request)

// REQUIRED: Sanitize at every boundary
const { kiteApiKey } = sanitizeCredentialsFromRequest(body);  // ✓
```

### Implementation Requirements

1. **Centralized Module MUST Exist**
   - Path: `src/shared/validation/sanitize.ts`
   - Exports: `sanitizeString`, `sanitizeKiteCredentials`, `sanitizeCredentialsFromRequest`, `buildKiteAuthHeader`

2. **All User Input MUST Flow Through Sanitization**
   - Form submissions → `sanitizeKiteCredentials()`
   - API requests → `sanitizeCredentialsFromRequest()`
   - localStorage rehydration → `sanitizeString()` on each field

3. **All Protocol Construction MUST Use Safe Builders**
   - Authorization headers → `buildKiteAuthHeader()`
   - No inline template literals with credential values

4. **No Duplicate Ad-Hoc Sanitization**
   - All `.trim()` calls centralized in module
   - Local code calls module functions, not raw `.trim()`

### Non-Negotiable Constraints

1. **No raw user input may reach protocol construction** — sanitization is mandatory
2. **Every boundary sanitizes** — defense in depth, never trust upstream
3. **Validation failures are explicit** — errors thrown, not silent empty values
4. **Centralized logic prevents drift** — one source of truth for sanitization rules
5. **Any change requires Principal approval**

### Relationship to Other Invariants

| Related | Relationship |
|---------|--------------|
| **CR-001** | Token validity depends on clean credentials; dirty input = invalid token |
| **CR-003** | Sanitization errors reported in WHAT/WHY/HOW format |
| **INV-001** | Rehydrated credentials must be sanitized; persisted dirt is still dirt |

### Verification Procedures

See **INV-006 VERIFICATION PROCEDURES** section below.

---

## INV-002: SYSTEM LIFECYCLE DISCIPLINE

**Status:** SYSTEM INVARIANT | REQUIRES PRINCIPAL APPROVAL TO MODIFY

### Definition

The MCI application must behave as a single coherent system with deterministic launch, shutdown, and state management. No residual, orphaned, or hidden processes may influence application behavior.

### Technical Details

- **Authoritative Launch:** `./scripts/start.sh` or `bun run start`
- **Authoritative Shutdown:** `./scripts/stop.sh` or `bun run stop`
- **Status Check:** `./scripts/status.sh` or `bun run status`
- **PID Tracking:** `.mci-pids` file tracks all spawned processes
- **Ports:** Frontend on 5173, Backend on 3000

### Behavioral Guarantees

| Principle | Guarantee |
|-----------|-----------|
| **Deterministic Launch** | Single command starts all required processes in correct order |
| **Deterministic Shutdown** | Single command terminates all processes with no orphans |
| **Cold-Start Integrity** | Any restart produces identical behavior; only INV-001 state persists |
| **Tooling Subordination** | Dev tools, terminals, and automation are subordinate to app lifecycle |
| **Clean State Verification** | Launch script verifies no residual processes before starting |

### Launch Sequence (6 Steps)

| Step | Action | Verification |
|------|--------|--------------|
| 1 | Cleanup residual processes | Kill any existing Vite/Bun processes |
| 2 | Verify clean state | Confirm ports 5173 and 3000 are free |
| 3 | Prepare environment | Verify dependencies installed |
| 4 | Start backend server | Wait for health check on :3000 |
| 5 | Start frontend server | Wait for response on :5173 |
| 6 | Display status | Confirm all services running |

### Shutdown Sequence (7 Steps)

| Step | Action | Verification |
|------|--------|--------------|
| 1 | Read PID file | Load tracked process IDs |
| 2 | Stop frontend server | Kill Vite process |
| 3 | Stop backend server | Kill Bun server process |
| 4 | Cleanup orphaned processes | Kill any remaining MCI processes |
| 5 | Cleanup PID file | Remove `.mci-pids` |
| 6 | Verify clean state | Confirm ports are released |
| 7 | Display status | Confirm all services stopped |

### Implementation Requirements

- `scripts/start.sh` MUST be the authoritative way to launch the application
- `scripts/stop.sh` MUST be the authoritative way to stop the application
- All processes MUST be tracked in `.mci-pids` file
- Launch script MUST perform forensic cleanup before starting
- Shutdown script MUST verify clean state after stopping
- No process may run independently of the lifecycle scripts

### Non-Negotiable Constraints

1. **No orphaned processes** — all processes terminate on shutdown
2. **No residual state** — only INV-001 (daily credentials) persists across restarts
3. **No hidden coupling** — tooling behavior never influences application correctness
4. **Deterministic cold-start** — identical behavior on every fresh start
5. **Any change requires Principal approval**

### Relationship to CR-002

INV-002 extends CR-002 (Graceful Shutdown) to cover the entire application lifecycle, not just the in-app shutdown sequence. CR-002 defines the 6-step trading shutdown; INV-002 defines process-level launch and shutdown discipline.

---

## INV-001 VERIFICATION PROCEDURES

### During Development

1. **Code Review Checklist:**
   - [ ] `tokenStore.ts` uses `localStorage` (not sessionStorage)
   - [ ] `partialize` includes `kiteApiKey`, `kiteAccessToken`, `kiteUserId`
   - [ ] `merge` function checks `now >= tokenExpiresAt`
   - [ ] On expiry: ALL credential fields cleared to empty strings
   - [ ] `localStorage.removeItem('mci-token-storage')` called on expiry

2. **Test Verification:**
   ```bash
   bun run test src/client/stores/tokenStore.test.ts
   ```

### During Troubleshooting

1. **Check localStorage in Browser DevTools:**
   - Open DevTools → Application → Local Storage
   - Find `mci-token-storage` key
   - Verify credentials present (within validity window)
   - Verify cleared (after 6:00 AM IST)

2. **Console Logs to Watch:**
   - `[TokenStore] Restoring valid credentials from localStorage` → Normal rehydration
   - `[TokenStore] CR-004: Clearing expired credentials on rehydration` → Expiry enforcement

### After Changes to Auth/Storage/Session

1. **Regression Test:**
   - Authenticate with valid credentials
   - Close browser completely
   - Reopen browser, navigate to app
   - Verify credentials restored (if within window)
   - Verify credentials cleared (if past expiry)

2. **Edge Case Test:**
   - Set system clock to 6:01 AM IST
   - Load app with previously-valid credentials
   - Verify forced re-authentication

---

## INV-002 VERIFICATION PROCEDURES

### During Development

1. **Code Review Checklist:**
   - [ ] All process spawning goes through `scripts/start.sh`
   - [ ] All process termination goes through `scripts/stop.sh`
   - [ ] PIDs are tracked in `.mci-pids` file
   - [ ] No hardcoded ports or process assumptions
   - [ ] Health checks verify service readiness

2. **Launch Verification:**
   ```bash
   # Stop any existing processes
   bun run stop
   
   # Verify clean state
   bun run status  # Should show "APPLICATION STOPPED"
   
   # Launch application
   bun run start
   
   # Verify running state
   bun run status  # Should show "APPLICATION RUNNING"
   ```

### During Troubleshooting

1. **Check for Orphaned Processes:**
   ```bash
   # Check for any Vite/Bun processes
   pgrep -f "vite|bun.*server"
   
   # Check ports in use
   lsof -i :5173,:3000
   ```

2. **Force Clean Shutdown:**
   ```bash
   bun run stop -- --force
   ```

### After Changes to Launch/Shutdown Logic

1. **Cold-Start Test:**
   ```bash
   # Complete shutdown
   bun run stop
   
   # Kill any remaining processes manually
   pkill -f "vite" 2>/dev/null || true
   pkill -f "bun.*server" 2>/dev/null || true
   
   # Verify ports free
   lsof -i :5173,:3000  # Should return nothing
   
   # Fresh start
   bun run start
   
   # Verify application behavior
   curl http://localhost:3000/api/health
   ```

2. **Restart Integrity Test:**
   ```bash
   # Start, stop, start - verify identical behavior
   bun run start
   # ... use application ...
   bun run stop
   bun run start
   # Application should behave identically
   ```

---

## INV-006 VERIFICATION PROCEDURES

### During Development

1. **Code Review Checklist:**
   - [ ] All form inputs call `sanitizeKiteCredentials()` before storage
   - [ ] All API routes call `sanitizeCredentialsFromRequest()` on body
   - [ ] All header construction uses `buildKiteAuthHeader()`
   - [ ] localStorage rehydration sanitizes each field via `sanitizeString()`
   - [ ] No raw `.trim()` calls outside centralized module
   - [ ] Validation errors thrown, not swallowed silently

2. **Module Integrity Check:**
   ```bash
   # Verify centralized module exists
   ls -la src/shared/validation/sanitize.ts
   
   # Verify exports
   grep -E "^export (function|const)" src/shared/validation/sanitize.ts
   ```

### Test Cases (Mandatory)

The following test cases MUST pass for INV-006 compliance:

| ID | Test Case | Input | Expected |
|----|-----------|-------|----------|
| AUTH-WS-001 | Leading whitespace | `" APIKEY"` | Trimmed to `"APIKEY"` |
| AUTH-WS-002 | Trailing whitespace | `"APIKEY "` | Trimmed to `"APIKEY"` |
| AUTH-WS-003 | Both whitespace | `" APIKEY "` | Trimmed to `"APIKEY"` |
| AUTH-WS-004 | Multiple spaces | `"  APIKEY  "` | Trimmed to `"APIKEY"` |
| AUTH-WS-005 | Tab characters | `"\tAPIKEY\t"` | Trimmed to `"APIKEY"` |
| AUTH-WS-006 | Control characters | `"API\x00KEY"` | Rejected with error |

### During Troubleshooting

1. **Inspect Authorization Header:**
   ```javascript
   // In browser DevTools, intercept the request
   // Check for double spaces in header value
   // Format should be: "token APIKEY:ACCESSTOKEN" (single space after "token")
   ```

2. **Check for Dirty Data:**
   ```javascript
   // In browser console
   const stored = localStorage.getItem('mci-token-storage');
   const parsed = JSON.parse(stored);
   console.log('API Key starts with space:', parsed.state.kiteApiKey.startsWith(' '));
   console.log('API Key ends with space:', parsed.state.kiteApiKey.endsWith(' '));
   ```

3. **Verify Sanitization Logs:**
   ```
   // Backend logs should show sanitized values being used
   // Never raw user input
   ```

### After Changes to Input/Auth/API

1. **Regression Test:**
   - Submit form with leading space in API key
   - Verify authentication succeeds (whitespace stripped)
   - Check backend logs for clean header format

2. **Boundary Test:**
   - Clear localStorage
   - Enter credentials with whitespace
   - Reload application
   - Verify rehydrated credentials are clean

3. **Inventory Audit:**
   ```bash
   # Find all credential handling paths
   grep -rn "kiteApiKey\|kiteAccessToken\|kiteUserId" src/
   
   # Verify each path flows through sanitization
   # No raw access permitted
   ```

---

## CROSS-REFERENCES

- **Architecture Flowcharts:** See `02_ARCHITECTURE/FLOWCHARTS/` for implementation diagrams
- **Error Propagation:** See `02_ARCHITECTURE/FLOWCHARTS/2.12_ERROR_PROPAGATION.md`
- **UXMI States:** See `02_ARCHITECTURE/FLOWCHARTS/2.9_UXMI_STATES.md`
- **Shutdown Sequence:** See `02_ARCHITECTURE/FLOWCHARTS/2.5_SHUTDOWN_SEQUENCE.md`
- **Phase I Constraints:** See `09_IMPLEMENTATION_ROADMAP/PHASE_ARTIFACTS/PHASE_I/P1-A04_CONSTRAINTS_REFERENCE.md`

---

*This document represents the inviolable foundation of MCI operations.*
*Any modification requires formal governance review and Principal approval.*
