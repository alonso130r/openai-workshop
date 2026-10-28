/**
 * ManimReact - Text Component
 * Plain text rendering with SVG
 */

import React, { forwardRef, useMemo } from 'react';
import { Mobject } from '../base/Mobject';
import { mathToPixel, mathLengthToPixel } from '../../core/coordinates';
import { useSceneStore } from '../../core/store';
import { COLORS, DEFAULT_FONT_SIZE } from '../../core/constants';
import type { TextProps, MobjectHandle } from '../../core/types';

export interface TextComponentProps extends TextProps {
  /** The text content */
  text: string;
  /** Font size in pixels */
  fontSize?: number;
  /** Font family */
  fontFamily?: string;
  /** Font weight */
  fontWeight?: string | number;
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right';
  /** Line height multiplier */
  lineHeight?: number;
  /** Letter spacing */
  letterSpacing?: number;
  /** Font style (normal, italic) */
  fontStyle?: 'normal' | 'italic';
  /** Text decoration */
  textDecoration?: 'none' | 'underline' | 'line-through';
}

/**
 * Text Component
 * Renders plain text as SVG
 */
export const Text = forwardRef<MobjectHandle, TextComponentProps>(
  (props, ref) => {
    const {
      text,
      fontSize = DEFAULT_FONT_SIZE,
      fontFamily = 'CMU Serif, Times New Roman, serif',
      fontWeight = 'normal',
      textAlign = 'center',
      lineHeight = 1.2,
      letterSpacing = 0,
      fontStyle = 'normal',
      textDecoration = 'none',
      style,
      ...rest
    } = props;

    const camera = useSceneStore((state) => state.camera);

    // Split text into lines
    const lines = useMemo(() => text.split('\n'), [text]);

    // Calculate text anchor
    const textAnchor = useMemo(() => {
      switch (textAlign) {
        case 'left':
          return 'start';
        case 'right':
          return 'end';
        default:
          return 'middle';
      }
    }, [textAlign]);

    const defaultStyle = useMemo(
      () => ({
        fillColor: COLORS.WHITE,
        fillOpacity: 1,
        strokeColor: 'none',
        strokeWidth: 0,
        ...style,
      }),
      [style]
    );

    return (
      <Mobject
        ref={ref}
        style={defaultStyle}
        {...rest}
        render={(renderProps) => (
          <g
            id={renderProps.id}
            transform={renderProps.transform}
            style={renderProps.style}
          >
            {lines.map((line, index) => (
              <text
                key={index}
                x={0}
                y={index * fontSize * lineHeight}
                fontSize={fontSize}
                fontFamily={fontFamily}
                fontWeight={fontWeight}
                fontStyle={fontStyle}
                textAnchor={textAnchor}
                letterSpacing={letterSpacing}
                textDecoration={textDecoration}
                fill={renderProps.pathStyle.fillColor}
                fillOpacity={renderProps.pathStyle.fillOpacity}
                stroke={renderProps.pathStyle.strokeColor}
                strokeWidth={renderProps.pathStyle.strokeWidth}
                dominantBaseline="middle"
              >
                {line}
              </text>
            ))}
          </g>
        )}
      />
    );
  }
);

Text.displayName = 'Text';

/**
 * Title Component
 * Larger text typically used for titles
 */
export const Title = forwardRef<MobjectHandle, TextComponentProps>(
  (props, ref) => {
    const { fontSize = 72, fontWeight = 'bold', ...rest } = props;

    return (
      <Text
        ref={ref}
        fontSize={fontSize}
        fontWeight={fontWeight}
        {...rest}
      />
    );
  }
);

Title.displayName = 'Title';

/**
 * Paragraph Component
 * Multi-line text with automatic wrapping
 */
export interface ParagraphProps extends TextComponentProps {
  /** Maximum width before wrapping (in math units) */
  maxWidth?: number;
}

export const Paragraph = forwardRef<MobjectHandle, ParagraphProps>(
  (props, ref) => {
    const {
      text,
      maxWidth = 10,
      fontSize = DEFAULT_FONT_SIZE,
      lineHeight = 1.4,
      ...rest
    } = props;

    // Simple word wrapping (approximate)
    const wrappedLines = useMemo(() => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      // Approximate characters per line based on maxWidth and fontSize
      const charsPerLine = Math.floor((maxWidth * 100) / (fontSize * 0.6));

      for (const word of words) {
        if (currentLine.length + word.length + 1 <= charsPerLine) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);

      return lines.join('\n');
    }, [text, maxWidth, fontSize]);

    return (
      <Text
        ref={ref}
        text={wrappedLines}
        fontSize={fontSize}
        lineHeight={lineHeight}
        textAlign="left"
        {...rest}
      />
    );
  }
);

Paragraph.displayName = 'Paragraph';

/**
 * BulletedList Component
 */
export interface BulletedListProps extends Omit<TextComponentProps, 'text'> {
  items: string[];
  bulletChar?: string;
  bulletSpacing?: number;
}

export const BulletedList = forwardRef<MobjectHandle, BulletedListProps>(
  (props, ref) => {
    const {
      items,
      bulletChar = '•',
      bulletSpacing = 2,
      fontSize = DEFAULT_FONT_SIZE,
      lineHeight = 1.5,
      ...rest
    } = props;

    const formattedText = useMemo(() => {
      return items.map((item) => `${bulletChar}  ${item}`).join('\n');
    }, [items, bulletChar]);

    return (
      <Text
        ref={ref}
        text={formattedText}
        fontSize={fontSize}
        lineHeight={lineHeight}
        textAlign="left"
        {...rest}
      />
    );
  }
);

BulletedList.displayName = 'BulletedList';

/**
 * NumberedList Component
 */
export interface NumberedListProps extends Omit<TextComponentProps, 'text'> {
  items: string[];
  startNumber?: number;
}

export const NumberedList = forwardRef<MobjectHandle, NumberedListProps>(
  (props, ref) => {
    const {
      items,
      startNumber = 1,
      fontSize = DEFAULT_FONT_SIZE,
      lineHeight = 1.5,
      ...rest
    } = props;

    const formattedText = useMemo(() => {
      return items
        .map((item, index) => `${startNumber + index}. ${item}`)
        .join('\n');
    }, [items, startNumber]);

    return (
      <Text
        ref={ref}
        text={formattedText}
        fontSize={fontSize}
        lineHeight={lineHeight}
        textAlign="left"
        {...rest}
      />
    );
  }
);

NumberedList.displayName = 'NumberedList';

export default Text;
