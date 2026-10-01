import React from 'react';
import {interpolate} from 'remotion';
import {Sfx} from '../../audio/sound-effects';
import {colors, fontInter} from '../../brand/brand-tokens';
import {CoinIcon} from '../../components/coin-icon';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {poseAt, timeScene, wordStart} from '../../storyboard/scene-timeline';
import {DUR, EASE_IN_OUT, EASE_OUT} from '../kit/mg-motion';
import {MgSceneFrame} from '../kit/mg-scene-frame';
import {MgActor} from '../mascots/mg-mascot';
import {BordersBeat, ShopBeat, SplitBeat} from './parts/mg-s07-beats';

const SCENE = sceneById('s07-arse-life');
const PAN = 0.45;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Piecewise eased value: holds between keys, eases across each [time, time + dur] span. */
const keyed = (t: number, keys: Array<{at: number; dur: number; to: number}>, from: number) =>
	keys.reduce((v, k) => interpolate(t, [k.at, k.at + k.dur], [v, k.to], {...clamp, easing: EASE_IN_OUT}), from);

/** A results stamp that slams in from 1.6× and settles with a slight tilt. */
const Stamp: React.FC<{t: number; at: number; tilt: number; children: React.ReactNode}> = ({t, at, tilt, children}) => {
	const p = EASE_OUT(interpolate(t, [at, at + DUR.std], [0, 1], clamp));
	if (p <= 0) return null;
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 18,
				padding: '22px 38px',
				borderRadius: 26,
				background: 'linear-gradient(135deg, #33b8e6, #1c93c4)',
				boxShadow: '0 22px 50px rgba(0,0,0,0.5), inset 0 0 0 3px rgba(255,255,255,0.35)',
				fontFamily: fontInter,
				fontWeight: 800,
				fontSize: 56,
				letterSpacing: '-0.02em',
				color: colors.white,
				opacity: p,
				transform: `scale(${1.6 - p * 0.6}) rotate(${tilt * p}deg)`,
			}}
		>
			{children}
		</div>
	);
};

/**
 * MG S07 — "ARSe in action". The camera flies across three use-case panels in sync with
 * the voice (borders → dinner → shop), then pulls back to a triptych of all three while
 * the results stamp in: seconds, low fees, Polygon. ARSe hops along in the foreground.
 */
