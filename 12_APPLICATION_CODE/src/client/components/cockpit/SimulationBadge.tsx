/**
 * SimulationBadge Component
 * 
 * COCKPIT INTEGRITY: Clearly marks simulated/mock data.
 * 
 * GAP-04: All simulated or mock data must be visibly labeled "SIMULATION".
 * 
 * PRINCIPLE: No indicator may suggest real data if the system is using mock data.
 */

import React from 'react';
import { Tooltip } from '../uxmi';

interface SimulationBadgeProps {
  /** Type of simulation */
  type?: 'data' | 'connection' | 'telemetry';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show inline or as a floating badge */
  floating?: boolean;
}

/**
 * Badge to clearly indicate simulated/mock data.
 * This must be shown on any component displaying non-real data.
 */
export const SimulationBadge: React.FC<SimulationBadgeProps> = ({
  type = 'data',
  size = 'sm',
  floating = false,
}) => {
  const typeDescriptions = {
    data: 'This data is simulated for demonstration purposes. Real data will be available after CIA-SIE-PURE integration.',
    connection: 'The connection status shown is simulated. Real WebSocket connectivity is pending integration.',
    telemetry: 'Telemetry values are mock data for UI demonstration. Real values require backend integration.',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const badge = (
    <Tooltip content={typeDescriptions[type]} position="bottom">
      <span
        className={`
          inline-flex items-center gap-1 font-bold uppercase tracking-wider
          bg-amber-500 text-amber-950 rounded
          ${sizeClasses[size]}
          ${floating ? 'absolute top-2 right-2 z-10 shadow-lg' : ''}
        `}
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        SIMULATION
      </span>
    </Tooltip>
  );

  return badge;
};

/**
 * Wrapper component that adds a simulation badge to its children.
 */
export const SimulationWrapper: React.FC<{
  children: React.ReactNode;
  isSimulated: boolean;
  type?: 'data' | 'connection' | 'telemetry';
}> = ({ children, isSimulated, type = 'data' }) => {
  if (!isSimulated) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <SimulationBadge type={type} floating />
      {children}
    </div>
  );
};

export default SimulationBadge;
