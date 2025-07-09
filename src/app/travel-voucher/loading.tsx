'use client';

import { useState, useEffect } from 'react';
import { AnimatedPlane } from '@/components/animated-plane';

const loadingTexts = [
  'Charting the course...',
  'Checking travel itineraries...',
  'Stamping the passports...',
  'Processing expense claims...',
  'Preparing for takeoff...',
];

export default function TravelVoucherLoading() {
  const [text, setText] = useState(loadingTexts[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setText(prevText => {
        const currentIndex = loadingTexts.indexOf(prevText);
        const nextIndex = (currentIndex + 1) % loadingTexts.length;
        return loadingTexts[nextIndex];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background subtle-dot-pattern">
      <div className="flex flex-col items-center gap-4 text-primary mb-4">
        <AnimatedPlane />
        <h1 className="text-2xl font-bold tracking-tight mt-4">
          Loading Travel Vouchers...
        </h1>
      </div>
      <p className="text-lg text-muted-foreground">{text}</p>
    </div>
  );
}
