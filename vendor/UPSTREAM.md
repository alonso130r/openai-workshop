# Manim React source

Source: https://github.com/ZSturman/Manim-React

Revision: `58e1699d87a488eb6b915239e0eeb7b3cdd4c145`

Author: Zachary Sturman. Upstream package declares the MIT license.

The source is included because `manim-react` was not published to npm when this presentation was built. `manim-entry.ts` is a local narrow entry point that excludes video export. One local patch removes the remote KaTeX stylesheet import from ManimScene because the host bundles a patched KaTeX release and fonts locally. Unused upstream development stories and example files are excluded. The MIT license text is included according to the license declared in the upstream package metadata.
