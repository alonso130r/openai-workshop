# Your AI Is Doing Extra Work

A React presentation based on `docs/Your_AI_Slide_Guide.md`: 20 main full-height scrolling sections with fixed scroll-snap stop-points, nine manually controlled Manim React scenes, and speaker notes. The planned content lasts 32 minutes, with about one minute for transitions; questions and audience pauses are excluded. Eight backups and take-home resources open explicitly through Contents and are outside forward navigation. The presentation uses a pure black canvas with mathematical typography and restrained controls.

## Run

Install dependencies with `npm ci`, then run `npm run dev`. Build with `npm run build`; `npm run preview` serves the production output. `npm test` checks the slide content against the descriptor snapshot.

## Present

- Scroll, use the small slide arrows, or press the arrow keys/Page Up/Page Down. Home and End reach the first and last slides.
- Open Contents with C. Escape closes the panel.
- Press Space to advance the presentation. On an animated slide, the first press starts the scene and the next press advances to the next slide. Use the play button to pause or resume, and [ and ] or the step arrows to move between explanatory beats. Replay and scrub are supported, and the speed selector adjusts pacing. Static slides never animate. Reduced-motion preferences are respected until you explicitly enable playback.
- Each slide has a stable `#slide-N` link. Fullscreen is available in supported browsers.
- Presenter notes are hidden by default. Add `?notes=1` to the site URL to open a scrollable notes-only view, including on a phone. This view includes the main talk followed by backup and take-home notes. This is an unlisted link, not access protection: anyone with the link or the site files can read the notes. To show Notes to everyone later, set `notesEnabled` to `true` in `src/App.tsx` and rebuild the site. Previously saved presentation details remain in the browser.

## Content and animation

`src/content.json` preserves the original guide, including its titles, timing, explanations, takeaways, storyboards, and sources. `src/presentation-slides.json` defines the approved shorter sequence, audience-facing titles, spoken notes and content timings. `src/presentation.ts` assembles it with the archived descriptors and exports backups separately. Detailed explanations and advanced options remain in backups and Notes. The custom-chip section explicitly names OpenAI and Broadcom’s Jalapeño, distinguishes documented lab workloads from planned deployment, and labels its compiler diagram as conceptual. `src/presentation-copy.json` preserves the earlier copy and the complete coding-agent prompt. If the original guide is available, run `node scripts/extract-content.mjs` to refresh this snapshot. The original `docs/` ignore rule is preserved. The tracked descriptor contract allows tests to run without that local folder.

`src/StaticVisual.tsx` contains concise visual explanations and recap layouts. On-screen slides avoid repeating the presenter notes or a second takeaway footer. `src/Scenes.tsx` implements IntroExample, ClassicCompiler, Memory, Compiler, Fusion, DotProduct, Tiling, Replay, and Guards. The black presentation canvas uses ManimScene, Rectangle, Text, and MathTex from the upstream library. Continuous transitions, drawn paths, and value movement use a deterministic shared clock in `src/animation/`. Most clips last 20 to 28 seconds with explanatory hold points. Slide 2 lasts 48 seconds so its fused phase can show the load, addition, ReLU, and final store for each input value. Navigating away pauses the clip and retains its position for revisiting. All diagrams are schematic, and no hardware benchmark result is asserted.

The `manim-react` package is not available on npm. Its actual source is vendored at a pinned upstream revision. See [upstream attribution](vendor/UPSTREAM.md). No Python renderer or video export is needed.

## Deployment

Vite exports a static site into `dist/`. The Sites identity and static directory live in `.openai/hosting.json`. Publication is private by default; changing the visitor audience requires a separate user request.
