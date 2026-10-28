/**
 * ManimReact - Animation Factories
 * Functions to create common animation types
 */

import type {
  MobjectState,
  Point3D,
  Color,
} from '../core/types';
import { smooth, linear, thereAndBack } from '../core/rateFunctions';
import { DEFAULT_ANIMATION_RUN_TIME, COLORS } from '../core/constants';
import { AnimationEngine, AnimationOptions } from './engine';

/**
 * Base animation creator
 */
export interface AnimationCreator {
  (
    engine: AnimationEngine,
    targetId: string,
    options?: AnimationOptions
  ): string;
}

// ============================================
// CREATION ANIMATIONS
// ============================================

/**
 * Create animation - draws the mobject from nothing
 * Animates opacity and optionally stroke drawing
 * Sets initial state to invisible before animating to visible
 */
export function create(
  engine: AnimationEngine,
  targetId: string,
  options: AnimationOptions = {}
): string {
  // Set initial state: invisible with zero opacity
  engine.setInitialState(targetId, {
    opacity: 0,
    visible: true,
    style: {
      strokeOpacity: 0,
      fillOpacity: 0,
    },
  });

  return engine.createAnimation(
    'Create',
    targetId,
    {
      opacity: 1,
      visible: true,
      style: {
        strokeOpacity: 1,
        fillOpacity: 1,
      },
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME,
      rateFunc: smooth,
      ...options,
    }
  );
}

/**
 * Uncreate animation - reverse of Create
 */
export function uncreate(
  engine: AnimationEngine,
  targetId: string,
  options: AnimationOptions = {}
): string {
  // Capture initial state (should be visible)
  engine.captureInitialState(targetId);

  return engine.createAnimation(
    'Uncreate',
    targetId,
    {
      opacity: 0,
      style: {
        strokeOpacity: 0,
        fillOpacity: 0,
      },
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME,
      rateFunc: smooth,
      ...options,
    }
  );
}

/**
 * Write animation - for text, draws characters one by one
 * Sets initial state to invisible before animating to visible
 */
export function write(
  engine: AnimationEngine,
  targetId: string,
  options: AnimationOptions = {}
): string {
  // Set initial state: invisible
  engine.setInitialState(targetId, {
    opacity: 0,
    visible: true,
  });

  return engine.createAnimation(
    'Write',
    targetId,
    {
      opacity: 1,
      visible: true,
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME * 1.5,
      rateFunc: linear,
      ...options,
    }
  );
}

/**
 * Unwrite animation - reverse of Write
 */
export function unwrite(
  engine: AnimationEngine,
  targetId: string,
  options: AnimationOptions = {}
): string {
  engine.captureInitialState(targetId);

  return engine.createAnimation(
    'Unwrite',
    targetId,
    {
      opacity: 0,
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME,
      rateFunc: linear,
      ...options,
    }
  );
}

/**
 * DrawBorderThenFill animation
 * Draws the border first, then fills
 * Sets initial state to invisible
 */
export function drawBorderThenFill(
  engine: AnimationEngine,
  targetId: string,
  options: AnimationOptions & { strokeColor?: Color; fillColor?: Color } = {}
): string {
  const { strokeColor = COLORS.WHITE, fillColor = COLORS.BLUE, ...animOptions } = options;

  // Set initial state: invisible
  engine.setInitialState(targetId, {
    opacity: 0,
    visible: true,
    style: {
      strokeOpacity: 0,
      fillOpacity: 0,
    },
  });

  return engine.createAnimation(
    'DrawBorderThenFill',
    targetId,
    {
      opacity: 1,
      visible: true,
      style: {
        strokeOpacity: 1,
        fillOpacity: 1,
        strokeColor,
        fillColor,
      },
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME * 2,
      rateFunc: smooth,
      ...animOptions,
    }
  );
}

// ============================================
// FADE ANIMATIONS
// ============================================

/**
 * FadeIn animation
 * Sets initial state to opacity 0 before fading in
 */
export function fadeIn(
  engine: AnimationEngine,
  targetId: string,
  options: AnimationOptions & { direction?: Point3D; shift?: number } = {}
): string {
  const { direction, shift = 0.5, ...animOptions } = options;

  // Set initial state: invisible
  engine.setInitialState(targetId, {
    opacity: 0,
    visible: true,
  });

  const endState: Partial<MobjectState> = {
    opacity: 1,
    visible: true,
  };

  // If direction specified, also animate position
  if (direction) {
    // Start position will be offset in the opposite direction
    // End position is the current position (handled by engine)
  }

  return engine.createAnimation('FadeIn', targetId, endState, {
    duration: DEFAULT_ANIMATION_RUN_TIME,
    rateFunc: smooth,
    ...animOptions,
  });
}

