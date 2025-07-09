'use client';

export function AnimatedPlane() {
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
      className="text-primary overflow-visible"
    >
      <style>{`
        .plane-body {
          animation: fly-in 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .plane-trail {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: draw-trail 1s ease-out 0.5s forwards;
        }
        @keyframes fly-in {
          from {
            transform: translateX(-100px) translateY(40px) rotate(-15deg);
            opacity: 0;
          }
          to {
            transform: translateX(0) translateY(0) rotate(0);
            opacity: 1;
          }
        }
        @keyframes draw-trail {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
      <g className="plane-body">
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-1-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
      </g>
      <path d="M9 12H2" className="plane-trail" />
    </svg>
  );
}
