/**
 * ManimReact - Animations Exports
 */

// Export the engine and core types
export {
  AnimationEngine,
  getAnimationEngine,
  resetAnimationEngine,
  createScopedEngine,
  getScopedEngine,
  destroyScopedEngine,
} from './engine';
export type { AnimationOptions, AnimationDefinition, TimelinePosition, MasterTimelineCallbacks } from './engine';

// Export hooks (excluding AnimationType to avoid conflict with core)
export {
  useAnimationEngine,
  useScopedAnimationEngine,
  useTriggeredAnimation,
  useMasterTimeline,
  useValueTracker,
  useAnimation,
  useTimeline,
  usePlayOnMount,
  useScene,
  useUpdater,
} from './hooks';
// Re-export AnimationType from hooks with alias
export type { AnimationType as HooksAnimationType } from './hooks';

// Export declarative components
export { Animated } from './Animated';
export type { AnimatedProps, AnimatedHandle, AnimationType as AnimatedType, RateFuncName } from './Animated';

export { AnimationSequence } from './AnimationSequence';
export type { AnimationSequenceProps, AnimationSequenceHandle, AnimationDef } from './AnimationSequence';

// Export convenience wrappers as the primary API
export {
  create,
  uncreate,
  write,
  drawBorderThenFill,
  fadeIn,
  fadeOut,
  moveTo,
  shift,
  rotate,
  scaleInPlace,
  growFromCenter,
  shrinkToCenter,
  indicate,
  flash,
  wiggle,
  circumscribe,
  transform,
  succession,
  animationGroup,
  laggedStart,
  wait,
} from './wrappers';

// Export core animations with 'core' prefix for advanced usage
import * as coreAnimations from './animations';
export { coreAnimations };
