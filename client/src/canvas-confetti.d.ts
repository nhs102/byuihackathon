declare module 'canvas-confetti' {
  export type ConfettiOrigin = { x?: number; y?: number };

  export type ConfettiOptions = {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    ticks?: number;
    x?: number;
    y?: number;
    origin?: ConfettiOrigin;
    colors?: string[];
    shapes?: string[];
    scalar?: number;
    disableForReducedMotion?: boolean;
    // allow other props as well
    [key: string]: any;
  };

  /**
   * Default export is a function that fires the confetti animation.
   * It may also expose a `create` factory in JS, but we keep a minimal typing here.
   */
  export default function confetti(opts?: ConfettiOptions): boolean;
}
