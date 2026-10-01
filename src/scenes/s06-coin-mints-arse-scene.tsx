import React from 'react';
import {Easing, interpolate, random} from 'remotion';
import {colors} from '../brand/brand-tokens';
import {PopChip} from '../components/pop-chip';
import {Sfx} from '../audio/sound-effects';
import {SceneActor} from '../components/scene-actor';
import {CAPSULE_OUTLET, CapsuleDomeMachine} from '../props/capsule-dome-minting-machine';
import {GROUND as MACHINE_GROUND} from '../props/minting-machine-parts';
import {poseAt, timeScene} from '../storyboard/scene-timeline';
import {SceneFrame, sceneById, useSceneTime} from './scene-frame';

const SCENE = sceneById('s06-coin');
const GROUND = 820; // raised so two- and three-line captions clear the machine base
const MACHINE_X = 1000; // centre of the capsule dome
const MACHINE_SCALE = 0.9;
const MACHINE_LEFT = MACHINE_X - 300 * MACHINE_SCALE;
const MACHINE_TOP = GROUND - MACHINE_GROUND * MACHINE_SCALE;
const OUTLET = {x: MACHINE_LEFT + CAPSULE_OUTLET.x * MACHINE_SCALE, y: MACHINE_TOP + CAPSULE_OUTLET.y * MACHINE_SCALE};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const S06CoinMintsArseScene: React.FC = () => {
	const t = useSceneTime();
	const {lines} = timeScene(SCENE);
	const [estLine, arseLine] = lines;

	// "Like this one!" lands at the end of Estable's line: crank, dome rattles, ARSe pops out.
	const CRANK = estLine.end - 1.7;
	const MINT = CRANK + 1.2;
	const LAND = MINT + 0.75;

	const drop = 1 - interpolate(t, [0, 0.55], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
	const op = interpolate(t, [CRANK, MINT], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
	const out = interpolate(t, [MINT, LAND], [0, 1], clamp);
	const shake = t > MINT && t < MINT + 0.2 ? (random(`sh${Math.floor(t * 30)}`) - 0.5) * 14 : 0;

	// ARSe shoots out of the chute and arcs to the right of the machine.
	const flight = out;
	const arseX = interpolate(flight, [0, 1], [OUTLET.x, 1560]);
	const arseY = interpolate(flight, [0, 1], [OUTLET.y + 60, GROUND]) - Math.sin(flight * Math.PI) * 320;
	const arseScale = interpolate(flight, [0, 0.35, 1], [0.2, 1, 1], clamp);
	const ring = interpolate(t, [MINT, MINT + 0.6], [0, 1], clamp);

	const estable = poseAt(
		'estable',
		[
			{at: 0, action: 'idle', look: 0.6},
			{at: estLine.start + 1.4, action: 'point', look: 1},
			{at: estLine.start + 2.8, action: 'idle', look: 0.4},
			{at: CRANK - 0.15, action: 'point', look: 1},
			{at: MINT + 0.1, action: 'celebrate', look: 1},
			{at: LAND + 0.8, action: 'idle', look: 1},
		],
		lines,
		t,
	);
	const arse = poseAt(
		'arse',
		[
			{at: 0, action: 'celebrate', facing: -1},
			{at: LAND, action: 'idle', facing: -1, look: -0.3},
			{at: arseLine.start, action: 'wave', facing: -1},
			{at: arseLine.start + 1.2, action: 'idle', facing: -1, look: 0},
		],
		lines,
		t,
	);

	return (
		<SceneFrame sceneId={SCENE.id} glowX={0.55} glowY={0.5}>
			<div style={{position: 'absolute', inset: 0, transform: `translate(${shake}px, ${shake * 0.5}px)`}}>
				<svg
					width={600 * MACHINE_SCALE}
					height={700 * MACHINE_SCALE}
					viewBox="0 0 600 700"
					style={{position: 'absolute', left: MACHINE_LEFT, top: MACHINE_TOP, overflow: 'visible', transform: `translateY(${-drop * 900}px)`}}
				>
					<CapsuleDomeMachine op={op} out={out} time={t} />
				</svg>
				<Sfx name="machine-drop" at={0.15} />
				<Sfx name="crank-rattle" at={CRANK} />
				<Sfx name="coin-pop-out" at={MINT - 0.05} />
				<Sfx name="landing-squash" at={LAND - 0.05} />
				{/* Multi-chain issuance. Avalanche (named on the site) has no Estable asset, so it folds into "+ more". */}
				<PopChip at={estLine.start + 2.2} x={MACHINE_X - 230} y={120} label="Ethereum" coin="ETH" dark size={24} />
				<PopChip at={estLine.start + 2.4} x={MACHINE_X} y={120} label="Polygon" coin="POL" dark size={24} />
				<PopChip at={estLine.start + 2.6} x={MACHINE_X + 200} y={120} label="+ more" dark size={24} />
				<SceneActor id="estable" pose={estable} x={590} groundY={GROUND} height={330} />
				{ring > 0 && ring < 1 && (
					<div
						style={{
							position: 'absolute',
							left: OUTLET.x,
							top: OUTLET.y,
							width: 500 * ring,
							height: 500 * ring,
							transform: 'translate(-50%, -50%)',
							borderRadius: '50%',
							border: `6px solid ${colors.arseSky}`,
							opacity: 1 - ring,
						}}
					/>
				)}
				{t >= MINT && <SceneActor id="arse" pose={arse} x={arseX} groundY={arseY} height={230} scale={arseScale} />}
				<PopChip at={arseLine.start + 3.3} x={1500} y={430} label="1 ARSe = 1 ARS" color={colors.arseBlue} size={34} />
				<PopChip at={arseLine.start + 5.6} x={1500} y={330} label="Verifiable reserves" color={colors.arseSky} dark size={28} />
			</div>
		</SceneFrame>
	);
};
