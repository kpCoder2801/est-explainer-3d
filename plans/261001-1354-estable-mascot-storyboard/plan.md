---
status: in-review
created: 2026-10-01
---

# Estable mascot explainer — storyboard first

## Contract

- **Outcome:** a ~100s, 1920×1080, 30fps English explainer in Remotion where three flat-vector mascots (Estable, ARSe, Nandu) tell the Estable story and interact with on-screen props. This phase delivers a reviewable storyboard plus a few animated preview scenes before any voice or music is generated.
- **Constraints:** copy sourced from the Estable and ARSe landing pages (README links); mascots built from the logos as code-drawn SVG rigs; Nandu stays pixel art but uses the shared flat style (same eyes, palette treatment, motion vocabulary); no Tether logo anywhere (text "A Tether portfolio company" only); ElevenLabs key lives in `.env` and is never printed or committed.
- **Non-goals:** 9:16/1:1 versions, non-English versions, Lottie/Rive export, the USDT mascot.
- **Acceptance:** user approves storyboard + preview scenes; then voices are cast, VO/SFX/music generated, scene timing switches from estimates to real audio durations, final MP4 renders and is inspected (frames, duration, loudness).

## Decisions

- Mascots are SVG rigs (body from logo geometry + separate eyes/mouth/limbs) driven by shared motion hooks: idle, blink, talk, walk, wave, point, jump, celebrate. Rejected AI raster sprites: frame-to-frame identity drift and no lip-sync.
- Until VO exists, scene length = word count ÷ 2.6 words/s + action padding, and the mouth uses a syllable pattern derived from the line text. After VO, ElevenLabs `with-timestamps` alignment drives mouth and captions.
- USDT mascot dropped (Tether brand use not cleared).
- Character style (user review 2026-10-01): 1930s rubber-hose cartoon per the Miss Minutes reference — white gloves, thin straight legs, big shoes. Estable: round eyes on teal bumps fully outside the apex, wide apart, mouth on the apex. ARSe: egg eyes with lashes over the top rim, mouth just under them, body blue brightened to `#33b8e6`. Nandu unchanged (approved).
- Finish (user review 2026-10-01): sticker line art + cel shading on all three — dark `outline` behind every part, lower-right shade crescent and upper-left gloss marks (`InkedShape`), white-soled shoes; Nandu gets the same per-pixel (outline, edge shade, top highlight).

## Phases

| # | Phase | Status |
|---|---|---|
| 1 | Script + storyboard (`src/storyboard/storyboard-script.ts`) | done |
| 2 | Mascot rigs + action sheet | done |
| 3 | Preview scenes (S1 intro, S6 Coin→ARSe, S8 Nandu) | done |
| 4 | Voice casting (Voice Design, 2–3 options per mascot) | done — option 2 for all |
| 5 | VO with timestamps, SFX, music | done |
| 6 | Remaining scenes (S02–S05, S07, S09, S10) | done |
| 7 | Final render + inspection | done — `out/estable-explainer.mp4`, awaiting user review |

- Script + storyboard approved 2026-10-01.
- Coin logos come from `est-ui-config/src/_shared/assets/images/ccy` (copied to `public/ccy`: BTC, ETH, TRX, POL); USDT excluded (Tether mark). Avalanche has no Estable asset, so the multi-chain chips read Ethereum · Polygon · + more.
- Minting machine: user picked the capsule dome (`src/props/capsule-dome-minting-machine.tsx`) from four concepts; the press, reserve minter and conveyor were removed.

## ElevenLabs

Key verified 2026-10-01: Starter tier, active, 39,876 credit quota.

- Voice casting run 2026-10-01 (`scripts/voice-casting.mjs`): 3 Voice Design previews per mascot in `public/voice-casting/`, ids in `manifest.json`. Cost 173 credits. Final VO puts the cut at ≈1:46 (scene leads, tails and gaps included).
- Music access confirmed on Starter (`scripts/music-access-check.mjs`, 10s clip in `public/music-test/`). Ad-use licensing for music still to confirm on the ElevenLabs account.

## Storyboard

Source of truth is `src/storyboard/storyboard-script.ts` (lines, speakers, beats). Rendered board: `out/storyboard-board.png`.

## Audio pipeline (2026-10-01)

- Voices saved to the account (`src/audio/voice-cast.json`). `scripts/generate-voice-over.mjs` records every line with `with-timestamps`, trims leading silence, and caches by text hash; `src/audio/vo-lines.json` drives scene timing, lip-sync and captions. Brand words are spoken via a map (ARSe → "A R S e", PSPs → "P S Ps"); captions keep the written form.
- `scripts/generate-sound-effects.mjs` → `public/sfx/` (13 effects); `scripts/generate-background-music.mjs` → 110s bed, ducked under speech by `BackgroundMusic`.
- Credits used to date: 2,540 of 39,876.

## Final render (2026-10-01)

`EstableExplainer` composition → `out/estable-explainer.mp4`: 1920×1080, 30fps, 106.5s, AAC audio; −16.6 LUFS integrated, −1.1 dBFS peak. Frames sampled across all ten scenes. Render: `npx remotion render src/index.ts EstableExplainer out/estable-explainer.mp4`.
