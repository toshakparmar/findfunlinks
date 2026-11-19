'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MagnetProps {
  children: React.ReactNode;
  distance?: number;
  className?: string;
}

export function Magnet({ children, distance = 30, className = '' }: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const dist = Math.hypot(clientX - centerX, clientY - centerY);

    if (dist < distance) {
      setPosition({
        x: (clientX - centerX) * 0.25,
        y: (clientY - centerY) * 0.25,
      });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', damping: 15, stiffness: 150, mass: 0.1 }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}

