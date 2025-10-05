import React, { useState } from 'react';
import { FlowPathData, generateCurvePath, getFlowColor, widthForKw, opacityForKw } from './flowHelpers';
import { TOKENS } from './tokens';

interface FlowPathProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  kw: number;
  mode: "pv" | "battery" | "export" | "import";
  dashed?: boolean;
  arrow?: boolean;
  title?: string;
}

export function FlowPath({
  from,
  to,
  kw,
  mode,
  dashed = false,
  arrow = false,
  title
}: FlowPathProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const pathId = `flow-${mode}-${from.x}-${from.y}-${to.x}-${to.y}`;
  const gradientId = `gradient-${pathId}`;
  const markerId = `arrow-${pathId}`;
  
  const color = getFlowColor(mode);
  const pathData = generateCurvePath(from, to);
  const strokeWidth = widthForKw(kw);
  const opacity = opacityForKw(kw);
  
  // Enhanced opacity on hover
  const currentOpacity = isHovered ? Math.min(opacity * 1.5, 1) : opacity;
  const currentStrokeWidth = isHovered ? strokeWidth + 0.5 : strokeWidth;
  
  return (
    <g>
      <defs>
        {/* Gradient for the flow line */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </linearGradient>
        
        {/* Arrow marker */}
        {arrow && (
          <marker
            id={markerId}
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L0,6 L8,3 z"
              fill={color}
              opacity={currentOpacity}
            />
          </marker>
        )}
      </defs>
      
      {/* Main flow path */}
      <path
        d={pathData}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={currentStrokeWidth}
        strokeDasharray={dashed ? "6 6" : "none"}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={currentOpacity}
        markerEnd={arrow ? `url(#${markerId})` : undefined}
        className="transition-all duration-300 ease-out"
        style={{
          filter: isHovered ? 'drop-shadow(0 0 8px rgba(0,0,0,0.2))' : 'none',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Dash animation for active flows */}
        {kw > 0 && (
          <animate
            attributeName="stroke-dashoffset"
            values="0;12;0"
            dur="2s"
            repeatCount="indefinite"
            begin="0s"
          />
        )}
      </path>
      
      {/* Tooltip on hover */}
      {isHovered && title && (
        <foreignObject
          x={(from.x + to.x) / 2 - 30}
          y={(from.y + to.y) / 2 - 20}
          width="60"
          height="40"
        >
          <div className="bg-black/80 text-white text-xs rounded-lg px-2 py-1 text-center font-mono">
            <div className="font-semibold">{title}</div>
            <div>{kw.toFixed(1)} kW</div>
          </div>
        </foreignObject>
      )}
    </g>
  );
}

// Convenience component for rendering multiple flows
interface FlowPathsProps {
  flows: FlowPathData[];
}

export function FlowPaths({ flows }: FlowPathsProps) {
  return (
    <g>
      {flows.map((flow, index) => (
        <FlowPath
          key={`${flow.mode}-${index}`}
          from={flow.from}
          to={flow.to}
          kw={flow.kw}
          mode={flow.mode}
          dashed={flow.dashed}
          arrow={flow.arrow}
          title={flow.title}
        />
      ))}
    </g>
  );
}
