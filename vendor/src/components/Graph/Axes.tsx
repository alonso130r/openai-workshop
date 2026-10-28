/**
 * ManimReact - Axes Component
 * Coordinate system visualization
 */

import React, { forwardRef, useMemo } from 'react';
import { Mobject } from '../../mobjects/base/Mobject';
import { mathToPixel, mathLengthToPixel } from '../../core/coordinates';
import { useSceneStore } from '../../core/store';
import { COLORS } from '../../core/constants';
import type { AxesProps, MobjectHandle, Point3D } from '../../core/types';
import { Line, Arrow } from '../../mobjects/geometry/Line';
import { Text } from '../../mobjects/text/Text';

export interface AxesComponentProps extends AxesProps {
  /** X-axis range [min, max, step] */
  xRange?: [number, number, number?];
  /** Y-axis range [min, max, step] */
  yRange?: [number, number, number?];
  /** Length of x-axis in math units */
  xLength?: number;
  /** Length of y-axis in math units */
  yLength?: number;
  /** Show axis numbers */
  includeNumbers?: boolean;
  /** Show tick marks */
  includeTicks?: boolean;
  /** Show arrow tips */
  includeArrows?: boolean;
  /** Include grid lines */
  includeGrid?: boolean;
  /** Axis line style */
  axisColor?: string;
  /** Tick length in math units */
  tickLength?: number;
  /** Number font size */
  numberFontSize?: number;
}

/**
 * Axes Component
 * Creates a coordinate system with x and y axes
 */
export const Axes = forwardRef<MobjectHandle, AxesComponentProps>(
  (props, ref) => {
    const {
      xRange = [-7, 7, 1],
      yRange = [-4, 4, 1],
      xLength,
      yLength,
      includeNumbers = true,
      includeTicks = true,
      includeArrows = true,
      includeGrid = false,
      axisColor = COLORS.WHITE,
      tickLength = 0.1,
      numberFontSize = 24,
      position = [0, 0, 0],
      style,
      ...rest
    } = props;

    const camera = useSceneStore((state) => state.camera);

    // Calculate axis bounds
    const [xMin, xMax, xStep = 1] = xRange;
    const [yMin, yMax, yStep = 1] = yRange;

    // Use provided lengths or calculate from range
    const actualXLength = xLength ?? (xMax - xMin);
    const actualYLength = yLength ?? (yMax - yMin);

    // Generate tick marks
    const xTicks = useMemo(() => {
      const ticks: number[] = [];
      for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
        if (x !== 0) ticks.push(x); // Skip origin
      }
      return ticks;
    }, [xMin, xMax, xStep]);

    const yTicks = useMemo(() => {
      const ticks: number[] = [];
      for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
        if (y !== 0) ticks.push(y); // Skip origin
      }
      return ticks;
    }, [yMin, yMax, yStep]);

    const defaultStyle = useMemo(
      () => ({
        strokeColor: axisColor,
        fillColor: axisColor,
        ...style,
      }),
      [axisColor, style]
    );

    // Convert to pixel coordinates
    const originPx = mathToPixel([0, 0, 0], camera);
    const tickLengthPx = mathLengthToPixel(tickLength, camera, 'y');

    return (
      <Mobject ref={ref} position={position} style={defaultStyle} {...rest}>
        {/* X-axis */}
        {includeArrows ? (
          <Arrow
            start={[xMin, 0]}
            end={[xMax, 0]}
            style={{ strokeColor: axisColor, fillColor: axisColor }}
          />
        ) : (
          <Line
            start={[xMin, 0]}
            end={[xMax, 0]}
            style={{ strokeColor: axisColor }}
          />
        )}

        {/* Y-axis */}
        {includeArrows ? (
          <Arrow
            start={[0, yMin]}
            end={[0, yMax]}
            style={{ strokeColor: axisColor, fillColor: axisColor }}
          />
        ) : (
          <Line
            start={[0, yMin]}
            end={[0, yMax]}
            style={{ strokeColor: axisColor }}
          />
        )}

        {/* X-axis ticks */}
        {includeTicks &&
          xTicks.map((x) => (
            <Line
              key={`x-tick-${x}`}
              start={[x, -tickLength]}
              end={[x, tickLength]}
              style={{ strokeColor: axisColor, strokeWidth: 2 }}
            />
          ))}

        {/* Y-axis ticks */}
        {includeTicks &&
          yTicks.map((y) => (
            <Line
              key={`y-tick-${y}`}
              start={[-tickLength, y]}
              end={[tickLength, y]}
              style={{ strokeColor: axisColor, strokeWidth: 2 }}
            />
          ))}

        {/* X-axis numbers */}
        {includeNumbers &&
          xTicks.map((x) => (
            <Text
              key={`x-num-${x}`}
              text={String(x)}
              position={[x, -tickLength * 3, 0]}
              fontSize={numberFontSize}
              style={{ fillColor: axisColor }}
            />
          ))}

        {/* Y-axis numbers */}
        {includeNumbers &&
          yTicks.map((y) => (
            <Text
              key={`y-num-${y}`}
              text={String(y)}
              position={[-tickLength * 4, y, 0]}
              fontSize={numberFontSize}
              style={{ fillColor: axisColor }}
            />
          ))}

        {/* Grid lines */}
        {includeGrid && (
          <>
            {xTicks.map((x) => (
              <Line
                key={`x-grid-${x}`}
                start={[x, yMin]}
                end={[x, yMax]}
                style={{
                  strokeColor: axisColor,
                  strokeOpacity: 0.2,
                  strokeWidth: 1,
                }}
              />
            ))}
            {yTicks.map((y) => (
              <Line
                key={`y-grid-${y}`}
                start={[xMin, y]}
                end={[xMax, y]}
                style={{
                  strokeColor: axisColor,
                  strokeOpacity: 0.2,
                  strokeWidth: 1,
                }}
              />
            ))}
          </>
        )}
      </Mobject>
    );
  }
);

Axes.displayName = 'Axes';

/**
 * NumberPlane Component
 * A full grid with labeled axes
 */
export interface NumberPlaneProps extends AxesComponentProps {
  /** Background line style */
  backgroundLineColor?: string;
  /** Faded lines style */
  fadedLineColor?: string;
  /** Line opacity for background */
  backgroundLineOpacity?: number;
}

export const NumberPlane = forwardRef<MobjectHandle, NumberPlaneProps>(
  (props, ref) => {
    const {
      backgroundLineColor = COLORS.BLUE,
      fadedLineColor = COLORS.BLUE,
      backgroundLineOpacity = 0.3,
      ...rest
    } = props;

    return <Axes ref={ref} includeGrid {...rest} />;
  }
);

NumberPlane.displayName = 'NumberPlane';

export default Axes;
