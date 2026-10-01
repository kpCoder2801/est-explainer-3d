import React from 'react';
import {colors} from '../../../brand/brand-tokens';
import {CanvasDraw, inter} from '../../kit/toy-canvas-textures';
import {CanvasFace, ToySlab} from '../../kit/toy-props';
import {V3} from '../../kit/toy-stage';
import {stepped} from './toy-s08-voxel-props';

const H = 0.62;
const D = 0.22;

const label =
	(text: string, color: string): CanvasDraw =>
	(ctx, w, h) => {
		inter(ctx, h * 0.62, 800);
		ctx.fillStyle = color;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, w / 2, h * 0.55);
	};

/**
 * One title word-card that stamps onto the set at `at`: it appears close to the
 * camera at 1.6× and slams back into place in two sprite-style steps (10fps), with a
 * small recoil tilt, like the 2D cut's stamp.
 */
export const StampCard: React.FC<{t: number; at: number; text: string; w: number; position: V3; gold?: boolean}> = ({t, at, text, w, position, gold}) => {
	const k = stepped(t) - at;
	if (k < 0) return null;
	const [scale, dz, tilt] = k < 0.1 ? [1.6, 1.4, -0.12] : k < 0.2 ? [1.15, 0.35, 0.05] : [1, 0, 0];
	const slab = gold ? colors.nanduGold : colors.tealDark;
	const ink = gold ? colors.outline : colors.white;
	return (
		<group position={[position[0], position[1], position[2] + dz]} scale={scale} rotation={[tilt, 0, tilt * 0.4]}>
			<ToySlab w={w} h={H} d={D} r={0.12} color={slab} />
			<CanvasFace w={w * 0.96} h={H * 0.9} position={[0, 0, D / 2 + 0.004]} draw={label(text, ink)} drawKey={text + ink} transparent />
		</group>
	);
};
