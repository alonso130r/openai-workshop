/**
 * ManimReact - Animation Engine
 * Core animation orchestration using GSAP
 */

import gsap from 'gsap';
import { v4 as uuid } from 'uuid';
import type {
  AnimationPhase,
  MobjectState,
  RateFunction,
  MobjectStyle,
} from '../core/types';
import { smooth } from '../core/rateFunctions';
import { DEFAULT_ANIMATION_RUN_TIME } from '../core/constants';
import { lerpPoint3D, lerp } from '../core/coordinates';

export interface AnimationOptions {
  duration?: number;
  delay?: number;
  rateFunc?: RateFunction;
  onStart?: () => void;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
}

export interface AnimationDefinition {
  id: string;
  type: string;
  targetId: string;
  startState: Partial<MobjectState>;
  endState: Partial<MobjectState>;
  options: AnimationOptions;
}

/** Position in master timeline - can be absolute time, relative string, or label */
export type TimelinePosition = number | string;

/** Callbacks for master timeline events */
export interface MasterTimelineCallbacks {
  onStart?: () => void;
  onUpdate?: (progress: number, time: number) => void;
  onComplete?: () => void;
}

/**
 * Animation Engine
 * Manages animation playback and state interpolation with master timeline support
 */
export class AnimationEngine {
  private animations: Map<string, AnimationDefinition> = new Map();
  private activeTimelines: Map<string, gsap.core.Timeline> = new Map();
  private getMobjectState: (id: string) => MobjectState | undefined;
  private updateMobjectState: (id: string, state: Partial<MobjectState>) => void;

  // Master timeline support
  private masterTimeline: gsap.core.Timeline | null = null;
  private labels: Map<string, number> = new Map();
  private initialStates: Map<string, MobjectState> = new Map();
  private timelinePosition: number = 0;
  private isPaused: boolean = true;
  private masterTimelineCallbacks: MasterTimelineCallbacks = {};

  // Store subscription for isPlaying sync
  private storeUnsubscribe: (() => void) | null = null;

  constructor(
    getMobjectState: (id: string) => MobjectState | undefined,
    updateMobjectState: (id: string, state: Partial<MobjectState>) => void
  ) {
    this.getMobjectState = getMobjectState;
    this.updateMobjectState = updateMobjectState;
  }

  /**
   * Subscribe to store's isPlaying state to sync master timeline
   */
  subscribeToStore(subscribe: (callback: (isPlaying: boolean) => void) => () => void): void {
    this.storeUnsubscribe = subscribe((isPlaying) => {
      if (isPlaying) {
        this.playMasterTimeline();
      } else {
        this.pauseMasterTimeline();
      }
    });
  }

  /**
   * Unsubscribe from store
   */
  unsubscribeFromStore(): void {
    if (this.storeUnsubscribe) {
      this.storeUnsubscribe();
      this.storeUnsubscribe = null;
    }
  }

  /**
   * Create or get the master timeline
   */
  getMasterTimeline(): gsap.core.Timeline {
    if (!this.masterTimeline) {
      this.masterTimeline = gsap.timeline({
        paused: true,
        onStart: () => {
          this.masterTimelineCallbacks.onStart?.();
        },
        onUpdate: () => {
          const progress = this.masterTimeline?.progress() ?? 0;
          const time = this.masterTimeline?.time() ?? 0;
          this.masterTimelineCallbacks.onUpdate?.(progress, time);
        },
        onComplete: () => {
          this.isPaused = true;
          this.masterTimelineCallbacks.onComplete?.();
        },
      });
    }
    return this.masterTimeline;
  }

  /**
   * Set master timeline callbacks
   */
  setMasterTimelineCallbacks(callbacks: MasterTimelineCallbacks): void {
    this.masterTimelineCallbacks = callbacks;
  }

  /**
   * Capture initial state of a mobject for later reset
   */
  captureInitialState(targetId: string): void {
    const state = this.getMobjectState(targetId);
    if (state && !this.initialStates.has(targetId)) {
      // Deep clone the state
      this.initialStates.set(targetId, JSON.parse(JSON.stringify(state)));
    }
  }

  /**
   * Set initial state for a mobject (before animation starts)
   */
  setInitialState(targetId: string, state: Partial<MobjectState>): void {
    // First capture current state if not already captured
    this.captureInitialState(targetId);
    // Apply the initial state for the animation
    this.updateMobjectState(targetId, state);
  }

