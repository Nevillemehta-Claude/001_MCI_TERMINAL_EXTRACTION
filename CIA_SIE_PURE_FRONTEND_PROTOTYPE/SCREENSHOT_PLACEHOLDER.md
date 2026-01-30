# PROTOTYPE SCREENSHOTS

**Note:** Screenshots will be captured after running the prototype.

---

## REQUIRED SCREENSHOTS FOR VERIFICATION

| Screenshot | Purpose | Verification Point |
|------------|---------|-------------------|
| `01_simulation_badge.png` | Shows SIMULATION badge | GAP-04 compliance |
| `02_token_timer.png` | Shows token countdown | CR-004 compliance |
| `03_phase0_form.png` | Token capture form | Phase 0 UI |
| `04_phase1_scanner.png` | Pre-ignition checks | Phase 1 UI |
| `05_phase2_ignition.png` | Ignition controls | Phase 2 UI |
| `06_phase3_dashboard.png` | Telemetry panels | Phase 3 UI |
| `07_phase4_shutdown.png` | Shutdown panel | CR-002 compliance |
| `08_error_display.png` | WHAT/WHY/HOW format | CR-003 compliance |
| `09_button_states.png` | 7 button states | CR-005 compliance |
| `10_tooltip.png` | 300ms tooltip | CR-005 timing |

---

## SCREENSHOT CAPTURE COMMAND

After starting the prototype:

```bash
# Using Playwright for automated screenshots
npx playwright screenshot http://localhost:5173 screenshot.png
```

---

## MANUAL VERIFICATION

If automated screenshots are not available, manually capture each screen and place in this directory.

---

*Placeholder created: 2026-01-29*
