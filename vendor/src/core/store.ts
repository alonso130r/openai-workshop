/**
 * ManimReact - Scene Store
 * Zustand-based state management for scene state
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  SceneState,
  MobjectState,
  AnimationState,
  CameraConfig,
  Point3D,
  AnimationPhase,
} from './types';
import {
  DEFAULT_FRAME_WIDTH,
  DEFAULT_FRAME_HEIGHT,
  DEFAULT_PIXEL_WIDTH,
  DEFAULT_PIXEL_HEIGHT,
  DEFAULT_FPS,
  COLORS,
} from './constants';

const defaultCameraConfig: CameraConfig = {
  frameWidth: DEFAULT_FRAME_WIDTH,
  frameHeight: DEFAULT_FRAME_HEIGHT,
  pixelWidth: DEFAULT_PIXEL_WIDTH,
  pixelHeight: DEFAULT_PIXEL_HEIGHT,
  backgroundColor: COLORS.BACKGROUND,
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  zoom: 1,
};

interface SceneStore extends SceneState {
  // Playback actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setFps: (fps: number) => void;

  // Time management
  tick: (deltaTime: number) => void;
  setCurrentTime: (time: number) => void;
  setTotalDuration: (duration: number) => void;

  // Mobject management
  addMobject: (id: string, state: MobjectState) => void;
  updateMobject: (id: string, updates: Partial<MobjectState>) => void;
  removeMobject: (id: string) => void;
  getMobject: (id: string) => MobjectState | undefined;
  clearMobjects: () => void;

  // Animation management
  addAnimation: (animation: AnimationState) => void;
  updateAnimation: (id: string, updates: Partial<AnimationState>) => void;
  removeAnimation: (id: string) => void;
  getActiveAnimations: () => AnimationState[];
  setAnimationPhase: (id: string, phase: AnimationPhase) => void;

  // Camera management
  setCamera: (config: Partial<CameraConfig>) => void;
  moveCameraTo: (position: Point3D) => void;
  zoomCamera: (zoom: number) => void;
  rotateCamera: (rotation: Point3D) => void;

  // Reset
  reset: () => void;
}

const initialState: SceneState = {
  currentTime: 0,
  totalDuration: 0,
  isPlaying: false,
  fps: DEFAULT_FPS,
  currentFrame: 0,
  mobjects: new Map(),
  animations: [],
  camera: defaultCameraConfig,
};

export const useSceneStore = create<SceneStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Playback actions
    play: () => set({ isPlaying: true }),

    pause: () => set({ isPlaying: false }),

    stop: () =>
      set({
        isPlaying: false,
        currentTime: 0,
        currentFrame: 0,
      }),

    seek: (time: number) => {
      const { totalDuration, fps } = get();
      const clampedTime = Math.max(0, Math.min(time, totalDuration));
      set({
        currentTime: clampedTime,
        currentFrame: Math.floor(clampedTime * fps),
      });
    },

    setFps: (fps: number) => set({ fps }),

    // Time management
    tick: (deltaTime: number) => {
      const { currentTime, totalDuration, isPlaying, fps } = get();
      if (!isPlaying) return;

      const newTime = currentTime + deltaTime;
      if (newTime >= totalDuration) {
        set({
          currentTime: totalDuration,
          currentFrame: Math.floor(totalDuration * fps),
          isPlaying: false,
        });
      } else {
        set({
          currentTime: newTime,
          currentFrame: Math.floor(newTime * fps),
        });
      }
    },

    setCurrentTime: (time: number) => {
      const { fps } = get();
      set({
        currentTime: time,
        currentFrame: Math.floor(time * fps),
      });
    },

    setTotalDuration: (duration: number) => set({ totalDuration: duration }),

    // Mobject management
    addMobject: (id: string, state: MobjectState) => {
      const { mobjects } = get();
      const newMobjects = new Map(mobjects);
      newMobjects.set(id, state);
      set({ mobjects: newMobjects });
    },

    updateMobject: (id: string, updates: Partial<MobjectState>) => {
      const { mobjects } = get();
      const existing = mobjects.get(id);
      if (existing) {
        const newMobjects = new Map(mobjects);
        newMobjects.set(id, { ...existing, ...updates });
        set({ mobjects: newMobjects });
      }
    },

    removeMobject: (id: string) => {
      const { mobjects } = get();
      const newMobjects = new Map(mobjects);
      newMobjects.delete(id);
      set({ mobjects: newMobjects });
    },

    getMobject: (id: string) => {
      return get().mobjects.get(id);
    },

    clearMobjects: () => set({ mobjects: new Map() }),

    // Animation management
    addAnimation: (animation: AnimationState) => {
      const { animations } = get();
      set({ animations: [...animations, animation] });
    },

    updateAnimation: (id: string, updates: Partial<AnimationState>) => {
      const { animations } = get();
      set({
        animations: animations.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        ),
      });
    },

    removeAnimation: (id: string) => {
      const { animations } = get();
      set({ animations: animations.filter((a) => a.id !== id) });
    },

    getActiveAnimations: () => {
      const { animations, currentTime } = get();
      return animations.filter(
        (a) =>
          a.phase === 'running' ||
          (a.startTime <= currentTime && a.startTime + a.duration > currentTime)
      );
    },

    setAnimationPhase: (id: string, phase: AnimationPhase) => {
      const { animations } = get();
      set({
        animations: animations.map((a) =>
          a.id === id ? { ...a, phase } : a
        ),
      });
    },

    // Camera management
    setCamera: (config: Partial<CameraConfig>) => {
      const { camera } = get();
      set({ camera: { ...camera, ...config } });
    },

    moveCameraTo: (position: Point3D) => {
      const { camera } = get();
      set({ camera: { ...camera, position } });
    },

    zoomCamera: (zoom: number) => {
      const { camera } = get();
      set({ camera: { ...camera, zoom } });
    },

    rotateCamera: (rotation: Point3D) => {
      const { camera } = get();
      set({ camera: { ...camera, rotation } });
    },

    // Reset
    reset: () => set(initialState),
  }))
);

// Selector hooks for performance
export const useCurrentTime = () => useSceneStore((s) => s.currentTime);
export const useIsPlaying = () => useSceneStore((s) => s.isPlaying);
export const useFps = () => useSceneStore((s) => s.fps);
export const useCamera = () => useSceneStore((s) => s.camera);
export const useMobjects = () => useSceneStore((s) => s.mobjects);
export const useAnimations = () => useSceneStore((s) => s.animations);

// Create a scoped store for individual scenes
export const createSceneStore = () => {
  return create<SceneStore>()(
    subscribeWithSelector((set, get) => ({
      ...initialState,
      // ... same implementation as above
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      stop: () => set({ isPlaying: false, currentTime: 0, currentFrame: 0 }),
      seek: (time: number) => {
        const { totalDuration, fps } = get();
        const clampedTime = Math.max(0, Math.min(time, totalDuration));
        set({ currentTime: clampedTime, currentFrame: Math.floor(clampedTime * fps) });
      },
      setFps: (fps: number) => set({ fps }),
      tick: (deltaTime: number) => {
        const { currentTime, totalDuration, isPlaying, fps } = get();
        if (!isPlaying) return;
        const newTime = currentTime + deltaTime;
        if (newTime >= totalDuration) {
          set({ currentTime: totalDuration, currentFrame: Math.floor(totalDuration * fps), isPlaying: false });
        } else {
          set({ currentTime: newTime, currentFrame: Math.floor(newTime * fps) });
        }
      },
      setCurrentTime: (time: number) => {
        const { fps } = get();
        set({ currentTime: time, currentFrame: Math.floor(time * fps) });
      },
      setTotalDuration: (duration: number) => set({ totalDuration: duration }),
      addMobject: (id: string, state: MobjectState) => {
        const { mobjects } = get();
        const newMobjects = new Map(mobjects);
        newMobjects.set(id, state);
        set({ mobjects: newMobjects });
      },
      updateMobject: (id: string, updates: Partial<MobjectState>) => {
        const { mobjects } = get();
        const existing = mobjects.get(id);
        if (existing) {
          const newMobjects = new Map(mobjects);
          newMobjects.set(id, { ...existing, ...updates });
          set({ mobjects: newMobjects });
        }
      },
      removeMobject: (id: string) => {
        const { mobjects } = get();
        const newMobjects = new Map(mobjects);
        newMobjects.delete(id);
        set({ mobjects: newMobjects });
      },
      getMobject: (id: string) => get().mobjects.get(id),
      clearMobjects: () => set({ mobjects: new Map() }),
      addAnimation: (animation: AnimationState) => {
        const { animations } = get();
        set({ animations: [...animations, animation] });
      },
      updateAnimation: (id: string, updates: Partial<AnimationState>) => {
        const { animations } = get();
        set({ animations: animations.map((a) => (a.id === id ? { ...a, ...updates } : a)) });
      },
      removeAnimation: (id: string) => {
        const { animations } = get();
        set({ animations: animations.filter((a) => a.id !== id) });
      },
      getActiveAnimations: () => {
        const { animations, currentTime } = get();
        return animations.filter((a) => a.phase === 'running' || (a.startTime <= currentTime && a.startTime + a.duration > currentTime));
      },
      setAnimationPhase: (id: string, phase: AnimationPhase) => {
        const { animations } = get();
        set({ animations: animations.map((a) => (a.id === id ? { ...a, phase } : a)) });
      },
      setCamera: (config: Partial<CameraConfig>) => {
        const { camera } = get();
        set({ camera: { ...camera, ...config } });
      },
      moveCameraTo: (position: Point3D) => {
        const { camera } = get();
        set({ camera: { ...camera, position } });
      },
      zoomCamera: (zoom: number) => {
        const { camera } = get();
        set({ camera: { ...camera, zoom } });
      },
      rotateCamera: (rotation: Point3D) => {
        const { camera } = get();
        set({ camera: { ...camera, rotation } });
      },
      reset: () => set(initialState),
    }))
  );
};
