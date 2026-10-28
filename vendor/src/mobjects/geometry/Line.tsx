/**
 * ManimReact - Line and Arrow Components
 */

import React, { forwardRef, useMemo } from 'react';
import { Mobject } from '../base/Mobject';
import { mathToPixel, distance, angleBetweenPoints } from '../../core/coordinates';
import { useSceneStore } from '../../core/store';
import { COLORS } from '../../core/constants';
import type { LineProps, ArrowProps, MobjectHandle, Point2D, Point3D } from '../../core/types';

export interface LineComponentProps extends LineProps {
  /** Start point in math coordinates (default: [-1, 0]) */
  start?: Point2D | Point3D;
  /** End point in math coordinates (default: [1, 0]) */
  end?: Point2D | Point3D;
  /** Add path arcs (curvature) */
  pathArcs?: number;
}

/**
 * Generate line path with optional curvature
 */
function generateLinePath(
  start: [number, number],
  end: [number, number],
  pathArcs: number = 0
): string {
  if (pathArcs === 0) {
    return `M ${start[0]} ${start[1]} L ${end[0]} ${end[1]}`;
  }

  // Generate curved path using arc
  const midX = (start[0] + end[0]) / 2;
  const midY = (start[1] + end[1]) / 2;
  const dist = Math.sqrt(
    Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2)
  );

  // Perpendicular offset for curve
  const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);
  const perpAngle = angle + Math.PI / 2;
  const offset = dist * pathArcs * 0.25;

  const ctrlX = midX + offset * Math.cos(perpAngle);
  const ctrlY = midY + offset * Math.sin(perpAngle);

  return `M ${start[0]} ${start[1]} Q ${ctrlX} ${ctrlY} ${end[0]} ${end[1]}`;
}

/**
 * Line Component
 */
export const Line = forwardRef<MobjectHandle, LineComponentProps>(
  (props, ref) => {
    const {
      start = [-1, 0],
      end = [1, 0],
      pathArcs = 0,
      style,
      position,
      ...rest
    } = props;

    const camera = useSceneStore((state) => state.camera);

    // Convert to pixel coordinates relative to position
    const pixelStart = useMemo(
      () => mathToPixel([start[0], start[1], 0], camera),
      [start, camera]
    );

    const pixelEnd = useMemo(
      () => mathToPixel([end[0], end[1], 0], camera),
      [end, camera]
    );

    // Calculate the center position for the group
    const centerPosition = useMemo((): Point3D => {
      return [
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2,
        0,
      ];
    }, [start, end]);

    // Generate path relative to center
    const pathData = useMemo(() => {
      const relativeStart: [number, number] = [
        pixelStart[0] - (pixelStart[0] + pixelEnd[0]) / 2,
        pixelStart[1] - (pixelStart[1] + pixelEnd[1]) / 2,
      ];
      const relativeEnd: [number, number] = [
        pixelEnd[0] - (pixelStart[0] + pixelEnd[0]) / 2,
        pixelEnd[1] - (pixelStart[1] + pixelEnd[1]) / 2,
      ];
      return generateLinePath(relativeStart, relativeEnd, pathArcs);
    }, [pixelStart, pixelEnd, pathArcs]);

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
        position={position ?? centerPosition}
        style={defaultStyle}
        {...rest}
      />
    );
  }
);

Line.displayName = 'Line';

/**
 * DashedLine Component
 */
export interface DashedLineProps extends LineComponentProps {
  /** Dash length in pixels */
  dashLength?: number;
  /** Gap length in pixels */
  gapLength?: number;
}

export const DashedLine = forwardRef<MobjectHandle, DashedLineProps>(
  (props, ref) => {
    const { dashLength = 10, gapLength = 5, style, ...rest } = props;

    const dashedStyle = useMemo(
      () => ({
        ...style,
      }),
      [style]
    );

    return (
      <Line
        ref={ref}
        style={dashedStyle}
        {...rest}
        render={(renderProps) => (
          <g
            id={renderProps.id}
            transform={renderProps.transform}
            style={renderProps.style}
          >
            <path
              d={rest.start && rest.end ? generateLinePath(
                [0, 0],
                [0, 0],
                rest.pathArcs
              ) : ''}
              fill="none"
              stroke={renderProps.pathStyle.strokeColor}
              strokeOpacity={renderProps.pathStyle.strokeOpacity}
              strokeWidth={renderProps.pathStyle.strokeWidth}
              strokeDasharray={`${dashLength} ${gapLength}`}
              strokeLinecap="round"
            />
          </g>
        )}
      />
    );
  }
);

DashedLine.displayName = 'DashedLine';

/**
 * Arrow Component
 */
export interface ArrowComponentProps extends ArrowProps {
  /** Tip length relative to stroke width */
  tipLength?: number;
  /** Tip width relative to stroke width */
  tipWidth?: number;
  /** Arrow tip style */
  tipStyle?: 'triangle' | 'stealth' | 'latex';
  /** Show tip at start */
  tipAtStart?: boolean;
  /** Show tip at end */
  tipAtEnd?: boolean;
}

