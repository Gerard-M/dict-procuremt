'use client';

export function AnimatedBriefcase() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="80"
      height="80"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <style>{`
        .briefcase-rect {
          stroke-dasharray: 70;
          stroke-dashoffset: 70;
          animation: draw-line 1s ease-out forwards;
        }
        .briefcase-handle {
          stroke-dasharray: 30;
          stroke-dashoffset: 30;
          animation: draw-line 1s ease-out 0.3s forwards;
        }
        .briefcase-latch {
          stroke-dasharray: 30;
          stroke-dashoffset: 30;
          animation: draw-line 1s ease-out 0.6s forwards;
        }
        @keyframes draw-line {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
      <rect width="20" height="14" x="2" y="6" rx="2" className="briefcase-rect" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" className="briefcase-handle" />
      <path d="M16 14h-2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2Z" className="briefcase-latch"/>
    </svg>
  );
}
