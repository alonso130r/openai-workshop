/**
 * ManimReact - Animation Hooks
 * React hooks for animation control
 */

import { useCallback, useRef, useEffect, useMemo, useState } from 'react';
import { useSceneStore } from '../core/store';
import {
  AnimationEngine,
  getAnimationEngine,
  createScopedEngine,
  destroyScopedEngine,
  getScopedEngine,
  TimelinePosition,
  AnimationOptions,
} from './engine';
import * as animations from './animations';
import type { MobjectState, Point3D, Color } from '../core/types';

/**
 * Hook to get the animation engine (legacy singleton)
 */
export function useAnimationEngine(): AnimationEngine {
  const getMobject = useSceneStore((s) => s.getMobject);
  const updateMobject = useSceneStore((s) => s.updateMobject);

  return useMemo(
    () => getAnimationEngine(getMobject, updateMobject),
    [getMobject, updateMobject]
  );
}

/**
 * Hook to get or create a scoped animation engine for a specific scene
 */
export function useScopedAnimationEngine(sceneId: string): AnimationEngine {
  const getMobject = useSceneStore((s) => s.getMobject);
  const updateMobject = useSceneStore((s) => s.updateMobject);
  const subscribe = useSceneStore.subscribe;

  const engine = useMemo(() => {
    const existing = getScopedEngine(sceneId);
    if (existing) return existing;
    return createScopedEngine(sceneId, getMobject, updateMobject);
  }, [sceneId, getMobject, updateMobject]);

  // Subscribe to isPlaying changes
  useEffect(() => {
    const unsubscribe = subscribe(
      (state) => state.isPlaying,
      (isPlaying) => {
        if (isPlaying) {
          engine.playMasterTimeline();
        } else {
          engine.pauseMasterTimeline();
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [engine, subscribe]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      destroyScopedEngine(sceneId);
    };
  }, [sceneId]);

  return engine;
}

/**
 * Animation type names
 */
export type AnimationType =
  | 'create'
  | 'fadeIn'
  | 'fadeOut'
  | 'moveTo'
  | 'rotate'
  | 'scale'
  | 'growFromCenter'
  | 'shrinkToCenter'
  | 'write'
  | 'indicate'
  | 'transform';

/**
 * Hook for triggered animations that only play when trigger becomes true
 * Supports replay via reset() function
 */
export function useTriggeredAnimation(
  targetId: string | undefined,
  trigger: boolean,
  animationType: AnimationType,
  options: AnimationOptions & {
    position?: Point3D;
    targetState?: Partial<MobjectState>;
    angle?: number;
    factor?: number;
  } = {}
) {
  const engine = useAnimationEngine();
  const hasPlayedRef = useRef(false);
  const initialCapturedRef = useRef(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Capture initial state on first render when targetId is available
  useEffect(() => {
    if (targetId && !initialCapturedRef.current) {
      engine.captureInitialState(targetId);
      initialCapturedRef.current = true;
    }
  }, [targetId, engine]);

  // Play animation when trigger becomes true
  useEffect(() => {
    if (!trigger || !targetId || hasPlayedRef.current) return;

    hasPlayedRef.current = true;
    setIsAnimating(true);

    const { position, targetState, angle, factor, ...animOptions } = options;

    let animationId: string;
    switch (animationType) {
      case 'create':
        animationId = animations.create(engine, targetId, animOptions);
        break;
      case 'fadeIn':
        animationId = animations.fadeIn(engine, targetId, animOptions);
        break;
      case 'fadeOut':
        animationId = animations.fadeOut(engine, targetId, animOptions);
        break;
      case 'moveTo':
        if (!position) {
          console.warn('moveTo requires a position');
          return;
        }
        animationId = animations.moveTo(engine, targetId, position, animOptions);
        break;
      case 'rotate':
        animationId = animations.rotate(engine, targetId, angle ?? Math.PI, animOptions);
        break;
      case 'scale':
        animationId = animations.scaleInPlace(engine, targetId, factor ?? 2, animOptions);
        break;
      case 'growFromCenter':
        animationId = animations.growFromCenter(engine, targetId, animOptions);
        break;
      case 'shrinkToCenter':
        animationId = animations.shrinkToCenter(engine, targetId, animOptions);
        break;
      case 'write':
        animationId = animations.write(engine, targetId, animOptions);
        break;
      case 'indicate':
        animationId = animations.indicate(engine, targetId, animOptions);
        break;
      case 'transform':
        if (!targetState) {
          console.warn('transform requires a targetState');
          return;
        }
        animationId = animations.transform(engine, targetId, targetState, animOptions);
        break;
      default:
        console.warn(`Unknown animation type: ${animationType}`);
        return;
    }

    engine.play(animationId).then(() => {
      setIsAnimating(false);
    });
  }, [trigger, targetId, animationType, options, engine]);

  // Reset function to allow replay
  const reset = useCallback(() => {
    if (targetId) {
      engine.resetToInitialState(targetId);
      hasPlayedRef.current = false;
      setIsAnimating(false);
    }
  }, [targetId, engine]);

  return { reset, isAnimating };
}

/**
 * Hook for building and playing animation sequences on a master timeline
 */
export function useMasterTimeline(sceneId?: string) {
  const engine = sceneId ? useScopedAnimationEngine(sceneId) : useAnimationEngine();
  const builtRef = useRef(false);

  const addAnimation = useCallback(
    (
      type: AnimationType,
      targetId: string,
      options?: AnimationOptions & { position?: Point3D; targetState?: Partial<MobjectState>; angle?: number; factor?: number },
      timelinePosition?: TimelinePosition
    ) => {
      const { position, targetState, angle, factor, ...animOptions } = options ?? {};

      let animationId: string;
      switch (type) {
        case 'create':
          animationId = animations.create(engine, targetId, animOptions);
          break;
        case 'fadeIn':
          animationId = animations.fadeIn(engine, targetId, animOptions);
          break;
        case 'fadeOut':
          animationId = animations.fadeOut(engine, targetId, animOptions);
          break;
        case 'moveTo':
          animationId = animations.moveTo(engine, targetId, position ?? [0, 0, 0], animOptions);
          break;
        case 'rotate':
          animationId = animations.rotate(engine, targetId, angle ?? Math.PI, animOptions);
          break;
        case 'scale':
          animationId = animations.scaleInPlace(engine, targetId, factor ?? 2, animOptions);
          break;
        case 'growFromCenter':
          animationId = animations.growFromCenter(engine, targetId, animOptions);
          break;
        case 'shrinkToCenter':
          animationId = animations.shrinkToCenter(engine, targetId, animOptions);
          break;
        case 'write':
          animationId = animations.write(engine, targetId, animOptions);
          break;
        case 'indicate':
          animationId = animations.indicate(engine, targetId, animOptions);
          break;
        case 'transform':
          animationId = animations.transform(engine, targetId, targetState ?? {}, animOptions);
          break;
        default:
          throw new Error(`Unknown animation type: ${type}`);
      }

      engine.addToMasterTimeline(animationId, timelinePosition);
      return animationId;
    },
    [engine]
  );

  const addLabel = useCallback(
    (name: string, position?: TimelinePosition) => {
      engine.addLabel(name, position);
    },
    [engine]
  );

  const play = useCallback(() => {
    engine.playMasterTimeline();
  }, [engine]);

  const pause = useCallback(() => {
    engine.pauseMasterTimeline();
  }, [engine]);

  const stop = useCallback(() => {
    engine.stopMasterTimeline();
  }, [engine]);

  const seek = useCallback(
    (time: number) => {
      engine.seekMasterTimeline(time);
    },
    [engine]
  );

  const seekToLabel = useCallback(
    (label: string) => {
      engine.seekToLabel(label);
    },
    [engine]
  );

  const reset = useCallback(() => {
    engine.resetMasterTimeline();
    builtRef.current = false;
  }, [engine]);

  const getDuration = useCallback(() => {
    return engine.getMasterTimelineDuration();
  }, [engine]);

  const getTime = useCallback(() => {
    return engine.getMasterTimelineTime();
  }, [engine]);

  const getProgress = useCallback(() => {
    return engine.getMasterTimelineProgress();
  }, [engine]);

  return {
    engine,
    addAnimation,
    addLabel,
    play,
    pause,
    stop,
    seek,
    seekToLabel,
    reset,
    getDuration,
    getTime,
    getProgress,
    isBuilt: builtRef.current,
    markBuilt: () => { builtRef.current = true; },
  };
}

/**
 * Hook for basic animation control on a mobject
 */
export function useAnimation(targetId: string) {
  const engine = useAnimationEngine();

  const create = useCallback(
    (options?: AnimationOptions) => {
      const id = animations.create(engine, targetId, options);
      return engine.play(id);
    },
    [engine, targetId]
  );

  const fadeIn = useCallback(
    (options?: AnimationOptions & { direction?: Point3D }) => {
      const id = animations.fadeIn(engine, targetId, options);
      return engine.play(id);
    },
    [engine, targetId]
  );

  const fadeOut = useCallback(
    (options?: AnimationOptions & { direction?: Point3D }) => {
      const id = animations.fadeOut(engine, targetId, options);
      return engine.play(id);
    },
    [engine, targetId]
  );

  const moveTo = useCallback(
    (position: Point3D, options?: AnimationOptions) => {
      const id = animations.moveTo(engine, targetId, position, options);
      return engine.play(id);
    },
    [engine, targetId]
  );

  const rotate = useCallback(
    (angle: number, options?: AnimationOptions & { axis?: Point3D }) => {
      const id = animations.rotate(engine, targetId, angle, options);
      return engine.play(id);
    },
    [engine, targetId]
  );

  const scale = useCallback(
    (factor: number, options?: AnimationOptions) => {
      const id = animations.scaleInPlace(engine, targetId, factor, options);
      return engine.play(id);
    },
    [engine, targetId]
  );

  const indicate = useCallback(
    (options?: AnimationOptions & { color?: Color; scaleFactor?: number }) => {
      const id = animations.indicate(engine, targetId, options);
      return engine.play(id);
    },
    [engine, targetId]
  );

  const transform = useCallback(
    (targetState: Partial<MobjectState>, options?: AnimationOptions) => {
      const id = animations.transform(engine, targetId, targetState, options);
      return engine.play(id);
    },
    [engine, targetId]
  );

  const write = useCallback(
    (options?: AnimationOptions) => {
      const id = animations.write(engine, targetId, options);
      return engine.play(id);
    },
    [engine, targetId]
  );

  const growFromCenter = useCallback(
    (options?: AnimationOptions) => {
      const id = animations.growFromCenter(engine, targetId, options);
      return engine.play(id);
    },
    [engine, targetId]
  );

  const shrinkToCenter = useCallback(
    (options?: AnimationOptions) => {
      const id = animations.shrinkToCenter(engine, targetId, options);
      return engine.play(id);
    },
    [engine, targetId]
  );

  return {
    create,
    fadeIn,
    fadeOut,
    moveTo,
    rotate,
    scale,
    indicate,
    transform,
    write,
    growFromCenter,
    shrinkToCenter,
  };
}

/**
 * Hook for timeline-based animation sequences
 */
export function useTimeline() {
  const engine = useAnimationEngine();
  const animationQueue = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  const add = useCallback(
    (
      type: keyof typeof animations,
      targetId: string,
      ...args: any[]
    ) => {
      const animFn = animations[type] as Function;
      if (animFn) {
        const id = animFn(engine, targetId, ...args);
        animationQueue.current.push(id);
        return id;
      }
      throw new Error(`Unknown animation type: ${type}`);
    },
    [engine]
  );

  const play = useCallback(async () => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;

    for (const id of animationQueue.current) {
      await engine.play(id);
    }

    isPlayingRef.current = false;
    animationQueue.current = [];
  }, [engine]);

  const playAll = useCallback(async () => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;

    await engine.playAll(animationQueue.current);

    isPlayingRef.current = false;
    animationQueue.current = [];
  }, [engine]);

  const clear = useCallback(() => {
    animationQueue.current = [];
  }, []);

  const wait = useCallback(async (duration: number) => {
    await animations.wait(duration);
  }, []);

  return {
    add,
    play,
    playAll,
    clear,
    wait,
    animations: animationQueue.current,
  };
}

/**
 * Hook for playing animation on mount
 */
export function usePlayOnMount(
  targetId: string,
  animationType: 'create' | 'fadeIn' | 'write' | 'growFromCenter' = 'create',
  options?: AnimationOptions
) {
  const anim = useAnimation(targetId);

  useEffect(() => {
    const timeout = setTimeout(() => {
      anim[animationType](options);
    }, 100); // Small delay to ensure mobject is mounted

    return () => clearTimeout(timeout);
  }, []);
}

/**
 * Hook for sequential animation playback (like Manim's Scene.play)
 */
export function useScene() {
  const engine = useAnimationEngine();
  const isPlayingRef = useRef(false);
  const queueRef = useRef<Array<() => Promise<void>>>([]);

  const play = useCallback(
    async (...animationFns: Array<() => string>) => {
      const ids = animationFns.map((fn) => fn());
      await engine.playAll(ids);
    },
    [engine]
  );

  const playSequential = useCallback(
    async (...animationFns: Array<() => string>) => {
      for (const fn of animationFns) {
        const id = fn();
        await engine.play(id);
      }
    },
    [engine]
  );

  const wait = useCallback(async (duration: number = 1) => {
    await animations.wait(duration);
  }, []);

  // Builder pattern for queueing animations
  const queue = useCallback(
    (animationFn: () => Promise<void>) => {
      queueRef.current.push(animationFn);
    },
    []
  );

  const runQueue = useCallback(async () => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;

    for (const fn of queueRef.current) {
      await fn();
    }

    queueRef.current = [];
    isPlayingRef.current = false;
  }, []);

  return {
    play,
    playSequential,
    wait,
    queue,
    runQueue,
    engine,
  };
}

