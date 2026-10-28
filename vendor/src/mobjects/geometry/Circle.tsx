/**
 * ManimReact - Circle Component
 * A circular arc or full circle
 */

import React, { forwardRef, useMemo } from 'react';
import { Mobject } from '../base/Mobject';
import { mathLengthToPixel } from '../../core/coordinates';
import { useSceneStore } from '../../core/store';
import { COLORS } from '../../core/constants';
import type { CircleProps, MobjectHandle } from '../../core/types';

const TAU = Math.PI * 2;

export interface CircleComponentProps extends CircleProps {
  /** Radius of the circle in math units (default: 1) */
  radius?: number;
  /** Start angle in radians (default: 0) */
  startAngle?: number;
  /** End angle in radians (default: 2π) */
  endAngle?: number;
  /** Number of arc segments for smoothness */
  numComponents?: number;
}

/**
 * Generate SVG arc path
 */
function generateArcPath(
  radius: number,
  startAngle: number,
  endAngle: number,
  numComponents: number = 64
): string {
  const points: [number, number][] = [];
  const angleRange = endAngle - startAngle;

  for (let i = 0; i <= numComponents; i++) {
    const t = i / numComponents;
    const angle = startAngle + t * angleRange;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    points.push([x, y]);
  }

  if (points.length === 0) return '';

  const pathParts: string[] = [`M ${points[0][0]} ${points[0][1]}`];

  for (let i = 1; i < points.length; i++) {
    pathParts.push(`L ${points[i][0]} ${points[i][1]}`);
  }

  // Close path if full circle
  if (Math.abs(angleRange - TAU) < 0.001) {
    pathParts.push('Z');
  }

  return pathParts.join(' ');
}

/**
 * Circle Component
 * Creates a circle or arc with customizable radius and angles
 */
export const Circle = forwardRef<MobjectHandle, CircleComponentProps>(
  (props, ref) => {
    const {
      radius = 1,
      startAngle = 0,
      endAngle = TAU,
      numComponents = 64,
      style,
      ...rest
    } = props;

    const camera = useSceneStore((state) => state.camera);

    // Convert radius to pixels
    const pixelRadius = useMemo(
      () => mathLengthToPixel(radius, camera, 'x'),
      [radius, camera]
    );

    // Generate path data
    const pathData = useMemo(
      () => generateArcPath(pixelRadius, startAngle, endAngle, numComponents),
      [pixelRadius, startAngle, endAngle, numComponents]
    );

    // Default style for circles
    const defaultStyle = useMemo(
      () => ({
        strokeColor: COLORS.BLUE,
        fillColor: 'none',
        ...style,
      }),
      [style]
    );

    return (
      <Mobject ref={ref} pathData={pathData} style={defaultStyle} {...rest} />
    );
  }
);

Circle.displayName = 'Circle';

/**
 * Dot Component
 * A small filled circle
 */
export const Dot = forwardRef<MobjectHandle, CircleComponentProps>(
  (props, ref) => {
    const { radius = 0.08, style, ...rest } = props;

    const defaultStyle = useMemo(
      () => ({
        strokeColor: COLORS.WHITE,
        fillColor: COLORS.WHITE,
        fillOpacity: 1,
        strokeWidth: 0,
        ...style,
      }),
      [style]
    );

    return <Circle ref={ref} radius={radius} style={defaultStyle} {...rest} />;
  }
);

Dot.displayName = 'Dot';

/**
 * Annulus Component
 * A ring shape (circle with hole)
 */
export interface AnnulusProps extends CircleComponentProps {
  innerRadius?: number;
  outerRadius?: number;
}

export const Annulus = forwardRef<MobjectHandle, AnnulusProps>((props, ref) => {
  const {
    innerRadius = 0.5,
    outerRadius = 1,
    startAngle = 0,
    endAngle = TAU,
    numComponents = 64,
    style,
    ...rest
  } = props;

  const camera = useSceneStore((state) => state.camera);

  // Convert radii to pixels
  const pixelInnerRadius = useMemo(
    () => mathLengthToPixel(innerRadius, camera, 'x'),
    [innerRadius, camera]
  );

  const pixelOuterRadius = useMemo(
    () => mathLengthToPixel(outerRadius, camera, 'x'),
    [outerRadius, camera]
  );

  // Generate annulus path (outer arc, then inner arc reversed)
  const pathData = useMemo(() => {
    const outerPoints: [number, number][] = [];
    const innerPoints: [number, number][] = [];
    const angleRange = endAngle - startAngle;

    for (let i = 0; i <= numComponents; i++) {
      const t = i / numComponents;
      const angle = startAngle + t * angleRange;

      outerPoints.push([
        pixelOuterRadius * Math.cos(angle),
        pixelOuterRadius * Math.sin(angle),
      ]);

      innerPoints.push([
        pixelInnerRadius * Math.cos(angle),
        pixelInnerRadius * Math.sin(angle),
      ]);
    }

    const parts: string[] = [];

    // Outer arc
    parts.push(`M ${outerPoints[0][0]} ${outerPoints[0][1]}`);
    for (let i = 1; i < outerPoints.length; i++) {
      parts.push(`L ${outerPoints[i][0]} ${outerPoints[i][1]}`);
    }

    // Connect to inner arc
    const lastInner = innerPoints[innerPoints.length - 1];
    parts.push(`L ${lastInner[0]} ${lastInner[1]}`);

    // Inner arc (reversed)
    for (let i = innerPoints.length - 2; i >= 0; i--) {
      parts.push(`L ${innerPoints[i][0]} ${innerPoints[i][1]}`);
    }

    parts.push('Z');

    return parts.join(' ');
  }, [
    pixelInnerRadius,
    pixelOuterRadius,
    startAngle,
    endAngle,
    numComponents,
  ]);

  const defaultStyle = useMemo(
    () => ({
      strokeColor: COLORS.WHITE,
      fillColor: COLORS.BLUE,
      fillOpacity: 0.5,
      ...style,
    }),
    [style]
  );

  return (
    <Mobject ref={ref} pathData={pathData} style={defaultStyle} {...rest} />
  );
});

Annulus.displayName = 'Annulus';

export default Circle;
