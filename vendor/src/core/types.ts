/**
 * ManimReact - Type Definitions
 */

// 2D and 3D point types
export type Point2D = [number, number];
export type Point3D = [number, number, number];
export type Point = Point2D | Point3D;

// Vector types
export type Vector2D = Point2D;
export type Vector3D = Point3D;
export type Vector = Vector2D | Vector3D;

// Color types
export type Color = string;
export type ColorWithAlpha = { color: Color; alpha: number };

// Coordinate configuration
export interface CoordinateConfig {
  frameWidth: number;
  frameHeight: number;
  pixelWidth: number;
  pixelHeight: number;
}

// Camera configuration
export interface CameraConfig extends CoordinateConfig {
  backgroundColor: Color;
  position: Point3D;
  rotation: Point3D;  // [phi, theta, gamma] in radians
  zoom: number;
}

// Animation timing
export interface AnimationConfig {
  duration: number;
  delay?: number;
  rateFunc?: RateFunction;
  lagRatio?: number;
}

// Rate function type
export type RateFunction = (t: number) => number;

// Mobject style configuration
export interface MobjectStyle {
  fillColor?: Color;
  fillOpacity?: number;
  strokeColor?: Color;
  strokeOpacity?: number;
  strokeWidth?: number;
}

// Base Mobject state
export interface MobjectState {
  id: string;
  position: Point3D;
  rotation: Point3D;
  scale: Point3D;
  opacity: number;
  style: MobjectStyle;
  zIndex: number;
  visible: boolean;
}

// Animation state
export type AnimationPhase = 'idle' | 'running' | 'paused' | 'complete';

export interface AnimationState {
  id: string;
  phase: AnimationPhase;
  progress: number;  // 0-1
  startTime: number;
  duration: number;
  targetId: string;
}

// Scene state
export interface SceneState {
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  fps: number;
  currentFrame: number;
  mobjects: Map<string, MobjectState>;
  animations: AnimationState[];
  camera: CameraConfig;
}

// Timeline item
export interface TimelineItem {
  id: string;
  type: 'animation' | 'wait' | 'group';
  startTime: number;
  duration: number;
  config?: AnimationConfig;
}

// Export configuration
export interface ExportConfig {
  format: 'mp4' | 'webm' | 'gif' | 'png-sequence';
  quality: 'preview' | 'medium' | 'high' | 'production';
  width: number;
  height: number;
  fps: number;
  startTime?: number;
  endTime?: number;
}

// Export progress callback
export type ExportProgressCallback = (progress: number, message?: string) => void;

// Event handlers
export type AnimationEventHandler = (animationId: string, phase: AnimationPhase) => void;
export type TimeUpdateHandler = (time: number, frame: number) => void;

// Mobject component props base
export interface MobjectProps {
  id?: string;
  position?: Point3D | Point2D;
  rotation?: Point3D | number;
  scale?: Point3D | number;
  opacity?: number;
  zIndex?: number;
  style?: Partial<MobjectStyle>;
  children?: React.ReactNode;
}

// Geometry-specific props
export interface CircleProps extends MobjectProps {
  radius?: number;
  startAngle?: number;
  endAngle?: number;
}

export interface RectangleProps extends MobjectProps {
  width?: number;
  height?: number;
  cornerRadius?: number;
}

export interface LineProps extends MobjectProps {
  start?: Point2D | Point3D;
  end?: Point2D | Point3D;
  pathArcs?: number;
}

export interface PolygonProps extends MobjectProps {
  points?: Point2D[];
}

export interface ArrowProps extends LineProps {
  tipLength?: number;
  tipWidth?: number;
  tipStyle?: 'triangle' | 'stealth' | 'latex';
}

export interface ArcProps extends MobjectProps {
  radius?: number;
  startAngle?: number;
  angle?: number;
}

export interface DotProps extends MobjectProps {
  radius?: number;
}

// Text/LaTeX props
export interface TextProps extends MobjectProps {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  textAlign?: 'left' | 'center' | 'right';
}

export interface MathTexProps extends MobjectProps {
  formula: string;
  fontSize?: number;
  displayMode?: boolean;
}

// Axes/Graph props
export interface AxesProps extends MobjectProps {
  xRange?: [number, number, number?];  // [min, max, step]
  yRange?: [number, number, number?];
  xLength?: number;
  yLength?: number;
  includeNumbers?: boolean;
  includeTicks?: boolean;
  includeArrows?: boolean;
  axisConfig?: Partial<LineProps>;
}

export interface NumberPlaneProps extends AxesProps {
  xStep?: number;
  yStep?: number;
  backgroundLineStyle?: Partial<MobjectStyle>;
}

export interface GraphProps extends MobjectProps {
  func: (x: number) => number;
  xRange?: [number, number];
  color?: Color;
  strokeWidth?: number;
  discontinuities?: number[];
}

// Animation types
export type AnimationType =
  | 'Create'
  | 'Uncreate'
  | 'Write'
  | 'Unwrite'
  | 'FadeIn'
  | 'FadeOut'
  | 'GrowFromCenter'
  | 'ShrinkToCenter'
  | 'Transform'
  | 'ReplacementTransform'
  | 'MoveToTarget'
  | 'Indicate'
  | 'Flash'
  | 'Circumscribe'
  | 'ShowPassingFlash'
  | 'ApplyWave'
  | 'Wiggle'
  | 'Rotate'
  | 'ScaleInPlace'
  | 'DrawBorderThenFill';

// Animation component props
export interface AnimationProps {
  target: React.RefObject<MobjectHandle> | string;
  type: AnimationType;
  duration?: number;
  delay?: number;
  rateFunc?: RateFunction;
  // Type-specific options
  direction?: Vector3D;
  color?: Color;
  scaleFactor?: number;
  angle?: number;
}

// Mobject handle (for imperative control)
export interface MobjectHandle {
  id: string;
  getState: () => MobjectState;
  setState: (state: Partial<MobjectState>) => void;
  moveTo: (position: Point3D, duration?: number) => Promise<void>;
  shift: (direction: Vector3D, duration?: number) => Promise<void>;
  scale: (factor: number, duration?: number) => Promise<void>;
  rotate: (angle: number, axis?: Vector3D, duration?: number) => Promise<void>;
  fadeIn: (duration?: number) => Promise<void>;
  fadeOut: (duration?: number) => Promise<void>;
  setStyle: (style: Partial<MobjectStyle>) => void;
}

// Scene handle
export interface SceneHandle {
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  getCurrentTime: () => number;
  getTotalDuration: () => number;
  addMobject: (id: string, state: MobjectState) => void;
  removeMobject: (id: string) => void;
  getMobject: (id: string) => MobjectState | undefined;
  export: (config: ExportConfig, onProgress?: ExportProgressCallback) => Promise<Blob>;
}

// Timeline handle
export interface TimelineHandle {
  addAnimation: (animation: AnimationProps, startTime?: number) => string;
  removeAnimation: (id: string) => void;
  addWait: (duration: number, startTime?: number) => string;
  getTotalDuration: () => number;
  getAnimations: () => TimelineItem[];
}
