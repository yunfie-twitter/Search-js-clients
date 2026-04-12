/**
 * motion.ts — Premium Apple-inspired animation constants
 * Single source of truth for all timing, easing, and spring values.
 */

// ── Easing curves ──
export const EASE_SPRING   = 'cubic-bezier(0.22, 1, 0.36, 1)';  // iOS spring
export const EASE_OUT      = 'cubic-bezier(0.16, 1, 0.3, 1)';   // Expo out
export const EASE_IN       = 'cubic-bezier(0.4, 0, 1, 1)';      // Expo in
export const EASE_IN_OUT   = 'cubic-bezier(0.45, 0, 0.55, 1)';  // Symmetric
export const EASE_BOUNCE   = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
export const EASE_DECEL    = 'cubic-bezier(0.05, 0.7, 0.1, 1.0)';
export const EASE_OVERSHOOT= 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';

// ── Durations (ms) ──
export const DUR_FAST      = 120;   // button press, icon swap
export const DUR_NORMAL    = 240;   // list items, tabs, small transitions
export const DUR_PAGE      = 320;   // page-level transitions
export const DUR_MODAL     = 360;   // modal / sheet presentation
export const DUR_MICRO     = 80;
export const DUR_SPRING    = 420;
export const DUR_MORPH     = 500;

// ── CSS shorthand helpers ──
export const transition = {
  fast:   `all ${DUR_FAST}ms ${EASE_SPRING}`,
  normal: `all ${DUR_NORMAL}ms ${EASE_SPRING}`,
  page:   `all ${DUR_PAGE}ms ${EASE_SPRING}`,
  modal:  `all ${DUR_MODAL}ms ${EASE_SPRING}`,
  opacity:  (ms = DUR_NORMAL) => `opacity ${ms}ms ${EASE_OUT}`,
  transform:(ms = DUR_NORMAL) => `transform ${ms}ms ${EASE_SPRING}`,
  color:    (ms = DUR_FAST)   => `color ${ms}ms ${EASE_IN_OUT}, background-color ${ms}ms ${EASE_IN_OUT}`,
};

// ── Button press scale ──
export const PRESS_SCALE   = 'scale(0.95)';
export const HOVER_SCALE   = 'scale(1.02)';

// ── Stagger helper (for list items) ──
export const staggerDelay = (index: number, base = 30) => `${index * base}ms`;