/**
 * FadeOut animation
 * Captures current state before fading out
 */
export function fadeOut(
  engine: AnimationEngine,
  targetId: string,
  options: AnimationOptions & { direction?: Point3D; shift?: number } = {}
): string {
  const { direction, shift = 0.5, ...animOptions } = options;

  // Capture initial state (should be visible)
  engine.captureInitialState(targetId);

  return engine.createAnimation(
    'FadeOut',
    targetId,
    {
      opacity: 0,
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME,
      rateFunc: smooth,
      ...animOptions,
    }
  );
}

/**
 * FadeToColor animation
 */
export function fadeToColor(
  engine: AnimationEngine,
  targetId: string,
  color: Color,
  options: AnimationOptions = {}
): string {
  engine.captureInitialState(targetId);

  return engine.createAnimation(
    'FadeToColor',
    targetId,
    {
      style: {
        fillColor: color,
        strokeColor: color,
      },
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME,
      rateFunc: smooth,
      ...options,
    }
  );
}

// ============================================
// GROW/SHRINK ANIMATIONS
// ============================================

/**
 * GrowFromCenter animation
 * Sets initial state to scale 0 before growing
 */
export function growFromCenter(
  engine: AnimationEngine,
  targetId: string,
  options: AnimationOptions = {}
): string {
  // Set initial state: zero scale
  engine.setInitialState(targetId, {
    scale: [0, 0, 0],
    opacity: 0,
    visible: true,
  });

  return engine.createAnimation(
    'GrowFromCenter',
    targetId,
    {
      scale: [1, 1, 1],
      opacity: 1,
      visible: true,
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME,
      rateFunc: smooth,
      ...options,
    }
  );
}

/**
 * ShrinkToCenter animation
 * Captures current state before shrinking
 */
export function shrinkToCenter(
  engine: AnimationEngine,
  targetId: string,
  options: AnimationOptions = {}
): string {
  // Capture initial state (should have scale)
  engine.captureInitialState(targetId);

  return engine.createAnimation(
    'ShrinkToCenter',
    targetId,
    {
      scale: [0, 0, 0],
      opacity: 0,
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME,
      rateFunc: smooth,
      ...options,
    }
  );
}

/**
 * GrowFromEdge animation
 * Sets initial state to scale 0 before growing
 */
export function growFromEdge(
  engine: AnimationEngine,
  targetId: string,
  _edge: Point3D,
  options: AnimationOptions = {}
): string {
  // Set initial state: zero scale
  engine.setInitialState(targetId, {
    scale: [0, 0, 0],
    opacity: 0,
    visible: true,
  });

  return engine.createAnimation(
    'GrowFromEdge',
    targetId,
    {
      scale: [1, 1, 1],
      opacity: 1,
      visible: true,
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME,
      rateFunc: smooth,
      ...options,
    }
  );
}

/**
 * GrowArrow animation - specifically for Arrow mobjects
 * Sets initial state to scale 0 before growing
 */
export function growArrow(
  engine: AnimationEngine,
  targetId: string,
  options: AnimationOptions = {}
): string {
  // Set initial state: zero scale
  engine.setInitialState(targetId, {
    scale: [0, 0, 0],
    opacity: 0,
    visible: true,
  });

  return engine.createAnimation(
    'GrowArrow',
    targetId,
    {
      scale: [1, 1, 1],
      opacity: 1,
      visible: true,
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME,
      rateFunc: smooth,
      ...options,
    }
  );
}

/**
 * SpinInFromNothing animation
 * Sets initial state to zero scale and rotated
 */
export function spinInFromNothing(
  engine: AnimationEngine,
  targetId: string,
  options: AnimationOptions & { angle?: number } = {}
): string {
  const { angle = Math.PI * 2, ...animOptions } = options;

  // Set initial state: zero scale and rotated
  engine.setInitialState(targetId, {
    scale: [0, 0, 0],
    rotation: [0, 0, angle],
    opacity: 0,
    visible: true,
  });

  return engine.createAnimation(
    'SpinInFromNothing',
    targetId,
    {
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
      opacity: 1,
      visible: true,
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME,
      rateFunc: smooth,
      ...animOptions,
    }
  );
}

// ============================================
// MOVEMENT ANIMATIONS
// ============================================

/**
 * MoveTo animation - move to absolute position
 * Captures initial position before moving
 */
