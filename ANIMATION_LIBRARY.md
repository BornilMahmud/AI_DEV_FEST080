# Animation Library Registry

Curated repositories for selecting proven 2D, 2.5D and 3D animation patterns.

## Tier A — Core 3D

| Repository | Link | Best use |
|---|---|---|
| React Three Fiber | https://github.com/pmndrs/react-three-fiber | React + Three.js scenes, interactive 3D, `useFrame`, reusable 3D components |
| Drei | https://github.com/pmndrs/drei | Ready-made R3F controls, loaders, environments, floating objects, presentation helpers |
| Three.js | https://github.com/mrdoob/three.js | Core WebGL/Three.js engine and official examples |
| Three.js examples | https://github.com/mrdoob/three.js/tree/dev/examples | Advanced interactive 3D, shaders, particles, postprocessing, physics-style demos |

## Tier B — Cinematic / Effects

| Repository | Link | Best use |
|---|---|---|
| Theatre.js | https://github.com/theatre-js/theatre | Timeline and cinematic choreography, camera/object animation |
| React Postprocessing | https://github.com/pmndrs/react-postprocessing | Bloom, depth of field, noise, vignette, outline, cinematic finishing |
| Postprocessing | https://github.com/pmndrs/postprocessing | Low-level WebGL post-processing effects and effect chains |
| Maath | https://github.com/pmndrs/maath | Smooth interpolation, easing, damped motion and math utilities |
| React Spring | https://github.com/pmndrs/react-spring | Spring-physics animation for React and R3F |

## Tier C — UI / Interaction Inspiration

| Repository | Link | Best use |
|---|---|---|
| Animation Handbook | https://github.com/matinmonshizadeh/animation-handbook | Large catalogue of web animation techniques and interaction patterns |
| Motion Primitives Website | https://github.com/itsjwill/motion-primitives-website | React animated UI components and interaction patterns |
| Glow Card React | https://github.com/kea0811/glow-card-react | Cursor tracking, spotlight/glow cards and reduced-motion-aware interaction |

## Tier D — Lightweight / Vanilla 3D Helpers

| Repository | Link | Best use |
|---|---|---|
| Drei Vanilla | https://github.com/pmndrs/drei-vanilla | Drei-inspired helpers for plain Three.js projects without React |

## Requirement → Selection Matrix

| User asks for | First choice | Secondary |
|---|---|---|
| interactive 3D model | R3F | Drei + Three.js examples |
| 3D product/object viewer | Drei PresentationControls | R3F |
| orbit / drag / inspect | Drei controls | R3F |
| floating 3D object | Drei Float | R3F |
| animated GLTF/GLB | R3F + Drei | Three.js |
| cinematic intro | Theatre.js + R3F | Drei |
| camera fly-through | Theatre.js | R3F |
| bloom | React Postprocessing | Postprocessing |
| depth of field | React Postprocessing | Postprocessing |
| vignette/noise | React Postprocessing | Postprocessing |
| glowing network | R3F + Postprocessing | Three.js examples |
| particle field | Three.js examples + R3F | Postprocessing |
| shader effect | Three.js examples | R3F |
| cursor spotlight | Glow Card React | Motion Primitives |
| magnetic hover | Motion Primitives | React Spring |
| spring UI | React Spring | Motion Primitives |
| scroll animation | Motion Primitives / handbook | R3F scroll controls for 3D |
| micro-interactions | Motion Primitives | Animation Handbook |
| vanilla JS/WebGL project | Three.js + Drei Vanilla | Postprocessing |

## Selection Policy

1. Prefer a library already installed in the project.
2. Prefer official or highly maintained repositories for production-critical primitives.
3. Prefer a single library when it solves the requirement cleanly.
4. Combine libraries only when responsibilities are distinct, for example:
   - R3F = scene
   - Drei = helpers/controls
   - Theatre.js = choreography
   - React Postprocessing = visual finishing
5. Keep heavy 3D effects out of dense screens unless they add real value.
6. Always support reduced motion.
7. Verify package compatibility with the project's React/Three version before installation.

## Example Stack for a Cinematic Technical Dashboard

```text
React application
    ↓
React Three Fiber
    ↓
Drei
    ↓
Theatre.js (only for timeline/cinematic sequences)
    ↓
React Postprocessing (only needed effects)
    ↓
React Spring / Maath (local smooth motion)
```

Do not automatically install the whole stack. Select the minimum required set per feature.
