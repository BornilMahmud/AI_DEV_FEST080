---
name: design-using-library-repo
description: Select and implement the right animation or 3D interaction from a curated animation-library registry based on the user's visual requirement, existing project stack, performance budget, and accessibility constraints. Prefer proven library patterns over inventing new animation systems.
---

# design-using-library-repo

## Purpose

Turn a user requirement such as "make the dashboard feel cinematic", "add a 3D hero", "make cards react to the cursor", or "animate the fraud network" into a concrete animation implementation by selecting the closest proven pattern from the curated library registry.

The agent must behave like an animation design-and-integration specialist, not a generic animation generator.

## Core Rule

**READ → INSPECT → MATCH → SELECT → ADAPT → IMPLEMENT → TEST → REPORT**

Do not build a new animation system before checking whether the requirement is already represented by a library example, component, effect, control, shader, interaction pattern, or 3D scene technique in the registry.

## Source Registry

See `ANIMATION_LIBRARY.md` in this skill folder for the complete curated registry and selection matrix.

Primary 3D stack:

- React Three Fiber — https://github.com/pmndrs/react-three-fiber
- Drei — https://github.com/pmndrs/drei
- React Postprocessing — https://github.com/pmndrs/react-postprocessing
- Postprocessing — https://github.com/pmndrs/postprocessing
- Theatre.js — https://github.com/theatre-js/theatre
- Three.js — https://github.com/mrdoob/three.js
- React Spring — https://github.com/pmndrs/react-spring
- Maath — https://github.com/pmndrs/maath
- Drei Vanilla — https://github.com/pmndrs/drei-vanilla

Animation/reference sources:

- Animation Handbook — https://github.com/matinmonshizadeh/animation-handbook
- Motion Primitives Website — https://github.com/itsjwill/motion-primitives-website
- Glow Card React — https://github.com/kea0811/glow-card-react

## Step 1 — Inspect Before Changing

Inspect:

1. package.json and lockfile
2. framework and renderer
3. current animation libraries
4. existing 3D scene/components
5. existing design tokens
6. reduced-motion handling
7. current performance-sensitive screens
8. the target component/page and its parent layout
9. project state/rules such as AGENTS.md and PROJECT_STATE.md

Never add a second animation framework when an existing compatible framework already solves the requirement.

## Step 2 — Convert the User Requirement Into Animation Intent

Extract:

- target surface: hero, card, button, navigation, modal, dashboard, network, 3D model, loader, etc.
- dimensionality: 2D / 2.5D / 3D
- interaction: hover / pointer / drag / scroll / click / load / continuous / timeline
- motion quality: smooth / spring / cinematic / technical / energetic / subtle
- visual effect: glow / bloom / particles / depth / parallax / morph / camera / shader
- intensity: low / medium / high
- performance budget: low-end friendly / balanced / high-end
- accessibility: reduced motion, keyboard, focus visibility

If the requirement is ambiguous, infer conservatively from the existing product design. Do not redesign unrelated UI.

## Step 3 — Select From the Registry

Select the **smallest sufficient set** of library patterns.

Selection priority:

1. Existing project dependency that already provides the needed behavior.
2. React Three Fiber + Drei for React 3D primitives and controls.
3. React Postprocessing / Postprocessing for visual effects.
4. Theatre.js for cinematic timeline choreography.
5. React Spring / Maath for natural interpolation and motion.
6. Three.js examples for advanced WebGL techniques.
7. Animation Handbook / Motion Primitives / Glow Card for reusable UI-motion patterns.

Do not combine libraries merely because they are available.

## Step 4 — Map Requirement to Library Pattern

Use this decision map:

### 3D scene / interactive model
Prefer:
- React Three Fiber
- Drei
- Three.js examples

Typical techniques:
- OrbitControls / PresentationControls
- Float
- useFrame
- instancing
- GLTF/GLB models
- environment lighting
- procedural geometry

### Cinematic intro / camera choreography
Prefer:
- Theatre.js
- React Three Fiber
- Drei

Use for:
- camera fly-ins
- object reveals
- staged scene transitions
- synchronized multi-object motion

### Glow / bloom / depth / cinematic finishing
Prefer:
- React Postprocessing
- Postprocessing