  /**
   * Reset a mobject to its initial state
   */
  resetToInitialState(targetId: string): void {
    const initialState = this.initialStates.get(targetId);
    if (initialState) {
      this.updateMobjectState(targetId, initialState);
    }
  }

  /**
   * Reset all mobjects to their initial states
   */
  resetAllToInitialState(): void {
    for (const [targetId, state] of this.initialStates) {
      this.updateMobjectState(targetId, state);
    }
  }

  /**
   * Add a label at the current position in the master timeline
   */
  addLabel(name: string, position?: TimelinePosition): void {
    const tl = this.getMasterTimeline();
    const resolvedPosition = position !== undefined ? position : this.timelinePosition;
    // For addLabel, we need a number or string position that GSAP can understand
    tl.addLabel(name, resolvedPosition);
    // Store numeric position for later reference
    const numericPosition = typeof resolvedPosition === 'number' ? resolvedPosition : this.timelinePosition;
    this.labels.set(name, numericPosition);
  }

  /**
   * Resolve a position (number, relative string like "+=0.5", or label name)
   */
  private resolvePosition(position: TimelinePosition): number | string {
    if (typeof position === 'number') {
      return position;
    }
    // Handle relative positions like "+=0.5" or "-=1"
    if (position.startsWith('+=') || position.startsWith('-=')) {
      return position; // GSAP handles these directly
    }
    // Check if it's a label
    if (this.labels.has(position)) {
      return position; // GSAP will resolve the label
    }
    // Try to parse as label with offset like "intro+=0.5"
    return position;
  }

  /**
   * Add an animation to the master timeline
   */
  addToMasterTimeline(animationId: string, position?: TimelinePosition): void {
    const animation = this.animations.get(animationId);
    if (!animation) {
      console.warn(`Animation ${animationId} not found`);
      return;
    }

    const tl = this.getMasterTimeline();
    const { targetId, startState, endState, options } = animation;
    const { duration = 1, rateFunc = smooth, onStart, onUpdate, onComplete } = options;

    // Capture initial state before animation starts
    this.captureInitialState(targetId);

    // Create proxy object for animation
    const proxy = { progress: 0 };

    // Create the tween
    const tween = gsap.to(proxy, {
      progress: 1,
      duration,
      ease: 'none',
      onStart: () => {
        onStart?.();
      },
      onUpdate: () => {
        const easedProgress = rateFunc(proxy.progress);
        const interpolatedState = this.interpolateState(startState, endState, easedProgress);
        this.updateMobjectState(targetId, interpolatedState);
        onUpdate?.(easedProgress);
      },
      onComplete: () => {
        onComplete?.();
      },
    });

    // Add to master timeline at the specified position
    const resolvedPosition = position !== undefined ? this.resolvePosition(position) : this.timelinePosition;
    tl.add(tween, resolvedPosition);

    // Update timeline position for next animation (if using default sequential positioning)
    if (position === undefined) {
      this.timelinePosition += duration;
    }
  }

  /**
   * Play the master timeline
   */
  playMasterTimeline(): void {
    const tl = this.getMasterTimeline();
    this.isPaused = false;
    tl.play();
  }

  /**
   * Pause the master timeline
   */
  pauseMasterTimeline(): void {
    if (this.masterTimeline) {
      this.isPaused = true;
      this.masterTimeline.pause();
    }
  }

  /**
   * Stop and reset the master timeline
   */
  stopMasterTimeline(): void {
    if (this.masterTimeline) {
      this.masterTimeline.pause();
      this.masterTimeline.seek(0);
      this.isPaused = true;
    }
  }

  /**
   * Seek to a specific time in the master timeline
   */
  seekMasterTimeline(time: number): void {
    if (this.masterTimeline) {
      this.masterTimeline.seek(time);
    }
  }

  /**
   * Seek to a label in the master timeline
   */
  seekToLabel(label: string): void {
    if (this.masterTimeline && this.labels.has(label)) {
      this.masterTimeline.seek(label);
    }
  }

  /**
   * Get the total duration of the master timeline
   */
  getMasterTimelineDuration(): number {
    return this.masterTimeline?.duration() ?? 0;
  }

  /**
   * Get the current time of the master timeline
   */
  getMasterTimelineTime(): number {
    return this.masterTimeline?.time() ?? 0;
  }

  /**
   * Get the progress (0-1) of the master timeline
   */
  getMasterTimelineProgress(): number {
    return this.masterTimeline?.progress() ?? 0;
  }

