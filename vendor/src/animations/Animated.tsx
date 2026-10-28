/**
 * ManimReact - Animated Component
 * Declarative wrapper for applying animations to mobjects
 */

import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useCallback,
  useState,
  cloneElement,
  isValidElement,
} from 'react';
import { useAnimationEngine } from './hooks';
import * as animations from './animations';
import type { AnimationOptions } from './engine';
import type { MobjectHandle, MobjectState, Point3D, RateFunction } from '../core/types';
import { smooth, linear, easeInOutCubic } from '../core/rateFunctions';

/** Available animation types */
export type AnimationType =
  | 'create'
  | 'fadeIn'
  | 'fadeOut'
  | 'growFromCenter'
  | 'shrinkToCenter'
  | 'write'
  | 'indicate'
  | 'moveTo'
  | 'rotate'
  | 'scale'
  | 'transform';

/** Rate function names for Storybook controls */
export type RateFuncName =
  | 'linear'
  | 'smooth'
  | 'easeInOutCubic';

/** Map rate function names to actual functions */
const rateFuncMap: Record<RateFuncName, RateFunction> = {
  linear,
  smooth,
  easeInOutCubic,
};

export interface AnimatedProps {
  /** The child mobject to animate */
  children: React.ReactElement;
  /** Type of animation to apply */
  animation: AnimationType;
  /** Whether to trigger the animation (set to true to play) */
  trigger?: boolean;
  /** Duration of the animation in seconds */
  duration?: number;
  /** Delay before animation starts in seconds */
  delay?: number;
  /** Rate function (easing) name */
  rateFunc?: RateFuncName;
  /** For moveTo: target position */
  targetPosition?: Point3D;
  /** For rotate: angle in radians */
  angle?: number;
  /** For scale: scale factor */
  scaleFactor?: number;
  /** For transform: target state */
  targetState?: Partial<MobjectState>;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Callback when animation starts */
  onStart?: () => void;
}

export interface AnimatedHandle {
  /** Reset the animation (restore initial state) */
  reset: () => void;
  /** Replay the animation */
  replay: () => void;
  /** Check if animation is currently playing */
  isAnimating: boolean;
  /** Get the child mobject's ID */
  getMobjectId: () => string | undefined;
}

/**
 * Animated Component
 * 
 * A declarative wrapper that applies animations to child mobjects.
 * 
 * @example
 * ```tsx
 * <Animated animation="fadeIn" trigger={isPlaying} duration={1}>
 *   <Circle radius={2} style={{ fillColor: '#58C4DD' }} />
 * </Animated>
 * ```
 */
export const Animated = forwardRef<AnimatedHandle, AnimatedProps>(
  (
    {
      children,
      animation,
      trigger = false,
      duration = 1,
      delay = 0,
      rateFunc = 'smooth',
      targetPosition,
      angle,
      scaleFactor,
      targetState,
      onComplete,
      onStart,
    },
    ref
  ) => {
    const engine = useAnimationEngine();
    const childRef = useRef<MobjectHandle>(null);
    const hasPlayedRef = useRef(false);
    const initialCapturedRef = useRef(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Get the rate function
    const rateFn = rateFuncMap[rateFunc] ?? smooth;

    // Get mobject ID from child ref
    const getMobjectId = useCallback(() => {
      return childRef.current?.id;
    }, []);

    // Capture initial state when child mounts
    useEffect(() => {
      const id = childRef.current?.id;
      if (id && !initialCapturedRef.current) {
        // Small delay to ensure mobject is registered
        const timeout = setTimeout(() => {
          engine.captureInitialState(id);
          initialCapturedRef.current = true;
        }, 50);
        return () => clearTimeout(timeout);
      }
    }, [engine]);

    // Play animation when trigger becomes true
    useEffect(() => {
      if (!trigger || hasPlayedRef.current) return;

      const id = childRef.current?.id;
      if (!id) return;

      hasPlayedRef.current = true;
      setIsAnimating(true);
      onStart?.();

      const options: AnimationOptions = {
        duration,
        delay,
        rateFunc: rateFn,
        onComplete: () => {
          setIsAnimating(false);
          onComplete?.();
        },
      };

      let animationId: string;

      switch (animation) {
        case 'create':
          animationId = animations.create(engine, id, options);
          break;
        case 'fadeIn':
          animationId = animations.fadeIn(engine, id, options);
          break;
        case 'fadeOut':
          animationId = animations.fadeOut(engine, id, options);
          break;
        case 'growFromCenter':
          animationId = animations.growFromCenter(engine, id, options);
          break;
        case 'shrinkToCenter':
          animationId = animations.shrinkToCenter(engine, id, options);
          break;
        case 'write':
          animationId = animations.write(engine, id, options);
          break;
        case 'indicate':
          animationId = animations.indicate(engine, id, options);
          break;
        case 'moveTo':
          if (!targetPosition) {
            console.warn('Animated: moveTo requires targetPosition prop');
            setIsAnimating(false);
            return;
          }
          animationId = animations.moveTo(engine, id, targetPosition, options);
          break;
        case 'rotate':
          animationId = animations.rotate(engine, id, angle ?? Math.PI, options);
          break;
        case 'scale':
          animationId = animations.scaleInPlace(engine, id, scaleFactor ?? 2, options);
          break;
        case 'transform':
          if (!targetState) {
            console.warn('Animated: transform requires targetState prop');
            setIsAnimating(false);
            return;
          }
          animationId = animations.transform(engine, id, targetState, options);
          break;
        default:
          console.warn(`Animated: Unknown animation type: ${animation}`);
          setIsAnimating(false);
          return;
      }

      engine.play(animationId).catch((err) => {
        console.error('Animation error:', err);
        setIsAnimating(false);
      });
    }, [
      trigger,
      animation,
      duration,
      delay,
      rateFn,
      targetPosition,
      angle,
      scaleFactor,
      targetState,
      onComplete,
      onStart,
      engine,
    ]);

    // Reset function
    const reset = useCallback(() => {
      const id = childRef.current?.id;
      if (id) {
        engine.resetToInitialState(id);
        hasPlayedRef.current = false;
        setIsAnimating(false);
      }
    }, [engine]);

    // Replay function
    const replay = useCallback(() => {
      reset();
      // Trigger animation again after reset
      setTimeout(() => {
        hasPlayedRef.current = false;
      }, 0);
    }, [reset]);

    // Expose imperative handle
    useImperativeHandle(
      ref,
      () => ({
        reset,
        replay,
        isAnimating,
        getMobjectId,
      }),
      [reset, replay, isAnimating, getMobjectId]
    );

    // Clone child with ref
    if (!isValidElement(children)) {
      console.warn('Animated: children must be a valid React element');
      return null;
    }

    return cloneElement(children as React.ReactElement<{ ref?: React.Ref<MobjectHandle> }>, {
      ref: childRef,
    });
  }
);

Animated.displayName = 'Animated';

export default Animated;
