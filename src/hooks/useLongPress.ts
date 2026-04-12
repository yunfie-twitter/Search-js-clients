import { useCallback, useRef } from 'react';
import { triggerHaptic } from '../utils/haptics';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
  shouldTriggerHaptic?: boolean;
}

export const useLongPress = ({
  onLongPress,
  onClick,
  delay = 500,
  shouldTriggerHaptic = true,
}: UseLongPressOptions) => {
  const timerRef = useRef<number | null>(null);
  const isLongPressTriggered = useRef(false);

  const start = useCallback((_e: React.MouseEvent | React.TouchEvent) => {
    isLongPressTriggered.current = false;
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      isLongPressTriggered.current = true;
      if (shouldTriggerHaptic) {
        triggerHaptic();
      }
      onLongPress();
    }, delay);
  }, [onLongPress, delay, shouldTriggerHaptic]);

  const clear = useCallback(
    (_e: React.MouseEvent | React.TouchEvent) => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    },
    []
  );

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    isLongPressTriggered.current = false;
  }, []);

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: clear,
    onMouseLeave: cancel,
    onTouchEnd: clear,
    onTouchCancel: cancel,
    onTouchMove: cancel,
    onClick: (e: React.MouseEvent) => {
      if (isLongPressTriggered.current) {
        e.preventDefault();
        e.stopPropagation();
      } else if (onClick) {
         onClick();
      }
    }
  };
};
