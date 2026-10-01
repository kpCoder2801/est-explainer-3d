# Estable explainer video

A ~1:45 explainer video for Estable starring the three mascots: **Estable** (the company), **ARSe** (the Argentine peso stablecoin) and **Nandu** (the self-custody wallet). The whole video is code: React + [Remotion](https://www.remotion.dev), with three.js for the 3D cut. The voices, music and sound effects were generated with [ElevenLabs](https://elevenlabs.io).

One script and one set of recorded voices drive three visual styles:

| Cut | Composition | Rendered file | Style |
|---|---|---|---|
| v1 | `EstableExplainer` | `out/estable-explainer.mp4` | 2D sticker cartoon |
| Motion graphics | `EstableExplainerMG` | `out/estable-explainer-mg.mp4` | Kinetic type, shape transitions, geometric mascots |
| 3D | `EstableExplainer3D` | `out/estable-explainer-3d.mp4` | Glossy vinyl-toy mascots in three.js |

The rendered videos are committed, so you can watch them without installing anything.

## Quick start

```bash
npm install
npm run studio   # opens Remotion Studio to preview and scrub every composition
```

Besides the three full cuts, the Studio lists each scene on its own (folders `Scenes`, `MgScenes`, `ToyScenes`), mascot review sheets (`MascotActionSheet`, `MgMascotSheet`, `ToyMascotSheet`), the cast lineup and the storyboard board.

## Rendering

```bash
npx remotion render EstableExplainer out/estable-explainer.mp4
npx remotion render EstableExplainerMG out/estable-explainer-mg.mp4
npm run render:3d                     # the 3D cut, with the settings it needs (see below)
npx remotion still ToyMascotSheet out/toy-action-sheet.png --frame=45
```

The 3D cut renders through WebGL. `remotion.config.ts` sets the ANGLE renderer for all renders. `render:3d` also limits the render to 2 browser tabs and raises the timeout to 120s, because at the default concurrency a long render can stall while a scene's 3D canvas is being created.

## Project structure

```
src/
  storyboard/   the script (storyboard-script.ts) and scene timing shared by all cuts
  audio/        voice-over playback, sound effects, music ducking, vo-lines.json (timings + lip-sync alignment)
  brand/        brand colours and the Inter font
  mascots/      v1 2D mascot rigs and the shared motion vocabulary (idle, talk, walk, wave, point, jump, celebrate)
  scenes/       v1 scenes S01–S10
  mg/           motion-graphics cut: kit, mascots, scenes, composition
  three/        3D cut: kit (materials, studio set, props, camera), toy mascots, scenes, composition
public/
  vo/           recorded voice-over lines
  sfx/          sound effects
  music/        background music beds
  ccy/          BTC / ETH / TRX / POL logos
  voice-casting/  candidate voices from casting
out/            rendered videos and stills
plans/          design and build notes for each cut
```

To change what the mascots say, edit `src/storyboard/storyboard-script.ts` and regenerate the voice-over (below). Scene lengths, captions and lip-sync all follow the recorded timings automatically.

## Regenerating audio (ElevenLabs)

The generated audio is already committed. You only need this to change the script, the voices or the sounds.

1. Put your key in `.env` (git-ignored): `ELEVENLABS_API_KEY=...`
2. Install `ffmpeg`. The scripts use it to trim silence and normalise loudness.
3. Run the script you need:

| Script | What it does |
|---|---|
| `node scripts/voice-casting.mjs` | Designs 3 candidate voices per mascot into `public/voice-casting/` |
| `node scripts/save-chosen-voices.mjs` | Saves the chosen voices and records their ids in `src/audio/voice-cast.json` |
| `node scripts/generate-voice-over.mjs` | Speaks every script line into `public/vo/` and writes `src/audio/vo-lines.json`; unchanged lines are skipped |
| `node scripts/generate-sound-effects.mjs` | Generates missing sound effects into `public/sfx/` |
| `node scripts/generate-background-music.mjs` | Generates the music beds into `public/music/` |

`generate-voice-over.mjs` imports the TypeScript script file directly, so it needs Node 22.18+ (or run it with `node --experimental-strip-types`).

## Design references

- Estable landing page design: https://www.figma.com/design/NjSnZZKsBMUxJI6GMgA5KP/Commercial-web?node-id=1821-40205&m=dev
- Entropia - ARSe landing: https://www.figma.com/design/c6q0WGMAMNDtGKD2yovCXU/Entropia?node-id=1587-3475&m=dev
