/**
 * ManimReact - Constants
 * Default values matching Manim's coordinate system
 */

// Frame dimensions (in mathematical units)
export const DEFAULT_FRAME_WIDTH = 14.222;  // Manim default
export const DEFAULT_FRAME_HEIGHT = 8;

// Pixel dimensions for rendering
export const DEFAULT_PIXEL_WIDTH = 1920;
export const DEFAULT_PIXEL_HEIGHT = 1080;

// Animation defaults
export const DEFAULT_ANIMATION_RUN_TIME = 1; // seconds
export const DEFAULT_WAIT_TIME = 1;

// Rendering rate
export const DEFAULT_FPS = 60;

// Backwards-compatible alias used by some modules
export const DEFAULT_FRAME_RATE = DEFAULT_FPS;

// Colors (Manim color palette)
export const COLORS = {
  // Primary colors
  BLUE: '#58C4DD',
  BLUE_A: '#C7E9F1',
  BLUE_B: '#9CDCEB',
  BLUE_C: '#58C4DD',
  BLUE_D: '#29ABCA',
  BLUE_E: '#1C758A',

  TEAL: '#5CD0B3',
  TEAL_A: '#ACEAD7',
  TEAL_B: '#76DDC0',
  TEAL_C: '#5CD0B3',
  TEAL_D: '#55C1A7',
  TEAL_E: '#49A88F',

  GREEN: '#83C167',
  GREEN_A: '#C9E2AE',
  GREEN_B: '#A6CF8C',
  GREEN_C: '#83C167',
  GREEN_D: '#77B05D',
  GREEN_E: '#699C52',

  YELLOW: '#FFFF00',
  YELLOW_A: '#FFF1B6',
  YELLOW_B: '#FFEA94',
  YELLOW_C: '#FFFF00',
  YELLOW_D: '#F4D345',
  YELLOW_E: '#E8C11C',

  GOLD: '#F0AC5F',
  GOLD_A: '#F7C797',
  GOLD_B: '#F9B775',
  GOLD_C: '#F0AC5F',
  GOLD_D: '#E1A158',
  GOLD_E: '#C78D46',

  RED: '#FC6255',
  RED_A: '#F7A1A3',
  RED_B: '#FF8080',
  RED_C: '#FC6255',
  RED_D: '#E65A4C',
  RED_E: '#CF5044',

  MAROON: '#C55F73',
  MAROON_A: '#ECABC1',
  MAROON_B: '#EC92AB',
  MAROON_C: '#C55F73',
  MAROON_D: '#A24D61',
  MAROON_E: '#94424F',

  PURPLE: '#9A72AC',
  PURPLE_A: '#CAA3E8',
  PURPLE_B: '#B189C6',
  PURPLE_C: '#9A72AC',
  PURPLE_D: '#715582',
  PURPLE_E: '#644172',

  // Grayscale
  WHITE: '#FFFFFF',
  GRAY_A: '#DDDDDD',
  GRAY_B: '#BBBBBB',
  GRAY_C: '#888888',
  GRAY_D: '#444444',
  GRAY_E: '#222222',
  BLACK: '#000000',

  // Special
  PINK: '#D147BD',
  LIGHT_PINK: '#DC75CD',
  ORANGE: '#FF862F',
  LIGHT_BROWN: '#CD853F',
  DARK_BROWN: '#8B4513',
  DARK_BLUE: '#236B8E',
  GREY_BROWN: '#736357',

  // Background
  BACKGROUND: '#000000',
} as const;

// Directions (unit vectors)
export const UP = [0, 1, 0] as const;
export const DOWN = [0, -1, 0] as const;
export const LEFT = [-1, 0, 0] as const;
export const RIGHT = [1, 0, 0] as const;
export const OUT = [0, 0, 1] as const;
export const IN = [0, 0, -1] as const;

export const UL = [-1, 1, 0] as const;  // Upper left
export const UR = [1, 1, 0] as const;   // Upper right
export const DL = [-1, -1, 0] as const; // Down left
export const DR = [1, -1, 0] as const;  // Down right

export const ORIGIN = [0, 0, 0] as const;

// Edge/corner positions
export const TOP = UP;
export const BOTTOM = DOWN;

// Standard stroke/fill defaults
export const DEFAULT_STROKE_WIDTH = 4;
export const DEFAULT_STROKE_COLOR = COLORS.WHITE;
export const DEFAULT_FILL_OPACITY = 0;
export const DEFAULT_STROKE_OPACITY = 1;

// Typography
export const DEFAULT_FONT_SIZE = 48;
export const DEFAULT_LINE_SPACING = 1.2;
