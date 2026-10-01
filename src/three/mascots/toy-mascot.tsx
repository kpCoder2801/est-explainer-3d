import React from 'react';
import {MascotId} from '../../mascots/mascot';
import {MascotPose} from '../../mascots/shared/mascot-motion';
import {ToyArseMascot} from './toy-arse-mascot';
import {ToyEstableMascot} from './toy-estable-mascot';
import {ToyNanduMascot} from './toy-nandu-mascot';

type ToyRigProps = {pose: MascotPose; height: number; yaw?: number};

const RIGS: Record<MascotId, React.FC<ToyRigProps>> = {
	estable: ToyEstableMascot,
	arse: ToyArseMascot,
	nandu: ToyNanduMascot,
};

/**
 * Renders any 3D toy mascot by id inside a three.js scene. Stands on y = 0 at the
 * group origin; `height` is body height in world units (legs extend below for
 * Estable/ARSe, as in the 2D rigs; Nandu's height includes its legs).
 */
export const ToyMascot: React.FC<ToyRigProps & {id: MascotId}> = ({id, ...rest}) => {
	const Rig = RIGS[id];
	return <Rig {...rest} />;
};
