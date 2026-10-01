---
status: in-review
created: 2026-10-01
---

# Estable explainer — motion-graphics version

## Contract

- **Outcome:** a second cut, `EstableExplainerMG` → `out/estable-explainer-mg.mp4`, 1920×1080 30fps, same script and recorded voices as v1, in a motion-graphics style: kinetic typography synced to the voice, geometric shape transitions between scenes, camera moves, line-draw icons, counters, and redesigned geometric mascots.
- **Constraints:** v1 (`EstableExplainer`, `src/scenes`, `src/mascots`) stays untouched apart from additive shared helpers; reuse VO (`src/audio/vo-lines.json`) and timing helpers; no Tether logo; real coin assets from `public/ccy`; brand palette and Inter.
- **Non-goals:** new script, new voices, other aspect ratios.
- **Acceptance:** MG mascots reviewed in a sheet; all 10 MG scenes animated with word-synced kinetic type; shape transitions; new MG music bed + MG sound effects; full render inspected (frames, duration, loudness).

## Motion identity

- Personality: energetic-premium. Signature easing: expo-out `bezier(0.16, 1, 0.3, 1)`; exits expo-in.
- Durations: quick 8f, standard 14f, slow 24f. Entrance: mask-reveal slide-up (+ slight scale), stagger 3f.
- Mascots: limbless, flat, geometric; act through float, squash/stretch, spin, hop, eye emotes, and a logo↔character morph.

## Phases

| # | Phase | Status |
|---|---|---|
| 1 | MG kit (tokens, reveal, kinetic type, shape transitions, background, captions) | done |
| 2 | MG mascots + review sheet | done (`MgMascotSheet`) |
| 3 | MG audio (music bed, SFX set) | done |
| 4 | MG scenes S01–S10 (parallel) | done |
| 5 | Assemble with transitions, render, inspect | done |

## Result (2026-10-01)

`EstableExplainerMG` → `out/estable-explainer-mg.mp4`: 1920×1080, 30fps, 101.7s (16-frame shape transitions overlap scenes), −16.5 LUFS, −1.3 dBFS peak. Frames sampled across all scenes.

- Code lives in `src/mg/` (kit, mascots, scenes, compositions); v1 untouched except additive shared helpers (`SceneVoiceOver`, Nandu pixel map module, `ArseMolecule` export, music `file` prop).
- MG sound effects are loudness-normalised on generation (`--normalize-mg`), because the API returned them at very uneven levels (one hit at full scale, another near-silent). The v1 effects are untouched.
- Credits used to date: ~4,200 of 39,876 (MG music ≈1,490).
