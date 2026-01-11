'use client';

import { motion, useSpring, useTransform } from 'motion/react';
import * as React from 'react';

interface AnimatedNumberProps {
  value: number;
  format?: Intl.NumberFormatOptions;
  className?: string;
}

export function AnimatedNumber({ value, format, className }: AnimatedNumberProps) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });

  const display = useTransform(spring, (current) =>
    current.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...format,
    })
  );

  React.useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className}>{display}</motion.span>;
}
