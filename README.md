# Your AI Is Doing Extra Work

A React presentation based on `docs/Your_AI_Slide_Guide.md`: 31 full-height scrolling sections with fixed scroll-snap stop-points, nine manually controlled Manim React scenes, and speaker notes. The presentation uses a pure black canvas with mathematical typography and restrained controls.

## Run

Install dependencies with `npm ci`, then run `npm run dev`. Build with `npm run build`; `npm run preview` serves the production output. `npm test` checks the slide content against the descriptor snapshot.

## Present

- Scroll, use the small slide arrows, or press the arrow keys/Page Up/Page Down. Home and End reach the first and last slides.
- Open Contents with C and Notes with N. Escape closes the panel.
- Press Space to play/pause an animated scene. Use [ and ] or the step arrows to move between explanatory beats. Replay and scrub are supported, and the speed selector adjusts pacing. Static slides never animate. Reduced-motion preferences are respected until you explicitly enable playback.
- Each slide has a stable `#slide-N` link. Fullscreen is available in supported browsers.
- In Notes, expand Customize presentation to edit titles or add a presenter and affiliation. These edits are saved only in the current browser.

## Content and animation

`src/content.json` preserves titles, timing, explanations, takeaways, storyboards, and sources. If the original guide is available, run `node scripts/extract-content.mjs` to refresh this snapshot. The original `docs/` ignore rule is preserved. The tracked descriptor contract allows tests to run without that local folder.

`src/StaticVisual.tsx` contains static slide layouts. `src/Scenes.tsx` implements IntroExample, ClassicCompiler, Memory, Compiler, Fusion, DotProduct, Tiling, Replay, and Guards. The black presentation canvas uses ManimScene, Rectangle, Text, and MathTex from the upstream library. Continuous transitions, drawn paths, and value movement use a deterministic shared clock in `src/animation/`. Clips last 20 to 28 seconds with explanatory hold points. Navigating away pauses the clip and retains its position for revisiting. All diagrams are schematic, and no hardware benchmark result is asserted.

The `manim-react` package is not available on npm. Its actual source is vendored at a pinned upstream revision. See [upstream attribution](vendor/UPSTREAM.md). No Python renderer or video export is needed.

## Deployment

Vite exports a static site into `dist/`. The Sites identity and static directory live in `.openai/hosting.json`. Publication is private by default; changing the visitor audience requires a separate user request.
