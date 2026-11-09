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

Starbug operations are structured as **standalone mission modules** launched from Deck 27 Hangar Bay or selected via the Space Map:

```
[Red Dwarf Deck HUB] ──(Launch Starbug)──► [Mission Load Screen / Briefing]
                                                  │
                                                  ▼
                                    +---------------------------+
                                    | STARBUG MISSION TYPES     |
                                    +---------------------------+
                                    | 1. Deep Space Intercept   |
                                    | 2. Asteroid Run / Salvage |
                                    | 3. Atmospheric Crash Landing|
                                    +---------------------------+
```

### Mission Types
1. **Space Intercept & Combat:** Dogfight rogue Simulant ships and protect *Red Dwarf*'s outer hull. `TODO (design): objective/fail states, enemy patterns.`
2. **Asteroid Run / Salvage.** `TODO (design): full description.`
3. **Atmospheric Crash Landing.** `TODO (design): full description — reference frame exists (STARBUG CRASH LANDING, swamp descent, hull integrity/engine failure HUD).`

---

## 5+. `TODO (design)`

Remaining sections not yet received: mission detail for 2–3 above, any additional
systems beyond character switching + Starbug missions, narrative/mission structure
across Decks 1–28, enemy/threat roster, progression, and anything else Gemini's
GDD/TDD covers that hasn't been pasted into this repo yet.
