---
status: done
created: 2026-10-01
---

# Estable explainer — 3D (three.js) version

## Contract

- **Outcome:** third cut `EstableExplainer3D` → `out/estable-explainer-3d.mp4`, 1920×1080 30fps, same script, recorded VO, captions and music as v1, rendered as real-time 3D (`@remotion/three` + `@react-three/fiber` + `three`): procedural 3D mascots performing the 7 shared actions, 3D sets, lighting and camera moves.
- **Constraints:** v1 and MG untouched except additive shared exports; reuse `storyboard-script.ts`, `scene-timeline.ts` (`poseAt`, `bodyMotion`), `vo-lines.json`, SFX, music; brand palette + Inter; frame-deterministic animation (no `useFrame`, no physics clock); render with `--gl=angle`.
- **Non-goals:** new script/voices, other aspect ratios, interactive web 3D, Blender/skeletal rigs, AI-generated meshes.
- **Acceptance:** 3D action sheet (3 mascots × 7 actions) reviewed by user; all 10 3D scenes VO-synced; full render ≈106.5s inspected (frames, duration, loudness); `npm run typecheck` passes.

## Decisions

- Style: **glossy vinyl toy** — physical clearcoat materials, soft bevels, faint inverted-hull outline, soft blob/contact shadows, dark studio.
- Models: procedural. Estable = extruded logo polygon with rounded corners; ARSe = plump ellipsoid with the logo molecule conformed onto its surface; Nandu = voxel bird from `nandu-pixel-map.ts`, stepped motion at 10fps.
- Motion: limbs driven by the shared `bodyMotion` joint angles so all three cuts move in the same hand.
- Checkpoint: user reviewed and approved the 3D mascot sheet (2026-10-01). Kept: mirroring on facing (as 2D cuts), faint outlines, current proportions.
- Set: unlit, non-tone-mapped floor fading into the fog colour (Neutral tone mapping crushes near-black), shadow-only layer, glow backdrop beyond fog distance, 3D node network for parallax.
- Canvas textures (text, screens, coin faces) are drawn during render after fonts + coin SVGs preload, since @remotion/three only redraws on frame change.
- Cut: `EstableExplainer3D` = TransitionSeries with the MG triangle/circle irises, v1 music bed, whoosh per transition.

## Phases

| # | Phase | Status |
|---|---|---|
| 1 | 3D kit (toy materials, outline, studio lights/environment) | done |
| 2 | 3D mascots + `ToyMascotSheet` review (`out/toy-action-sheet.png`, `out/toy-mascot-sheet.mp4`) | done (approved) |
| 3 | 3D scene kit + S01; S02–S10 built in parallel; shared helpers consolidated into kit (`toy-camera-path.ts`, `toy-estable-logo.tsx`, `toyRightHandWorld`) | done |
| 4 | Assemble, render (`npm run render:3d`), inspect: 101.7s (v1 length minus 9×16f transition overlap, as MG), −16.4 LUFS vs v1 −16.6 | done |

## Render note

Long renders at the default concurrency stalled creating a WebGL canvas (frame 1360, S06 start) after many scene canvases had been created and torn down in each tab; the same frames render fine in isolation. `npm run render:3d` uses 2 tabs and a 120s timeout, which renders the full cut.
