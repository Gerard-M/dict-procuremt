'use client';

import { useState, useEffect } from 'react';
import { AnimatedBriefcase } from '@/components/animated-briefcase';

const loadingTexts = [
  'Processing purchase requests...',
  'Gathering quotations...',
  'Preparing official documents...',
  'Auditing paperwork trail...',
  'Finalizing procurement phase...',
];

export default function ProcurementLoading() {
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
        <AnimatedBriefcase />
        <h1 className="text-2xl font-bold tracking-tight mt-4">
          Loading Procurement...
        </h1>
      </div>
      <p className="text-lg text-muted-foreground">{text}</p>
    </div>
  );
}
