/**
 * ManimReact - Coordinate System Utilities
 * Handles transformation between mathematical and pixel coordinates
 */

import {
  DEFAULT_FRAME_WIDTH,
  DEFAULT_FRAME_HEIGHT,
  DEFAULT_PIXEL_WIDTH,
  DEFAULT_PIXEL_HEIGHT,
} from './constants';
import type { Point2D, Point3D, CoordinateConfig, Vector3D } from './types';

/**
 * Default coordinate configuration
 */
export const defaultCoordinateConfig: CoordinateConfig = {
  frameWidth: DEFAULT_FRAME_WIDTH,
  frameHeight: DEFAULT_FRAME_HEIGHT,
  pixelWidth: DEFAULT_PIXEL_WIDTH,
  pixelHeight: DEFAULT_PIXEL_HEIGHT,
};

/**
 * Convert mathematical coordinates to pixel coordinates
 * Manim uses a coordinate system with origin at center, Y-axis pointing up
 */
export function mathToPixel(
  point: Point2D | Point3D,
  config: CoordinateConfig = defaultCoordinateConfig
): Point2D {
  const [x, y] = point;
  const scaleX = config.pixelWidth / config.frameWidth;
  const scaleY = config.pixelHeight / config.frameHeight;

  return [
    (x + config.frameWidth / 2) * scaleX,
    (config.frameHeight / 2 - y) * scaleY, // Flip Y-axis
  ];
}

/**
 * Convert pixel coordinates to mathematical coordinates
 */
export function pixelToMath(
  point: Point2D,
  config: CoordinateConfig = defaultCoordinateConfig
): Point2D {
  const [px, py] = point;
  const scaleX = config.pixelWidth / config.frameWidth;
  const scaleY = config.pixelHeight / config.frameHeight;

  return [
    px / scaleX - config.frameWidth / 2,
    config.frameHeight / 2 - py / scaleY, // Flip Y-axis
  ];
}

/**
 * Convert mathematical length to pixel length
 */
export function mathLengthToPixel(
  length: number,
  config: CoordinateConfig = defaultCoordinateConfig,
  axis: 'x' | 'y' = 'x'
): number {
  if (axis === 'x') {
    return (length * config.pixelWidth) / config.frameWidth;
  }
  return (length * config.pixelHeight) / config.frameHeight;
}

/**
 * Convert pixel length to mathematical length
 */
export function pixelLengthToMath(
  length: number,
  config: CoordinateConfig = defaultCoordinateConfig,
  axis: 'x' | 'y' = 'x'
): number {
  if (axis === 'x') {
    return (length * config.frameWidth) / config.pixelWidth;
  }
  return (length * config.frameHeight) / config.pixelHeight;
}

/**
 * Get the scale factor for converting math units to pixels
 */
export function getScaleFactor(
  config: CoordinateConfig = defaultCoordinateConfig
): Point2D {
  return [
    config.pixelWidth / config.frameWidth,
    config.pixelHeight / config.frameHeight,
  ];
}

/**
 * Calculate distance between two points
 */
export function distance(a: Point2D | Point3D, b: Point2D | Point3D): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = (a[2] ?? 0) - (b[2] ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate the angle between two points (in radians)
 */
export function angleBetweenPoints(
  from: Point2D | Point3D,
  to: Point2D | Point3D
): number {
  return Math.atan2(to[1] - from[1], to[0] - from[0]);
}

/**
 * Normalize a vector to unit length
 */
export function normalize(v: Vector3D): Vector3D {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  if (len === 0) return [0, 0, 0];
  return [v[0] / len, v[1] / len, v[2] / len];
}

/**
 * Scale a vector by a scalar
 */
export function scaleVector(v: Vector3D, scalar: number): Vector3D {
  return [v[0] * scalar, v[1] * scalar, v[2] * scalar];
}

/**
 * Add two vectors
 */
export function addVectors(a: Vector3D, b: Vector3D): Vector3D {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

/**
 * Subtract two vectors (a - b)
 */
export function subtractVectors(a: Vector3D, b: Vector3D): Vector3D {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

/**
 * Dot product of two vectors
 */
export function dotProduct(a: Vector3D, b: Vector3D): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Cross product of two vectors
 */
export function crossProduct(a: Vector3D, b: Vector3D): Vector3D {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/**
 * Rotate a point around the origin by an angle (in radians)
 */
export function rotatePoint2D(point: Point2D, angle: number): Point2D {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [
    point[0] * cos - point[1] * sin,
    point[0] * sin + point[1] * cos,
  ];
}

/**
 * Rotate a 3D point around an axis
 */
export function rotatePoint3D(
  point: Point3D,
  angle: number,
  axis: Vector3D = [0, 0, 1]
): Point3D {
  const normalizedAxis = normalize(axis);
  const [x, y, z] = point;
  const [ux, uy, uz] = normalizedAxis;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const oneMinusCos = 1 - cos;

  // Rodrigues' rotation formula
  return [
    (cos + ux * ux * oneMinusCos) * x +
      (ux * uy * oneMinusCos - uz * sin) * y +
      (ux * uz * oneMinusCos + uy * sin) * z,
    (uy * ux * oneMinusCos + uz * sin) * x +
      (cos + uy * uy * oneMinusCos) * y +
      (uy * uz * oneMinusCos - ux * sin) * z,
    (uz * ux * oneMinusCos - uy * sin) * x +
      (uz * uy * oneMinusCos + ux * sin) * y +
      (cos + uz * uz * oneMinusCos) * z,
  ];
}

/**
 * Linear interpolation between two points
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Linear interpolation between two 2D points
 */
export function lerpPoint2D(a: Point2D, b: Point2D, t: number): Point2D {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
}

/**
 * Linear interpolation between two 3D points
 */
export function lerpPoint3D(a: Point3D, b: Point3D, t: number): Point3D {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Map a value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Get the midpoint between two points
 */
export function midpoint(a: Point3D, b: Point3D): Point3D {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
}

/**
 * Get the bounding box of a set of points
 */
export function getBoundingBox(points: Point3D[]): {
  min: Point3D;
  max: Point3D;
  center: Point3D;
  width: number;
  height: number;
  depth: number;
} {
  if (points.length === 0) {
    return {
      min: [0, 0, 0],
      max: [0, 0, 0],
      center: [0, 0, 0],
      width: 0,
      height: 0,
      depth: 0,
    };
  }

  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;

  for (const [x, y, z] of points) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    minZ = Math.min(minZ, z);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, z);
  }

  return {
    min: [minX, minY, minZ],
    max: [maxX, maxY, maxZ],
    center: [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2],
    width: maxX - minX,
    height: maxY - minY,
    depth: maxZ - minZ,
  };
}
