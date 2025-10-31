'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5 sm:mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5 sm:mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5 sm:mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5 sm:ml-2',
  };

  // Cleanup bei Unmount
  useEffect(() => {
    return () => {
      if (pressTimer.current) clearTimeout(pressTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  // Touch-Handler für mobile Geräte - zeigt Tooltip kurz bei langem Drücken
  const handleLongPress = () => {
    setShowTooltip(true);
    // Tooltip nach 2.5 Sekunden automatisch ausblenden
    hideTimer.current = setTimeout(() => setShowTooltip(false), 2500);
  };

  const handleTouchStart = () => {
    pressTimer.current = setTimeout(handleLongPress, 500); // 500ms langes Drücken
  };

  const handleTouchEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  return (
    <div className="relative group flex items-center">
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="contents"
      >
        {children}
      </div>
      
      {/* Tooltip - versteckt auf Smartphones, sichtbar ab sm (Tablet) mit Hover */}
      <div
        className={`absolute ${positionClasses[position]} w-max max-w-[200px] sm:max-w-xs px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs sm:text-sm text-white bg-gray-900 bg-opacity-95 backdrop-blur-sm rounded-md sm:rounded-lg shadow-lg
                   hidden sm:block
                   ${showTooltip ? 'opacity-100' : 'opacity-0'} 
                   sm:group-hover:opacity-100 
                   transition-opacity duration-200 pointer-events-none z-50`}
      >
        <span className="block leading-tight">{text}</span>
        {/* Pfeil für bessere Optik */}
        <div className={`absolute w-2 h-2 bg-gray-900 bg-opacity-95 transform rotate-45 
          ${position === 'top' ? 'bottom-[-3px] left-1/2 -translate-x-1/2' : ''}
          ${position === 'bottom' ? 'top-[-3px] left-1/2 -translate-x-1/2' : ''}
          ${position === 'left' ? 'right-[-3px] top-1/2 -translate-y-1/2' : ''}
          ${position === 'right' ? 'left-[-3px] top-1/2 -translate-y-1/2' : ''}
        `}></div>
      </div>
    </div>
  );
};

export default Tooltip;
