import React from 'react';
import {Easing, interpolate} from 'remotion';
import {colors, fontInter} from '../brand/brand-tokens';
import {PopChip} from '../components/pop-chip';
import {Sfx} from '../audio/sound-effects';
import {SceneActor} from '../components/scene-actor';
import {poseAt, timeScene, wordStart} from '../storyboard/scene-timeline';
import {SceneFrame, sceneById, useSceneTime} from './scene-frame';

const SCENE = sceneById('s08-nandu');
const GROUND = 880;
const NANDU_X = 700;
const PHONE_X = 1300;
const PX = 22; // pixel size for Nandu's world props
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** Snap time to 10fps so props move like sprites, matching Nandu. */
const stepped = (t: number) => Math.floor(t * 10) / 10;

const PixelRects: React.FC<{rows: string[]; palette: Record<string, string>}> = ({rows, palette}) => (
	<>
		{rows.flatMap((row, y) =>
			[...row].map((c, x) => (palette[c] ? <rect key={`${x}-${y}`} x={x * PX} y={y * PX} width={PX + 0.5} height={PX + 0.5} fill={palette[c]} /> : null)),
		)}
	</>
);

const PHONE = [
	'.ggggggggg.',
	'gwwwwwwwwwg',
	'gwssssssswg',
	'gwssssssswg',
	'gwssssssswg',
	'gwssssssswg',
	'gwssssssswg',
	'gwssssssswg',
	'gwssssssswg',
	'gwssssssswg',
	'gwssssssswg',
	'gwwwwwwwwwg',
	'gwwwwkwwwwg',
	'.ggggggggg.',
];
const KEY = ['.yyy.......', 'yy.yyyyyyyy', 'yy.yy..y.y.', '.yyy.......'];
const LOCK = ['..www..', '.w...w.', '.w...w.', 'wwwwwww', 'www.www', 'www.www', 'wwwwwww'];

export const S08NanduSelfCustodyScene: React.FC = () => {
	const t = useSceneTime();
	const {lines} = timeScene(SCENE);
	const [line] = lines;

	const PHONE_IN = wordStart(line, 9); // "...on Polygon."
	const KEY_DROP = wordStart(line, 10); // "Your keys stay on your device."
	const LOCKED = KEY_DROP + 0.8;
	const STAMPS = [16, 18, 20].map((i) => wordStart(line, i));

	// Sprint in from the right, overshoot, skid back — all on stepped time.
	const st = stepped(t);
	const runX = interpolate(st, [0, 1.1, 1.35], [2150, NANDU_X - 50, NANDU_X], {...clamp, easing: Easing.out(Easing.quad)});
	const nandu = poseAt(
		'nandu',
		[
			{at: 0, action: 'walk', facing: -1},
			{at: 1.15, action: 'idle', facing: -1, look: 0},
			{at: PHONE_IN - 0.2, action: 'idle', facing: 1, look: 1},
			{at: KEY_DROP + 0.1, action: 'point', facing: 1, look: 1},
			{at: LOCKED + 0.4, action: 'idle', facing: -1, look: 0},
			{at: line.end + 0.1, action: 'celebrate', facing: -1},
		],
		lines,
		t,
	);
	// Running uses a faster stride than walking.
	const runningPose = t < 1.15 ? {...nandu, actionTime: nandu.actionTime * 1.8} : nandu;

	const dust = Array.from({length: 10}, (_, i) => {
		const born = i * 0.11;
		const age = st - born;
		if (age < 0 || age > 0.6 || born > 1.2) return null;
		const x = interpolate(born, [0, 1.1], [2150, NANDU_X], clamp) + 90 + age * 60;
		const s = PX * (1 - age / 0.6);
		return <rect key={i} x={x} y={GROUND - 30 - age * 60} width={s} height={s} fill={colors.nanduLight} opacity={1 - age / 0.6} />;
	});

	const phoneDrop = interpolate(stepped(t), [PHONE_IN, PHONE_IN + 0.4], [-700, 0], {...clamp, easing: Easing.out(Easing.bounce)});
	const keyY = interpolate(stepped(t), [KEY_DROP, KEY_DROP + 0.6], [-500, 150], {...clamp, easing: Easing.in(Easing.quad)});
	const keyVisible = t >= KEY_DROP && t < LOCKED;
	const sparkle = interpolate(t, [LOCKED, LOCKED + 0.6], [0, 1], clamp);
	const phoneTop = GROUND - PHONE.length * PX;

	return (
		<SceneFrame sceneId={SCENE.id} glowX={0.45} glowY={0.55}>
			<svg width={1920} height={1080} style={{position: 'absolute', shapeRendering: 'crispEdges'}}>
				{dust}
				{t >= PHONE_IN && (
					<g transform={`translate(${PHONE_X - (11 * PX) / 2} ${phoneTop + phoneDrop})`}>
						<PixelRects rows={PHONE} palette={{g: colors.nanduGold, w: colors.nanduShade, s: colors.tealDark, k: colors.nanduLight}} />
						{t >= LOCKED && (
							<g transform={`translate(${2 * PX} ${3 * PX})`}>
								<PixelRects rows={LOCK} palette={{w: colors.tealBright}} />
							</g>
						)}
					</g>
				)}
				{keyVisible && (
					<g transform={`translate(${PHONE_X - (11 * PX) / 2} ${phoneTop + keyY})`}>
						<PixelRects rows={KEY} palette={{y: colors.nanduLight}} />
					</g>
				)}
				{sparkle > 0 &&
					sparkle < 1 &&
					[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
						const a = (i / 8) * Math.PI * 2;
						const r = 60 + sparkle * 160;
						const cy = phoneTop + 5 * PX;
						return <rect key={i} x={PHONE_X + Math.cos(a) * r} y={cy + Math.sin(a) * r} width={PX * 0.8} height={PX * 0.8} fill={colors.tealBright} opacity={1 - sparkle} />;
					})}
			</svg>
			<Sfx name="pixel-run" at={0} />
			<Sfx name="pixel-skid" at={1.05} />
			<Sfx name="pixel-drop" at={PHONE_IN} />
			<Sfx name="pixel-drop" at={KEY_DROP} volume={0.8} />
			<Sfx name="pixel-lock" at={LOCKED} />
			{STAMPS.map((s) => (
				<Sfx key={s} name="text-stamp" at={s} />
			))}
			<SceneActor id="nandu" pose={runningPose} x={runX} groundY={GROUND} height={320} />
			<PopChip at={PHONE_IN + 0.3} x={PHONE_X} y={phoneTop - 60} label="Built on Polygon" coin="POL" color="#8247e5" size={26} />
			<div style={{position: 'absolute', top: 120, width: '100%', display: 'flex', justifyContent: 'center', gap: 36, fontFamily: fontInter}}>
				{['Your crypto.', 'Your wallet.', 'Your control.'].map((w, i) => {
					// Stamp: snaps from 1.6× to 1× in two steps, sprite-style.
					const k = stepped(t) - STAMPS[i];
					if (k < 0) return null;
					const scale = k < 0.1 ? 1.6 : k < 0.2 ? 1.15 : 1;
					return (
						<div key={w} style={{fontSize: 76, fontWeight: 800, color: i === 2 ? colors.nanduGold : colors.white, transform: `scale(${scale})`}}>
							{w}
						</div>
					);
				})}
			</div>
		</SceneFrame>
	);
};
