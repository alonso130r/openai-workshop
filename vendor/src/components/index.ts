/**
 * ManimReact - Components Index
 */

// Scene components
export {
  SceneProvider,
  useSceneContext,
  usePlayback,
  useTime,
  type SceneContextValue,
  type SceneProviderProps,
} from './Scene';
export { ManimScene, type ManimSceneProps } from './Scene';
export { Camera, MovingCamera, useCamera, type CameraProps, type MovingCameraProps } from './Scene';

// Re-export SceneHandle from core types
export type { SceneHandle } from '../core/types';

// Graph components
export {
  Axes,
  NumberPlane,
  FunctionGraph,
  ParametricFunction,
  ImplicitFunction,
  type AxesComponentProps,
  type NumberPlaneProps,
  type FunctionGraphProps,
  type ParametricFunctionProps,
  type ImplicitFunctionProps,
} from './Graph';
