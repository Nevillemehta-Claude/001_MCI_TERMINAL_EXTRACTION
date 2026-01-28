/**
 * Phase 2: Ignition Sequence
 *
 * Two-stage ignition with safety controls:
 * 1. Backend Selection (ICICI, HDFC, Kotak, Zerodha)
 * 2. ARM System (with trading confirmation)
 * 3. IGNITE to start trading
 *
 * Safety features:
 * - Real trading requires typing confirmation phrase
 * - Two-step arming process
 * - Emergency abort at any time
 * - Clear visual distinction between brokers
 */

export { BackendSelector } from './BackendSelector';
export { IgnitionButton } from './IgnitionButton';
