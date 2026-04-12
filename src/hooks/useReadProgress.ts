import { useEffect, useState } from 'react';

export const useReadProgress = () => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const root = document.getElementById('root');
      if (root) {
        const val = (root.scrollTop / (root.scrollHeight - root.clientHeight)) * 100;
        setPct(Math.min(100, Math.max(0, isNaN(val) ? 0 : val)));
      } else {
        const el = document.documentElement;
        const val = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
        setPct(Math.min(100, Math.max(0, isNaN(val) ? 0 : val)));
      }
    };
    const scrollTarget = document.getElementById('root') || window;
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollTarget.removeEventListener('scroll', onScroll);
  }, []);
  return pct;
};
