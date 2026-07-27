// useIsLargeScreen.ts (T-002)
// Breakpoint hook (README §9): desktop ≥1024, tablet 768–1023, mobile <768.

import { useEffect, useState } from 'react';

export interface Breakpoints {
  isDesktop: boolean; // >= 1024
  isTablet: boolean; // 768–1023
  isMobile: boolean; // < 768
}

function read(): Breakpoints {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return { isDesktop: true, isTablet: false, isMobile: false };
  }
  const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
  const isTablet = window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches;
  return { isDesktop, isTablet, isMobile: !isDesktop && !isTablet };
}

export function useIsLargeScreen(): Breakpoints {
  const [bp, setBp] = useState<Breakpoints>(read);

  useEffect(() => {
    const mqls = [
      window.matchMedia('(min-width: 1024px)'),
      window.matchMedia('(min-width: 768px) and (max-width: 1023px)'),
    ];
    const onChange = () => setBp(read());
    mqls.forEach((m) => m.addEventListener('change', onChange));
    onChange();
    return () => mqls.forEach((m) => m.removeEventListener('change', onChange));
  }, []);

  return bp;
}
