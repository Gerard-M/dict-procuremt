'use client';

import { Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const loadingTexts = [
  'Brewing coffee for the accountants...',
  'Organizing financial records...',
  'Polishing the paperwork...',
  'Untangling the red tape...',
  'Counting the beans...',
  'Aligning the pixels...',
  'Fetching the latest updates...',
  'Securing the data fortress...',
  'Waking up the servers...',
];

export function LoadingScreen() {
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
      <div className="flex items-center gap-4 text-primary mb-4">
        <Building2 className="h-12 w-12 animate-pulse" />
        <h1 className="text-4xl font-bold tracking-tight">
          ILCDB Management System
        </h1>
      </div>
      <p className="text-lg text-muted-foreground">{text}</p>
    </div>
  );
}
