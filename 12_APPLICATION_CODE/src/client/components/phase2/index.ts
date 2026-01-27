/**
 * Phase 2: Ignition Sequence
 *
 * Two-stage ignition with safety controls:
 * 1. Backend Selection (Paper vs Live)
 * 2. ARM System (with live confirmation if needed)
 * 3. IGNITE to start trading
 *
 * Safety features:
 * - Live trading requires typing confirmation phrase
 * - Two-step arming process
 * - Emergency abort at any time
 * - Clear visual distinction between modes
 */

export { BackendSelector } from './BackendSelector';
export { IgnitionButton } from './IgnitionButton';
