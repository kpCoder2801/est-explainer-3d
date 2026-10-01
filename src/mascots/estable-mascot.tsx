import React from 'react';
import {colors} from '../brand/brand-tokens';
import {MascotPose} from './shared/mascot-motion';
import {Gloss, InkedShape} from './shared/inked-shape';
import {CartoonMouth, RoundEye, VectorMascot, VectorRigSpec} from './shared/vector-mascot-rig';

/**
 * The Estable mark (assets/logos/estable.png, 1024 units) traced as one polygon:
 * outer triangle with the inward spiral channel. Round joins on a same-colour
 * stroke reproduce the logo's softened corners.
 */
const ESTABLE_LOGO_POINTS = [
	[512, 0],
	[912, 775],
	[892, 805],
	[375, 805],
	[357, 775],
	[512, 490],
	[610, 660],
	[630, 672],
	[680, 672],
	[697, 640],
	[512, 295],
	[215, 860],
	[235, 892],
	[958, 892],
	[1022, 995],
	[1000, 1024],
	[20, 1024],
	[0, 995],
]
	.map(([x, y]) => `${x},${y}`)
	.join(' ');

export const EstableLogoShape: React.FC<{fill?: string}> = ({fill = colors.teal}) => (
	<polygon points={ESTABLE_LOGO_POINTS} fill={fill} stroke={fill} strokeWidth={34} strokeLinejoin="round" />
);

const EYES = [{cx: 318, cy: 110}, {cx: 706, cy: 110}];
const EYE_R = 96;
const EYE_TALL = 1.12;
const OUTLINE = 22;

/** Logo + the two eye bumps as one silhouette, expanded by `grow` for the outline pass. */
const drawSilhouette = (fill: string, grow: number) => (
	<g fill={fill}>
		<polygon points={ESTABLE_LOGO_POINTS} stroke={fill} strokeWidth={34 + grow * 2} strokeLinejoin="round" />
		{EYES.map((e) => (
			<ellipse key={e.cx} cx={e.cx} cy={e.cy} rx={EYE_R * 1.25 + grow} ry={EYE_R * 1.25 * EYE_TALL + grow} />
		))}
	</g>
);

// Eyes sit fully outside the triangle on teal bumps that just touch the slopes,
// set wide apart; the mouth sits on the solid apex between them. Sticker line art
// plus cel shade (lower-right) and gloss marks (upper-left), lit from the top-left.
const spec: VectorRigSpec = {
	width: 1024,
	height: 1024,
	shoulderL: {x: 270, y: 560},
	shoulderR: {x: 755, y: 560},
	armSpread: 22,
	hipL: {x: 345, y: 1000},
	hipR: {x: 665, y: 1000},
	armLength: 250,
	legLength: 230,
	limbWidth: 40,
	limbColor: colors.tealBright,
	legWidth: 20,
	legColor: colors.tealLight,
	shoeColor: colors.teal,
	shoeShade: colors.tealShade,
	shoeSize: 165,
	outline: OUTLINE,
	renderBody: ({mouth, blink, look}) => (
		<g>
			<InkedShape draw={drawSilhouette} base={colors.teal} shade={colors.tealShade} outline={OUTLINE} shadeShift={{x: 26, y: 30}}>
				{/* Gloss along the left slope, plus a sparkle dot further down. */}
				<Gloss d="M 360 382 L 246 610" width={26} color={colors.tealHighlight} />
				<circle cx={214} cy={676} r={14} fill={colors.tealHighlight} opacity={0.85} />
			</InkedShape>
			{EYES.map((e) => (
				<RoundEye key={e.cx} cx={e.cx} cy={e.cy} r={EYE_R} tall={EYE_TALL} look={look} blink={blink} />
			))}
			<CartoonMouth cx={512} cy={215} w={130} open={mouth} />
		</g>
	),
};

export const EstableMascot: React.FC<{pose: MascotPose; height: number}> = ({pose, height}) => (
	<VectorMascot spec={spec} pose={pose} height={height} />
);
