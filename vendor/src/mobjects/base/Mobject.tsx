/**
 * ManimReact - Base Mobject Component
 * Foundation for all visual mathematical objects
 */

import React, {
  forwardRef,
  useImperativeHandle,
  useId,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useSceneStore } from '../../core/store';
import { mathToPixel, mathLengthToPixel } from '../../core/coordinates';
import {
  DEFAULT_STROKE_WIDTH,
  DEFAULT_STROKE_COLOR,
  DEFAULT_FILL_OPACITY,
  DEFAULT_STROKE_OPACITY,
} from '../../core/constants';
import type {
  MobjectProps,
  MobjectHandle,
  MobjectState,
  MobjectStyle,
  Point3D,
} from '../../core/types';

export interface BaseMobjectProps extends MobjectProps {
  /** SVG path data or children */
  pathData?: string;
  /** Custom render function */
  render?: (props: RenderProps) => React.ReactNode;
}

export interface RenderProps {
  id: string;
  transform: string;
  style: React.CSSProperties;
  pathStyle: MobjectStyle;
  pixelPosition: [number, number];
  pixelScale: [number, number];
}

/**
 * Normalize position to Point3D
 */
function normalizePosition(pos?: Point3D | [number, number]): Point3D {
  if (!pos) return [0, 0, 0];
  if (pos.length === 2) return [pos[0], pos[1], 0];
  return pos;
}

/**
 * Normalize scale to Point3D
 */
function normalizeScale(scale?: Point3D | number): Point3D {
  if (scale === undefined) return [1, 1, 1];
  if (typeof scale === 'number') return [scale, scale, scale];
  return scale;
}

/**
 * Normalize rotation to Point3D
 */
function normalizeRotation(rotation?: Point3D | number): Point3D {
  if (rotation === undefined) return [0, 0, 0];
  if (typeof rotation === 'number') return [0, 0, rotation];
  return rotation;
}

/**
 * Create initial mobject state
 */
function createInitialState(
  id: string,
  props: MobjectProps
): MobjectState {
  const position = normalizePosition(props.position as Point3D | [number, number]);
  const scale = normalizeScale(props.scale as Point3D | number);
  const rotation = normalizeRotation(props.rotation as Point3D | number);

  return {
    id,
    position,
    rotation,
    scale,
    opacity: props.opacity ?? 1,
    zIndex: props.zIndex ?? 0,
    visible: true,
    style: {
      fillColor: props.style?.fillColor ?? 'none',
      fillOpacity: props.style?.fillOpacity ?? DEFAULT_FILL_OPACITY,
      strokeColor: props.style?.strokeColor ?? DEFAULT_STROKE_COLOR,
      strokeOpacity: props.style?.strokeOpacity ?? DEFAULT_STROKE_OPACITY,
      strokeWidth: props.style?.strokeWidth ?? DEFAULT_STROKE_WIDTH,
    },
  };
}

/**
 * Base Mobject Component
 * All geometric primitives extend this component
 */
