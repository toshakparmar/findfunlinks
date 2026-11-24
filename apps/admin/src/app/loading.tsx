import React from 'react';
import { CircularLoader } from '@finallinks/ui';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-[#16181B]/60 backdrop-blur-[2px]">
      <CircularLoader size="xl" label="Loading" color="#0B9DF7" />
    </div>
  );
}