export function moveTo(
  engine: AnimationEngine,
  targetId: string,
  position: Point3D,
  options: AnimationOptions = {}
): string {
  // Capture initial state (current position)
  engine.captureInitialState(targetId);

  return engine.createAnimation(
    'MoveTo',
    targetId,
    {
      position,
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME,
      rateFunc: smooth,
      ...options,
    }
  );
}

/**
 * Shift animation - move by relative amount
 */
export function shift(
  engine: AnimationEngine,
  targetId: string,
  _direction: Point3D,
  options: AnimationOptions = {}
): string {
  // This needs the current position to calculate end position
  // For now, we pass the direction and let engine handle it
  return engine.createAnimation(
    'Shift',
    targetId,
    {
      // Position will be calculated by engine based on current + direction
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME,
      rateFunc: smooth,
      ...options,
    }
  );
}

/**
 * MoveAlongPath animation
 */
export function moveAlongPath(
  engine: AnimationEngine,
  targetId: string,
  path: Point3D[],
  options: AnimationOptions = {}
): string {
  // For path animation, we need special handling
  return engine.createAnimation(
    'MoveAlongPath',
    targetId,
    {
      position: path[path.length - 1],
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME * 2,
      rateFunc: linear,
      ...options,
    }
  );
}

// ============================================
// ROTATION ANIMATIONS
// ============================================

/**
 * Rotate animation
 */
export function rotate(
  engine: AnimationEngine,
  targetId: string,
  angle: number,
  options: AnimationOptions & { axis?: Point3D; aboutPoint?: Point3D } = {}
): string {
  const { axis = [0, 0, 1], aboutPoint, ...animOptions } = options;

  return engine.createAnimation(
    'Rotate',
    targetId,
    {
      rotation: [0, 0, angle], // Simplified - just Z rotation
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME,
      rateFunc: smooth,
      ...animOptions,
    }
  );
}

/**
 * Rotating animation - continuous rotation
 */
export function rotating(
  engine: AnimationEngine,
  targetId: string,
  options: AnimationOptions & { radians?: number; axis?: Point3D } = {}
): string {
  const { radians = Math.PI * 2, axis = [0, 0, 1], ...animOptions } = options;

  return engine.createAnimation(
    'Rotating',
    targetId,
    {
      rotation: [0, 0, radians],
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME * 2,
      rateFunc: linear,
      ...animOptions,
    }
  );
}

// ============================================
// SCALE ANIMATIONS
// ============================================

/**
 * ScaleInPlace animation
 */
export function scaleInPlace(
  engine: AnimationEngine,
  targetId: string,
  factor: number,
  options: AnimationOptions = {}
): string {
  return engine.createAnimation(
    'ScaleInPlace',
    targetId,
    {
      scale: [factor, factor, factor],
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME,
      rateFunc: smooth,
      ...options,
    }
  );
}

// ============================================
// INDICATION ANIMATIONS
// ============================================

/**
 * Indicate animation - highlights a mobject
 */
export function indicate(
  engine: AnimationEngine,
  targetId: string,
  options: AnimationOptions & { color?: Color; scaleFactor?: number } = {}
): string {
  const { color = COLORS.YELLOW, scaleFactor = 1.2, ...animOptions } = options;

  return engine.createAnimation(
    'Indicate',
    targetId,
    {
      scale: [scaleFactor, scaleFactor, scaleFactor],
      style: {
        strokeColor: color,
      },
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME,
      rateFunc: thereAndBack,
      ...animOptions,
    }
  );
}

/**
 * Flash animation
 */
export function flash(
  engine: AnimationEngine,
  targetId: string,
  options: AnimationOptions & { color?: Color; lineLength?: number } = {}
): string {
  const { color = COLORS.YELLOW, ...animOptions } = options;

  return engine.createAnimation(
    'Flash',
    targetId,
    {
      style: {
        strokeColor: color,
        fillColor: color,
      },
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME * 0.5,
      rateFunc: thereAndBack,
      ...animOptions,
    }
  );
}

/**
 * Circumscribe animation - draws a shape around the mobject
 */
export function circumscribe(
  engine: AnimationEngine,
  targetId: string,
  options: AnimationOptions & { shape?: 'circle' | 'rectangle'; color?: Color } = {}
): string {
  const { shape = 'rectangle', color = COLORS.YELLOW, ...animOptions } = options;

  return engine.createAnimation(
    'Circumscribe',
    targetId,
    {},
    {
      duration: DEFAULT_ANIMATION_RUN_TIME,
      rateFunc: smooth,
      ...animOptions,
    }
  );
}

/**
 * Wiggle animation
 */
