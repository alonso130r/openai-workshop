/**
 * ManimReact - Rectangle Component
 * Rectangles, squares, and rounded rectangles
 */

import React, { forwardRef, useMemo } from 'react';
import { Mobject } from '../base/Mobject';
import { mathLengthToPixel } from '../../core/coordinates';
import { useSceneStore } from '../../core/store';
import { COLORS } from '../../core/constants';
import type { RectangleProps, MobjectHandle } from '../../core/types';

export interface RectangleComponentProps extends RectangleProps {
  /** Width in math units (default: 4) */
  width?: number;
  /** Height in math units (default: 2) */
  height?: number;
  /** Corner radius for rounded rectangles */
  cornerRadius?: number;
}

/**
 * Generate rectangle path
 */
function generateRectPath(
  width: number,
  height: number,
  cornerRadius: number = 0
): string {
  const halfW = width / 2;
  const halfH = height / 2;

  if (cornerRadius === 0) {
    // Simple rectangle
    return `
      M ${-halfW} ${-halfH}
      L ${halfW} ${-halfH}
      L ${halfW} ${halfH}
      L ${-halfW} ${halfH}
      Z
    `;
  }

  // Rounded rectangle
  const r = Math.min(cornerRadius, halfW, halfH);

  return `
    M ${-halfW + r} ${-halfH}
    L ${halfW - r} ${-halfH}
    Q ${halfW} ${-halfH} ${halfW} ${-halfH + r}
    L ${halfW} ${halfH - r}
    Q ${halfW} ${halfH} ${halfW - r} ${halfH}
    L ${-halfW + r} ${halfH}
    Q ${-halfW} ${halfH} ${-halfW} ${halfH - r}
    L ${-halfW} ${-halfH + r}
    Q ${-halfW} ${-halfH} ${-halfW + r} ${-halfH}
    Z
  `;
}

/**
 * Rectangle Component
 */
export const Rectangle = forwardRef<MobjectHandle, RectangleComponentProps>(
  (props, ref) => {
    const {
      width = 4,
      height = 2,
      cornerRadius = 0,
      style,
      ...rest
    } = props;

    const camera = useSceneStore((state) => state.camera);

    // Convert dimensions to pixels
    const pixelWidth = useMemo(
      () => mathLengthToPixel(width, camera, 'x'),
      [width, camera]
    );

    const pixelHeight = useMemo(
      () => mathLengthToPixel(height, camera, 'y'),
      [height, camera]
    );

    const pixelCornerRadius = useMemo(
      () => mathLengthToPixel(cornerRadius, camera, 'x'),
      [cornerRadius, camera]
    );

    // Generate path
    const pathData = useMemo(
      () => generateRectPath(pixelWidth, pixelHeight, pixelCornerRadius),
      [pixelWidth, pixelHeight, pixelCornerRadius]
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
  }
);

Rectangle.displayName = 'Rectangle';

/**
 * Square Component
 * A rectangle with equal width and height
 */
export interface SquareProps extends Omit<RectangleComponentProps, 'width' | 'height'> {
  /** Side length in math units (default: 2) */
  sideLength?: number;
}

export const Square = forwardRef<MobjectHandle, SquareProps>((props, ref) => {
  const { sideLength = 2, ...rest } = props;

  return <Rectangle ref={ref} width={sideLength} height={sideLength} {...rest} />;
});

Square.displayName = 'Square';

/**
 * RoundedRectangle Component
 * A rectangle with rounded corners
 */
export const RoundedRectangle = forwardRef<MobjectHandle, RectangleComponentProps>(
  (props, ref) => {
    const { cornerRadius = 0.25, ...rest } = props;

    return <Rectangle ref={ref} cornerRadius={cornerRadius} {...rest} />;
  }
);

RoundedRectangle.displayName = 'RoundedRectangle';

export default Rectangle;
