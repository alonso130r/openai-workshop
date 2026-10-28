/**
 * ManimReact - Rate Functions (Easing Functions)
 * Equivalent to Manim's rate_func module
 */

import type { RateFunction } from './types';

/**
 * Linear rate function - constant speed
 */
export const linear: RateFunction = (t: number): number => t;

/**
 * Smooth rate function - Hermite interpolation (Manim default)
 * Starts and ends with zero velocity
 */
export const smooth: RateFunction = (t: number): number => {
  // 3t² - 2t³
  return 3 * t * t - 2 * t * t * t;
};

/**
 * Smoother rate function - quintic Hermite interpolation
 * Even smoother acceleration/deceleration
 */
export const smoother: RateFunction = (t: number): number => {
  // 6t⁵ - 15t⁴ + 10t³
  return 6 * Math.pow(t, 5) - 15 * Math.pow(t, 4) + 10 * Math.pow(t, 3);
};

/**
 * Rush into - starts slow, ends fast
 */
export const rushInto: RateFunction = (t: number): number => {
  return 2 * smooth(0.5 * t);
};

/**
 * Rush from - starts fast, ends slow
 */
export const rushFrom: RateFunction = (t: number): number => {
  return 2 * smooth(0.5 * (t + 1)) - 1;
};

/**
 * Slow into - decelerates to a stop
 */
export const slowInto: RateFunction = (t: number): number => {
  return Math.sqrt(1 - (1 - t) * (1 - t));
};

/**
 * Double smooth - applies smooth twice
 */
export const doubleSmooth: RateFunction = (t: number): number => {
  if (t < 0.5) {
    return 0.5 * smooth(2 * t);
  }
  return 0.5 * (1 + smooth(2 * t - 1));
};

/**
 * There and back - goes to 1 and back to 0
 */
export const thereAndBack: RateFunction = (t: number): number => {
  const newT = 2 * t - 1;
  return 1 - newT * newT;
};

/**
 * There and back with pause - goes to 1, pauses, then back to 0
 */
export const thereAndBackWithPause = (
  pauseRatio: number = 1 / 3
): RateFunction => {
  return (t: number): number => {
    const a = 1 / pauseRatio;
    if (t < 0.5 - pauseRatio / 2) {
      return smooth(a * t);
    } else if (t < 0.5 + pauseRatio / 2) {
      return 1;
    } else {
      return smooth(a - a * t);
    }
  };
};

/**
 * Running start - overshoots then settles
 */
export const runningStart = (pullFactor: number = -0.5): RateFunction => {
  return (t: number): number => {
    return bezier([0, 0, pullFactor, pullFactor, 1, 1, 1])(t);
  };
};

/**
 * Not quite there - approaches 1 but doesn't reach it
 */
export const notQuiteThere = (
  proportion: number = 0.7,
  smoothness: number = 0
): RateFunction => {
  return (t: number): number => {
    const target = proportion + (1 - proportion) * smooth(t);
    if (smoothness === 0) {
      return target * smooth(t);
    }
    return smooth(t) * target;
  };
};

/**
 * Wiggle - oscillates
 */
export const wiggle: RateFunction = (t: number): number => {
  return thereAndBack(t) * Math.sin(4 * Math.PI * t);
};

/**
 * Squish rate func - applies a rate function over a subset of [0, 1]
 */
export const squishRateFunc = (
  func: RateFunction,
  a: number = 0.4,
  b: number = 0.6
): RateFunction => {
  return (t: number): number => {
    if (t < a) {
      return func(0);
    } else if (t > b) {
      return func(1);
    } else {
      return func((t - a) / (b - a));
    }
  };
};

/**
 * Lingering - starts fast, slows at end
 */
export const lingering: RateFunction = (t: number): number => {
  return squishRateFunc(smooth, 0, 0.8)(t);
};

/**
 * Exponential decay
 */
export const exponentialDecay = (halfLife: number = 0.1): RateFunction => {
  return (t: number): number => {
    return 1 - Math.exp(-t / halfLife);
  };
};

// Standard easing functions

/**
 * Ease in - quadratic
 */
export const easeInQuad: RateFunction = (t: number): number => t * t;

