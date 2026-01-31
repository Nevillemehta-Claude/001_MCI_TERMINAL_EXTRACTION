import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: number;
}

/**
 * UXMI Tooltip Component (CR-005)
 * - 300ms appear delay (prevents flicker)
 * - 100ms disappear delay
 * - 280px max width
 * - Position: prefer top, auto-flip if constrained
 * - Escape key dismisses
 * - Must answer: "What happens if I click?"
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  maxWidth = 280,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const APPEAR_DELAY = 300; // CR-005: 300ms appear delay
  const DISAPPEAR_DELAY = 100; // CR-005: 100ms disappear delay

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, APPEAR_DELAY);
  };

  const handleMouseLeave = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, DISAPPEAR_DELAY);
  };

  // Escape key dismisses tooltip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  // Auto-flip position if constrained by viewport
  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      if (position === 'top' && tooltipRect.top < 0) {
        setActualPosition('bottom');
      } else if (position === 'bottom' && tooltipRect.bottom > window.innerHeight) {
        setActualPosition('top');
      } else {
        setActualPosition(position);
      }
    }
  }, [isVisible, position]);

  const getPositionClasses = () => {
    switch (actualPosition) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg
            transition-opacity duration-150 ${getPositionClasses()}`}
          style={{ maxWidth: `${maxWidth}px` }}
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-gray-900 rotate-45
              ${actualPosition === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' : ''}
              ${actualPosition === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' : ''}
              ${actualPosition === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' : ''}
              ${actualPosition === 'right' ? 'right-full top-1/2 -translate-y-1/2 -mr-1' : ''}
            `}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
