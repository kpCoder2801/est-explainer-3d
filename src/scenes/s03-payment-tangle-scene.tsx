import React from 'react';
import {Easing, interpolate, random, spring, useVideoConfig} from 'remotion';
import {Sfx} from '../audio/sound-effects';
import {colors, fontInter} from '../brand/brand-tokens';
import {SceneActor} from '../components/scene-actor';
import {poseAt, timeScene, wordStart} from '../storyboard/scene-timeline';
import {SceneFrame, sceneById, useSceneTime} from './scene-frame';

const SCENE = sceneById('s03-problem');
const GROUND = 800; // three caption rows on this line; keep the stage above them
const ESTABLE_X = 430;
/** Where Estable's pointing glove sits (pull pose), derived from the rig at height 330. */
const HAND = {x: 598, y: GROUND - 262};
const KNOT = {x: 1290, y: 430};
const LINE = 8;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

type Node = {id: 'bank' | 'shop' | 'phone'; label: string; x: number; y: number; anchor: {x: number; y: number}};
const NODES: Node[] = [
	{id: 'bank', label: 'BANK', x: 990, y: 210, anchor: {x: 1060, y: 300}},
	{id: 'shop', label: 'SHOP', x: 1620, y: 280, anchor: {x: 1510, y: 330}},
	{id: 'phone', label: 'PHONE', x: 1310, y: 640, anchor: {x: 1310, y: 560}},
];

/** Smooth path through points (Catmull-Rom converted to cubic Béziers). */
const smoothPath = (pts: Array<{x: number; y: number}>) =>
	pts.reduce((d, p, i) => {
		if (i === 0) return `M ${p.x} ${p.y}`;
		const p0 = pts[i - 2] ?? pts[i - 1];
		const p1 = pts[i - 1];
		const p2 = p;
		const p3 = pts[i + 1] ?? p;
		const c1 = {x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6};
		const c2 = {x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6};
		return `${d} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`;
	}, '');

/** Knot loop offsets around KNOT; deterministic so every render is identical. */
const loop = (seed: string, n: number) =>
	Array.from({length: n}, (_, i) => {
		const a = (i / n) * Math.PI * 2 + random(`${seed}a${i}`) * 1.2;
		const r = 60 + random(`${seed}r${i}`) * 110;
		return {x: Math.cos(a) * r, y: Math.sin(a) * r * 0.8, ph: random(`${seed}p${i}`) * 6};
	});
const LOOPS = [loop('k1', 5), loop('k2', 5), loop('k3', 6)];

/** Sticker-style node box with a simple pictogram. */
const NodeBox: React.FC<{node: Node; scale: number; glow: number}> = ({node, scale, glow}) => {
	const w = 220;
	const h = 170;
	const ink = colors.outline;
	const icon =
		node.id === 'bank' ? (
			<g stroke={ink} strokeWidth={6} strokeLinejoin="round" fill={colors.tealLight}>
				<path d="M -55 -18 L 0 -52 L 55 -18 Z" />
				{[-36, 0, 36].map((x) => (
					<rect key={x} x={x - 8} y={-14} width={16} height={46} />
				))}
				<rect x={-60} y={32} width={120} height={14} rx={4} />
			</g>
		) : node.id === 'shop' ? (
			<g stroke={ink} strokeWidth={6} strokeLinejoin="round">
				<rect x={-50} y={-10} width={100} height={56} fill={colors.tealLight} />
				<rect x={-14} y={10} width={28} height={36} fill={colors.tealDark} />
				<path d="M -60 -14 L -50 -46 L 50 -46 L 60 -14 Q 45 2 30 -14 Q 15 2 0 -14 Q -15 2 -30 -14 Q -45 2 -60 -14 Z" fill="#ef6f78" />
			</g>
		) : (
			<g stroke={ink} strokeWidth={6}>
				<rect x={-30} y={-52} width={60} height={100} rx={12} fill={colors.tealLight} />
				<rect x={-20} y={-38} width={40} height={66} rx={6} fill={colors.tealDark} />
				<circle cx={0} cy={38} r={4} fill={ink} stroke="none" />
			</g>
		);
	return (
		<g transform={`translate(${node.x} ${node.y}) scale(${scale})`}>
			<rect x={-w / 2 - 10} y={-h / 2 - 10} width={w + 20} height={h + 20} rx={40} fill={colors.tealBright} opacity={glow * 0.45} />
			<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={30} fill={colors.teal} stroke={ink} strokeWidth={LINE} />
			<rect x={-w / 2 + LINE / 2} y={h / 2 - 34} width={w - LINE} height={30} rx={22} fill={colors.tealShade} />
			<path d={`M ${-w / 2 + 20} ${-h / 2 + 46} L ${-w / 2 + 20} ${-h / 2 + 20} L ${-w / 2 + 64} ${-h / 2 + 20}`} stroke={colors.white} strokeOpacity={0.45} strokeWidth={8} strokeLinecap="round" fill="none" />
			<g transform="translate(0 -14)">{icon}</g>
			<text y={h / 2 - 14} textAnchor="middle" fontFamily={fontInter} fontWeight={800} fontSize={26} letterSpacing={2} fill={colors.white}>
				{node.label}
			</text>
		</g>
	);
};

