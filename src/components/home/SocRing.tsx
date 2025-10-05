import React from 'react';
import { TOKENS, formatPercent } from './tokens';

interface SocRingProps {
  value: number;
  reserve?: number;
  size?: number;
  stroke?: number;
}

export function SocRing({ 
  value, 
  reserve, 
  size = 64, 
  stroke = 4 
}: SocRingProps) {
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // SOC ring
  const socDasharray = circumference;
  const socDashoffset = circumference - (value / 100) * circumference;
  
  // Color based on SOC thresholds
  const getSocColor = (soc: number) => {
    if (soc < 20) return TOKENS.red;
    if (soc < 60) return TOKENS.amber;
    return TOKENS.green;
  };
  
  const socColor = getSocColor(value);
  
  // Reserve ring (inner)
  const reserveRadius = radius - stroke - 2;
  const reserveCircumference = 2 * Math.PI * reserveRadius;
  const reserveDasharray = reserveCircumference;
  const reserveDashoffset = reserveCircumference - ((reserve || 0) / 100) * reserveCircumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        role="img"
        aria-label={`Battery state of charge: ${formatPercent(value)}%`}
      >
        <defs>
          {/* Gradient for SOC ring */}
          <linearGradient id="socGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={socColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={socColor} stopOpacity="1" />
          </linearGradient>
          
          {/* Gradient for reserve ring */}
          <linearGradient id="reserveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={TOKENS.amber} stopOpacity="0.6" />
            <stop offset="100%" stopColor={TOKENS.amber} stopOpacity="0.9" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={TOKENS.border}
          strokeWidth={stroke}
          fill="none"
          opacity="0.3"
        />
        
        {/* Reserve ring (inner, optional) */}
        {reserve && reserve > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={reserveRadius}
            stroke="url(#reserveGradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray={reserveDasharray}
            strokeDashoffset={reserveDashoffset}
            strokeLinecap="round"
            className="transition-all duration-400 ease-out"
          />
        )}
        
        {/* SOC progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#socGradient)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={socDasharray}
          strokeDashoffset={socDashoffset}
          strokeLinecap="round"
          className="transition-all duration-400 ease-out"
        />
      </svg>
      
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span 
            className="text-sm font-bold font-mono" 
            style={{ color: socColor }}
          >
            {formatPercent(value)}%
          </span>
          {reserve && reserve > 0 && (
            <div 
              className="text-xs opacity-70" 
              style={{ color: TOKENS.amber }}
            >
              RES
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
