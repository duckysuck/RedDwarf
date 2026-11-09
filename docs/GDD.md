# Game Design Document (GDD)

> **Design ownership:** this document is led by Gemini (game designer). It's checked
> into this repo so implementation can track it, but content changes should come from
> the design side. Sections marked `TODO (design)` are known gaps — not invented here.

## 1. Core Vision & Pillars

### 1.1 High Concept
*Red Dwarf: Dead Space, Live Comedy* is a third-person narrative action game utilizing a **GTA V-inspired character switching mechanic**. Players jump between Dave Lister, Kryten, and The Cat in real-time as they deal with simultaneous ship emergencies, using Starbug flight operations as discrete mission modules.

### 1.2 Gameplay Pillars
1. **Seamless Crew Switching:** Switch control between Lister, Kryten, and Cat anywhere inside *Red Dwarf*. Each character has distinct abilities, movement vectors, and ongoing idle behaviors when unpossessed.
2. **Dedicated Starbug Missions:** Starbug segments function as discrete mission deployments selected from the Hangar Bay or map hub — covering orbital dogfights, salvage extractions, and crash landing survival.
3. **High-Tension Sitcom Horror:** Atmospheric survival lighting paired with absurd character goals and dynamic banter across Decks 1–28.

---

## 2. Character Switching System (GTA Style)

### 2.1 The Switch Wheel & Transition Mechanics
* Holding the Switch Key (Alt / D-Pad Down) pauses/slows time and opens a radial crew wheel:
  * **Lister (Top Left):** Action, combat, heavy weapons, curry/lager stamina.
  * **Kryten (Top Right):** Maintenance minigames, hacking, diagnostic scanning, groveling.
  * **Cat (Bottom):** Agility, vertical traversal, high-speed sprinting, style meter.
* **Camera Transition Effect:** The camera pulls back into an overhead 3D wireframe schematic of *Red Dwarf* (as seen in the Deck Map), slides to the target character's deck location, and zooms down into 3rd-person view.
* **Dynamic Spawn Contexts:** Unpossessed characters enter autonomous AI routines (e.g., switching to Kryten finds him ironing trousers on Deck 16; switching to Lister finds him sleeping in the Bunkroom or raiding food vending machines).

---

## 3. Playable Character Matrix

| Character | Class Type | Core Mechanics & Movement | Unique Ability / System |
| :--- | :--- | :--- | :--- |
| **Dave Lister** | Enforcer / Brawler | Cover-shooting (Bazookoid), heavy sprint, door override under pressure. | **Curry & Lager Stamina:** Consumables restore health and grant temporary invulnerability sprint. |
| **Kryten** | Specialist / Hacker | Power distribution, fuse repair, temporal alignment, hazard scanning. | **Grovel & Bypass:** Sacrifices robot pride to disarm hostile android AI or bypass security locks. |
| **The Cat** | Traversal / Scout | Wall jumping, ledge balance, container climbing, high-speed dodge roll. | **Pristine Style Meter:** Taking damage reduces movement speed until cleaned at a mirror station. |

---

## 4. Starbug Mission Architecture

Starbug operations are structured as **standalone mission modules** launched from Deck 27 Hangar Bay or selected via the Space Map.

### 4.1 Mission Pillars
- **High-Stakes Visual Panic, Low Mechanical Friction:** warning klaxons, structural sparks, and Holly vector warnings sell catastrophe while generous handling buffers keep the actual flying forgiving.
- **Dynamic Camera Framing:** seamless blend between a tight 3rd-person chase camera during maneuvers and a wider orbital view during dogfights.
- **The "Needle-Thread" Illusion:** every mission ends with a landing sequence that *looks* narrow and precise but is backed by assist vectors that guarantee a clean dock (see §4.4).

### 4.2 Mission Taxonomy

| Mission Type | Environmental Theme | Primary Hazards | Core Objective |
| :--- | :--- | :--- | :--- |
| **Orbital Ambush** | Deep space, dense asteroid field | Simulant fighter drones, kinetic spatial debris | Clear flight corridor & escort *Red Dwarf* |
| **Derelict Salvage** | Unpowered capital ship hulls | Active arc lightning, zero-gravity dead zones | Navigate inner channels & extract tech components |
| **Swamp Re-entry** | Low-altitude planetary atmosphere | Extreme turbulence, dense fog, swamp canopy | Maintain glide slope & survive crash landing |

### 4.3 Detailed Mission: "Asteroid Ambush" (Mission 01)

**Phase 1 — Launch & Flight Corridor (0:00–1:30)**
Launch from Deck 27 Hangar and clear the incoming asteroid field. Linear corridor
navigation following glowing diegetic vector waypoints ("SAFE FLIGHT CORRIDOR 1.5 km")
while dodging space debris. HUD: target brackets, Hull Integrity %, Fuel %, Speed.

**Phase 2 — Simulant Intercept & Dogfight (1:30–3:30)**
Eliminate 3 waves of rogue Simulant scout ships targeting the Starbug's thrusters.
Lock-on heat-seeking lasers; a booster dodge-roll breaks incoming missile locks
("!! INCOMING FIRE !!" threat indicator). Holly delivers escalating panic commentary
over comms as the comedic beat.

**Phase 3 — The "Illusion of Skill" Hangar Docking (3:30–4:30)**
Return to *Red Dwarf* and dock in Deck 27 before the containment forcefield collapses.
Assists (see §4.4 for the implementation): a wide capture cone pulls the Starbug toward
the bay centerline, auto-leveling kicks in closer in, and a speed dampener bleeds off
momentum at touchdown, triggering spark VFX and the transition back to the Deck 27
interior.

### 4.4 Docking Assist — design intent

Not a literal flight-skill test: an invisible assist volume around each dock makes
every attempt land cleanly, while the camera/VFX sell it as a close thing.

- **Capture cone (~150m):** within this radius, gently blend the Starbug's velocity
  vector toward the dock centerline — proportional to proximity, not a hard snap.
  Alpha = `clamp(1 - distanceToDock / captureRadius, 0, 1)`.
- **Auto-level zone (~50m):** blend rotation toward the bay floor's parallel
  orientation as alpha increases.
- **Touchdown threshold (~10m):** speed dampens to near-zero, docking-complete event
  fires (spark VFX, transition back to the Deck 27 interior hub).

See [`TDD.md`](TDD.md) §6 for the Rapier/Three.js implementation of this.

### 4.5 Flight HUD data requirements

Engine-agnostic data the flight HUD binds to (was specified as Scaleform/AS3 bindings
in an Unreal-targeted draft — the data requirements carry over, the UI tech doesn't):

| HUD element | Data source | Update |
| :--- | :--- | :--- |
| Hull bar | `currentHullIntegrity / maxHullIntegrity` | per frame |
| Fuel bar | `currentFuel / maxFuel` (0.0–1.0 fill) | per frame |
| Speed readout | `velocity.length()` | per frame |
| Missile-lock warning | boolean, toggled on incoming Simulant missile lock | event-driven |
| Radar | rotates threat icons relative to `starbug.rotation.yaw` | per frame |

---

## 5+. `TODO (design)`

Remaining gaps: any systems beyond character switching + Starbug missions, narrative/
mission structure across Decks 1–28, enemy/threat roster beyond Simulant scouts/
fighters, progression, Derelict Salvage and Swamp Re-entry mission beat-by-beat detail
(taxonomy above has their theme/hazards/objective, not a phase breakdown yet).