export const Mobject = forwardRef<MobjectHandle, BaseMobjectProps>(
  (props, ref) => {
    const {
      id: providedId,
      position,
      rotation,
      scale,
      opacity = 1,
      zIndex = 0,
      style,
      pathData,
      render,
      children,
    } = props;

    const generatedId = useId();
    const id = providedId ?? generatedId;

    const { addMobject, updateMobject, removeMobject, getMobject, camera } =
      useSceneStore();

    // Initialize mobject state
    useEffect(() => {
      const initialState = createInitialState(id, props);
      addMobject(id, initialState);

      return () => {
        removeMobject(id);
      };
    }, [id]);

    // Update state when props change
    useEffect(() => {
      const updates: Partial<MobjectState> = {};

      if (position !== undefined) {
        updates.position = normalizePosition(position as Point3D | [number, number]);
      }
      if (rotation !== undefined) {
        updates.rotation = normalizeRotation(rotation as Point3D | number);
      }
      if (scale !== undefined) {
        updates.scale = normalizeScale(scale as Point3D | number);
      }
      if (opacity !== undefined) {
        updates.opacity = opacity;
      }
      if (zIndex !== undefined) {
        updates.zIndex = zIndex;
      }
      if (style !== undefined) {
        const currentState = getMobject(id);
        updates.style = { ...currentState?.style, ...style };
      }

      if (Object.keys(updates).length > 0) {
        updateMobject(id, updates);
      }
    }, [position, rotation, scale, opacity, zIndex, style, id, updateMobject, getMobject]);

    // Get current state
    const state = getMobject(id);
    const currentState = state ?? createInitialState(id, props);

    // Calculate pixel coordinates
    const pixelPosition = useMemo(
      () => mathToPixel(currentState.position, camera),
      [currentState.position, camera]
    );

    const pixelScale = useMemo(
      () =>
        [
          mathLengthToPixel(currentState.scale[0], camera, 'x'),
          mathLengthToPixel(currentState.scale[1], camera, 'y'),
        ] as [number, number],
      [currentState.scale, camera]
    );

    // Build transform string
    const transform = useMemo(() => {
      const [px, py] = pixelPosition;
      const [sx, sy] = currentState.scale;
      const [, , rz] = currentState.rotation; // Only use Z rotation for 2D

      const parts: string[] = [];
      parts.push(`translate(${px}, ${py})`);

      if (rz !== 0) {
        parts.push(`rotate(${(rz * 180) / Math.PI})`);
      }

      if (sx !== 1 || sy !== 1) {
        parts.push(`scale(${sx}, ${sy})`);
      }

      return parts.join(' ');
    }, [pixelPosition, currentState.scale, currentState.rotation]);

    // Build CSS style
    const cssStyle = useMemo(
      (): React.CSSProperties => ({
        opacity: currentState.opacity,
        visibility: currentState.visible ? 'visible' : 'hidden',
      }),
      [currentState.opacity, currentState.visible]
    );

    // Imperative handle for animation control
    useImperativeHandle(
      ref,
      () => ({
        id,
        getState: () => getMobject(id) ?? currentState,
        setState: (updates: Partial<MobjectState>) => updateMobject(id, updates),

        moveTo: async (newPosition: Point3D, duration?: number) => {
          // For now, immediate move. Animation system will handle duration
          updateMobject(id, { position: newPosition });
        },

        shift: async (direction: Point3D, duration?: number) => {
          const current = getMobject(id);
          if (current) {
            const newPos: Point3D = [
              current.position[0] + direction[0],
              current.position[1] + direction[1],
              current.position[2] + direction[2],
            ];
            updateMobject(id, { position: newPos });
          }
        },

        scale: async (factor: number, duration?: number) => {
          const current = getMobject(id);
          if (current) {
            const newScale: Point3D = [
              current.scale[0] * factor,
              current.scale[1] * factor,
              current.scale[2] * factor,
            ];
            updateMobject(id, { scale: newScale });
          }
        },

        rotate: async (angle: number, _axis?: Point3D, duration?: number) => {
          const current = getMobject(id);
          if (current) {
            const newRotation: Point3D = [
              current.rotation[0],
              current.rotation[1],
              current.rotation[2] + angle,
            ];
            updateMobject(id, { rotation: newRotation });
          }
        },

        fadeIn: async (duration?: number) => {
          updateMobject(id, { opacity: 1, visible: true });
        },

        fadeOut: async (duration?: number) => {
          updateMobject(id, { opacity: 0 });
        },

        setStyle: (newStyle: Partial<MobjectStyle>) => {
          const current = getMobject(id);
          if (current) {
            updateMobject(id, { style: { ...current.style, ...newStyle } });
          }
        },
      }),
      [id, getMobject, updateMobject, currentState]
    );

    // Render props for custom rendering
    const renderProps: RenderProps = {
      id,
      transform,
      style: cssStyle,
      pathStyle: currentState.style,
      pixelPosition,
      pixelScale,
    };

    // Custom render function
    if (render) {
      return <>{render(renderProps)}</>;
    }

    // Default path rendering
    if (pathData) {
      return (
        <g
          id={id}
          transform={transform}
          style={cssStyle}
          data-mobject-type="path"
        >
          <path
            d={pathData}
            fill={currentState.style.fillColor ?? 'none'}
            fillOpacity={currentState.style.fillOpacity}
            stroke={currentState.style.strokeColor}
            strokeOpacity={currentState.style.strokeOpacity}
            strokeWidth={currentState.style.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {children}
        </g>
      );
    }

    // Render children only
    return (
      <g id={id} transform={transform} style={cssStyle} data-mobject-type="group">
        {children}
      </g>
    );
  }
);

Mobject.displayName = 'Mobject';

export default Mobject;
