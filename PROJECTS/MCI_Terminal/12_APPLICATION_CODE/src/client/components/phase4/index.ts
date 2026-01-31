/**
 * Phase 4: Shutdown Protocol
 *
 * Graceful and emergency shutdown procedures:
 *
 * Options:
 * - Cancel pending orders
 * - Close all positions
 * - Save system state
 *
 * Steps:
 * 1. Save System State
 * 2. Cancel Pending Orders
 * 3. Close Positions
 * 4. Disconnect Data Streams
 * 5. Cleanup Resources
 * 6. Finalize Shutdown
 *
 * Features:
 * - Two shutdown modes: Graceful and Emergency
 * - Step-by-step progress tracking
 * - Error handling with retry
 * - Confirmation dialogs
 */

export { ShutdownPanel } from './ShutdownPanel';
