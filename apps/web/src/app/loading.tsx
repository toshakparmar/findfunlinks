import React from 'react';
import { CircularLoader } from '../components/ui/CircularLoader';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-white/70 dark:bg-[#050A18]/70 backdrop-blur-[2px]">
      <CircularLoader size="xl" label="Loading" />
    </div>
  );
}
