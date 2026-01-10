'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Utensils } from 'lucide-react';

interface RestaurantBadgeProps {
  /** Restaurant name */
  name: string;
  /** Logo URL (optional) */
  logoUrl?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const SIZE_MAP = {
  sm: {
    container: 'size-10',
    icon: 'size-5',
    text: 'text-base',
  },
  md: {
    container: 'size-14',
    icon: 'size-7',
    text: 'text-xl',
  },
  lg: {
    container: 'size-20',
    icon: 'size-10',
    text: 'text-2xl',
  },
};

/**
 * RestaurantBadge - Displays restaurant logo or branded placeholder
 *
 * Shows the restaurant logo if available, otherwise displays an icon
 * with the restaurant's theme color.
 */
export function RestaurantBadge({ name, logoUrl, size = 'md', className }: RestaurantBadgeProps) {
  const sizes = SIZE_MAP[size];
  const [imageError, setImageError] = React.useState(false);

  const showImage = logoUrl && !imageError;

  return (
    <motion.div
      className={cn(
        'bg-primary/10 relative flex items-center justify-center overflow-hidden rounded-2xl',
        sizes.container,
        className
      )}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {showImage ? (
        <Image
          src={logoUrl}
          alt={`Logo de ${name}`}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <Utensils className={cn('text-primary', sizes.icon)} />
      )}
    </motion.div>
  );
}
