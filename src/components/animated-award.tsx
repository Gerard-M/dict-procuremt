'use client';

export function AnimatedAward() {
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
        .award-circle {
          stroke-dasharray: 45;
          stroke-dashoffset: 45;
          animation: draw-line 1s ease-out forwards;
        }
        .award-ribbon {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: draw-line 1s ease-out 0.5s forwards;
        }
        @keyframes draw-line {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
      <circle cx="12" cy="8" r="7" className="award-circle" />
      <polyline points="8.21 13.89 7 22 12 17 17 22 15.79 13.88" className="award-ribbon" />
    </svg>
  );
}
