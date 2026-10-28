/**
 * ManimReact - Main Library Entry Point
 * A React library for creating mathematical animations in the style of 3Blue1Brown
 */

// Core exports - explicitly exclude items that conflict with other modules
export {
  // Types
  type Point2D,
  type Point3D,
  type Vector2D,
  type Vector3D,
  // Removed: Vector (conflicts with geometry/Line)
  type Color,
  type MobjectStyle,
  type MobjectState,
  type MobjectProps,
  type MobjectHandle,
  type SceneHandle,
  type CameraConfig,
  type ExportConfig,
  type ExportProgressCallback,
  type ExportResult,
  type AnimationPhase,
  type AnimationType, // Core AnimationType
  type RateFunction,
  type MathTexProps,
  type TextProps,
  type CircleProps,
  type RectangleProps,
  type PolygonProps,
  type LineProps,
  type AxesProps,
  // Removed: NumberPlaneProps (conflicts with components/Graph)
  type FunctionGraphProps,
  type ArcProps,
  type DotProps,
  type SceneState,
} from './core/types';

export {
  DEFAULT_PIXEL_WIDTH,
  DEFAULT_PIXEL_HEIGHT,
  DEFAULT_FPS,
  DEFAULT_FRAME_WIDTH,
  DEFAULT_FRAME_HEIGHT,
  DEFAULT_ANIMATION_RUN_TIME,
  DEFAULT_FONT_SIZE,
  COLORS,
  DEGREES,
  PI,
  TAU,
} from './core/constants';

export {
  mathToPixel,
  pixelToMath,
  getBoundingBox,
  normalize,
  scaleVector,
  addVectors,
  subtractVectors,
  dotProduct,
  crossProduct,
} from './core/coordinates';

export {
  linear,
  smooth,
  easeInOutCubic,
  easeOutCubic,
  easeInCubic,
  easeOutBounce,
  easeInBounce,
  easeInOutBounce,
  rush,
  thereAndBack,
  // Removed: wiggle (conflicts with animations/wrappers)
} from './core/rateFunctions';

export { useSceneStore, createSceneStore } from './core/store';

// Mobject exports
export * from './mobjects';

// Animation exports
export * from './animations';

// Component exports
export * from './components';

// Export system
export * from './export';

// Version
export const VERSION = '0.1.0';
