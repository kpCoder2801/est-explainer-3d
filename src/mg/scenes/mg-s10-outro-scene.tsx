import React from 'react';
import {interpolate} from 'remotion';
import {Sfx} from '../../audio/sound-effects';
import {colors, fontInter} from '../../brand/brand-tokens';
import {EstableLogoShape} from '../../mascots/estable-mascot';
import {MascotPose} from '../../mascots/shared/mascot-motion';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {poseAt, timeScene, wordStart} from '../../storyboard/scene-timeline';
import {DrawPath} from '../kit/draw-path';
import {KineticPhrase} from '../kit/kinetic-phrase';
import {MaskReveal} from '../kit/mask-reveal';
import {MgSceneFrame} from '../kit/mg-scene-frame';
import {between, DUR, EASE_IN_OUT, EASE_OUT, enter} from '../kit/mg-motion';
import {MgActor} from '../mascots/mg-mascot';

const SCENE = sceneById('s10-outro');
const LOGO = {cx: 960, top: 130, size: 250};
const PILL = {cx: 960, cy: 650, w: 440, h: 104};
const HOLD = 1.2; // final seconds frozen for a clean end frame

/**
 * MG S10 — the bookend logo sting. The cast converges; Estable and ARSe morph into their
 * marks while Nandu's pixels scatter; everything collapses into the white Estable logo on
 * the opener's construction grid; the headline builds word by word; "estable.io" stamps
 * into a drawn pill as the cast pops back in small. The last ~1.2s holds still.
 */
