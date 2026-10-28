/**
 * Shared TypeScript types for Storybook stories
 */

export type Point2D = [number, number];
export type Point3D = [number, number, number];

export interface StoryWrapperProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  showControls?: boolean;
  backgroundColor?: string;
  autoPlay?: boolean;
  loop?: boolean;
}
