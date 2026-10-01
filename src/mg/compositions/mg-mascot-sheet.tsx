import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fontInter} from '../../brand/brand-tokens';
import {MASCOT_META, MascotId} from '../../mascots/mascot';
import {MascotAction, MascotPose, mouthFromText} from '../../mascots/shared/mascot-motion';
import {MgBackground} from '../kit/mg-background';
import {EASE_IN_OUT} from '../kit/mg-motion';
import {MgActor} from '../mascots/mg-mascot';

const ACTIONS: MascotAction[] = ['idle', 'talk', 'walk', 'wave', 'point', 'jump', 'celebrate'];
const CAST: Array<{id: MascotId; height: number}> = [
	{id: 'estable', height: 150},
	{id: 'arse', height: 120},
	{id: 'nandu', height: 140},
];

/** Review sheet for the MG cast: every action per mascot, plus the logo-morph / pixel-assembly loop. */
export const MgMascotSheet: React.FC = () => {
	const t = useCurrentFrame() / useVideoConfig().fps;
	const colW = 1920 / (ACTIONS.length + 1.4);
	// Morph loop: character → logo → character over 4s.
	const morph = EASE_IN_OUT(interpolate(t % 4, [0.8, 1.6, 2.6, 3.4], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
	const pose = (action: MascotAction, seed: string): MascotPose => ({
		action,
		actionTime: t,
		time: t,
		mouth: action === 'talk' ? mouthFromText('Hello there, nice to meet you', t % 2.5, 2.5) : 0,
		look: action === 'point' ? 1 : Math.sin(t * 0.8) * 0.5,
		facing: 1,
		seed,
	});
	return (
		<AbsoluteFill style={{fontFamily: fontInter, color: colors.white}}>
			<MgBackground />
			{ACTIONS.map((a, i) => (
				<div key={a} style={{position: 'absolute', left: colW * (i + 1.4), width: colW, top: 36, textAlign: 'center', fontSize: 22, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: colors.tealBright}}>
					{a}
				</div>
			))}
			<div style={{position: 'absolute', left: 30, top: 36, fontSize: 22, fontWeight: 800, letterSpacing: 3, color: colors.tealBright}}>MORPH</div>
			{CAST.map((c, row) => {
				const ground = 290 + row * 330;
				return (
					<React.Fragment key={c.id}>
						<div style={{position: 'absolute', left: 30, top: ground + 20, fontSize: 26, fontWeight: 800, color: MASCOT_META[c.id].color}}>{MASCOT_META[c.id].name}</div>
						<MgActor id={c.id} pose={pose('idle', `m${c.id}`)} x={colW * 0.7} groundY={ground} height={c.height} morph={c.id === 'nandu' ? 1 - morph : morph} />
						{ACTIONS.map((a, i) => (
							<MgActor key={a} id={c.id} pose={pose(a, `${c.id}${a}`)} x={colW * (i + 1.9)} groundY={ground} height={c.height} />
						))}
					</React.Fragment>
				);
			})}
		</AbsoluteFill>
	);
};
