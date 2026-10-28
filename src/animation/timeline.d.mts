export interface ScenePlan {
  duration: number;
  beats: { at: number; label: string }[];
}
export function clamp(value: number): number;
export function progress(time: number, start: number, end: number): number;
export function interpolate(from: number, to: number, amount: number): number;
export const scenes: Record<string, ScenePlan>;
export function nextBeat(
  scene: ScenePlan,
  time: number,
  direction: number,
): number;