export const Arrow = forwardRef<MobjectHandle, ArrowComponentProps>(
  (props, ref) => {
    const {
      start = [-1, 0],
      end = [1, 0],
      tipLength = 0.25,
      tipWidth = 0.25,
      tipStyle = 'triangle',
      tipAtStart = false,
      tipAtEnd = true,
      style,
      ...rest
    } = props;

    const camera = useSceneStore((state) => state.camera);

    // Convert to pixel coordinates
    const pixelStart = useMemo(
      () => mathToPixel([start[0], start[1], 0], camera),
      [start, camera]
    );

    const pixelEnd = useMemo(
      () => mathToPixel([end[0], end[1], 0], camera),
      [end, camera]
    );

    // Calculate angle for arrow head
    const angle = useMemo(
      () => angleBetweenPoints(pixelStart, pixelEnd),
      [pixelStart, pixelEnd]
    );

    // Calculate tip size in pixels
    const tipLengthPx = useMemo(
      () => tipLength * camera.pixelWidth / camera.frameWidth,
      [tipLength, camera]
    );

    const tipWidthPx = useMemo(
      () => tipWidth * camera.pixelWidth / camera.frameWidth,
      [tipWidth, camera]
    );

    const defaultStyle = useMemo(
      () => ({
        strokeColor: COLORS.WHITE,
        fillColor: COLORS.WHITE,
        fillOpacity: 1,
        ...style,
      }),
      [style]
    );

    // Generate arrow tip path
    const generateTipPath = (
      tip: [number, number],
      angle: number,
      length: number,
      width: number
    ): string => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const back = [tip[0] - length * cos, tip[1] - length * sin];
      const left = [
        back[0] - (width / 2) * sin,
        back[1] + (width / 2) * cos,
      ];
      const right = [
        back[0] + (width / 2) * sin,
        back[1] - (width / 2) * cos,
      ];

      if (tipStyle === 'stealth') {
        const mid = [
          back[0] - (length / 3) * cos,
          back[1] - (length / 3) * sin,
        ];
        return `M ${tip[0]} ${tip[1]} L ${left[0]} ${left[1]} L ${mid[0]} ${mid[1]} L ${right[0]} ${right[1]} Z`;
      }

      return `M ${tip[0]} ${tip[1]} L ${left[0]} ${left[1]} L ${right[0]} ${right[1]} Z`;
    };

    // Center position
    const centerPosition = useMemo((): Point3D => {
      return [
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2,
        0,
      ];
    }, [start, end]);

    return (
      <Mobject
        ref={ref}
        position={centerPosition}
        style={defaultStyle}
        {...rest}
        render={(renderProps) => {
          // Relative coordinates
          const relStart: [number, number] = [
            pixelStart[0] - (pixelStart[0] + pixelEnd[0]) / 2,
            pixelStart[1] - (pixelStart[1] + pixelEnd[1]) / 2,
          ];
          const relEnd: [number, number] = [
            pixelEnd[0] - (pixelStart[0] + pixelEnd[0]) / 2,
            pixelEnd[1] - (pixelStart[1] + pixelEnd[1]) / 2,
          ];

          return (
            <g
              id={renderProps.id}
              transform={renderProps.transform}
              style={renderProps.style}
            >
              {/* Line shaft */}
              <path
                d={`M ${relStart[0]} ${relStart[1]} L ${relEnd[0]} ${relEnd[1]}`}
                fill="none"
                stroke={renderProps.pathStyle.strokeColor}
                strokeOpacity={renderProps.pathStyle.strokeOpacity}
                strokeWidth={renderProps.pathStyle.strokeWidth}
                strokeLinecap="round"
              />

              {/* End tip */}
              {tipAtEnd && (
                <path
                  d={generateTipPath(relEnd, angle, tipLengthPx, tipWidthPx)}
                  fill={renderProps.pathStyle.fillColor}
                  fillOpacity={renderProps.pathStyle.fillOpacity}
                  stroke="none"
                />
              )}

              {/* Start tip */}
              {tipAtStart && (
                <path
                  d={generateTipPath(
                    relStart,
                    angle + Math.PI,
                    tipLengthPx,
                    tipWidthPx
                  )}
                  fill={renderProps.pathStyle.fillColor}
                  fillOpacity={renderProps.pathStyle.fillOpacity}
                  stroke="none"
                />
              )}
            </g>
          );
        }}
      />
    );
  }
);

Arrow.displayName = 'Arrow';

/**
 * DoubleArrow Component
 * Arrow with tips at both ends
 */
export const DoubleArrow = forwardRef<MobjectHandle, ArrowComponentProps>(
  (props, ref) => {
    return <Arrow ref={ref} tipAtStart tipAtEnd {...props} />;
  }
);

DoubleArrow.displayName = 'DoubleArrow';

/**
 * Vector Component
 * Arrow starting from origin
 */
export interface VectorProps extends Omit<ArrowComponentProps, 'start'> {
  direction?: Point2D | Point3D;
}

export const Vector = forwardRef<MobjectHandle, VectorProps>((props, ref) => {
  const { direction = [1, 0], end, ...rest } = props;

  const vectorEnd = end ?? [direction[0], direction[1]] as Point2D;

  return <Arrow ref={ref} start={[0, 0]} end={vectorEnd} {...rest} />;
});

Vector.displayName = 'Vector';

export default Line;
