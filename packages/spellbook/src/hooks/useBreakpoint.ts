import * as React from 'react';

const BREAKPOINT = 1024; // lg breakpoint in Tailwind (1024px)

export function useIsLargeScreen() {
  const [isLarge, setIsLarge] = React.useState(
    () => typeof window !== 'undefined' && window.innerWidth >= BREAKPOINT,
  );

  React.useEffect(() => {
    const onResize = () => setIsLarge(window.innerWidth >= BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isLarge;
}