/**
 * Ease out - quadratic
 */
export const easeOutQuad: RateFunction = (t: number): number => 1 - (1 - t) * (1 - t);

/**
 * Ease in out - quadratic
 */
export const easeInOutQuad: RateFunction = (t: number): number => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

/**
 * Ease in - cubic
 */
export const easeInCubic: RateFunction = (t: number): number => t * t * t;

/**
 * Ease out - cubic
 */
export const easeOutCubic: RateFunction = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * Ease in out - cubic
 */
export const easeInOutCubic: RateFunction = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/**
 * Ease in - sine
 */
export const easeInSine: RateFunction = (t: number): number => {
  return 1 - Math.cos((t * Math.PI) / 2);
};

/**
 * Ease out - sine
 */
export const easeOutSine: RateFunction = (t: number): number => {
  return Math.sin((t * Math.PI) / 2);
};

/**
 * Ease in out - sine
 */
export const easeInOutSine: RateFunction = (t: number): number => {
  return -(Math.cos(Math.PI * t) - 1) / 2;
};

/**
 * Ease in - exponential
 */
export const easeInExpo: RateFunction = (t: number): number => {
  return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
};

/**
 * Ease out - exponential
 */
export const easeOutExpo: RateFunction = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

/**
 * Ease in out - exponential
 */
export const easeInOutExpo: RateFunction = (t: number): number => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2;
};

/**
 * Ease in - elastic
 */
export const easeInElastic: RateFunction = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
};

/**
 * Ease out - elastic
 */
export const easeOutElastic: RateFunction = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

/**
 * Ease in - bounce
 */
export const easeInBounce: RateFunction = (t: number): number => {
  return 1 - easeOutBounce(1 - t);
};

/**
 * Ease out - bounce
 */
export const easeOutBounce: RateFunction = (t: number): number => {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
};

/**
 * Ease in out - bounce
 */
export const easeInOutBounce: RateFunction = (t: number): number => {
  return t < 0.5
    ? (1 - easeOutBounce(1 - 2 * t)) / 2
    : (1 + easeOutBounce(2 * t - 1)) / 2;
};

/**
 * Ease in - back (overshoots)
 */
export const easeInBack: RateFunction = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
};

/**
 * Ease out - back (overshoots)
 */
export const easeOutBack: RateFunction = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/**
 * Ease in out - back (overshoots)
 */
export const easeInOutBack: RateFunction = (t: number): number => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
};

/**
 * Bezier rate function
 * Creates a cubic bezier curve from control points
 */
export const bezier = (points: number[]): RateFunction => {
  const n = points.length - 1;
  return (t: number): number => {
    let result = 0;
    for (let i = 0; i <= n; i++) {
      result += binomialCoeff(n, i) * Math.pow(1 - t, n - i) * Math.pow(t, i) * points[i];
    }
    return result;
  };
};

/**
 * Cubic bezier (CSS-style)
 */
export const cubicBezier = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): RateFunction => {
  // Newton-Raphson iteration to find t for given x
  return (x: number): number => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const currentX = calcBezier(t, x1, x2) - x;
      if (Math.abs(currentX) < 0.001) break;
      const derivative = calcBezierDerivative(t, x1, x2);
      if (Math.abs(derivative) < 0.000001) break;
      t -= currentX / derivative;
    }
    return calcBezier(t, y1, y2);
  };
};

// Helper functions

function binomialCoeff(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result *= (n - i) / (i + 1);
  }
  return result;
}

function calcBezier(t: number, a: number, b: number): number {
  return (
    3 * a * t * (1 - t) * (1 - t) +
    3 * b * t * t * (1 - t) +
    t * t * t
  );
}

function calcBezierDerivative(t: number, a: number, b: number): number {
  return (
    3 * a * (1 - t) * (1 - t) -
    6 * a * t * (1 - t) +
    6 * b * t * (1 - t) -
    3 * b * t * t +
    3 * t * t
  );
}

// Export common rate function aliases
export {
  smooth as default_rate_func,
  easeInOutQuad as ease_in_out,
  easeInQuad as ease_in,
  easeOutQuad as ease_out,
};
