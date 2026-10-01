import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fontInter} from '../brand/brand-tokens';
import {BrandNetworkBackground} from '../components/brand-network-background';
import {SceneActor} from '../components/scene-actor';
import {MASCOT_META, MascotId} from '../mascots/mascot';
import {MascotAction, mouthFromText} from '../mascots/shared/mascot-motion';

const CAST: Array<{id: MascotId; x: number; height: number}> = [
	{id: 'estable', x: 520, height: 420},
	{id: 'arse', x: 1060, height: 300},
	{id: 'nandu', x: 1500, height: 380},
];
const TURN = 2; // seconds each mascot holds the "spotlight"

/** Close-up review of the cast at large size: each takes a turn talking, waving, then pointing. */
export const MascotCastLineup: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const turn = Math.floor(t / TURN) % CAST.length;
	return (
		<AbsoluteFill style={{fontFamily: fontInter, color: colors.white}}>
			<BrandNetworkBackground glowX={0.5} glowY={0.55} />
			{CAST.map((c, i) => {
				const local = t - Math.floor(t / TURN) * TURN;
				const active = i === turn;
				const action: MascotAction = !active ? 'idle' : local < 0.9 ? 'talk' : local < 1.5 ? 'wave' : 'point';
				return (
					<React.Fragment key={c.id}>
						<SceneActor
							id={c.id}
							x={c.x}
							groundY={900}
							height={c.height}
							pose={{
								action,
								actionTime: active ? local - (local < 0.9 ? 0 : local < 1.5 ? 0.9 : 1.5) : t,
								time: t + i,
								mouth: active ? mouthFromText('Hello there, nice to meet you', local, TURN) : 0,
								look: active ? 0.4 : (CAST[turn].x - c.x) / 900,
								facing: 1,
								seed: `lineup-${c.id}`,
							}}
						/>
						<div style={{position: 'absolute', left: c.x, top: 960, transform: 'translateX(-50%)', textAlign: 'center'}}>
							<div style={{fontSize: 36, fontWeight: 800, color: MASCOT_META[c.id].color}}>{MASCOT_META[c.id].name}</div>
							<div style={{fontSize: 20, opacity: 0.7}}>{MASCOT_META[c.id].role}</div>
						</div>
					</React.Fragment>
				);
			})}
		</AbsoluteFill>
	);
};
