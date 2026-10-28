/**
 * ManimReact - Function Graph Component
 */

import React, { forwardRef, useMemo } from 'react';
import { Mobject } from '../../mobjects/base/Mobject';
import { mathToPixel } from '../../core/coordinates';
import { useSceneStore } from '../../core/store';
import { COLORS } from '../../core/constants';
import type { GraphProps, MobjectHandle, Point2D } from '../../core/types';

export interface FunctionGraphProps extends GraphProps {
  /** The function to plot */
  func: (x: number) => number;
  /** X-range to plot [min, max] */
  xRange?: [number, number];
  /** Number of samples for the curve */
  numSamples?: number;
  /** Color of the graph */
  color?: string;
  /** Stroke width */
  strokeWidth?: number;
  /** Points where the function is discontinuous */
  discontinuities?: number[];
  /** Tolerance for detecting discontinuities */
  discontinuityTolerance?: number;
}

/**
 * FunctionGraph Component
 * Plots a mathematical function
 */
export const FunctionGraph = forwardRef<MobjectHandle, FunctionGraphProps>(
  (props, ref) => {
    const {
      func,
      xRange = [-7, 7],
      numSamples = 200,
      color = COLORS.YELLOW,
      strokeWidth = 4,
      discontinuities = [],
      discontinuityTolerance = 1,
      style,
      ...rest
    } = props;

    const camera = useSceneStore((state) => state.camera);

    // Generate path data
    const pathData = useMemo(() => {
      const [xMin, xMax] = xRange;
      const dx = (xMax - xMin) / numSamples;

      const segments: Point2D[][] = [[]];
      let currentSegment = 0;

      for (let i = 0; i <= numSamples; i++) {
        const x = xMin + i * dx;
        let y: number;

        try {
          y = func(x);
        } catch {
          // Function error at this point - start new segment
          if (segments[currentSegment].length > 0) {
            currentSegment++;
            segments[currentSegment] = [];
          }
          continue;
        }

        // Check for NaN, Infinity, or discontinuity
        if (!isFinite(y) || isNaN(y)) {
          if (segments[currentSegment].length > 0) {
            currentSegment++;
            segments[currentSegment] = [];
          }
          continue;
        }

        // Check for discontinuity
        const isDiscontinuity = discontinuities.some(
          (d) => Math.abs(x - d) < dx
        );
        if (isDiscontinuity) {
          if (segments[currentSegment].length > 0) {
            currentSegment++;
            segments[currentSegment] = [];
          }
          continue;
        }

        // Check for large jumps (automatic discontinuity detection)
        const prevPoint = segments[currentSegment].slice(-1)[0];
        if (prevPoint && Math.abs(y - prevPoint[1]) > discontinuityTolerance) {
          currentSegment++;
          segments[currentSegment] = [];
        }

        // Clamp y to reasonable bounds
        const clampedY = Math.max(-10, Math.min(10, y));
        segments[currentSegment].push([x, clampedY]);
      }

      // Convert segments to SVG path
      const paths: string[] = [];

      for (const segment of segments) {
        if (segment.length < 2) continue;

        const pixelPoints = segment.map((p) =>
          mathToPixel([p[0], p[1], 0], camera)
        );

        const pathParts = [`M ${pixelPoints[0][0]} ${pixelPoints[0][1]}`];

        for (let i = 1; i < pixelPoints.length; i++) {
          pathParts.push(`L ${pixelPoints[i][0]} ${pixelPoints[i][1]}`);
        }

        paths.push(pathParts.join(' '));
      }

      return paths.join(' ');
    }, [func, xRange, numSamples, discontinuities, discontinuityTolerance, camera]);

    const graphStyle = useMemo(
      () => ({
        strokeColor: color,
        strokeWidth,
        fillColor: 'none',
        ...style,
      }),
      [color, strokeWidth, style]
    );

    return (
      <Mobject ref={ref} pathData={pathData} style={graphStyle} {...rest} />
    );
  }
);

FunctionGraph.displayName = 'FunctionGraph';

/**
 * ParametricFunction Component
 * Plots a parametric curve
 */
export interface ParametricFunctionProps extends Omit<FunctionGraphProps, 'func'> {
  /** Parametric function returning [x, y] for parameter t */
  func: (t: number) => [number, number];
  /** Parameter range [min, max] */
  tRange?: [number, number];
}

