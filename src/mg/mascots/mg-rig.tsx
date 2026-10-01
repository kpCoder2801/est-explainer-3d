import React, {useId} from 'react';
import {blinkAmount, MascotPose} from '../../mascots/shared/mascot-motion';
import {mgMotion} from './mg-mascot-motion';

export type MgFaceState = {mouth: number; blink: number; look: number; happy: boolean; time: number; gradId: string};

/**
 * Shared MG rig: floats the body above a soft contact shadow, applies the limbless
 * motion (pivoting at the body centre so spins read as a logo sting) and mirrors for facing.
 */
export const MgRig: React.FC<{
	pose: MascotPose;
	height: number;
	w: number;
	h: number;
	render: (s: MgFaceState) => React.ReactNode;
}> = ({pose, height, w, h, render}) => {
	const m = mgMotion(pose.action, pose.actionTime, pose.time);
	const gradId = `g${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
	const scale = height / h;
	const lift = -m.y * h;
	const pad = h * 0.45;
	return (
		<svg width={(w + pad * 2) * scale} height={(h + pad * 1.2) * scale} viewBox={`${-pad} ${-pad} ${w + pad * 2} ${h + pad * 1.2}`} style={{overflow: 'visible', transform: `scaleX(${pose.facing})`}}>
			<ellipse cx={w / 2} cy={h + h * 0.12} rx={w * 0.36 * (1 - Math.min(0.6, lift / h))} ry={h * 0.035} fill="#000" opacity={0.35 * (1 - Math.min(0.7, lift / h))} />
			<g transform={`translate(0 ${-lift}) translate(${w / 2} ${h / 2}) rotate(${m.rot}) scale(${m.sx} ${m.sy}) translate(${-w / 2} ${-h / 2})`}>
				{render({mouth: pose.mouth, blink: blinkAmount(pose.time, pose.seed), look: pose.look * pose.facing, happy: m.happy, time: pose.time, gradId})}
			</g>
		</svg>
	);
};
