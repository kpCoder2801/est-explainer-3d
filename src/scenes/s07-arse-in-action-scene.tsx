import React from 'react';
import {Easing, interpolate, spring, useVideoConfig} from 'remotion';
import {Sfx} from '../audio/sound-effects';
import {colors} from '../brand/brand-tokens';
import {PopChip} from '../components/pop-chip';
import {SceneActor} from '../components/scene-actor';
import {Globe, MapPin} from '../props/scene-props';
import {Beat, poseAt, timeScene, wordStart} from '../storyboard/scene-timeline';
import {ArcTrail, bezier, DinnerReceipt, ShopStall, SplitPhone} from './parts/s07-arse-props';
import {SceneFrame, sceneById, useSceneTime} from './scene-frame';

const SCENE = sceneById('s07-arse-life');
const GROUND = 840;
const STAGE_W = 1920;
const ARSE_H = 230;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);

// Stage 1: remittance arc across the globe (Argentina → far side).
const GLOBE = {cx: 900, cy: 450, r: 260};
const ARG = {x: 820, y: 610};
const ARC_CTRL = {x: 640, y: 120};
const DEST = {x: 1090, y: 320};
// Stage 2: dinner split between two phones.
const PHONE_L = 520;
const PHONE_R = 1170;
const RECEIPT = {x: 960, y: 330};
// Stage 3: shop counter with QR.
const STALL_X = 1000;
const COUNTER_TOP = GROUND - 200;

type Spot = {x: number; y: number; s: number};
/** Hop from a to b at progress p with a peak of h px. */
const hop = (a: Spot, b: Spot, p: number, h: number): Spot => ({
	x: a.x + (b.x - a.x) * p,
	y: a.y + (b.y - a.y) * p - Math.sin(p * Math.PI) * h,
	s: a.s + (b.s - a.s) * p,
});

/**
 * S07 — ARSe in action: three word-synced vignettes on a panning stage (remittance,
 * dinner split, shop QR payment), then "seconds / low fees / Polygon" chips.
 */
