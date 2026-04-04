'use client';

import { motion } from 'framer-motion';

export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export const viewportConfig = {
  once: true,
  margin: '-80px' as const,
};

export const smoothTransition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1] as const,
};

export { motion };
