/**
 * Reusable Storybook control presets (argTypes)
 * Use these to maintain consistency across stories
 */

import type { ArgTypes } from '@storybook/react';

export const positionControls: ArgTypes = {
  position: {
    control: 'object',
    description: 'Position [x, y, z] in math coordinates',
    table: {
      type: { summary: '[number, number, number]' },
      defaultValue: { summary: '[0, 0, 0]' },
    },
  },
};

export const colorControls: ArgTypes = {
  color: {
    control: 'color',
    description: 'Color of the mobject',
    table: {
      type: { summary: 'string' },
    },
  },
  fill: {
    control: 'color',
    description: 'Fill color',
    table: {
      type: { summary: 'string' },
    },
  },
  stroke: {
    control: 'color',
    description: 'Stroke/border color',
    table: {
      type: { summary: 'string' },
    },
  },
};

export const strokeControls: ArgTypes = {
  strokeWidth: {
    control: { type: 'range', min: 0, max: 10, step: 0.5 },
    description: 'Width of the stroke/border',
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '2' },
    },
  },
  stroke: {
    control: 'color',
    description: 'Stroke color',
  },
};

export const dimensionControls: ArgTypes = {
  width: {
    control: { type: 'range', min: 400, max: 1200, step: 50 },
    description: 'Canvas width in pixels',
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '800' },
    },
  },
  height: {
    control: { type: 'range', min: 300, max: 800, step: 50 },
    description: 'Canvas height in pixels',
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '450' },
    },
  },
};

export const opacityControls: ArgTypes = {
  opacity: {
    control: { type: 'range', min: 0, max: 1, step: 0.1 },
    description: 'Opacity of the mobject',
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '1' },
    },
  },
  fillOpacity: {
    control: { type: 'range', min: 0, max: 1, step: 0.1 },
    description: 'Fill opacity',
    table: {
      type: { summary: 'number' },
    },
  },
};

export const animationControls: ArgTypes = {
  duration: {
    control: { type: 'range', min: 0.5, max: 5, step: 0.1 },
    description: 'Animation duration in seconds',
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '1' },
    },
  },
  delay: {
    control: { type: 'range', min: 0, max: 2, step: 0.1 },
    description: 'Animation delay in seconds',
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '0' },
    },
  },
  rateFunc: {
    control: 'select',
    options: [
      'linear',
      'smooth',
      'smootherStep',
      'easeInOut',
      'easeIn',
      'easeOut',
      'easeInSine',
      'easeOutSine',
      'easeInOutSine',
      'easeInQuad',
      'easeOutQuad',
      'easeInOutQuad',
      'easeInCubic',
      'easeOutCubic',
      'easeInOutCubic',
      'easeInExpo',
      'easeOutExpo',
      'easeInOutExpo',
      'wiggle',
    ],
    description: 'Rate function for animation timing',
    table: {
      type: { summary: 'string' },
      defaultValue: { summary: 'smooth' },
    },
  },
};

export const textControls: ArgTypes = {
  text: {
    control: 'text',
    description: 'Text content',
    table: {
      type: { summary: 'string' },
    },
  },
  fontSize: {
    control: { type: 'range', min: 12, max: 72, step: 2 },
    description: 'Font size in pixels',
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '24' },
    },
  },
  fontWeight: {
    control: 'select',
    options: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    description: 'Font weight',
    table: {
      type: { summary: 'string | number' },
      defaultValue: { summary: 'normal' },
    },
  },
  fontFamily: {
    control: 'text',
    description: 'Font family',
    table: {
      type: { summary: 'string' },
    },
  },
  textAlign: {
    control: 'select',
    options: ['left', 'center', 'right'],
    description: 'Text alignment',
    table: {
      type: { summary: 'string' },
      defaultValue: { summary: 'center' },
    },
  },
};

export const mathControls: ArgTypes = {
  tex: {
    control: 'text',
    description: 'LaTeX expression',
    table: {
      type: { summary: 'string' },
    },
  },
  fontSize: {
    control: { type: 'range', min: 12, max: 72, step: 2 },
    description: 'Font size for rendered LaTeX',
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '24' },
    },
  },
  color: {
    control: 'color',
    description: 'Text color',
  },
};
