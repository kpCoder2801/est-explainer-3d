import React from 'react';
import {colors} from '../brand/brand-tokens';
import {ArseMascot} from './arse-mascot';
import {EstableMascot} from './estable-mascot';
import {NanduMascot} from './nandu-mascot';
import {MascotPose} from './shared/mascot-motion';

export type MascotId = 'estable' | 'arse' | 'nandu';

export const MASCOT_META: Record<MascotId, {name: string; color: string; role: string}> = {
	estable: {name: 'Estable', color: colors.teal, role: 'Host · the company'},
	arse: {name: 'ARSe', color: colors.arseBlue, role: 'Argentine peso stablecoin'},
	nandu: {name: 'Nandu', color: colors.nanduGold, role: 'Self-custody wallet'},
};

const RIGS: Record<MascotId, React.FC<{pose: MascotPose; height: number}>> = {
	estable: EstableMascot,
	arse: ArseMascot,
	nandu: NanduMascot,
};

/** Renders any mascot by id; `height` is the body height in px (limbs extend beyond). */
export const Mascot: React.FC<{id: MascotId; pose: MascotPose; height: number}> = ({id, pose, height}) => {
	const Rig = RIGS[id];
	return <Rig pose={pose} height={height} />;
};
