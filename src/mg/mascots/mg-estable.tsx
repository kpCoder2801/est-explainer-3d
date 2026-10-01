import React from 'react';
import {colors} from '../../brand/brand-tokens';
import {EstableLogoShape} from '../../mascots/estable-mascot';
import {MascotPose} from '../../mascots/shared/mascot-motion';
import {PillEye, PillMouth} from './mg-face';
import {MgRig} from './mg-rig';

/**
 * MG Estable: the exact logo, flat with a diagonal brand gradient and no outline,
 * with a compact face on the solid apex. `logo` 0→1 fades the face out so the
 * character becomes the pure mark (used for logo stings and match cuts).
 */
export const MgEstable: React.FC<{pose: MascotPose; height: number; logo?: number}> = ({pose, height, logo = 0}) => (
	<MgRig
		pose={pose}
		height={height}
		w={1024}
		h={1024}
		render={({mouth, blink, look, happy, gradId}) => (
			<g>
				<defs>
					<linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stopColor={colors.tealBright} />
						<stop offset="0.55" stopColor={colors.teal} />
						<stop offset="1" stopColor={colors.tealShade} />
					</linearGradient>
				</defs>
				<EstableLogoShape fill={`url(#${gradId})`} />
				<g opacity={1 - logo}>
					<PillEye cx={454} cy={196} w={56} h={94} look={look} blink={blink} happy={happy} />
					<PillEye cx={570} cy={196} w={56} h={94} look={look} blink={blink} happy={happy} />
					<PillMouth cx={512} cy={276} w={66} open={mouth} />
				</g>
			</g>
		)}
	/>
);
