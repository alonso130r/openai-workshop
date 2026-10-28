/**
 * ManimReact - Convenience Animation Wrappers
 * These wrappers provide a simpler API for stories and examples
 * that accepts MobjectHandle directly instead of requiring engine + targetId
 * 
 * These wrappers automatically play the animation and return a Promise
 */

import { useSceneStore } from '../core/store';
import { getAnimationEngine, AnimationOptions } from './engine';
import * as coreAnimations from './animations';
import type { MobjectHandle, Point3D, Color, MobjectState } from '../core/types';

// Type for objects that have an id property (like MobjectHandle)
type HasId = { id: string } | MobjectHandle;

/**
 * Get the animation engine from the store
 */
function getEngine() {
  const state = useSceneStore.getState();
  return getAnimationEngine(state.getMobject, state.updateMobject);
}

/**
 * Extract the target ID from a MobjectHandle or object with id
 */
function getTargetId(target: HasId): string {
  return target.id;
}

// ============================================
// CREATION ANIMATIONS
// ============================================

export function create(target: HasId, options?: AnimationOptions): Promise<void> {
  const engine = getEngine();
  const id = coreAnimations.create(engine, getTargetId(target), options);
  return engine.play(id);
}

export function uncreate(target: HasId, options?: AnimationOptions): Promise<void> {
  const engine = getEngine();
  const id = coreAnimations.uncreate(engine, getTargetId(target), options);
  return engine.play(id);
}

export function write(target: HasId, options?: AnimationOptions): Promise<void> {
  const engine = getEngine();
  const id = coreAnimations.write(engine, getTargetId(target), options);
  return engine.play(id);
}

export function drawBorderThenFill(target: HasId, options?: AnimationOptions): Promise<void> {
  const engine = getEngine();
  const id = coreAnimations.drawBorderThenFill(engine, getTargetId(target), options);
  return engine.play(id);
}

// ============================================
// FADE ANIMATIONS
// ============================================

export function fadeIn(target: HasId, options?: AnimationOptions & { direction?: Point3D }): Promise<void> {
  const engine = getEngine();
  const id = coreAnimations.fadeIn(engine, getTargetId(target), options);
  return engine.play(id);
}

export function fadeOut(target: HasId, options?: AnimationOptions & { direction?: Point3D }): Promise<void> {
  const engine = getEngine();
  const id = coreAnimations.fadeOut(engine, getTargetId(target), options);
  return engine.play(id);
}

// ============================================
// MOVEMENT ANIMATIONS
// ============================================

export function moveTo(target: HasId, position: Point3D, options?: AnimationOptions): Promise<void> {
  const engine = getEngine();
  const id = coreAnimations.moveTo(engine, getTargetId(target), position, options);
  return engine.play(id);
}

export function shift(target: HasId, direction: Point3D, options?: AnimationOptions): Promise<void> {
  const engine = getEngine();
  const id = coreAnimations.shift(engine, getTargetId(target), direction, options);
  return engine.play(id);
}

// ============================================
// ROTATION ANIMATIONS
// ============================================

export function rotate(target: HasId, angle: number, options?: AnimationOptions & { axis?: Point3D }): Promise<void> {
  const engine = getEngine();
  const id = coreAnimations.rotate(engine, getTargetId(target), angle, options);
  return engine.play(id);
}

// ============================================
// SCALE ANIMATIONS
// ============================================

export function scaleInPlace(target: HasId, factor: number, options?: AnimationOptions): Promise<void> {
  const engine = getEngine();
  const id = coreAnimations.scaleInPlace(engine, getTargetId(target), factor, options);
  return engine.play(id);
}

export function growFromCenter(target: HasId, options?: AnimationOptions): Promise<void> {
  const engine = getEngine();
  const id = coreAnimations.growFromCenter(engine, getTargetId(target), options);
  return engine.play(id);
}

export function shrinkToCenter(target: HasId, options?: AnimationOptions): Promise<void> {
  const engine = getEngine();
  const id = coreAnimations.shrinkToCenter(engine, getTargetId(target), options);
  return engine.play(id);
}

// ============================================
// EMPHASIS ANIMATIONS
// ============================================

export function indicate(target: HasId, options?: AnimationOptions & { color?: Color; scaleFactor?: number }): Promise<void> {
  const engine = getEngine();
  const id = coreAnimations.indicate(engine, getTargetId(target), options);
  return engine.play(id);
}

export function flash(target: HasId, options?: AnimationOptions & { color?: Color; numFlashes?: number }): Promise<void> {
  const engine = getEngine();
  const id = coreAnimations.flash(engine, getTargetId(target), options);
  return engine.play(id);
}

export function wiggle(target: HasId, options?: AnimationOptions & { amplitude?: number }): Promise<void> {
  const engine = getEngine();
  const id = coreAnimations.wiggle(engine, getTargetId(target), options);
  return engine.play(id);
}

export function circumscribe(target: HasId, options?: AnimationOptions & { color?: Color; strokeWidth?: number }): Promise<void> {
  const engine = getEngine();
  const id = coreAnimations.circumscribe(engine, getTargetId(target), options);
  return engine.play(id);
}

// ============================================
// TRANSFORM ANIMATIONS
// ============================================

export function transform(target: HasId, targetState: Partial<MobjectState>, options?: AnimationOptions): Promise<void> {
  const engine = getEngine();
  const id = coreAnimations.transform(engine, getTargetId(target), targetState, options);
  return engine.play(id);
}

// ============================================
// COMPOSITE ANIMATIONS
// ============================================

export function succession(animationIds: string[]): Promise<void> {
  const engine = getEngine();
  return coreAnimations.succession(engine, animationIds);
}

export function animationGroup(animationIds: string[], config?: { lagRatio?: number }): Promise<void[]> {
  const engine = getEngine();
  return coreAnimations.animationGroup(engine, animationIds, config);
}

export function laggedStart(animationIds: string[], lagRatio?: number): Promise<void> {
  const engine = getEngine();
  return coreAnimations.laggedStart(engine, animationIds, lagRatio);
}

// Re-export useful types and utilities
export type { AnimationOptions } from './engine';
export { wait } from './animations';