export const MgS10OutroScene: React.FC = () => {
	const sceneT = useSceneTime();
	const {lines, duration} = timeScene(SCENE);
	const [est, arse, nandu] = lines;
	// Freeze everything for the final hold so the end frame is perfectly clean.
	const t = Math.min(sceneT, duration - HOLD);

	const MORPH = wordStart(est, 0);
	const COLLAPSE = MORPH + 0.65;
	const LAND = COLLAPSE + 0.38;
	const morph = enter(t, MORPH, DUR.slow);
	const collapse = between(t, COLLAPSE, LAND, 0, 1, EASE_IN_OUT);
	const land = enter(t, LAND, DUR.slow, EASE_OUT);
	const guides = enter(t, LAND, DUR.slow) * (1 - enter(t, LAND + 0.9, DUR.slow));
	const ring = enter(t, LAND, 0.6);
	const pill = between(t, arse.start - 0.1, arse.start + 0.5, 0, 1);
	const STAMP = wordStart(nandu, 0) - 0.05;
	const stamp = enter(t, STAMP, DUR.std);

	const big = (id: 'estable' | 'arse' | 'nandu', x: number): MascotPose =>
		poseAt(id, [{at: 0, action: 'wave', facing: x < 960 ? 1 : x > 960 ? -1 : 1}, {at: MORPH, action: 'idle', look: 0}], lines, t);
	const small = (id: 'arse' | 'nandu', facing: 1 | -1, cheerAt: number): MascotPose =>
		poseAt(id, [{at: 0, action: 'idle', facing, look: facing * 0.5}, {at: cheerAt, action: 'celebrate', facing}], lines, t);

	// Big cast: converge toward centre, then collapse up into the logo spot.
	const converge = between(t, 0, MORPH, 0, 1, EASE_OUT);
	const lx = (start: number) => interpolate(collapse, [0, 1], [interpolate(converge, [0, 1], [start, start * 0.75 + 960 * 0.25]), 960]);
	const ly = interpolate(collapse, [0, 1], [760, LOGO.top + LOGO.size]);
	const fade = 1 - collapse;
	const k = interpolate(collapse, [0, 1], [1, 0.55]);

	return (
		<MgSceneFrame sceneId={SCENE.id} orbA={[0.5, 0.3]} orbB={[0.5, 0.85]}>
			{collapse < 1 && (
				<>
					<MgActor id="arse" pose={big('arse', 520)} x={lx(520)} groundY={ly} height={210 * k} opacity={fade} morph={morph} />
					<MgActor id="nandu" pose={big('nandu', 1400)} x={lx(1400)} groundY={ly} height={240 * k} opacity={fade} morph={1 - morph} />
					<MgActor id="estable" pose={big('estable', 960)} x={960} groundY={ly} height={320 * k} opacity={fade} morph={morph} />
				</>
			)}

			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				{/* Opener's construction grid returns around the final mark. */}
				<g opacity={guides}>
					<line x1={960 - 900 * guides} y1={LOGO.top + LOGO.size / 2} x2={960 + 900 * guides} y2={LOGO.top + LOGO.size / 2} stroke={colors.tealBright} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="6 10" />
					<line x1={960} y1={LOGO.top + LOGO.size / 2 - 300 * guides} x2={960} y2={LOGO.top + LOGO.size / 2 + 300 * guides} stroke={colors.tealBright} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="6 10" />
					{[0, 1, 2].map((i) => {
						const a = (-90 + i * 120) * (Math.PI / 180);
						return <circle key={i} cx={960 + Math.cos(a) * 200 * ring} cy={LOGO.top + LOGO.size * 0.58 + Math.sin(a) * 200 * ring} r={6} fill={colors.tealBright} />;
					})}
				</g>
				<circle cx={960} cy={LOGO.top + LOGO.size * 0.58} r={200 * ring} fill="none" stroke={colors.tealBright} strokeOpacity={0.3 * (1 - ring * 0.5)} strokeWidth={2} />
				{land > 0 && ring < 1 && <circle cx={960} cy={LOGO.top + LOGO.size * 0.58} r={80 + ring * 520} fill="none" stroke={colors.white} strokeWidth={14 * (1 - ring)} opacity={1 - ring} />}
				<g opacity={land} transform={`translate(${LOGO.cx} ${LOGO.top + LOGO.size / 2}) scale(${interpolate(land, [0, 1], [1.35, 1]) * (LOGO.size / 1024)}) translate(-512 -512)`}>
					<EstableLogoShape fill={colors.white} />
				</g>
				{/* "See you at…" draws the pill; "estable dot io!" stamps the URL into it. */}
				<DrawPath
					d={`M ${PILL.cx} ${PILL.cy - PILL.h / 2} L ${PILL.cx + PILL.w / 2 - PILL.h / 2} ${PILL.cy - PILL.h / 2} A ${PILL.h / 2} ${PILL.h / 2} 0 0 1 ${PILL.cx + PILL.w / 2 - PILL.h / 2} ${PILL.cy + PILL.h / 2} L ${PILL.cx - PILL.w / 2 + PILL.h / 2} ${PILL.cy + PILL.h / 2} A ${PILL.h / 2} ${PILL.h / 2} 0 0 1 ${PILL.cx - PILL.w / 2 + PILL.h / 2} ${PILL.cy - PILL.h / 2} Z`}
					progress={pill}
					stroke={colors.tealBright}
					width={5}
					fill={stamp > 0 ? `rgba(0,157,146,${0.22 * stamp})` : 'none'}
				/>
			</svg>

			<KineticPhrase line={est} from={1} to={6} x={960} y={430} size={84} width={1760} accent={['future', 'digital', 'finance.']} />
			<div
				style={{
					position: 'absolute',
					left: PILL.cx - PILL.w / 2,
					top: PILL.cy - 40,
					width: PILL.w,
					textAlign: 'center',
					fontFamily: fontInter,
					fontWeight: 800,
					fontSize: 60,
					letterSpacing: '-0.02em',
					lineHeight: 1.15,
					color: colors.white,
					transform: `scale(${interpolate(stamp, [0, 1], [1.4, 1])})`,
				}}
			>
				<MaskReveal at={STAMP}>
					estable<span style={{color: colors.tealBright}}>.io</span>
				</MaskReveal>
			</div>

			<MgActor id="arse" pose={small('arse', 1, nandu.end)} x={PILL.cx - PILL.w / 2 - 110} groundY={PILL.cy + PILL.h / 2 + 10} height={120} scale={enter(t, arse.start - 0.15, DUR.std)} opacity={enter(t, arse.start - 0.15, DUR.quick)} />
			<MgActor id="nandu" pose={small('nandu', -1, nandu.end)} x={PILL.cx + PILL.w / 2 + 110} groundY={PILL.cy + PILL.h / 2 + 10} height={130} morph={between(t, nandu.start - 0.2, nandu.start + 0.4, 0, 1, EASE_OUT)} />

			<Sfx name="mg-whoosh" at={0.05} volume={0.7} />
			<Sfx name="mg-glitch" at={MORPH + 0.1} volume={0.7} />
			<Sfx name="mg-riser" at={COLLAPSE - 0.9} volume={0.5} />
			<Sfx name="mg-bass-drop" at={LAND} />
			<Sfx name="mg-sparkle" at={LAND + 0.05} volume={0.7} />
			<Sfx name="mg-type" at={wordStart(est, 1)} volume={0.5} />
			<Sfx name="mg-tick" at={arse.start - 0.1} volume={0.7} />
			<Sfx name="mg-sparkle" at={nandu.start - 0.2} volume={0.5} />
			<Sfx name="mg-confirm" at={STAMP} />
		</MgSceneFrame>
	);
};