/**
 * Hook for updater-based animations (continuous updates)
 */
export function useUpdater(
  targetId: string,
  updaterFn: (state: MobjectState, dt: number, t: number) => Partial<MobjectState>,
  deps: any[] = []
) {
  const getMobject = useSceneStore((s) => s.getMobject);
  const updateMobject = useSceneStore((s) => s.updateMobject);
  const isPlaying = useSceneStore((s) => s.isPlaying);
  const startTimeRef = useRef<number | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) {
      startTimeRef.current = null;
      return;
    }

    const update = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
        lastTimeRef.current = timestamp;
      }

      const t = (timestamp - startTimeRef.current) / 1000; // Total time in seconds
      const dt = (timestamp - lastTimeRef.current) / 1000; // Delta time
      lastTimeRef.current = timestamp;

      const currentState = getMobject(targetId);
      if (currentState) {
        const updates = updaterFn(currentState, dt, t);
        updateMobject(targetId, updates);
      }

      frameIdRef.current = requestAnimationFrame(update);
    };

    frameIdRef.current = requestAnimationFrame(update);

    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [isPlaying, targetId, getMobject, updateMobject, ...deps]);
}

/**
 * Hook for value tracking animations (like DecimalNumber.set_value)
 */
export function useValueTracker(initialValue: number = 0) {
  const valueRef = useRef(initialValue);

  const setValue = useCallback(
    async (
      newValue: number,
      options?: { duration?: number }
    ) => {
      const { duration = 1 } = options ?? {};

      // Animate the value change
      return new Promise<void>((resolve) => {
        const startValue = valueRef.current;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
          const elapsed = (currentTime - startTime) / 1000;
          const progress = Math.min(elapsed / duration, 1);

          valueRef.current = startValue + (newValue - startValue) * progress;

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            valueRef.current = newValue;
            resolve();
          }
        };

        requestAnimationFrame(animate);
      });
    },
    []
  );

  const getValue = useCallback(() => valueRef.current, []);

  return {
    value: valueRef.current,
    setValue,
    getValue,
  };
}
