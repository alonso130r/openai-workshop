/**
 * ManimReact - MathTex Component
 * LaTeX math rendering using KaTeX
 */

import React, { forwardRef, useMemo, useEffect, useState } from 'react';
import katex from 'katex';
import { Mobject } from '../base/Mobject';
import { useSceneStore } from '../../core/store';
import { COLORS, DEFAULT_FONT_SIZE } from '../../core/constants';
import type { MathTexProps, MobjectHandle } from '../../core/types';

export interface MathTexComponentProps extends MathTexProps {
  /** LaTeX formula string */
  formula: string;
  /** Font size scale */
  fontSize?: number;
  /** Display mode (block vs inline) */
  displayMode?: boolean;
  /** Color of the math */
  color?: string;
  /** Background color */
  backgroundColor?: string;
  /** Throw error on invalid LaTeX */
  throwOnError?: boolean;
}

/**
 * Parse KaTeX HTML output to extract SVG-friendly elements
 */
function parseKatexToSvg(html: string): string {
  // This is a simplified approach - for production, use a proper HTML to SVG converter
  // or render directly to foreignObject
  return html;
}

/**
 * MathTex Component
 * Renders LaTeX math using KaTeX
 */
export const MathTex = forwardRef<MobjectHandle, MathTexComponentProps>(
  (props, ref) => {
    const {
      formula,
      fontSize = DEFAULT_FONT_SIZE,
      displayMode = true,
      color,
      backgroundColor,
      throwOnError = false,
      style,
      ...rest
    } = props;

    const [renderedHtml, setRenderedHtml] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const camera = useSceneStore((state) => state.camera);

    // Render LaTeX using KaTeX
    useEffect(() => {
      try {
        const html = katex.renderToString(formula, {
          displayMode,
          throwOnError,
          output: 'html', // Use HTML output for foreignObject
          strict: false,
        });
        setRenderedHtml(html);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'KaTeX rendering error');
        if (throwOnError) {
          throw e;
        }
      }
    }, [formula, displayMode, throwOnError]);

    const defaultStyle = useMemo(
      () => ({
        fillColor: color ?? COLORS.WHITE,
        fillOpacity: 1,
        strokeColor: 'none',
        strokeWidth: 0,
        ...style,
      }),
      [color, style]
    );

    // Scale factor for KaTeX output
    const scale = fontSize / 21; // KaTeX default is ~21px

    if (error && !throwOnError) {
      // Render error message
      return (
        <Mobject
          ref={ref}
          style={{ ...defaultStyle, fillColor: COLORS.RED }}
          {...rest}
          render={(renderProps) => (
            <g
              id={renderProps.id}
              transform={renderProps.transform}
              style={renderProps.style}
            >
              <text
                fill={COLORS.RED}
                fontSize={fontSize * 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {`LaTeX Error: ${formula}`}
              </text>
            </g>
          )}
        />
      );
    }

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
            <foreignObject
              x={-500 * scale}
              y={-100 * scale}
              width={1000 * scale}
              height={200 * scale}
              style={{
                overflow: 'visible',
              }}
            >
              <div
                // @ts-ignore - xmlns is needed for foreignObject
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: '100%',
                  color: color ?? COLORS.WHITE,
                  fontSize: `${fontSize}px`,
                  backgroundColor: backgroundColor ?? 'transparent',
                  fontFamily: 'KaTeX_Main, Times New Roman, serif',
                }}
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            </foreignObject>
          </g>
        )}
      />
    );
  }
);

MathTex.displayName = 'MathTex';

/**
 * Tex Component
 * Alias for MathTex with text mode support
 */
export interface TexProps extends MathTexComponentProps {
  /** Enable text mode for mixed text/math */
  textMode?: boolean;
}

export const Tex = forwardRef<MobjectHandle, TexProps>((props, ref) => {
  const { formula, textMode = false, ...rest } = props;

  // Wrap in text mode if requested
  const wrappedFormula = textMode ? `\\text{${formula}}` : formula;

  return <MathTex ref={ref} formula={wrappedFormula} {...rest} />;
});

Tex.displayName = 'Tex';

/**
 * MathTexFromString Component
 * Creates multiple MathTex elements from a template string
 */
export interface MathTexFromStringProps extends Omit<MathTexComponentProps, 'formula'> {
  /** Template string with ${...} for math parts */
  template: string;
  /** Values to substitute */
  values?: Record<string, string>;
}

export const MathTexFromString = forwardRef<MobjectHandle, MathTexFromStringProps>(
  (props, ref) => {
    const { template, values = {}, ...rest } = props;

    // Substitute values into template
    const formula = useMemo(() => {
      let result = template;
      for (const [key, value] of Object.entries(values)) {
        result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
      }
      return result;
    }, [template, values]);

    return <MathTex ref={ref} formula={formula} {...rest} />;
  }
);

MathTexFromString.displayName = 'MathTexFromString';

/**
 * Integer Component
 * Displays an integer with optional sign
 */
export interface IntegerProps extends Omit<MathTexComponentProps, 'formula'> {
  value: number;
  showSign?: boolean;
}

export const Integer = forwardRef<MobjectHandle, IntegerProps>((props, ref) => {
  const { value, showSign = false, ...rest } = props;

  const formula = useMemo(() => {
    const intValue = Math.floor(value);
    if (showSign && intValue >= 0) {
      return `+${intValue}`;
    }
    return String(intValue);
  }, [value, showSign]);

  return <MathTex ref={ref} formula={formula} {...rest} />;
});

Integer.displayName = 'Integer';

/**
 * DecimalNumber Component
 * Displays a decimal number with configurable precision
 */
export interface DecimalNumberProps extends Omit<MathTexComponentProps, 'formula'> {
  value: number;
  numDecimalPlaces?: number;
  showSign?: boolean;
  includeSign?: boolean;
}

export const DecimalNumber = forwardRef<MobjectHandle, DecimalNumberProps>(
  (props, ref) => {
    const {
      value,
      numDecimalPlaces = 2,
      showSign = false,
      includeSign = false,
      ...rest
    } = props;

    const formula = useMemo(() => {
      const fixed = value.toFixed(numDecimalPlaces);
      if ((showSign || includeSign) && value >= 0) {
        return `+${fixed}`;
      }
      return fixed;
    }, [value, numDecimalPlaces, showSign, includeSign]);

    return <MathTex ref={ref} formula={formula} {...rest} />;
  }
);

DecimalNumber.displayName = 'DecimalNumber';

/**
 * Variable Component
 * A styled variable name
 */
export interface VariableProps extends Omit<MathTexComponentProps, 'formula'> {
  name: string;
  value?: number | string;
  subscript?: string;
  superscript?: string;
}

export const Variable = forwardRef<MobjectHandle, VariableProps>(
  (props, ref) => {
    const { name, value, subscript, superscript, ...rest } = props;

    const formula = useMemo(() => {
      let result = name;
      if (subscript) {
        result += `_{${subscript}}`;
      }
      if (superscript) {
        result += `^{${superscript}}`;
      }
      if (value !== undefined) {
        result += ` = ${value}`;
      }
      return result;
    }, [name, value, subscript, superscript]);

    return <MathTex ref={ref} formula={formula} {...rest} />;
  }
);

Variable.displayName = 'Variable';

export default MathTex;
