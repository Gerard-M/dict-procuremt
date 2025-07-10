'use client';

import { Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Progress } from './ui/progress';

export function LoadingScreen() {
  const [progress, setProgress] = useState(13);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(80), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background subtle-dot-pattern">
      <div className="flex flex-col items-center gap-4 text-primary mb-4 w-full">
        <div className="flex items-center gap-4">
            <Building2 className="h-12 w-12 animate-pulse" />
            <h1 className="text-4xl font-bold tracking-tight">
            ILCDB Management System
            </h1>
        </div>
        <Progress value={progress} className="w-1/3 mt-4" />
      </div>
    </div>
  );
}
