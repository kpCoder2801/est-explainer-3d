import React from 'react';
import {interpolate} from 'remotion';
import {colors} from '../../brand/brand-tokens';
import {ArseMolecule} from '../../mascots/arse-mascot';
import {MascotPose} from '../../mascots/shared/mascot-motion';
import {PillEye, PillMouth} from './mg-face';
import {MgRig} from './mg-rig';

/**
 * MG ARSe: a glossy blue coin (radial gradient, no outline) with a clean face up top and
 * the ARSe molecule worn as an emblem below. `logo` 0→1 grows the emblem back to the
 * full mark and fades the face — the character turns into the coin logo.
 */
export const MgArse: React.FC<{pose: MascotPose; height: number; logo?: number}> = ({pose, height, logo = 0}) => {
	const k = interpolate(logo, [0, 1], [0.42, 1]);
	const cy = interpolate(logo, [0, 1], [180, 133]);
	return (
		<MgRig
			pose={pose}
			height={height}
			w={250}
			h={250}
			render={({mouth, blink, look, happy, gradId, time}) => (
				<g>
					<defs>
						<radialGradient id={gradId} cx="0.35" cy="0.3" r="0.8">
							<stop offset="0" stopColor={colors.arseSky} />
							<stop offset="0.55" stopColor={colors.arseBlue} />
							<stop offset="1" stopColor={colors.arseShade} />
						</radialGradient>
					</defs>
					<circle cx={125} cy={125} r={125} fill={`url(#${gradId})`} />
					<path d="M 46 70 A 92 92 0 0 1 98 30" stroke="#fff" strokeOpacity={0.55} strokeWidth={9} strokeLinecap="round" fill="none" />
					<g transform={`translate(125 ${cy}) scale(${k}) translate(-125 -133)`}>
						<ArseMolecule spin={Math.sin(time * 1.4) * 6} />
					</g>
					<g opacity={1 - logo}>
						<PillEye cx={94} cy={88} w={24} h={40} look={look} blink={blink} happy={happy} lash={-1} />
						<PillEye cx={156} cy={88} w={24} h={40} look={look} blink={blink} happy={happy} lash={1} />
						<PillMouth cx={125} cy={128} w={30} open={mouth} />
					</g>
				</g>
			)}
		/>
	);
};
