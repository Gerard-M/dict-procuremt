'use client';

import { useState, useEffect } from 'react';
import { AnimatedBriefcase } from '@/components/animated-briefcase';
import { Progress } from '@/components/ui/progress';

export default function ProcurementLoading() {
  const [progress, setProgress] = useState(13);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(80), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background subtle-dot-pattern">
      <div className="flex flex-col items-center gap-4 text-primary mb-4 w-full">
        <AnimatedBriefcase />
        <h1 className="text-2xl font-bold tracking-tight mt-4">
          Loading Procurement...
        </h1>
        <Progress value={progress} className="w-1/3 mt-4" />
      </div>
    </div>
  );
}
