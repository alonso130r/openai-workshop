/**
 * ManimReact - AnimationSequence Component
 * Declarative component for choreographed animation sequences on a master timeline
 */

import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useCallback,
  useRef,
  useState,
} from 'react';
import { useMasterTimeline, AnimationType } from './hooks';
import type { TimelinePosition } from './engine';
import type { MobjectState, Point3D, RateFunction } from '../core/types';
import { smooth, linear, easeInOutCubic } from '../core/rateFunctions';

/** Rate function names for Storybook controls */
export type RateFuncName = 'linear' | 'smooth' | 'easeInOutCubic';

/** Map rate function names to actual functions */
const rateFuncMap: Record<RateFuncName, RateFunction> = {
  linear,
  smooth,
  easeInOutCubic,
};

/** Single animation definition in the sequence */
export interface AnimationDef {
  /** Type of animation or 'label' for adding timeline labels */
  type: AnimationType | 'label' | 'wait';
  /** Target mobject ID (required for animations, not for label/wait) */
  targetId?: string;
  /** For labels: the label name */
  labelName?: string;
  /** For wait: duration to wait */
  waitDuration?: number;
  /** Position in timeline (absolute number, relative string like "+=0.5", or label name) */
  position?: TimelinePosition;
  /** Animation options */
  duration?: number;
  delay?: number;
  rateFunc?: RateFuncName;
  /** For moveTo: target position */
  targetPosition?: Point3D;
  /** For rotate: angle in radians */
  angle?: number;
  /** For scale: scale factor */
  scaleFactor?: number;
  /** For transform: target state */
  targetState?: Partial<MobjectState>;
}

export interface AnimationSequenceProps {
  /** Unique ID for this sequence (used for scoped engine) */
  id?: string;
  /** Array of animation definitions in order */
  animations: AnimationDef[];
  /** Whether to trigger building and playing the sequence */
  trigger?: boolean;
  /** Whether to auto-play once built */
  autoPlay?: boolean;
  /** Loop the animation */
  loop?: boolean;
  /** Callback when sequence completes */
  onComplete?: () => void;
  /** Callback when sequence starts */
  onStart?: () => void;
  /** Callback for time updates */
  onTimeUpdate?: (time: number, progress: number) => void;
  /** Children (the mobjects to animate) */
  children?: React.ReactNode;
}

export interface AnimationSequenceHandle {
  /** Play the sequence */
  play: () => void;
  /** Pause the sequence */
  pause: () => void;
  /** Stop and reset the sequence */
  stop: () => void;
  /** Seek to a specific time */
  seek: (time: number) => void;
  /** Seek to a label */
  seekToLabel: (label: string) => void;
  /** Reset everything (clear timeline and restore initial states) */
  reset: () => void;
  /** Rebuild the timeline (useful after prop changes) */
  rebuild: () => void;
  /** Get current time */
  getTime: () => number;
  /** Get total duration */
  getDuration: () => number;
  /** Get progress (0-1) */
  getProgress: () => number;
  /** Check if playing */
  isPlaying: boolean;
}

/**
 * AnimationSequence Component
 * 
 * A declarative component for building complex animation sequences
 * using a master timeline with support for labels and relative positioning.
 * 
 * @example
 * ```tsx
 * const circleRef = useRef<MobjectHandle>(null);
 * const rectRef = useRef<MobjectHandle>(null);
 * 
 * <AnimationSequence
 *   trigger={isPlaying}
 *   animations={[
 *     { type: 'label', labelName: 'intro' },
 *     { type: 'create', targetId: circleRef.current?.id, duration: 1 },
 *     { type: 'fadeIn', targetId: rectRef.current?.id, position: '+=0.5', duration: 0.8 },
 *     { type: 'label', labelName: 'main' },
 *     { type: 'moveTo', targetId: circleRef.current?.id, targetPosition: [2, 0, 0], duration: 1.5 },
 *     { type: 'wait', waitDuration: 0.5 },
 *     { type: 'fadeOut', targetId: circleRef.current?.id, duration: 1 },
 *   ]}
 * >
 *   <Circle ref={circleRef} />
 *   <Rectangle ref={rectRef} />
 * </AnimationSequence>
 * ```
 */