export const ParametricFunction = forwardRef<MobjectHandle, ParametricFunctionProps>(
  (props, ref) => {
    const {
      func,
      tRange = [0, 1],
      numSamples = 200,
      color = COLORS.BLUE,
      strokeWidth = 4,
      style,
      ...rest
    } = props;

    const camera = useSceneStore((state) => state.camera);

    const pathData = useMemo(() => {
      const [tMin, tMax] = tRange;
      const dt = (tMax - tMin) / numSamples;

      const points: Point2D[] = [];

      for (let i = 0; i <= numSamples; i++) {
        const t = tMin + i * dt;
        try {
          const [x, y] = func(t);
          if (isFinite(x) && isFinite(y) && !isNaN(x) && !isNaN(y)) {
            points.push([x, y]);
          }
        } catch {
          // Skip invalid points
        }
      }

      if (points.length < 2) return '';

      const pixelPoints = points.map((p) =>
        mathToPixel([p[0], p[1], 0], camera)
      );

      const pathParts = [`M ${pixelPoints[0][0]} ${pixelPoints[0][1]}`];

      for (let i = 1; i < pixelPoints.length; i++) {
        pathParts.push(`L ${pixelPoints[i][0]} ${pixelPoints[i][1]}`);
      }

      return pathParts.join(' ');
    }, [func, tRange, numSamples, camera]);

    const graphStyle = useMemo(
      () => ({
        strokeColor: color,
        strokeWidth,
        fillColor: 'none',
        ...style,
      }),
      [color, strokeWidth, style]
    );

    return (
      <Mobject ref={ref} pathData={pathData} style={graphStyle} {...rest} />
    );
  }
);

ParametricFunction.displayName = 'ParametricFunction';

/**
 * ImplicitFunction Component
 * Plots an implicit function f(x,y) = 0
 */
export interface ImplicitFunctionProps extends Omit<FunctionGraphProps, 'func'> {
  /** Implicit function f(x,y) - plots where f(x,y) = 0 */
  func: (x: number, y: number) => number;
  /** X-range */
  xRange?: [number, number];
  /** Y-range */
  yRange?: [number, number];
  /** Grid resolution for marching squares */
  resolution?: number;
}

export const ImplicitFunction = forwardRef<MobjectHandle, ImplicitFunctionProps>(
  (props, ref) => {
    const {
      func,
      xRange = [-7, 7],
      yRange = [-4, 4],
      resolution = 100,
      color = COLORS.GREEN,
      strokeWidth = 3,
      style,
      ...rest
    } = props;

    const camera = useSceneStore((state) => state.camera);

    // Simplified implicit function plotting using contour detection
    const pathData = useMemo(() => {
      const [xMin, xMax] = xRange;
      const [yMin, yMax] = yRange;
      const dx = (xMax - xMin) / resolution;
      const dy = (yMax - yMin) / resolution;

      const segments: Point2D[][] = [];

      // Simple marching squares approximation
      for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
          const x = xMin + i * dx;
          const y = yMin + j * dy;

          const values = [
            func(x, y),
            func(x + dx, y),
            func(x + dx, y + dy),
            func(x, y + dy),
          ];

          // Check for sign changes (zero crossing)
          const signs = values.map((v) => (v > 0 ? 1 : v < 0 ? -1 : 0));
          const hasZeroCrossing = signs.some((s, idx) => {
            const next = signs[(idx + 1) % 4];
            return s !== 0 && next !== 0 && s !== next;
          });

          if (hasZeroCrossing) {
            // Add approximate zero crossing point
            const centerX = x + dx / 2;
            const centerY = y + dy / 2;
            segments.push([[centerX, centerY]]);
          }
        }
      }

      if (segments.length === 0) return '';

      // Convert to pixel coordinates and create points
      const pixelPoints = segments.flat().map((p) =>
        mathToPixel([p[0], p[1], 0], camera)
      );

      // Simple point rendering (full implementation would use proper contour tracing)
      return pixelPoints
        .map((p) => `M ${p[0]} ${p[1]} L ${p[0] + 1} ${p[1] + 1}`)
        .join(' ');
    }, [func, xRange, yRange, resolution, camera]);

    const graphStyle = useMemo(
      () => ({
        strokeColor: color,
        strokeWidth,
        fillColor: 'none',
        ...style,
      }),
      [color, strokeWidth, style]
    );

    return (
      <Mobject ref={ref} pathData={pathData} style={graphStyle} {...rest} />
    );
  }
);

ImplicitFunction.displayName = 'ImplicitFunction';

export default FunctionGraph;
