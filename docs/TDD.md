# Technical Design Document (TDD)

Implementation side of [`docs/GDD.md`](GDD.md). This document is owned here (developer
side), separate from design.

## Stack

- **Three.js** — rendering, scene graph
- **@pixiv/three-vrm** — character rigs, humanoid animation retargeting
- **@dimforge/rapier3d-compat** — physics (WASM), collision, character controller
- **Vite** — dev server / bundler
- Deploy pattern: static build, served the same way as `space-mvp` / `clipforge` (no
  backend needed for the prototype; static Docker + Traefik if/when it goes on
  tukems.cloud or similar)

> Not Unreal Engine / UnrealScript — see [`ART_DIRECTION.md`](ART_DIRECTION.md) for why
> (fidelity target changed to stylized/atmospheric; Unreal-in-browser only works via
> paid GPU pixel streaming, which was explicitly ruled out on cost).

## 1. Crew Switching — state machine

Single `CrewManager` owns:
- `activeCharacterId: 'lister' | 'kryten' | 'cat'`
- One `CharacterController` instance per crew member (Rapier kinematic capsule +
  VRM rig), always simulating — not destroyed/recreated on switch
- Inactive controllers run an `AIBehaviorTree` (idle routines per GDD §2.1 — e.g.
  Kryten ironing on Deck 16); active controller takes player input instead

Switch flow (`Alt` held → radial wheel → release on target):
1. Freeze input to active controller, time-scale drops (`Tween` to ~0.15x, not a hard
   pause — keeps the world feeling alive during the switch)
2. Camera blends from current third-person rig to an orthographic-ish overhead
   "schematic" camera (see §2)
3. Camera flies to target character's deck position
4. Camera blends back to third-person on the new active controller; time-scale
   restores; AI behavior tree on the now-inactive controller resumes

## 2. Camera transition ("schematic" overview)

- A dedicated `SchematicCamera` scene layer: wireframe deck outlines (`LineSegments`,
  emissive cyan/amber per Deck Map HUD reference), toggled visible only during the
  transition — not rendered every frame
- Transition driven by a simple cubic-bezier position/FOV tween, ~0.8–1.2s total;
  exact timing is a feel pass once a controller exists to test against

## 3. Unpossessed AI hooks

- `AIBehaviorTree` per character: small set of states (Idle/Routine, Wander, React),
  swappable per mission/deck context from a data table (deck → routine), not hardcoded
  per character — keeps "Kryten ironing on Deck 16" as data, not a special case in code
- Hook point: `CrewManager.onSwitch(fromId, toId)` fires before the camera transition
  starts, so the outgoing character's routine can be selected deterministically
  (no mid-animation pop)

## 4. Starbug mission streaming

- Each Starbug mission type (Intercept / Salvage / Crash Landing) is a separate
  Three.js `Scene` + asset bundle, lazy-loaded (dynamic `import()`) on mission launch
  from the Hangar Bay / Space Map, not bundled into the main ship scene
- Mission scenes are self-contained: own lighting rig, own physics world, own HUD
  overlay — the main *Red Dwarf* interior scene is paused/unmounted while a mission
  runs, not simulated in the background
- Return-to-ship transition reuses the schematic camera fly-in from §2

## 5. Open implementation questions

- Exact VRM source/rig pipeline for the three crew models (placeholder capsule in
  `src/main.js` until real/stand-in rigs exist)
- Rapier character-controller tuning (step height, slope limits) — needed before
  Cat's wall-jump/ledge traversal can be built
- Mission 2/3 detail is still `TODO (design)` in the GDD — blocks building Salvage and
  Crash Landing mission scenes specifically; Intercept can start from the GDD's
  existing description
