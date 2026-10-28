/**
 * ManimReact - Polygon and Triangle Components
 */

import React, { forwardRef, useMemo } from 'react';
import { Mobject } from '../base/Mobject';
import { mathToPixel, getBoundingBox } from '../../core/coordinates';
import { useSceneStore } from '../../core/store';
import { COLORS } from '../../core/constants';
import type { PolygonProps, MobjectHandle, Point2D, Point3D } from '../../core/types';

export interface PolygonComponentProps extends PolygonProps {
  /** Array of points defining the polygon vertices */
  points?: Point2D[];
  /** Whether to close the path */
  closed?: boolean;
}

/**
 * Generate polygon path from points
 */
function generatePolygonPath(
  points: [number, number][],
  closed: boolean = true
): string {
  if (points.length === 0) return '';

  const parts: string[] = [`M ${points[0][0]} ${points[0][1]}`];

  for (let i = 1; i < points.length; i++) {
    parts.push(`L ${points[i][0]} ${points[i][1]}`);
  }

  if (closed) {
    parts.push('Z');
  }

  return parts.join(' ');
}

/**
 * Polygon Component
 */
export const Polygon = forwardRef<MobjectHandle, PolygonComponentProps>(
  (props, ref) => {
    const {
      points = [
        [-1, 0],
        [1, 0],
        [0, 1],
      ],
      closed = true,
      style,
      position,
      ...rest
    } = props;

    const camera = useSceneStore((state) => state.camera);

    // Convert points to pixel coordinates
    const pixelPoints = useMemo(
      () => points.map((p) => mathToPixel([p[0], p[1], 0], camera)),
      [points, camera]
    );

    // Calculate center of polygon
    const center = useMemo(() => {
      if (points.length === 0) return [0, 0, 0] as Point3D;
      const sumX = points.reduce((sum, p) => sum + p[0], 0);
      const sumY = points.reduce((sum, p) => sum + p[1], 0);
      return [sumX / points.length, sumY / points.length, 0] as Point3D;
    }, [points]);

    // Pixel center
    const pixelCenter = useMemo(
      () => mathToPixel(center, camera),
      [center, camera]
    );

    // Generate path relative to center
    const pathData = useMemo(() => {
      const relativePoints = pixelPoints.map(
        (p) => [p[0] - pixelCenter[0], p[1] - pixelCenter[1]] as [number, number]
      );
      return generatePolygonPath(relativePoints, closed);
    }, [pixelPoints, pixelCenter, closed]);

    const defaultStyle = useMemo(
      () => ({
        strokeColor: COLORS.WHITE,
        fillColor: 'none',
        ...style,
      }),
      [style]
    );

    return (
      <Mobject
        ref={ref}
        pathData={pathData}
        position={position ?? center}
        style={defaultStyle}
        {...rest}
      />
    );
  }
);

Polygon.displayName = 'Polygon';

/**
 * RegularPolygon Component
 * A polygon with equal sides and angles
 */
export interface RegularPolygonProps extends Omit<PolygonComponentProps, 'points'> {
  /** Number of sides */
  n?: number;
  /** Radius (distance from center to vertex) */
  radius?: number;
  /** Start angle in radians */
  startAngle?: number;
}

export const RegularPolygon = forwardRef<MobjectHandle, RegularPolygonProps>(
  (props, ref) => {
    const {
      n = 6,
      radius = 1,
      startAngle = Math.PI / 2,
      ...rest
    } = props;

    const points = useMemo(() => {
      const pts: Point2D[] = [];
      for (let i = 0; i < n; i++) {
        const angle = startAngle + (2 * Math.PI * i) / n;
        pts.push([
          radius * Math.cos(angle),
          radius * Math.sin(angle),
        ]);
      }
      return pts;
    }, [n, radius, startAngle]);

    return <Polygon ref={ref} points={points} {...rest} />;
  }
);

RegularPolygon.displayName = 'RegularPolygon';

/**
 * Triangle Component
 */
export interface TriangleProps extends Omit<PolygonComponentProps, 'points'> {
  /** Base width */
  width?: number;
  /** Height */
  height?: number;
}

export const Triangle = forwardRef<MobjectHandle, TriangleProps>(
  (props, ref) => {
    const { width = 2, height = Math.sqrt(3), ...rest } = props;

    const points = useMemo((): Point2D[] => {
      const halfW = width / 2;
      const halfH = height / 2;
      return [
        [0, halfH],          // Top
        [-halfW, -halfH],    // Bottom left
        [halfW, -halfH],     // Bottom right
      ];
    }, [width, height]);

    return <Polygon ref={ref} points={points} {...rest} />;
  }
);

Triangle.displayName = 'Triangle';

/**
 * Star Component
 */
export interface StarProps extends Omit<PolygonComponentProps, 'points'> {
  /** Number of points */
  n?: number;
  /** Outer radius */
  outerRadius?: number;
  /** Inner radius */
  innerRadius?: number;
  /** Start angle in radians */
  startAngle?: number;
}

export const Star = forwardRef<MobjectHandle, StarProps>((props, ref) => {
  const {
    n = 5,
    outerRadius = 1,
    innerRadius = 0.5,
    startAngle = Math.PI / 2,
    ...rest
  } = props;

  const points = useMemo(() => {
    const pts: Point2D[] = [];
    const totalPoints = n * 2;

    for (let i = 0; i < totalPoints; i++) {
      const angle = startAngle + (2 * Math.PI * i) / totalPoints;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      pts.push([
        radius * Math.cos(angle),
        radius * Math.sin(angle),
      ]);
    }

    return pts;
  }, [n, outerRadius, innerRadius, startAngle]);

  return <Polygon ref={ref} points={points} {...rest} />;
});

Star.displayName = 'Star';

/**
 * Polyline Component
 * Like Polygon but not closed
 */
export const Polyline = forwardRef<MobjectHandle, PolygonComponentProps>(
  (props, ref) => {
    return <Polygon ref={ref} closed={false} {...props} />;
  }
);

Polyline.displayName = 'Polyline';

export default Polygon;
