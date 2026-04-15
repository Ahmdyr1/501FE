
import React from 'react';

export const CarAnimation: React.FC = () => {
  return (
    <div className="car-animation-container pointer-events-none">
      <style>{`
        .car-animation-container {
          position: absolute;
          bottom: 10%; /* Adjust vertical position */
          left: -300px; /* Start off-screen */
          width: 280px;
          height: 120px;
          z-index: 10; /* Middle Layer (Above background, below Login Card) */
          animation: drive-across 12s linear infinite;
        }

        .car-body {
          fill: #ffffff;
          stroke: #1e293b; /* Slate-800 */
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
          animation: car-bounce 0.15s ease-in-out infinite alternate;
        }

        .wheel {
          transform-origin: center;
          fill: #ffffff;
          stroke: #1e293b;
          stroke-width: 3;
          animation: wheel-spin 0.8s linear infinite, car-bounce 0.15s ease-in-out infinite alternate;
        }

        /* Movement across screen */
        @keyframes drive-across {
          0% { left: -300px; }
          40% { left: 45%; } /* Drive to middle */
          100% { left: 100%; margin-left: 300px; } /* Drive off screen */
        }

        /* Subtle body vibration */
        @keyframes car-bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-2px); }
        }

        /* Wheel rotation */
        @keyframes wheel-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Car Body - Sketched Style */}
        <g className="car-group">
           {/* Main Chassis */}
           <path 
             className="car-body" 
             d="M 50 85 L 50 65 L 80 45 L 180 45 L 220 65 L 260 68 L 260 95 L 230 95 C 230 80 200 80 200 95 L 110 95 C 110 80 80 80 80 95 L 40 95 L 45 85 Z"
           />
           {/* Roof/Window Separator */}
           <path 
             className="car-body" 
             d="M 80 65 L 220 65"
             fill="none"
           />
           {/* Window Divider */}
           <path 
             className="car-body" 
             d="M 150 45 L 150 65"
             fill="none"
           />
        </g>

        {/* Rear Wheel */}
        <g className="wheel" style={{ transformBox: 'fill-box', transformOrigin: '95px 95px' }}>
          <circle cx="95" cy="95" r="18" />
          <line x1="95" y1="77" x2="95" y2="113" />
          <line x1="77" y1="95" x2="113" y2="95" />
        </g>

        {/* Front Wheel */}
        <g className="wheel" style={{ transformBox: 'fill-box', transformOrigin: '215px 95px' }}>
          <circle cx="215" cy="95" r="18" />
          <line x1="215" y1="77" x2="215" y2="113" />
          <line x1="197" y1="95" x2="233" y2="95" />
        </g>
        
        {/* Speed lines (wind) */}
        <path d="M 20 50 L 5 50" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        <path d="M 30 70 L 10 70" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
};