export const S03PaymentTangleScene: React.FC = () => {
	const t = useSceneTime();
	const {fps} = useVideoConfig();
	const {lines} = timeScene(SCENE);
	const [line] = lines;

	const MESSY = wordStart(line, 9); // "It's complex, fragmented, and slow."
	const PULL = wordStart(line, 14); // "Let's fix that."
	const SNAP = Math.min(wordStart(line, 16) + 0.35, line.end + 0.15);

	const pull = interpolate(t, [PULL + 0.2, SNAP], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
	const messy = interpolate(t, [MESSY - 0.2, MESSY + 0.3], [0, 1], clamp) * (1 - pull);
	const tangleFade = interpolate(t, [SNAP - 0.05, SNAP + 0.12], [1, 0], clamp);
	const clean = interpolate(t, [SNAP, SNAP + 0.4], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const flash = interpolate(t, [SNAP, SNAP + 0.1, SNAP + 0.6], [0, 1, 0], clamp);

	// Knot wobbles harder while it's "complex, fragmented, and slow", and tightens as Estable pulls.
	const wobble = 6 + messy * 16;
	const knotScale = 1 - pull * 0.92;
	const knotPts = (l: ReturnType<typeof loop>) =>
		l.map((p) => ({
			x: KNOT.x + p.x * knotScale + Math.sin(t * 7 + p.ph) * wobble * knotScale,
			y: KNOT.y + p.y * knotScale + Math.cos(t * 6 + p.ph) * wobble * knotScale,
		}));
	// Loose end lies on the floor, then jumps to Estable's glove on "Let's".
	const grab = interpolate(t, [PULL, PULL + 0.2], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
	const loose = {x: interpolate(grab, [0, 1], [740, HAND.x]) - pull * 40, y: interpolate(grab, [0, 1], [GROUND - 90, HAND.y])};
	const cable = smoothPath([
		NODES[0].anchor,
		...knotPts(LOOPS[0]),
		NODES[1].anchor,
		...knotPts(LOOPS[1]),
		NODES[2].anchor,
		...knotPts(LOOPS[2]),
		{x: (KNOT.x + loose.x) / 2, y: Math.max(KNOT.y, loose.y) + 40 * (1 - pull)},
		loose,
	]);
	const flicker = messy > 0.05 && random(`f${Math.floor(t * 9)}`) > 0.45;
	const cableColor = messy > 0.05 ? (flicker ? '#ff6b6b' : '#c0464e') : '#6f8d89';

	const box = (i: number) => spring({frame: (t - 0.1 - i * 0.15) * fps, fps, config: {damping: 11, stiffness: 150}});
	const bounce = 1 + Math.sin(interpolate(t, [SNAP, SNAP + 0.5], [0, Math.PI], clamp)) * 0.1;

	const estable = poseAt(
		'estable',
		[
			{at: 0, action: 'idle', look: 0.8},
			{at: MESSY + 0.6, action: 'idle', look: 1},
			{at: PULL, action: 'point', look: 1},
			{at: SNAP + 0.15, action: 'celebrate', look: 0.6},
		],
		lines,
		t,
	);

	return (
		<SceneFrame sceneId={SCENE.id} glowX={0.62} glowY={0.4}>
			{[0, 1, 2].map((i) => (
				<Sfx key={i} name="block-thud" at={0.1 + i * 0.15} volume={0.6} />
			))}
			<Sfx name="cable-tangle" at={MESSY - 0.1} volume={0.8} />
			<Sfx name="cable-snap-clean" at={SNAP - 0.25} />
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				{/* Clean connections draw in once the knot snaps. */}
				{clean > 0 &&
					NODES.map((a, i) => {
						const b = NODES[(i + 1) % NODES.length];
						const x2 = a.x + (b.x - a.x) * clean;
						const y2 = a.y + (b.y - a.y) * clean;
						return (
							<g key={a.id} strokeLinecap="round">
								<line x1={a.x} y1={a.y} x2={x2} y2={y2} stroke={colors.outline} strokeWidth={22} />
								<line x1={a.x} y1={a.y} x2={x2} y2={y2} stroke={colors.tealBright} strokeWidth={12} />
							</g>
						);
					})}
				<g opacity={tangleFade} fill="none" strokeLinecap="round" strokeLinejoin="round">
					<path d={cable} stroke={colors.outline} strokeWidth={22} />
					<path d={cable} stroke={cableColor} strokeWidth={12} />
				</g>
				{NODES.map((n, i) => (
					<g key={n.id} transform={`translate(${n.x} ${n.y}) scale(${bounce}) translate(${-n.x} ${-n.y})`}>
						<NodeBox node={n} scale={box(i)} glow={clean} />
					</g>
				))}
				<circle cx={KNOT.x} cy={KNOT.y} r={40 + flash * 260} fill="none" stroke={colors.tealBright} strokeWidth={10} opacity={flash} />
			</svg>
			<SceneActor id="estable" pose={estable} x={ESTABLE_X} groundY={GROUND} height={330} />
		</SceneFrame>
	);
};
