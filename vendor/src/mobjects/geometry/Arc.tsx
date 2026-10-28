/**
 * ManimReact - Arc Component
 * Arcs, sectors, and curved shapes
 */

import React, { forwardRef, useMemo } from 'react';
import { Mobject } from '../base/Mobject';
import { mathLengthToPixel } from '../../core/coordinates';
import { useSceneStore } from '../../core/store';
import { COLORS } from '../../core/constants';
import type { ArcProps, MobjectHandle } from '../../core/types';

const TAU = Math.PI * 2;

export interface ArcComponentProps extends ArcProps {
  /** Radius in math units */
  radius?: number;
  /** Start angle in radians */
  startAngle?: number;
  /** Arc angle in radians (length of the arc) */
  angle?: number;
  /** Number of segments for smoothness */
  numComponents?: number;
}

/**
 * Generate arc path
 */
function generateArcPath(
  radius: number,
  startAngle: number,
  angle: number,
  numComponents: number = 50
): string {
  if (Math.abs(angle) < 0.001) return '';

  const points: [number, number][] = [];
  const endAngle = startAngle + angle;

  for (let i = 0; i <= numComponents; i++) {
    const t = i / numComponents;
    const currentAngle = startAngle + t * angle;
    points.push([
      radius * Math.cos(currentAngle),
      radius * Math.sin(currentAngle),
    ]);
  }

  const parts: string[] = [`M ${points[0][0]} ${points[0][1]}`];

  for (let i = 1; i < points.length; i++) {
    parts.push(`L ${points[i][0]} ${points[i][1]}`);
  }

  return parts.join(' ');
}

/**
 * Arc Component
 * A circular arc
 */
export const Arc = forwardRef<MobjectHandle, ArcComponentProps>((props, ref) => {
  const {
    radius = 1,
    startAngle = 0,
    angle = TAU / 4, // 90 degrees by default
    numComponents = 50,
    style,
    ...rest
  } = props;

  const camera = useSceneStore((state) => state.camera);

  const pixelRadius = useMemo(
    () => mathLengthToPixel(radius, camera, 'x'),
    [radius, camera]
  );

  const pathData = useMemo(
    () => generateArcPath(pixelRadius, startAngle, angle, numComponents),
    [pixelRadius, startAngle, angle, numComponents]
  );

  const defaultStyle = useMemo(
    () => ({
      strokeColor: COLORS.WHITE,
      fillColor: 'none',
      ...style,
    }),
    [style]
  );

  return (
    <Mobject ref={ref} pathData={pathData} style={defaultStyle} {...rest} />
  );
});

Arc.displayName = 'Arc';

/**
 * Sector Component
 * A pie slice shape
 */
export interface SectorProps extends ArcComponentProps {
  /** Inner radius for annular sector */
  innerRadius?: number;
}

export const Sector = forwardRef<MobjectHandle, SectorProps>((props, ref) => {
  const {
    radius = 1,
    innerRadius = 0,
    startAngle = 0,
    angle = TAU / 4,
    numComponents = 50,
    style,
    ...rest
  } = props;

  const camera = useSceneStore((state) => state.camera);

  const pixelRadius = useMemo(
    () => mathLengthToPixel(radius, camera, 'x'),
    [radius, camera]
  );

  const pixelInnerRadius = useMemo(
    () => mathLengthToPixel(innerRadius, camera, 'x'),
    [innerRadius, camera]
  );

  const pathData = useMemo(() => {
    const endAngle = startAngle + angle;

    // Outer arc points
    const outerPoints: [number, number][] = [];
    for (let i = 0; i <= numComponents; i++) {
      const t = i / numComponents;
      const currentAngle = startAngle + t * angle;
      outerPoints.push([
        pixelRadius * Math.cos(currentAngle),
        pixelRadius * Math.sin(currentAngle),
      ]);
    }

    if (innerRadius === 0) {
      // Simple sector (pie slice)
      const parts: string[] = [
        'M 0 0',
        `L ${outerPoints[0][0]} ${outerPoints[0][1]}`,
      ];

      for (let i = 1; i < outerPoints.length; i++) {
        parts.push(`L ${outerPoints[i][0]} ${outerPoints[i][1]}`);
      }

      parts.push('Z');
      return parts.join(' ');
    }

    // Annular sector
    const innerPoints: [number, number][] = [];
    for (let i = 0; i <= numComponents; i++) {
      const t = i / numComponents;
      const currentAngle = startAngle + t * angle;
      innerPoints.push([
        pixelInnerRadius * Math.cos(currentAngle),
        pixelInnerRadius * Math.sin(currentAngle),
      ]);
    }

    const parts: string[] = [`M ${outerPoints[0][0]} ${outerPoints[0][1]}`];

    // Outer arc
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
  }, [pixelRadius, pixelInnerRadius, startAngle, angle, numComponents]);

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

Sector.displayName = 'Sector';

/**
 * ArcBetweenPoints Component
 * An arc passing through two points
 */
export interface ArcBetweenPointsProps extends Omit<ArcComponentProps, 'radius' | 'startAngle'> {
  start?: [number, number];
  end?: [number, number];
  /** Curvature of the arc */
  curvature?: number;
}

export const ArcBetweenPoints = forwardRef<MobjectHandle, ArcBetweenPointsProps>(
  (props, ref) => {
    const {
      start = [-1, 0],
      end = [1, 0],
      curvature = 1,
      numComponents = 50,
      style,
      ...rest
    } = props;

    const camera = useSceneStore((state) => state.camera);

    const pathData = useMemo(() => {
      // Calculate arc parameters from two points
      const midX = (start[0] + end[0]) / 2;
      const midY = (start[1] + end[1]) / 2;
      const dx = end[0] - start[0];
      const dy = end[1] - start[1];
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.001) return '';

      // Perpendicular direction
      const perpX = -dy / dist;
      const perpY = dx / dist;

      // Control point offset
      const offset = (dist / 2) * curvature;
      const ctrlX = midX + perpX * offset;
      const ctrlY = midY + perpY * offset;

      // Convert to pixels
      const [psx, psy] = [
        (start[0] + camera.frameWidth / 2) * (camera.pixelWidth / camera.frameWidth),
        (camera.frameHeight / 2 - start[1]) * (camera.pixelHeight / camera.frameHeight),
      ];
      const [pex, pey] = [
        (end[0] + camera.frameWidth / 2) * (camera.pixelWidth / camera.frameWidth),
        (camera.frameHeight / 2 - end[1]) * (camera.pixelHeight / camera.frameHeight),
      ];
      const [pcx, pcy] = [
        (ctrlX + camera.frameWidth / 2) * (camera.pixelWidth / camera.frameWidth),
        (camera.frameHeight / 2 - ctrlY) * (camera.pixelHeight / camera.frameHeight),
      ];

      // Center for relative positioning
      const centerX = (psx + pex) / 2;
      const centerY = (psy + pey) / 2;

      return `M ${psx - centerX} ${psy - centerY} Q ${pcx - centerX} ${pcy - centerY} ${pex - centerX} ${pey - centerY}`;
    }, [start, end, curvature, camera]);

    const centerPosition = useMemo(
      () => [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, 0] as [number, number, number],
      [start, end]
    );

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
        position={centerPosition}
        style={defaultStyle}
        {...rest}
      />
    );
  }
);