export const S07ArseInActionScene: React.FC = () => {
	const t = useSceneTime();
	const {fps} = useVideoConfig();
	const {lines} = timeScene(SCENE);
	const [line] = lines;

	// Cues from the spoken words ("Send money across borders, split a dinner, or pay at a shop. In seconds, with low fees, on Polygon.").
	const ZIP = wordStart(line, 1); // "money"
	const ARRIVE = ZIP + 0.6;
	const B2 = wordStart(line, 4); // "split"
	const T2 = B2 - 0.3;
	const B3 = wordStart(line, 7); // "or"
	const T3 = B3 - 0.3;
	const PAY = wordStart(line, 9); // "at" — lands on the QR right after "pay"
	const CHIPS = [13, 15, 18].map((i) => wordStart(line, i)); // seconds · low · Polygon

	const camera = interpolate(t, [T2, B2, T3, B3], [0, 1, 1, 2], {...clamp, easing: ease}) * -STAGE_W;
	const stage = (i: number) => `translate(${i * STAGE_W + camera} 0)`;

	// ARSe's path in screen space.
	const zipP = interpolate(t, [ZIP, ARRIVE], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
	const onArc = bezier(ARG, ARC_CTRL, DEST, zipP);
	const s1: Spot = {x: onArc.x, y: onArc.y, s: 0.5};
	const s2: Spot = {x: 960, y: GROUND, s: 1};
	const s3a: Spot = {x: 560, y: GROUND, s: 1};
	const s3b: Spot = {x: 900, y: COUNTER_TOP, s: 1};
	const arse =
		t < T2
			? s1
			: t < B2
				? hop({x: DEST.x, y: DEST.y, s: 0.5}, s2, interpolate(t, [T2, B2], [0, 1], clamp), 160)
				: t < T3
					? s2
					: t < B3
						? hop(s2, s3a, interpolate(t, [T3, B3], [0, 1], clamp), 120)
						: hop(s3a, s3b, interpolate(t, [B3, PAY], [0, 1], clamp), 200);

	const beats: Beat[] = [
		{at: 0, action: 'idle', facing: 1, look: 0.4},
		{at: ZIP, action: 'celebrate', facing: 1},
		{at: ARRIVE, action: 'idle', facing: 1, look: -0.3},
		{at: T2, action: 'jump', facing: -1},
		{at: B2 + 0.35, action: 'jump', facing: 1},
		{at: T3, action: 'jump', facing: -1},
		{at: B3, action: 'jump', facing: 1},
		{at: PAY, action: 'celebrate', facing: 1},
		{at: PAY + 0.7, action: 'idle', facing: 1, look: 0.4},
		{at: CHIPS[2], action: 'celebrate', facing: 1},
	];
	const pose = poseAt('arse', beats, lines, t);

	const destPin = spring({frame: (t - ARRIVE) * fps, fps, config: {damping: 10, stiffness: 180}});
	const split = interpolate(t, [B2 + 0.05, B2 + 0.4], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
	const receiptIn = spring({frame: (t - T2) * fps, fps, config: {damping: 12, stiffness: 200}});
	const checked = t >= B2 + 0.4;
	const scanned = interpolate(t, [PAY, PAY + 0.15, PAY + 0.6], [0, 1, 0.6], clamp);

	return (
		<SceneFrame sceneId={SCENE.id} glowX={0.5} glowY={0.45}>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<g transform={stage(0)}>
					<Globe cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r} spin={t * 25} />
					<ArcTrail a={ARG} c={ARC_CTRL} b={DEST} progress={zipP} />
					<MapPin x={ARG.x} y={ARG.y + 4} size={56} color={colors.arseBlue} />
					{destPin > 0.01 && (
						<g transform={`translate(${DEST.x} ${DEST.y + 4}) scale(${destPin}) translate(${-DEST.x} ${-(DEST.y + 4)})`}>
							<MapPin x={DEST.x} y={DEST.y + 4} size={56} />
						</g>
					)}
				</g>
				<g transform={stage(1)}>
					<SplitPhone x={PHONE_L} y={300} done={checked} />
					<SplitPhone x={PHONE_R} y={300} done={checked} />
					<g transform={`translate(${RECEIPT.x} ${RECEIPT.y}) scale(${receiptIn}) translate(${-RECEIPT.x} ${-RECEIPT.y})`}>
						<DinnerReceipt x={RECEIPT.x} y={RECEIPT.y} split={split} spread={325} opacity={interpolate(split, [0.8, 1], [1, 0], clamp)} />
					</g>
				</g>
				<g transform={stage(2)}>
					<ShopStall x={STALL_X} ground={GROUND} scanned={scanned} />
				</g>
			</svg>
			<SceneActor id="arse" pose={pose} x={arse.x} groundY={arse.y} height={ARSE_H} scale={arse.s} />
			{t >= PAY && <PopChip at={PAY + 0.1} x={STALL_X + 135 + camera + 2 * STAGE_W} y={400} label="Paid ✓" color="#3ccf7a" size={30} />}
			<PopChip at={CHIPS[0]} x={560} y={120} label="⚡ Seconds" color={colors.arseBlue} size={34} />
			<PopChip at={CHIPS[1]} x={960} y={120} label="Low fees" color={colors.arseSky} size={34} />
			<PopChip at={CHIPS[2]} x={1360} y={120} label="Polygon" coin="POL" color="#8247e5" dark size={34} />
			<Sfx name="arc-zip" at={ZIP} volume={0.8} />
			<Sfx name="phone-ping" at={ARRIVE} volume={0.7} />
			<Sfx name="hop-boing" at={T2} volume={0.6} />
			<Sfx name="card-flip" at={B2 + 0.05} volume={0.8} />
			<Sfx name="phone-ping" at={B2 + 0.4} volume={0.7} />
			<Sfx name="hop-boing" at={T3} volume={0.6} />
			<Sfx name="qr-beep" at={PAY} volume={0.8} />
		</SceneFrame>
	);
};
