import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fontInter} from '../brand/brand-tokens';
import {BrandNetworkBackground} from '../components/brand-network-background';
import {Mascot, MASCOT_META, MascotId} from '../mascots/mascot';
import {MascotAction, mouthFromText} from '../mascots/shared/mascot-motion';

const ACTIONS: MascotAction[] = ['idle', 'talk', 'walk', 'wave', 'point', 'jump', 'celebrate'];
const CAST: MascotId[] = ['estable', 'arse', 'nandu'];
const SAMPLE = 'Hello there, nice to meet you all today';

/** Review sheet: every mascot performing every shared action, side by side. */
export const MascotActionSheet: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const colW = 1920 / (ACTIONS.length + 1);
	return (
		<AbsoluteFill style={{fontFamily: fontInter, color: colors.white}}>
			<BrandNetworkBackground density={40} reveal={0.5} />
			{ACTIONS.map((a, i) => (
				<div key={a} style={{position: 'absolute', left: colW * (i + 1), width: colW, top: 40, textAlign: 'center', fontSize: 26, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: colors.tealBright}}>
					{a}
				</div>
			))}
			{CAST.map((id, row) => (
				<React.Fragment key={id}>
					<div style={{position: 'absolute', left: 30, top: 150 + row * 310 + 90, width: colW - 40}}>
						<div style={{fontSize: 34, fontWeight: 800}}>{MASCOT_META[id].name}</div>
						<div style={{fontSize: 18, opacity: 0.7}}>{MASCOT_META[id].role}</div>
					</div>
					{ACTIONS.map((a, i) => (
						<div key={a} style={{position: 'absolute', left: colW * (i + 1), top: 120 + row * 310, width: colW, height: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
							<Mascot
								id={id}
								height={id === 'arse' ? 150 : 170}
								pose={{
									action: a,
									actionTime: t,
									time: t + row * 0.7 + i * 0.3,
									mouth: a === 'talk' ? mouthFromText(SAMPLE, t % 3, 3) : 0,
									look: a === 'point' ? 1 : Math.sin(t * 0.8 + i) * 0.5,
									facing: 1,
									seed: `${id}-${a}`,
								}}
							/>
						</div>
					))}
				</React.Fragment>
			))}
		</AbsoluteFill>
	);
};