export const MgS07ArseInActionScene: React.FC = () => {
	const t = useSceneTime();
	const {lines} = timeScene(SCENE);
	const [line] = lines;

	const B1 = wordStart(line, 4) - 0.3;
	const B2 = wordStart(line, 7) - 0.15;
	const B3 = wordStart(line, 12) - 0.25;
	const STAMPS = [13, 15, 18].map((i) => wordStart(line, i));

	// Camera centre (canvas x) and zoom: pan panel → panel, then pull back to the triptych.
	const camC = keyed(t, [{at: B1, dur: PAN, to: 2880}, {at: B2, dur: PAN, to: 4800}, {at: B3, dur: 0.6, to: 2880}], 960);
	const zoom = keyed(t, [{at: B1, dur: PAN / 2, to: 0.94}, {at: B1 + PAN / 2, dur: PAN / 2, to: 1}, {at: B2, dur: PAN / 2, to: 0.94}, {at: B2 + PAN / 2, dur: PAN / 2, to: 1}, {at: B3, dur: 0.6, to: 0.31}], 1);
	// Pull-back also tilts the camera up so the triptych sits above the stamps.
	const camY = keyed(t, [{at: B3, dur: 0.6, to: 1160}], 540);
	const dim = interpolate(t, [B3 + 0.3, B3 + 0.7], [1, 0.45], clamp);
	const blur = interpolate(t, [B1, B1 + PAN / 2, B1 + PAN], [0, 6, 0], clamp) + interpolate(t, [B2, B2 + PAN / 2, B2 + PAN], [0, 6, 0], clamp);

	const pose = poseAt(
		'arse',
		[
			{at: 0, action: 'idle', facing: -1, look: -0.6},
			{at: B1 - 0.1, action: 'jump', facing: -1},
			{at: B1 + 0.9, action: 'idle', facing: -1, look: -0.6},
			{at: B2 - 0.1, action: 'jump', facing: -1},
			{at: B2 + 0.9, action: 'idle', facing: -1, look: -0.6},
			{at: B3, action: 'celebrate', facing: -1},
		],
		lines,
		t,
	);

	const beats = [BordersBeat, SplitBeat, ShopBeat];
	return (
		<MgSceneFrame sceneId={SCENE.id} accent={colors.arseBlue} orbA={[0.3, 0.3]} orbB={[0.8, 0.65]}>
			{/* Parallax layer: floating geometry drifting at half the camera speed. */}
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				{Array.from({length: 18}, (_, i) => {
					const x = ((i * 397) % 5760) - (camC - 960) * 0.5;
					const y = 120 + ((i * 233) % 760);
					const kind = i % 3;
					return kind === 0 ? (
						<circle key={i} cx={x} cy={y} r={18 + (i % 4) * 8} fill="none" stroke={colors.arseSky} strokeOpacity={0.18} strokeWidth={3} />
					) : kind === 1 ? (
						<path key={i} d={`M ${x - 14} ${y} L ${x + 14} ${y} M ${x} ${y - 14} L ${x} ${y + 14}`} stroke={colors.tealBright} strokeOpacity={0.25} strokeWidth={4} strokeLinecap="round" />
					) : (
						<rect key={i} x={x - 12} y={y - 12} width={24} height={24} rx={6} fill={colors.arseBlue} opacity={0.15} transform={`rotate(${t * 20 + i * 30} ${x} ${y})`} />
					);
				})}
			</svg>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 5760,
					height: 1080,
					transformOrigin: '0 0',
					transform: `translate(${960 - camC * zoom}px, ${540 - camY * zoom}px) scale(${zoom})`,
					opacity: dim,
					filter: blur > 0.1 ? `blur(${blur}px)` : undefined,
				}}
			>
				{beats.map((Beat, i) => (
					<div key={i} style={{position: 'absolute', left: i * 1920, top: 0, width: 1920, height: 1080}}>
						<Beat t={t} line={line} />
					</div>
				))}
			</div>
			<div style={{position: 'absolute', left: 0, right: 360, top: 610, display: 'flex', justifyContent: 'center', gap: 30}}>
				<Stamp t={t} at={STAMPS[0]} tilt={-3}>
					⚡ In seconds
				</Stamp>
				<Stamp t={t} at={STAMPS[1]} tilt={2}>
					Low fees
				</Stamp>
				<Stamp t={t} at={STAMPS[2]} tilt={-2}>
					<CoinIcon symbol="POL" size={56} />
					Polygon
				</Stamp>
			</div>
			<MgActor id="arse" pose={pose} x={1590} groundY={830} height={230} />
			<Sfx name="mg-data" at={wordStart(line, 0)} volume={0.7} />
			<Sfx name="mg-pop" at={wordStart(line, 3)} volume={0.7} />
			<Sfx name="mg-whoosh" at={B1} />
			<Sfx name="mg-pop" at={wordStart(line, 6)} volume={0.8} />
			<Sfx name="mg-whoosh" at={B2} />
			<Sfx name="mg-type" at={wordStart(line, 8)} volume={0.6} />
			<Sfx name="mg-confirm" at={wordStart(line, 11)} volume={0.8} />
			<Sfx name="mg-whoosh" at={B3} volume={0.8} />
			{STAMPS.map((s) => (
				<Sfx key={s} name="mg-impact" at={s} volume={0.45} />
			))}
			<Sfx name="mg-coin" at={STAMPS[2] + 0.05} volume={0.8} />
		</MgSceneFrame>
	);
};