export const AnimationSequence = forwardRef<AnimationSequenceHandle, AnimationSequenceProps>(
  (
    {
      id = 'default-sequence',
      animations: animationDefs,
      trigger = false,
      autoPlay = true,
      loop = false,
      onComplete,
      onStart,
      onTimeUpdate,
      children,
    },
    ref
  ) => {
    const timeline = useMasterTimeline(id);
    const hasBuiltRef = useRef(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const loopingRef = useRef(loop);

    // Update looping ref when prop changes
    useEffect(() => {
      loopingRef.current = loop;
    }, [loop]);

    // Build the timeline from animation definitions
    const buildTimeline = useCallback(() => {
      if (hasBuiltRef.current) {
        timeline.reset();
      }

      // Set up callbacks
      timeline.engine.setMasterTimelineCallbacks({
        onStart: () => {
          setIsPlaying(true);
          onStart?.();
        },
        onUpdate: (progress, time) => {
          onTimeUpdate?.(time, progress);
        },
        onComplete: () => {
          if (loopingRef.current) {
            timeline.seek(0);
            timeline.play();
          } else {
            setIsPlaying(false);
            onComplete?.();
          }
        },
      });

      // Add animations to timeline
      for (const def of animationDefs) {
        if (def.type === 'label') {
          if (def.labelName) {
            timeline.addLabel(def.labelName, def.position);
          }
        } else if (def.type === 'wait') {
          // Add a dummy animation or just advance position
          // For now, we handle wait by adding empty time
          // This will be handled by the position of the next animation
        } else {
          if (!def.targetId) {
            console.warn('AnimationSequence: Animation requires targetId', def);
            continue;
          }

          const rateFunc = def.rateFunc ? rateFuncMap[def.rateFunc] : smooth;
          
          timeline.addAnimation(
            def.type as AnimationType,
            def.targetId,
            {
              duration: def.duration,
              delay: def.delay,
              rateFunc,
              position: def.targetPosition,
              targetState: def.targetState,
              angle: def.angle,
              factor: def.scaleFactor,
            },
            def.position
          );
        }
      }

      hasBuiltRef.current = true;
      timeline.markBuilt();
    }, [animationDefs, timeline, onComplete, onStart, onTimeUpdate]);

    // Build and optionally play when trigger becomes true
    useEffect(() => {
      if (trigger && !hasBuiltRef.current) {
        buildTimeline();
        if (autoPlay) {
          timeline.play();
        }
      }
    }, [trigger, buildTimeline, autoPlay, timeline]);

    // Imperative methods
    const play = useCallback(() => {
      if (!hasBuiltRef.current) {
        buildTimeline();
      }
      timeline.play();
      setIsPlaying(true);
    }, [buildTimeline, timeline]);

    const pause = useCallback(() => {
      timeline.pause();
      setIsPlaying(false);
    }, [timeline]);

    const stop = useCallback(() => {
      timeline.stop();
      setIsPlaying(false);
    }, [timeline]);

    const seek = useCallback(
      (time: number) => {
        timeline.seek(time);
      },
      [timeline]
    );

    const seekToLabel = useCallback(
      (label: string) => {
        timeline.seekToLabel(label);
      },
      [timeline]
    );

    const reset = useCallback(() => {
      timeline.reset();
      hasBuiltRef.current = false;
      setIsPlaying(false);
    }, [timeline]);

    const rebuild = useCallback(() => {
      reset();
      buildTimeline();
    }, [reset, buildTimeline]);

    // Expose imperative handle
    useImperativeHandle(
      ref,
      () => ({
        play,
        pause,
        stop,
        seek,
        seekToLabel,
        reset,
        rebuild,
        getTime: timeline.getTime,
        getDuration: timeline.getDuration,
        getProgress: timeline.getProgress,
        isPlaying,
      }),
      [play, pause, stop, seek, seekToLabel, reset, rebuild, timeline, isPlaying]
    );

    // Just render children - they are the mobjects being animated
    return <>{children}</>;
  }
);

AnimationSequence.displayName = 'AnimationSequence';

export default AnimationSequence;