ArcBetweenPoints.displayName = 'ArcBetweenPoints';

/**
 * CurvedArrow Component
 */
export interface CurvedArrowProps extends ArcBetweenPointsProps {
  tipLength?: number;
  tipWidth?: number;
}

export const CurvedArrow = forwardRef<MobjectHandle, CurvedArrowProps>(
  (props, ref) => {
    const {
      start = [-1, 0],
      end = [1, 0],
      curvature = 1,
      tipLength = 0.2,
      tipWidth = 0.15,
      style,
      ...rest
    } = props;

    // For now, use ArcBetweenPoints with arrow marker
    // Full implementation would add arrowhead at the end

    const defaultStyle = useMemo(
      () => ({
        strokeColor: COLORS.WHITE,
        fillColor: 'none',
        ...style,
      }),
      [style]
    );

    return (
      <ArcBetweenPoints
        ref={ref}
        start={start}
        end={end}
        curvature={curvature}
        style={defaultStyle}
        {...rest}
      />
    );
  }
);

CurvedArrow.displayName = 'CurvedArrow';

/**
 * Angle Component
 * Visual representation of an angle
 */
export interface AngleProps extends Omit<ArcComponentProps, 'angle'> {
  /** First line endpoint (relative to vertex at origin) */
  line1?: [number, number];
  /** Second line endpoint (relative to vertex at origin) */
  line2?: [number, number];
  /** Angle arc radius */
  arcRadius?: number;
  /** Show dot at vertex */
  showDot?: boolean;
}

export const Angle = forwardRef<MobjectHandle, AngleProps>((props, ref) => {
  const {
    line1 = [1, 0],
    line2 = [0.5, Math.sqrt(3) / 2],
    arcRadius = 0.5,
    showDot = false,
    style,
    ...rest
  } = props;

  // Calculate angles
  const angle1 = Math.atan2(line1[1], line1[0]);
  const angle2 = Math.atan2(line2[1], line2[0]);

  let angleDiff = angle2 - angle1;
  // Normalize to [-π, π]
  while (angleDiff > Math.PI) angleDiff -= TAU;
  while (angleDiff < -Math.PI) angleDiff += TAU;

  return (
    <Arc
      ref={ref}
      radius={arcRadius}
      startAngle={angle1}
      angle={angleDiff}
      style={style}
      {...rest}
    />
  );
});

Angle.displayName = 'Angle';

/**
 * RightAngle Component
 * A right angle indicator (square)
 */
export interface RightAngleProps extends Omit<AngleProps, 'line2'> {
  /** Size of the square indicator */
  size?: number;
}

export const RightAngle = forwardRef<MobjectHandle, RightAngleProps>(
  (props, ref) => {
    const {
      line1 = [1, 0],
      size = 0.3,
      style,
      ...rest
    } = props;

    const camera = useSceneStore((state) => state.camera);

    // Calculate perpendicular direction
    const angle1 = Math.atan2(line1[1], line1[0]);
    const angle2 = angle1 + Math.PI / 2;

    const pixelSize = mathLengthToPixel(size, camera, 'x');

    const pathData = useMemo(() => {
      const p1 = [pixelSize * Math.cos(angle1), -pixelSize * Math.sin(angle1)];
      const p2 = [
        pixelSize * Math.cos(angle1) + pixelSize * Math.cos(angle2),
        -pixelSize * Math.sin(angle1) - pixelSize * Math.sin(angle2),
      ];
      const p3 = [pixelSize * Math.cos(angle2), -pixelSize * Math.sin(angle2)];

      return `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]}`;
    }, [angle1, angle2, pixelSize]);

    const defaultStyle = useMemo(
      () => ({
        strokeColor: COLORS.WHITE,
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

RightAngle.displayName = 'RightAngle';

export default Arc;