Use for:
- Bloom
- Depth of Field
- Vignette
- Noise
- Outline
- Chromatic Aberration
- other supported effects

### Cursor-reactive card / spotlight
Prefer:
- Glow Card React
- Motion Primitives

Use for:
- pointer-following spotlight
- edge glow
- magnetic hover
- subtle card tilt

### Springy UI motion
Prefer:
- React Spring
- Motion Primitives

Use for:
- hover
- popovers
- panels
- navigation
- smooth state changes

### Scroll-driven animation
Prefer:
- Motion Primitives
- Animation Handbook references
- GSAP only when the project already uses it or the requirement genuinely needs timeline tooling
- R3F scroll controls for 3D scenes

### Advanced shaders / particle fields
Prefer:
- Three.js examples
- React Three Fiber
- Postprocessing

Use only when the visual effect materially improves the experience.

## Step 5 — Implement, Don't Clone

When using an external repository as inspiration:

- reuse the underlying technique or documented component API;
- adapt naming, styling, dimensions, timing and colors to the existing product;
- preserve the project's design system;
- do not copy branding, logos, demo text, or unrelated page structure;
- check the source license before copying substantial code;
- prefer installing the official package or extracting a small self-contained technique when appropriate.

The final result must look native to the user's application.

## Step 6 — 3D Performance Rules

For 3D additions:

- prefer instancing for repeated objects;
- keep geometry/material counts reasonable;
- avoid per-frame React state updates;
- use `useFrame` and refs for high-frequency motion;
- lazy-load large models;
- compress or optimize GLTF/GLB assets where the project permits;
- cap device pixel ratio when needed;
- pause or reduce animation when the target is not visible;
- avoid unnecessary post-processing passes;
- use GPU-friendly transforms and shaders;
- provide a lower-cost fallback for constrained devices when practical.

## Step 7 — Accessibility Rules

Every animation implementation must:

- respect `prefers-reduced-motion`;
- keep keyboard focus visible;
- never communicate critical information only through motion or color;
- avoid flashing/strobing;
- preserve interaction when motion is disabled;
- keep decorative animation `aria-hidden` when appropriate.

For reduced motion, replace complex movement with opacity, static state, or very short non-spatial transitions.

## Step 8 — Visual Integration Rules

Maintain the existing visual language.

For a technical/cinematic dashboard, default motion qualities may include:

- controlled easing;
- short-to-medium durations;
- restrained glow;
- subtle depth/parallax;
- purposeful movement tied to user action;
- no constant distracting movement on dense admin screens.

Customer-facing screens may use warmer, friendlier motion. Admin/fraud-analysis screens should feel precise, technical and information-first.

## Step 9 — Avoid Animation Bloat

Do not:

- animate every element;
- add 3D where 2D is clearer;
- add multiple heavy canvas scenes to one screen unnecessarily;
- introduce three separate libraries for one hover effect;
- recreate a library component from scratch without checking the registry;
- replace working application behavior while adding motion.

Animation must improve comprehension, hierarchy, feedback, or perceived quality.

## Step 10 — Verification

After implementation:

1. run the existing tests;
2. run lint/typecheck/build as available;
3. verify the animation at desktop and mobile widths;
4. test pointer, keyboard and touch interactions;
5. test reduced motion;
6. check for console errors and WebGL context/runtime errors;
7. confirm existing pages still work;
8. verify that no backend/API/data behavior was changed unless explicitly requested.

## Change Control

Before modifying a file, classify the work:

- already complete → do not change;
- partial → implement only missing behavior;
- broken → fix the bug only;
- new requirement → add the minimum required feature.

Prefer the smallest coherent diff.

Do not redo existing authentication, database, risk engine, backend, ML, or completed UI systems just because an animation task was requested.

## Required Final Report

Report:

- user requirement;
- selected library/repository;
- selected pattern/component/technique;
- why it was selected;
- files changed;
- packages added (if any);
- tests/build status;
- performance/accessibility notes;
- anything intentionally left unchanged.

Example:

> Requirement: pointer-following spotlight on risk cards.
> Selected: Glow Card React technique.
> Adaptation: medium violet glow, short lag, edge lighting, reduced-motion snap.
> Changed: `RiskCard.tsx`, `globals.css`.
> Dependencies: none.
> Verified: build + interaction + reduced-motion.
