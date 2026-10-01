import React from 'react';
import {interpolate} from 'remotion';
import {Sfx} from '../../audio/sound-effects';
import {colors, fontInter} from '../../brand/brand-tokens';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {poseAt, timeScene, wordStart} from '../../storyboard/scene-timeline';
import {DrawPath} from '../kit/draw-path';
import {KineticPhrase} from '../kit/kinetic-phrase';
import {MgSceneFrame} from '../kit/mg-scene-frame';
import {between, DUR, EASE_OUT, enter} from '../kit/mg-motion';
import {MgActor} from '../mascots/mg-mascot';
import {ConversionNode, FlyingCoin, InvoiceCard, SettleCard} from './parts/mg-s04-pay-parts';

const SCENE = sceneById('s04-pay');
const NODE: [number, number] = [1250, 450];
const CARD = {x: 450, y: 230};

/**
 * MG S04 — Estable Pay. An invoice UI builds itself, real crypto coins fly curved paths
 * into a glowing conversion node, a single stable-value stream settles into a counter,
 * then "Instantly." punches in over a dimmed stage with a self-drawing check.
 */
export const MgS04EstablePayScene: React.FC = () => {
	const t = useSceneTime();
	const {lines} = timeScene(SCENE);
	const [line] = lines;
	// Word indices: 4 send · 6 invoice · 7 customers · 8 pay · 10 crypto · 14 settles · 16 stable · 18 Instantly.
	const sendAt = wordStart(line, 4);
	const customersAt = wordStart(line, 7);
	const settleAt = wordStart(line, 14);
	const stableAt = wordStart(line, 16);
	const instantAt = wordStart(line, 18);
	const coinAt = [wordStart(line, 8), wordStart(line, 9), wordStart(line, 10)].map((w) => w - 0.15);
	const arrivals = coinAt.map((a) => a + 0.62);

	const nodeAppear = enter(t, customersAt - 0.25, DUR.slow);
	const pulse = Math.max(0, ...arrivals.map((a) => interpolate(t, [a - 0.05, a + 0.05, a + 0.45], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
	const stream = between(t, settleAt - 0.1, settleAt + 0.5);
	const dim = enter(t, instantAt - 0.06, DUR.quick);
	const punch = enter(t, instantAt - 0.04, 0.18, EASE_OUT);
	const check = between(t, instantAt + 0.15, instantAt + 0.6);

	// Slow camera push across the whole scene, plus a recoil on "Instantly."
	const push = interpolate(t, [0, 11], [1, 1.05]);
	const stageScale = push * (1 - dim * 0.06);

	const estable = poseAt(
		'estable',
		[
			{at: 0, action: 'idle', look: 0.6},
			{at: sendAt - 0.1, action: 'point', facing: 1, look: 1},
			{at: customersAt + 0.2, action: 'idle', facing: 1, look: 0.8},
			{at: settleAt, action: 'jump', facing: 1, look: 1},
			{at: settleAt + 0.9, action: 'idle', facing: 1, look: 0.6},
			{at: instantAt, action: 'celebrate', facing: 1},
		],
		lines,
		t,
	);

	const streamEnd = 1470;
	return (
		<MgSceneFrame sceneId={SCENE.id} orbA={[0.62, 0.42]} orbB={[0.2, 0.75]}>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${stageScale})`, transformOrigin: '50% 45%', opacity: 1 - dim * 0.72}}>
				<KineticPhrase line={line} from={0} to={2} x={110} y={86} size={84} width={1000} align="left" accent={['pay,']} exitAt={customersAt - 0.3} />
				<div style={{position: 'absolute', left: CARD.x, top: CARD.y, width: 400, height: 500, transform: `translateY(${Math.sin(t * 1.3) * 6}px) rotate(-2deg)`}}>
					<InvoiceCard t={t} buildAt={sendAt - 0.15} paid={between(t, settleAt + 0.4, settleAt + 0.7)} />
				</div>
				<svg width={1920} height={1080} style={{position: 'absolute'}}>
					{/* Invoice → node request line, then node → settlement stream. */}
					<DrawPath d={`M ${CARD.x + 400} ${CARD.y + 250} C ${CARD.x + 520} ${CARD.y + 250} ${NODE[0] - 260} ${NODE[1]} ${NODE[0] - 150} ${NODE[1]}`} progress={between(t, customersAt - 0.3, customersAt + 0.3)} stroke={colors.tealBright} width={3} opacity={0.5} />
					<DrawPath d={`M ${NODE[0] + 150} ${NODE[1]} L ${streamEnd} ${NODE[1]}`} progress={stream} stroke={colors.tealBright} width={10} />
					{stream >= 1 &&
						[0, 1, 2, 3].map((i) => {
							const k = ((t * 1.6 + i / 4) % 1);
							return <circle key={i} cx={NODE[0] + 150 + k * (streamEnd - NODE[0] - 150)} cy={NODE[1]} r={7} fill={colors.white} opacity={Math.sin(k * Math.PI)} />;
						})}
				</svg>
				<div style={{position: 'absolute', left: NODE[0] - 180, top: NODE[1] - 180, width: 360, height: 360}}>
					<ConversionNode t={t} appear={nodeAppear} pulse={pulse} />
				</div>
				<FlyingCoin t={t} at={coinAt[0]} symbol="BTC" from={[760, -120]} ctrl={[1000, 120]} to={NODE} />
				<FlyingCoin t={t} at={coinAt[1]} symbol="ETH" from={[1600, -140]} ctrl={[1500, 140]} to={NODE} />
				<FlyingCoin t={t} at={coinAt[2]} symbol="TRX" from={[2000, 760]} ctrl={[1560, 760]} to={NODE} />
				<div style={{position: 'absolute', left: streamEnd, top: NODE[1] - 110, width: 380, height: 220}}>
					<SettleCard t={t} at={settleAt + 0.3} countTo={stableAt + 0.7} />
				</div>
				<KineticPhrase line={line} from={16} to={17} x={NODE[0] + 40} y={650} size={92} width={1000} uppercase accent={['stable', 'value.']} />
				<MgActor id="estable" pose={estable} x={250} groundY={860} height={260} />
			</div>
			{/* "Instantly." — hard cut-in over the dimmed stage. */}
			{t >= instantAt - 0.04 && (
				<>
					<svg width={1920} height={1080} style={{position: 'absolute'}}>
						<circle cx={960} cy={250} r={74} fill={colors.tealBright} opacity={check > 0 ? 0.18 : 0} />
						<DrawPath d="M 960 176 A 74 74 0 1 1 959.9 176" progress={check} stroke={colors.tealBright} width={10} />
						<DrawPath d="M 924 252 L 950 278 L 1000 222" progress={between(t, instantAt + 0.45, instantAt + 0.75)} stroke={colors.white} width={14} />
					</svg>
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							top: 360,
							textAlign: 'center',
							fontFamily: fontInter,
							fontWeight: 800,
							fontSize: 230,
							letterSpacing: '-0.04em',
							color: colors.white,
							transform: `scale(${1.35 - punch * 0.35})`,
							opacity: Math.min(1, punch * 3),
						}}
					>
						Instantly<span style={{color: colors.tealBright}}>.</span>
					</div>
				</>
			)}
			<Sfx name="mg-whoosh" at={0.3} volume={0.7} />
			<Sfx name="mg-type" at={sendAt - 0.1} volume={0.6} />
			<Sfx name="mg-data" at={customersAt - 0.25} volume={0.6} />
			{arrivals.map((a) => (
				<Sfx key={a} name="mg-coin" at={a - 0.05} volume={0.7} />
			))}
			<Sfx name="mg-whoosh" at={settleAt - 0.1} volume={0.6} />
			<Sfx name="mg-riser" at={instantAt - 1.4} volume={0.45} />
			<Sfx name="mg-impact" at={instantAt - 0.04} />
			<Sfx name="mg-confirm" at={instantAt + 0.5} />
		</MgSceneFrame>
	);
};
