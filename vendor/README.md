# ManimReact

A React library for creating mathematical animations in the style of 3Blue1Brown, inspired by the Python [Manim](https://www.manim.community/) library.

## Features

- 🎨 **SVG-based rendering** - Crisp, scalable animations at any resolution
- 📐 **Manim-compatible coordinate system** - Origin at center, Y-axis pointing up
- ✏️ **Rich geometry primitives** - Circles, rectangles, lines, polygons, arcs, arrows
- 📝 **LaTeX math rendering** - Beautiful mathematical equations with KaTeX
- 🎬 **Powerful animation system** - Create, fade, transform, rotate, and more
- 📊 **Graphing tools** - Axes, function graphs, parametric curves
- 🎥 **Video export** - Export animations to WebM/MP4
- ⚛️ **React-native** - Full React integration with hooks and refs

## Installation

```bash
npm install manim-react
# or
yarn add manim-react
# or
pnpm add manim-react
```

## Quick Start

```tsx
import React, { useRef, useEffect } from 'react';
import {
  ManimScene,
  Circle,
  MathTex,
  create,
  fadeIn,
  COLORS,
  type SceneHandle,
  type MobjectHandle,
} from 'manim-react';

function MyAnimation() {
  const sceneRef = useRef<SceneHandle>(null);
  const circleRef = useRef<MobjectHandle>(null);
  const equationRef = useRef<MobjectHandle>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !circleRef.current || !equationRef.current) return;

    // Play animations
    scene.play([
      create(circleRef.current, { duration: 1 }),
      fadeIn(equationRef.current, { duration: 1.5 }),
    ]);
  }, []);

  return (
    <ManimScene ref={sceneRef} showControls width={800} height={450}>
      <Circle
        ref={circleRef}
        radius={1}
        fill={COLORS.BLUE}
        stroke={COLORS.WHITE}
        position={[-2, 0, 0]}
      />
      <MathTex
        ref={equationRef}
        tex="e^{i\pi} + 1 = 0"
        color={COLORS.WHITE}
        position={[2, 0, 0]}
      />
    </ManimScene>
  );
}
```

## Core Concepts

### Coordinate System

ManimReact uses the same coordinate system as Manim:
- Origin (0, 0) is at the center of the screen
- X-axis increases to the right
- Y-axis increases upward
- Default frame is approximately 14.22 × 8 units

### Mobjects

Mobjects (mathematical objects) are the building blocks of animations:

```tsx
// Geometry
<Circle radius={1} fill={COLORS.BLUE} />
<Rectangle width={2} height={1} fill={COLORS.RED} />
<Line start={[-1, 0, 0]} end={[1, 0, 0]} />
<Arrow start={[0, 0, 0]} end={[2, 1, 0]} />
<Polygon points={[[0, 0, 0], [1, 0, 0], [0.5, 1, 0]]} />

// Text
<Text text="Hello World" fontSize={24} />
<MathTex tex="\int_0^1 x^2 dx = \frac{1}{3}" />

// Graphing
<Axes xRange={[-5, 5]} yRange={[-3, 3]} />
<FunctionGraph func={(x) => Math.sin(x)} />
```

### Animations

Animations transform mobjects over time:

```tsx
// Creation animations
create(mobject, { duration: 1 })
fadeIn(mobject, { duration: 0.5 })
write(mobject, { duration: 1.5 })
growFromCenter(mobject, { duration: 1 })

// Movement animations
moveTo(mobject, [2, 1, 0], { duration: 1 })
shift(mobject, [1, 0, 0], { duration: 0.5 })
rotate(mobject, Math.PI, { duration: 1 })

// Transform animations
transform(source, target, { duration: 1 })

// Emphasis animations
indicate(mobject, { duration: 0.5 })
flash(mobject, { duration: 0.3 })

// Combining animations
animationGroup([anim1, anim2]) // Play together
succession([anim1, anim2])     // Play in sequence
laggedStart([anim1, anim2, anim3], { lagRatio: 0.5 })
```

### Rate Functions

Control animation timing with rate functions:

```tsx
import { smooth, easeInOut, thereAndBack } from 'manim-react';

fadeIn(mobject, { 
  duration: 1, 
  rateFunc: smooth  // Default
})

rotate(mobject, Math.PI, {
  duration: 2,
  rateFunc: easeInOutCubic
})
```

Available rate functions:
- `linear`, `smooth`, `smoothstep`, `smootherstep`
- `easeInSine`, `easeOutSine`, `easeInOutSine`
- `easeInQuad`, `easeOutQuad`, `easeInOutQuad`
- `easeInCubic`, `easeOutCubic`, `easeInOutCubic`
- `easeInBounce`, `easeOutBounce`, `easeInOutBounce`
- `thereAndBack`, `thereAndBackWithPause`
- And many more...

## Video Export

Export your animations to video:

```tsx
import { useVideoExport } from 'manim-react';

function MyScene() {
  const sceneRef = useRef<SceneHandle>(null);
  const { exportVideo, isExporting, progress } = useVideoExport({
    format: 'webm',
    quality: 0.95,
    autoDownload: true,
  });

  const handleExport = async () => {
    const svg = sceneRef.current?.getSVGElement();
    if (!svg) return;

    await exportVideo(svg, 5, (time) => {
      // Update scene to the given time
      sceneRef.current?.seek(time);
    });
  };

  return (
    <>
      <ManimScene ref={sceneRef}>
        {/* Your scene content */}
      </ManimScene>
      <button onClick={handleExport} disabled={isExporting}>
        {isExporting ? `Exporting ${progress?.percent}%` : 'Export'}
      </button>
    </>
  );
}
```

Or use the built-in export panel:

```tsx
import { ExportPanel } from 'manim-react';

<ExportPanel
  svgRef={svgRef}
  duration={5}
  onTick={(time) => scene.seek(time)}
/>
```

## Colors

ManimReact includes Manim's color palette:

```tsx
import { COLORS } from 'manim-react';

COLORS.BLUE      // #58C4DD
COLORS.RED       // #FC6255
COLORS.GREEN     // #83C167
COLORS.YELLOW    // #FFFF00
COLORS.PURPLE    // #9A72AC
COLORS.ORANGE    // #FF862F
COLORS.PINK      // #D147BD
COLORS.TEAL      // #5CD0B3
COLORS.WHITE     // #FFFFFF
COLORS.BLACK     // #000000
// ... and more
```

## Direction Constants

```tsx
import { UP, DOWN, LEFT, RIGHT, UL, UR, DL, DR, ORIGIN } from 'manim-react';

// These are 3D vectors
UP     // [0, 1, 0]
DOWN   // [0, -1, 0]
LEFT   // [-1, 0, 0]
RIGHT  // [1, 0, 0]
UL     // [-1, 1, 0]
UR     // [1, 1, 0]
DL     // [-1, -1, 0]
DR     // [1, -1, 0]
ORIGIN // [0, 0, 0]
```

## Hooks

```tsx
// Animation engine hook
const engine = useAnimationEngine();

// Per-mobject animation hook
const { play, stop, isPlaying } = useAnimation(mobjectRef);

// Timeline control
const { time, play, pause, seek } = useTimeline();

// Scene context
const scene = useScene();

// Value tracking (like Manim's ValueTracker)
const [value, setValue] = useValueTracker(0, (v) => {
  // Called on every update
});
```

## API Reference

### Components

- `ManimScene` - Main scene container
- `Circle`, `Dot`, `Annulus` - Circular shapes
- `Rectangle`, `Square`, `RoundedRectangle` - Rectangular shapes
- `Line`, `DashedLine`, `Arrow`, `DoubleArrow`, `Vector` - Line segments
- `Polygon`, `RegularPolygon`, `Triangle`, `Star` - Polygons
- `Arc`, `Sector`, `ArcBetweenPoints` - Arc shapes
- `Text`, `Title`, `Paragraph`, `BulletedList` - Text elements
- `MathTex`, `Tex`, `Integer`, `DecimalNumber` - Math rendering
- `Axes`, `NumberPlane` - Coordinate systems
- `FunctionGraph`, `ParametricFunction` - Function plotting
- `Camera`, `MovingCamera` - Camera control

### Animation Functions

- `create`, `uncreate` - Draw/undraw strokes
- `fadeIn`, `fadeOut` - Opacity transitions
- `write`, `unwrite` - Text writing effect
- `growFromCenter`, `shrinkToCenter` - Scale from center
- `moveTo`, `shift` - Position changes
- `rotate`, `rotateAround` - Rotation
- `scale` - Size changes
- `transform`, `morphTo` - Shape transformation
- `indicate`, `flash`, `wiggle` - Emphasis effects
- `animationGroup`, `succession`, `laggedStart` - Combining animations

## Browser Support

ManimReact requires a modern browser with support for:
- SVG
- MediaRecorder API (for video export)
- ES2020+ features

## License

MIT

## Acknowledgments

- [3Blue1Brown](https://www.3blue1brown.com/) for the inspiration
- [Manim Community](https://www.manim.community/) for the original Python library
- [KaTeX](https://katex.org/) for LaTeX rendering
- [GSAP](https://greensock.com/gsap/) for animation interpolation
