# Red Dwarf: The Game (fan concept)

A multi-perspective narrative action-adventure concept combining high-stakes sci-fi
survival aesthetics with the iconic British sitcom incompetence of *Red Dwarf*.

**Unofficial fan project.** *Red Dwarf* and its characters are the property of Grant
Naylor Productions / BBC. This is a non-commercial dev-portfolio prototype, not for
sale or distribution.

## Status

Early prototype. Design is being led externally (Gemini); this repo is the
implementation side — a browser-playable vertical slice.

## Stack

- **Three.js** (WebGL) — client-side rendered, free static hosting, no GPU server
- **@pixiv/three-vrm** for character rigs/animation
- **@dimforge/rapier3d-compat** for physics (traversal, collision)
- **Vite** for dev/build

See [`docs/ART_DIRECTION.md`](docs/ART_DIRECTION.md) for the visual target and why
Three.js was chosen over Unreal Engine / Babylon.js.

## Docs

- [`docs/GDD.md`](docs/GDD.md) — Game Design Document (design source of truth, owned by Gemini)
- [`docs/TDD.md`](docs/TDD.md) — Technical Design Document (implementation side, owned here)
- [`docs/ART_DIRECTION.md`](docs/ART_DIRECTION.md) — visual style target and references

## Running locally

```
npm install
npm run dev
```
