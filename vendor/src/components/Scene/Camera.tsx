/**
 * ManimReact - Camera Component
 * Camera controls and transformations
 */

import React, { forwardRef, useEffect, useMemo } from 'react';
import { useSceneStore } from '../../core/store';
import { mathToPixel } from '../../core/coordinates';
import type { Point3D, CameraConfig } from '../../core/types';

export interface CameraProps {
  /** Camera position (where camera is looking at) */
  position?: Point3D;
  /** Zoom level */
  zoom?: number;
  /** Rotation in radians */
  rotation?: number;
  /** Children (mobjects to render) */
  children?: React.ReactNode;
}

/**
 * Camera Component
 * Wraps content with camera transformations
 */
export const Camera = forwardRef<SVGGElement, CameraProps>((props, ref) => {
  const { position = [0, 0, 0], zoom = 1, rotation = 0, children } = props;

  const camera = useSceneStore((s) => s.camera);
  const setCamera = useSceneStore((s) => s.setCamera);

  // Update camera state when props change
  useEffect(() => {
    setCamera({
      position,
      zoom,
      rotation: [0, 0, rotation],
    });
  }, [position, zoom, rotation, setCamera]);

  // Calculate transform
  const transform = useMemo(() => {
    const centerX = camera.pixelWidth / 2;
    const centerY = camera.pixelHeight / 2;

    // Apply camera offset
    const offsetX = -(position[0] * camera.pixelWidth) / camera.frameWidth;
    const offsetY = (position[1] * camera.pixelHeight) / camera.frameHeight;

    const parts: string[] = [];

    // Translate to center, apply transforms, translate back
    parts.push(`translate(${centerX}, ${centerY})`);

    if (zoom !== 1) {
      parts.push(`scale(${zoom})`);
    }

    if (rotation !== 0) {
      parts.push(`rotate(${(rotation * 180) / Math.PI})`);
    }

    parts.push(`translate(${offsetX}, ${offsetY})`);
    parts.push(`translate(${-centerX}, ${-centerY})`);

    return parts.join(' ');
  }, [position, zoom, rotation, camera]);

  return (
    <g ref={ref} id="camera" transform={transform}>
      {children}
    </g>
  );
});

Camera.displayName = 'Camera';

/**
 * MovingCamera - Camera with animation support
 */
export interface MovingCameraProps extends CameraProps {
  /** Follow a specific mobject */
  follow?: string;
  /** Frame width (zoom to fit) */
  frameWidth?: number;
  /** Frame height (zoom to fit) */
  frameHeight?: number;
}

export const MovingCamera = forwardRef<SVGGElement, MovingCameraProps>(
  (props, ref) => {
    const { follow, frameWidth, frameHeight, ...rest } = props;

    const getMobject = useSceneStore((s) => s.getMobject);

    // Calculate position to follow mobject
    const position = useMemo(() => {
      if (follow) {
        const mobject = getMobject(follow);
        if (mobject) {
          return mobject.position;
        }
      }
      return rest.position ?? [0, 0, 0];
    }, [follow, getMobject, rest.position]);

    return <Camera ref={ref} position={position} {...rest} />;
  }
);

MovingCamera.displayName = 'MovingCamera';

/**
 * Hook for camera controls
 */
export function useCamera() {
  const camera = useSceneStore((s) => s.camera);
  const setCamera = useSceneStore((s) => s.setCamera);
  const moveCameraTo = useSceneStore((s) => s.moveCameraTo);
  const zoomCamera = useSceneStore((s) => s.zoomCamera);
  const rotateCamera = useSceneStore((s) => s.rotateCamera);

  const frameCenter = useCallback((mobjectId: string) => {
    const getMobject = useSceneStore.getState().getMobject;
    const mobject = getMobject(mobjectId);
    if (mobject) {
      moveCameraTo(mobject.position);
    }
  }, [moveCameraTo]);

  const zoomToFit = useCallback(
    (mobjectIds: string[], margin: number = 0.5) => {
      // Calculate bounding box of all mobjects and zoom accordingly
      // Simplified - just zoom out
      zoomCamera(0.8);
    },
    [zoomCamera]
  );

  return {
    camera,
    setCamera,
    moveTo: moveCameraTo,
    zoom: zoomCamera,
    rotate: rotateCamera,
    frameCenter,
    zoomToFit,
  };
}

// Helper import for useCallback
import { useCallback } from 'react';

export default Camera;
