/**
 * ManimReact - Scene Context
 * React context for scene state and configuration
 */

import React, { createContext, useContext, useRef, useEffect, useMemo, useCallback } from 'react';
import { useSceneStore, createSceneStore } from '../../core/store';
import type {
  SceneState,
  CameraConfig,
  ExportConfig,
  ExportProgressCallback,
  SceneHandle,
  MobjectState,
} from '../../core/types';
import {
  DEFAULT_FRAME_WIDTH,
  DEFAULT_FRAME_HEIGHT,
  DEFAULT_PIXEL_WIDTH,
  DEFAULT_PIXEL_HEIGHT,
  DEFAULT_FPS,
  COLORS,
} from '../../core/constants';

export interface SceneContextValue {
  // Scene state
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
  fps: number;

  // Playback controls
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;

  // Scene handle
  sceneRef: React.RefObject<SceneHandle>;

  // Camera config
  camera: CameraConfig;
}

const SceneContext = createContext<SceneContextValue | null>(null);

export interface SceneProviderProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  fps?: number;
  backgroundColor?: string;
  frameWidth?: number;
  frameHeight?: number;
}

/**
 * Scene Provider
 * Provides scene context to all child components
 */
export function SceneProvider({
  children,
  width = DEFAULT_PIXEL_WIDTH,
  height = DEFAULT_PIXEL_HEIGHT,
  fps = DEFAULT_FPS,
  backgroundColor = COLORS.BACKGROUND,
  frameWidth = DEFAULT_FRAME_WIDTH,
  frameHeight = DEFAULT_FRAME_HEIGHT,
}: SceneProviderProps) {
  const sceneRef = useRef<SceneHandle>(null);

  // Get store methods
  const play = useSceneStore((s) => s.play);
  const pause = useSceneStore((s) => s.pause);
  const stop = useSceneStore((s) => s.stop);
  const seek = useSceneStore((s) => s.seek);
  const setCamera = useSceneStore((s) => s.setCamera);
  const setFps = useSceneStore((s) => s.setFps);
  const isPlaying = useSceneStore((s) => s.isPlaying);
  const currentTime = useSceneStore((s) => s.currentTime);
  const totalDuration = useSceneStore((s) => s.totalDuration);
  const camera = useSceneStore((s) => s.camera);

  // Initialize camera config
  useEffect(() => {
    setCamera({
      pixelWidth: width,
      pixelHeight: height,
      frameWidth,
      frameHeight,
      backgroundColor,
    });
    setFps(fps);
  }, [width, height, fps, backgroundColor, frameWidth, frameHeight, setCamera, setFps]);

  const value = useMemo(
    () => ({
      isPlaying,
      currentTime,
      totalDuration,
      fps,
      play,
      pause,
      stop,
      seek,
      sceneRef,
      camera,
    }),
    [isPlaying, currentTime, totalDuration, fps, play, pause, stop, seek, camera]
  );

  return (
    <SceneContext.Provider value={value}>{children}</SceneContext.Provider>
  );
}

/**
 * Hook to access scene context
 */
export function useSceneContext(): SceneContextValue {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error('useSceneContext must be used within a SceneProvider');
  }
  return context;
}

/**
 * Hook for scene playback controls
 */
export function usePlayback() {
  const { play, pause, stop, seek, isPlaying, currentTime, totalDuration } =
    useSceneContext();

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const restart = useCallback(() => {
    stop();
    play();
  }, [stop, play]);

  return {
    play,
    pause,
    stop,
    seek,
    toggle,
    restart,
    isPlaying,
    currentTime,
    totalDuration,
  };
}

/**
 * Hook for scene time tracking
 */
export function useTime() {
  const currentTime = useSceneStore((s) => s.currentTime);
  const totalDuration = useSceneStore((s) => s.totalDuration);
  const fps = useSceneStore((s) => s.fps);
  const currentFrame = useSceneStore((s) => s.currentFrame);

  return {
    currentTime,
    totalDuration,
    fps,
    currentFrame,
    progress: totalDuration > 0 ? currentTime / totalDuration : 0,
  };
}