  /**
   * Check if master timeline is paused
   */
  isMasterTimelinePaused(): boolean {
    return this.isPaused;
  }

  /**
   * Reset the master timeline completely (clear all animations)
   */
  resetMasterTimeline(): void {
    if (this.masterTimeline) {
      this.masterTimeline.kill();
      this.masterTimeline = null;
    }
    this.timelinePosition = 0;
    this.labels.clear();
    this.resetAllToInitialState();
    this.initialStates.clear();
  }

  /**
   * Clear initial states (useful when scene is reset)
   */
  clearInitialStates(): void {
    this.initialStates.clear();
  }

  /**
   * Create an animation
   */
  createAnimation(
    type: string,
    targetId: string,
    endState: Partial<MobjectState>,
    options: AnimationOptions = {}
  ): string {
    const id = uuid();
    const startState = this.getMobjectState(targetId) ?? {};

    this.animations.set(id, {
      id,
      type,
      targetId,
      startState,
      endState,
      options: {
        duration: DEFAULT_ANIMATION_RUN_TIME,
        rateFunc: smooth,
        ...options,
      },
    });

    return id;
  }

  /**
   * Play an animation
   */
  play(animationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const animation = this.animations.get(animationId);
      if (!animation) {
        reject(new Error(`Animation ${animationId} not found`));
        return;
      }

      const { targetId, startState, endState, options } = animation;
      const { duration = 1, delay = 0, rateFunc = smooth, onStart, onUpdate, onComplete } = options;

      // Create GSAP timeline
      const tl = gsap.timeline({
        delay,
        onStart: () => {
          onStart?.();
        },
        onComplete: () => {
          onComplete?.();
          this.activeTimelines.delete(animationId);
          resolve();
        },
      });

      // Create proxy object for animation
      const proxy = { progress: 0 };

      tl.to(proxy, {
        progress: 1,
        duration,
        ease: 'none', // We handle easing ourselves
        onUpdate: () => {
          // Apply rate function
          const easedProgress = rateFunc(proxy.progress);

          // Interpolate state
          const interpolatedState = this.interpolateState(
            startState,
            endState,
            easedProgress
          );

          // Update mobject
          this.updateMobjectState(targetId, interpolatedState);

          onUpdate?.(easedProgress);
        },
      });

      this.activeTimelines.set(animationId, tl);
    });
  }

  /**
   * Play multiple animations simultaneously
   */
  playAll(animationIds: string[]): Promise<void[]> {
    return Promise.all(animationIds.map((id) => this.play(id)));
  }

  /**
   * Play animations in sequence
   */
  async playSequence(animationIds: string[]): Promise<void> {
    for (const id of animationIds) {
      await this.play(id);
    }
  }

  /**
   * Pause an animation
   */
  pause(animationId: string): void {
    const tl = this.activeTimelines.get(animationId);
    if (tl) {
      tl.pause();
    }
  }

  /**
   * Resume an animation
   */
  resume(animationId: string): void {
    const tl = this.activeTimelines.get(animationId);
    if (tl) {
      tl.resume();
    }
  }

  /**
   * Stop an animation
   */
  stop(animationId: string): void {
    const tl = this.activeTimelines.get(animationId);
    if (tl) {
      tl.kill();
      this.activeTimelines.delete(animationId);
    }
  }

  /**
   * Stop all animations
   */
  stopAll(): void {
    for (const [, tl] of this.activeTimelines) {
      tl.kill();
    }
    this.activeTimelines.clear();
  }

  /**
   * Interpolate between two states
   */
  private interpolateState(
    start: Partial<MobjectState>,
    end: Partial<MobjectState>,
    t: number
  ): Partial<MobjectState> {
    const result: Partial<MobjectState> = {};

    // Interpolate position
    if (start.position && end.position) {
      result.position = lerpPoint3D(start.position, end.position, t);
    } else if (end.position) {
      result.position = end.position;
    }

    // Interpolate rotation
    if (start.rotation && end.rotation) {
      result.rotation = lerpPoint3D(start.rotation, end.rotation, t);
    } else if (end.rotation) {
      result.rotation = end.rotation;
    }

    // Interpolate scale
    if (start.scale && end.scale) {
      result.scale = lerpPoint3D(start.scale, end.scale, t);
    } else if (end.scale) {
      result.scale = end.scale;
    }

    // Interpolate opacity
    if (start.opacity !== undefined && end.opacity !== undefined) {
      result.opacity = lerp(start.opacity, end.opacity, t);
    } else if (end.opacity !== undefined) {
      result.opacity = end.opacity;
    }

    // Interpolate style
    if (start.style || end.style) {
      result.style = this.interpolateStyle(start.style ?? {}, end.style ?? {}, t);
    }

    // Handle visibility
    if (end.visible !== undefined) {
      result.visible = t > 0 ? end.visible : start.visible;
    }

    return result;
  }

  /**
   * Interpolate between two styles
   */
  private interpolateStyle(
    start: Partial<MobjectStyle>,
    end: Partial<MobjectStyle>,
    t: number
  ): Partial<MobjectStyle> {
    const result: Partial<MobjectStyle> = {};

    // Interpolate fill opacity
    if (start.fillOpacity !== undefined && end.fillOpacity !== undefined) {
      result.fillOpacity = lerp(start.fillOpacity, end.fillOpacity, t);
    } else if (end.fillOpacity !== undefined) {
      result.fillOpacity = end.fillOpacity;
    }

    // Interpolate stroke opacity
    if (start.strokeOpacity !== undefined && end.strokeOpacity !== undefined) {
      result.strokeOpacity = lerp(start.strokeOpacity, end.strokeOpacity, t);
    } else if (end.strokeOpacity !== undefined) {
      result.strokeOpacity = end.strokeOpacity;
    }

    // Interpolate stroke width
    if (start.strokeWidth !== undefined && end.strokeWidth !== undefined) {
      result.strokeWidth = lerp(start.strokeWidth, end.strokeWidth, t);
    } else if (end.strokeWidth !== undefined) {
      result.strokeWidth = end.strokeWidth;
    }

    // Colors - for now, use end color (TODO: implement color interpolation)
    if (end.fillColor !== undefined) {
      result.fillColor = t > 0.5 ? end.fillColor : start.fillColor;
    }
    if (end.strokeColor !== undefined) {
      result.strokeColor = t > 0.5 ? end.strokeColor : start.strokeColor;
    }

    return result;
  }

  /**
   * Get animation state
   */
  getAnimationState(animationId: string): AnimationPhase {
    const tl = this.activeTimelines.get(animationId);
    if (!tl) return 'idle';
    if (tl.paused()) return 'paused';
    if (tl.progress() >= 1) return 'complete';
    return 'running';
  }

  /**
   * Get animation progress
   */
  getAnimationProgress(animationId: string): number {
    const tl = this.activeTimelines.get(animationId);
    return tl?.progress() ?? 0;
  }

  /**
   * Clean up all resources
   */
  destroy(): void {
    this.stopAll();
    this.resetMasterTimeline();
    this.unsubscribeFromStore();
    this.animations.clear();
    this.activeTimelines.clear();
    this.initialStates.clear();
    this.labels.clear();
  }
}

