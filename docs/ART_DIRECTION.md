# Art Direction

## The bar we're aiming for

The original pitch reference (an AI-generated TikTok "gameplay" trailer, @smilecommunity)
is near-photorealistic cinematic footage — not achievable in real-time by any engine,
browser-based or native, during actual gameplay. That bar was explicitly dropped in
favour of a **stylized, atmospheric** look, free to host (no GPU server / pixel
streaming), running client-side in-browser.

## Reference: Lost Cathedral (genex.games/lost-cathedral)

Confirmed built in **Three.js** (`github.com/Rabneba/skate-threejs`, three ^0.185),
self-described as "PS2-era" — i.e. deliberately retro/stylized, not photoreal — yet it
still reads as dark, moody, and atmospheric: torch-lit god rays through fog, pooled
warm light against near-black negative space, boss-fight HUD. This is proof that the
desired mood is achievable in a free, client-rendered browser engine.

**Takeaway for RedDwarf:** lean on the same toolkit — low ambient light, strong warm
point-light pools against dark/desaturated bases, fog/haze for depth, ACES filmic tone
mapping, bloom on emissive/light sources — rather than trying to chase raw polygon or
texture fidelity.

## What this means practically

- Materials: simple PBR (MeshStandardMaterial), not photoreal texture work
- Lighting does the heavy lifting — contrast and color temperature over detail
- Fog/haze on every interior to hide geometry limits and sell depth
- Characters: `three-vrm` rigs, stylized proportions over realism
- Avoid: flat even lighting, bright/clean sci-fi corridors — go moody/industrial per
  the original pitch references (cramped, lived-in, warning lights, steam/haze)
