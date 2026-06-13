import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [hasMounted, setHasMounted] = useState(false);
  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 15,
  });

  const display = useTransform(springValue, (current) => {
    return `${prefix}${Math.round(current).toLocaleString('en-IN')}${suffix}`;
  });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      springValue.set(value);
    }
  }, [value, hasMounted, springValue]);

  if (!hasMounted) return <span>{prefix}{value.toLocaleString('en-IN')}{suffix}</span>;

  return <motion.span>{display}</motion.span>;
}
