import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center text-[#F1F5F9]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" />
        <p className="text-xs text-[#A8B3C7]">Loading...</p>
      </div>
    </div>
  );
}
