import React from 'react';
import {Easing, interpolate, spring, useVideoConfig} from 'remotion';
import {Sfx} from '../audio/sound-effects';
import {colors} from '../brand/brand-tokens';
import {PopChip} from '../components/pop-chip';
import {SceneActor} from '../components/scene-actor';
import {Globe, InfoCard, MapPin} from '../props/scene-props';
import {poseAt, timeScene, wordStart} from '../storyboard/scene-timeline';
import {SceneFrame, sceneById, useSceneTime} from './scene-frame';

const SCENE = sceneById('s02-who');
const GROUND = 790; // this line wraps to four caption rows, so the stage sits higher
const GLOBE = {cx: 1090, cy: 420, r: 280};
const ESTABLE_X = 420;
const WALK_END = 1.3;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** Degrees per second the globe turns; the pin rides along with it. */
const SPIN_SPEED = 4;

/** Two "money rail" orbits wrap the globe and coins ride them — the "rails for digital money" payoff. */
const MoneyRails: React.FC<{progress: number; time: number}> = ({progress, time}) => {
	const rails = [
		{rx: GLOBE.r * 1.38, ry: GLOBE.r * 0.42, rot: -14, color: colors.tealBright},
		{rx: GLOBE.r * 1.25, ry: GLOBE.r * 0.36, rot: 22, color: colors.arseSky},
	];
	return (
		<g>
			{rails.map((r, i) => {
				const p = interpolate(progress, [i * 0.2, i * 0.2 + 0.7], [0, 1], clamp);
				const circumference = Math.PI * (3 * (r.rx + r.ry) - Math.sqrt((3 * r.rx + r.ry) * (r.rx + 3 * r.ry)));
				// Coins travel along the drawn rail once it is complete.
				const coins = p >= 1 ? [0, 0.33, 0.66] : [];
				return (
					<g key={i} transform={`rotate(${r.rot} ${GLOBE.cx} ${GLOBE.cy})`}>
						<ellipse cx={GLOBE.cx} cy={GLOBE.cy} rx={r.rx} ry={r.ry} fill="none" stroke={colors.outline} strokeWidth={16} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - p)} strokeLinecap="round" />
						<ellipse cx={GLOBE.cx} cy={GLOBE.cy} rx={r.rx} ry={r.ry} fill="none" stroke={r.color} strokeWidth={8} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - p)} strokeLinecap="round" />
						{coins.map((c) => {
							const a = (c + time * 0.35 * (i ? -1 : 1)) * Math.PI * 2;
							return <circle key={c} cx={GLOBE.cx + Math.cos(a) * r.rx} cy={GLOBE.cy + Math.sin(a) * r.ry} r={15} fill={colors.nanduGold} stroke={colors.outline} strokeWidth={5} />;
						})}
					</g>
				);
			})}
		</g>
	);
};

export const S02WhoWeAreScene: React.FC = () => {
	const t = useSceneTime();
	const {fps} = useVideoConfig();
	const {lines} = timeScene(SCENE);
	const [line] = lines;

	const TETHER = wordStart(line, 2);
	const EL_SALVADOR = wordStart(line, 6);
	const FOUNDED = wordStart(line, 8);
	const RAILS = wordStart(line, 16);

	const walkX = interpolate(t, [0, WALK_END], [-160, ESTABLE_X], {...clamp, easing: Easing.out(Easing.quad)});
	const globeIn = spring({frame: t * fps, fps, config: {damping: 14, stiffness: 90}});
	const spin = t * SPIN_SPEED;
	// The pin targets Central America on the globe's first landmass and turns with the globe.
	const shift = ((spin % 360) / 360) * GLOBE.r * 2;
	const pinTarget = {x: GLOBE.cx - GLOBE.r * 0.32 + shift, y: GLOBE.cy - GLOBE.r * 0.05};
	const pinDrop = interpolate(t, [EL_SALVADOR - 0.15, EL_SALVADOR + 0.25], [-600, 0], {...clamp, easing: Easing.in(Easing.quad)});
	const pinSquash = interpolate(t, [EL_SALVADOR + 0.25, EL_SALVADOR + 0.35, EL_SALVADOR + 0.5], [1, 0.75, 1], clamp);
	const card = (at: number) => spring({frame: (t - at) * fps, fps, config: {damping: 12, stiffness: 170}});
	const rails = interpolate(t, [RAILS, RAILS + 1.4], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});

	const estable = poseAt(
		'estable',
		[
			{at: 0, action: 'walk'},
			{at: WALK_END, action: 'idle', look: 0.6},
			{at: EL_SALVADOR - 0.35, action: 'point', look: 1},
			{at: EL_SALVADOR + 1.1, action: 'idle', look: 0.5},
			{at: RAILS - 0.1, action: 'wave', look: 1},
			{at: RAILS + 1.2, action: 'idle', look: 0.6},
			{at: line.end + 0.05, action: 'celebrate', look: 0.3},
		],
		lines,
		t,
	);

	return (
		<SceneFrame sceneId={SCENE.id} glowX={0.58} glowY={0.42}>
			<Sfx name="footsteps-cartoon" at={0} volume={0.8} />
			<Sfx name="pin-drop" at={EL_SALVADOR + 0.2} />
			<Sfx name="card-flip" at={TETHER} />
			<Sfx name="card-flip" at={FOUNDED} />
			<Sfx name="arc-zip" at={RAILS} />
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<g transform={`translate(${GLOBE.cx} ${GLOBE.cy}) scale(${globeIn}) translate(${-GLOBE.cx} ${-GLOBE.cy})`}>
					{/* Back halves of the rails sit behind the globe; the full rails are drawn again in front, clipped to the lower half. */}
					<MoneyRails progress={rails} time={t} />
					<Globe cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r} spin={spin} />
					<clipPath id="s02-front-rails">
						<rect x={0} y={GLOBE.cy} width={1920} height={1080} />
					</clipPath>
					<g clipPath="url(#s02-front-rails)">
						<MoneyRails progress={rails} time={t} />
					</g>
					{t >= EL_SALVADOR - 0.15 && (
						<g transform={`translate(${pinTarget.x} ${pinTarget.y + pinDrop}) scale(1 ${pinSquash}) translate(${-pinTarget.x} ${-pinTarget.y})`}>
							<MapPin x={pinTarget.x} y={pinTarget.y} size={84} />
						</g>
					)}
				</g>
			</svg>
			<PopChip at={EL_SALVADOR + 0.45} x={pinTarget.x} y={pinTarget.y - 150} label="El Salvador" color={colors.tealBright} size={26} />
			{t >= TETHER && (
				<InfoCard x={1440} y={150} w={420} rotate={3} scale={card(TETHER)} accent={colors.tealBright}>
					A Tether portfolio company
				</InfoCard>
			)}
			{t >= FOUNDED && (
				<InfoCard x={1460} y={480} w={400} rotate={-2} scale={card(FOUNDED)} fontSize={34}>
					Founded by ex-Bitfinex &amp; Tether builders
				</InfoCard>
			)}
			<SceneActor id="estable" pose={estable} x={walkX} groundY={GROUND} height={330} />
		</SceneFrame>
	);
};