/**
 * Scoped engine instances (one per scene)
 */
const engines: Map<string, AnimationEngine> = new Map();

/**
 * Create a scoped animation engine for a specific scene
 */
export function createScopedEngine(
  sceneId: string,
  getMobjectState: (id: string) => MobjectState | undefined,
  updateMobjectState: (id: string, state: Partial<MobjectState>) => void
): AnimationEngine {
  // Destroy existing engine if present
  const existing = engines.get(sceneId);
  if (existing) {
    existing.destroy();
  }

  const engine = new AnimationEngine(getMobjectState, updateMobjectState);
  engines.set(sceneId, engine);
  return engine;
}

/**
 * Get an existing scoped engine
 */
export function getScopedEngine(sceneId: string): AnimationEngine | undefined {
  return engines.get(sceneId);
}

/**
 * Destroy a scoped engine
 */
export function destroyScopedEngine(sceneId: string): void {
  const engine = engines.get(sceneId);
  if (engine) {
    engine.destroy();
    engines.delete(sceneId);
  }
}

/**
 * Create a singleton animation engine instance (for backward compatibility)
 */
let engineInstance: AnimationEngine | null = null;

export function getAnimationEngine(
  getMobjectState: (id: string) => MobjectState | undefined,
  updateMobjectState: (id: string, state: Partial<MobjectState>) => void
): AnimationEngine {
  if (!engineInstance) {
    engineInstance = new AnimationEngine(getMobjectState, updateMobjectState);
  }
  return engineInstance;
}

export function resetAnimationEngine(): void {
  if (engineInstance) {
    engineInstance.destroy();
    engineInstance = null;
  }
}
