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

## 6. Starbug flight physics & docking assist

Implements GDD §4.3–4.4. Source material arrived as an Unreal/UnrealScript spec
(`SVehicle`, `PhysicsVolume`, Kismet) — not usable as-is since we're on Three.js/Rapier,
not Unreal. This section re-implements the same *behavior* with our own stack; see
`src/starbug/` for the working code.

### 6.1 `StarbugController` — 6-DOF flight

A Rapier dynamic rigid body (not kinematic — we want real impulse/torque physics for
the dogfight feel) wrapped by a thin controller:

- `applyFlightInput(forward, strafe, pitch, yaw, roll, dt)` applies linear thrust
  along the body's forward/right axes and rotational torque, scaled by per-axis rate
  constants (`engineThrust`, `strafeThrust`, `pitchRate`, `yawRate`, `rollRate`)
- Fuel drains proportionally to force magnitude applied; at zero fuel (or during a
  scripted `engineFailure` state), thrust input is ignored and a constant downward
  force is applied instead — the "atmospheric stall" fallback for Swamp Re-entry
- Telemetry (`hullIntegrity`, `fuel`, `velocity.length()`) is plain state on the
  controller, read directly by the HUD per GDD §4.5 — no event bus needed for values
  polled every frame

### 6.2 `DockingVolume` — the "needle-thread" illusion

A trigger volume (Rapier sensor collider, not solid) placed at each hangar dock:

- On overlap with the Starbug's collider, the volume takes over blending the
  Starbug's velocity and rotation each frame — the player's flight input is *not*
  cut, it's blended against, so it still feels controlled
- `alpha = clamp(1 - distanceToDock / captureRadius, 0, 1)` — the same proportional
  blend as the design spec, just expressed in Three.js vector math instead of
  UnrealScript's `VLerp`/`RInterpTo`
- Below the touchdown threshold, zero out remaining velocity and fire a
  `docking-complete` DOM event that the mission-scene controller (§4) listens for to
  trigger the return-to-ship transition

### 6.3 Why not copy the Unreal source directly

Beyond the engine mismatch, `SVehicle`/`PhysicsVolume`/Kismet event triggers don't
have Three.js/Rapier equivalents worth mimicking 1:1 — e.g. Rapier sensor colliders
already do what `PhysicsVolume.Touch` did, so there's no separate "volume" class
needed, just a sensor collider with a callback.

## 7. Open implementation questions

- Exact VRM source/rig pipeline for the three crew models (placeholder capsule in
  `src/main.js` until real/stand-in rigs exist)
- Rapier character-controller tuning (step height, slope limits) — needed before
  Cat's wall-jump/ledge traversal can be built
- Derelict Salvage and Swamp Re-entry still only have taxonomy-level detail in the
  GDD (theme/hazards/objective, no phase breakdown) — Orbital Ambush (GDD §4.3) has
  enough detail to build first
- `StarbugController`/`DockingVolume` (§6) are written but not yet wired into a
  mission scene — no Starbug mesh, no hangar geometry, no HUD overlay yet