export function wiggle(
  engine: AnimationEngine,
  targetId: string,
  options: AnimationOptions & { scaleFactor?: number; rotationAngle?: number } = {}
): string {
  const {
    scaleFactor = 1.1,
    rotationAngle = 0.05,
    ...animOptions
  } = options;

  return engine.createAnimation(
    'Wiggle',
    targetId,
    {
      scale: [scaleFactor, scaleFactor, scaleFactor],
      rotation: [0, 0, rotationAngle],
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME,
      rateFunc: thereAndBack,
      ...animOptions,
    }
  );
}

/**
 * ApplyWave animation
 */
export function applyWave(
  engine: AnimationEngine,
  targetId: string,
  options: AnimationOptions & { direction?: Point3D; amplitude?: number } = {}
): string {
  const { direction = [0, 1, 0], amplitude = 0.2, ...animOptions } = options;

  return engine.createAnimation(
    'ApplyWave',
    targetId,
    {},
    {
      duration: DEFAULT_ANIMATION_RUN_TIME,
      rateFunc: smooth,
      ...animOptions,
    }
  );
}

/**
 * ShowPassingFlash animation
 */
export function showPassingFlash(
  engine: AnimationEngine,
  targetId: string,
  options: AnimationOptions & { timeWidth?: number } = {}
): string {
  const { timeWidth = 0.3, ...animOptions } = options;

  return engine.createAnimation(
    'ShowPassingFlash',
    targetId,
    {
      style: {
        strokeOpacity: 1,
      },
    },
    {
      duration: DEFAULT_ANIMATION_RUN_TIME,
      rateFunc: linear,
      ...animOptions,
    }
  );
}

// ============================================
// TRANSFORM ANIMATIONS
// ============================================

/**
 * Transform animation - morph one mobject into another
 * Note: Full implementation requires path morphing
 */
export function transform(
  engine: AnimationEngine,
  sourceId: string,
  targetState: Partial<MobjectState>,
  options: AnimationOptions = {}
): string {
  return engine.createAnimation('Transform', sourceId, targetState, {
    duration: DEFAULT_ANIMATION_RUN_TIME,
    rateFunc: smooth,
    ...options,
  });
}

/**
 * ReplacementTransform animation
 * Like Transform but replaces the mobject
 */
export function replacementTransform(
  engine: AnimationEngine,
  sourceId: string,
  targetState: Partial<MobjectState>,
  options: AnimationOptions = {}
): string {
  return engine.createAnimation('ReplacementTransform', sourceId, targetState, {
    duration: DEFAULT_ANIMATION_RUN_TIME,
    rateFunc: smooth,
    ...options,
  });
}

/**
 * MoveToTarget animation
 * Animates to a pre-set target state
 */
export function moveToTarget(
  engine: AnimationEngine,
  targetId: string,
  targetState: Partial<MobjectState>,
  options: AnimationOptions = {}
): string {
  return engine.createAnimation('MoveToTarget', targetId, targetState, {
    duration: DEFAULT_ANIMATION_RUN_TIME,
    rateFunc: smooth,
    ...options,
  });
}

/**
 * TransformMatchingShapes animation
 * Transforms matching parts between two mobjects
 */
export function transformMatchingShapes(
  engine: AnimationEngine,
  sourceId: string,
  targetState: Partial<MobjectState>,
  options: AnimationOptions = {}
): string {
  return engine.createAnimation('TransformMatchingShapes', sourceId, targetState, {
    duration: DEFAULT_ANIMATION_RUN_TIME,
    rateFunc: smooth,
    ...options,
  });
}

// ============================================
// ANIMATION COMPOSITION
// ============================================

/**
 * Wait - create a delay
 */
export function wait(duration: number = 1): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration * 1000));
}

/**
 * AnimationGroup configuration
 */
export interface AnimationGroupConfig {
  lagRatio?: number;
}

/**
 * Create an animation group (parallel animations)
 */
export function animationGroup(
  engine: AnimationEngine,
  animationIds: string[],
  _config: AnimationGroupConfig = {}
): Promise<void[]> {
  return engine.playAll(animationIds);
}

/**
 * Succession - sequential animations
 */
export function succession(
  engine: AnimationEngine,
  animationIds: string[]
): Promise<void> {
  return engine.playSequence(animationIds);
}

/**
 * LaggedStart - staggered parallel animations
 */
export async function laggedStart(
  engine: AnimationEngine,
  animationIds: string[],
  lagRatio: number = 0.1
): Promise<void> {
  const promises: Promise<void>[] = [];

  for (let i = 0; i < animationIds.length; i++) {
    const delay = i * lagRatio;
    await wait(delay);
    promises.push(engine.play(animationIds[i]));
  }

  await Promise.all(promises);
}
