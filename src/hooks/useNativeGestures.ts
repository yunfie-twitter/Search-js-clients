import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearchStore } from '../store/useSearchStore';
import { triggerHaptic } from '../utils/haptics';

export function useNativeGestures() {
  const navigate = useNavigate();
  const location = useLocation();
  const expSwipeBack = useSearchStore(s => s.expSwipeBack);
  
  const startX = useRef(0);
  const startY = useRef(0);
  const isEdge = useRef(false);

  useEffect(() => {
    if (!expSwipeBack) return;

    const onTouchStart = (e: TouchEvent) => {
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      // 画面左端 30px 以内からの開始を「エッジスワイプ」とみなす
      if (x < 30) {
        startX.current = x;
        startY.current = y;
        isEdge.current = true;
      } else {
        isEdge.current = false;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isEdge.current) return;
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = e.changedTouches[0].clientY - startY.current;

      // 横方向に 80px 以上、かつ縦方向の動きが少ない場合に「戻る」を実行
      if (dx > 80 && Math.abs(dy) < Math.abs(dx) * 0.5) {
        if (location.pathname !== '/') {
          triggerHaptic(15);
          navigate(-1);
        }
      }
      isEdge.current = false;
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [expSwipeBack, navigate, location.pathname]);
}
