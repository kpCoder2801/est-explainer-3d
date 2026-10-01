import React from 'react';
import {colors} from '../brand/brand-tokens';
import {MascotPose} from './shared/mascot-motion';
import {Gloss, InkedShape} from './shared/inked-shape';
import {CartoonMouth, EggEye, eggPath, eggTilt, VectorMascot, VectorRigSpec} from './shared/vector-mascot-rig';

// Molecule paths copied verbatim from assets/logos/arse.svg (250-unit viewBox).
const ARSE_MOLECULE_PATHS = [
	'M45.0618 169.642C45.0618 161.358 51.8738 154.642 60.1581 154.642C63.3263 154.642 66.4457 155.637 69.0183 157.486L70.1168 158.275C76.6928 163.002 85.5183 163.127 92.2262 158.59L94.1759 157.271C96.7084 155.558 99.6959 154.642 102.753 154.642H103.062C111.346 154.642 118.062 161.358 118.062 169.642C118.062 177.926 111.209 184.642 102.924 184.642C99.7892 184.642 96.6867 183.671 94.1253 181.863L92.2681 180.552C85.588 175.837 76.6296 175.966 70.0883 180.872L69.0618 181.642C66.4654 183.589 63.3074 184.642 60.0618 184.642C51.7776 184.642 45.0618 177.926 45.0618 169.642Z',
	'M51.3215 181.949C44.5507 177.175 42.9869 167.738 47.7602 160.967C49.5857 158.378 52.1961 156.402 55.1897 155.364L56.4678 154.922C64.12 152.27 69.3078 145.129 69.4641 137.032L69.5095 134.679C69.5686 131.622 70.5416 128.653 72.3034 126.154L72.4811 125.902C77.2544 119.131 86.6128 117.512 93.3837 122.285C100.155 127.058 101.695 136.529 96.9213 143.3C95.1148 145.862 92.5338 147.839 89.5802 148.89L87.4386 149.653C79.7357 152.396 74.6795 159.792 74.9202 167.965L74.9579 169.248C75.0535 172.492 74.0942 175.679 72.2241 178.332C67.4508 185.103 58.0924 186.722 51.3215 181.949Z',
	'M204 169.642C204 161.358 197.188 154.642 188.904 154.642C185.736 154.642 182.616 155.637 180.043 157.486L178.945 158.275C172.369 163.002 163.543 163.127 156.836 158.59L154.886 157.271C152.353 155.558 149.366 154.642 146.308 154.642H146C137.716 154.642 131 161.358 131 169.642C131 177.926 137.853 184.642 146.137 184.642C149.273 184.642 152.375 183.671 154.937 181.863L156.794 180.552C163.474 175.837 172.432 175.966 178.973 180.872L180 181.642C182.596 183.589 185.754 184.642 189 184.642C197.284 184.642 204 177.926 204 169.642Z',
	'M197.74 181.949C204.511 177.175 206.075 167.738 201.302 160.967C199.476 158.378 196.866 156.402 193.872 155.364L192.594 154.922C184.942 152.27 179.754 145.129 179.598 137.032L179.552 134.679C179.493 131.622 178.52 128.653 176.758 126.154L176.581 125.902C171.807 119.131 162.449 117.512 155.678 122.285C148.907 127.058 147.367 136.529 152.141 143.3C153.947 145.862 156.528 147.839 159.482 148.89L161.623 149.653C169.326 152.396 174.382 159.792 174.142 167.965L174.104 169.248C174.008 172.492 174.968 175.679 176.838 178.332C181.611 185.103 190.969 186.722 197.74 181.949Z',
	'M132.271 46.0248C139.462 50.1372 141.911 59.3844 137.798 66.5759C136.226 69.3261 133.814 71.5403 130.931 72.8557L129.701 73.4173C122.333 76.7796 117.843 84.3786 118.453 92.4541L118.63 94.8014C118.86 97.8503 118.171 100.898 116.654 103.552L116.501 103.82C112.388 111.012 103.225 113.508 96.033 109.395C88.8416 105.283 86.4137 96 90.5261 88.8085C92.0824 86.0869 94.4652 83.8755 97.3062 82.5495L99.3662 81.5881C106.776 78.1299 111.11 70.2891 110.099 62.1753L109.94 60.902C109.538 57.6814 110.192 54.4174 111.803 51.6C115.916 44.4085 125.079 41.9124 132.271 46.0248Z',
	'M117.522 45.8934C124.751 41.8471 133.938 44.5112 137.984 51.7401C139.532 54.5046 140.187 57.7125 139.83 60.8605L139.678 62.2046C138.766 70.2515 142.967 78.014 150.202 81.651L152.306 82.7081C155.038 84.0812 157.296 86.2409 158.789 88.9089L158.94 89.1781C162.986 96.407 160.406 105.547 153.177 109.594C145.948 113.64 136.741 110.94 132.694 103.711C131.163 100.975 130.495 97.7938 130.821 94.6756L131.058 92.4147C131.91 84.2825 127.422 76.5285 119.946 73.2168L118.773 72.6971C115.805 71.3825 113.344 69.141 111.759 66.3089C107.713 59.08 110.293 49.9397 117.522 45.8934Z',
];

/** Flat ARSe coin (blue disc + white molecule), as in the logo. `spin` rotates the molecule. */
export const ArseLogoShape: React.FC<{spin?: number}> = ({spin = 0}) => (
	<g>
		<circle cx={125} cy={125} r={125} fill={colors.arseBlue} />
		<ArseMolecule spin={spin} />
	</g>
);

const ArseMolecule: React.FC<{spin: number}> = ({spin}) => (
	<g>
		<g transform={`rotate(${spin} 125 133)`}>
			{ARSE_MOLECULE_PATHS.map((d) => (
				<path key={d.slice(0, 16)} d={d} fill={colors.white} />
			))}
		</g>
		<circle cx={125} cy={133} r={15} fill={colors.white} />
	</g>
);

const EYES = [
	{cx: 74, cy: 14, side: -1 as const},
	{cx: 176, cy: 14, side: 1 as const},
];
const EYE_W = 27;
const EYE_H = 37;
const OUTLINE = 5.5;

/** Disc + egg eye bumps as one silhouette, expanded by `grow` for the outline pass. */
const drawSilhouette = (fill: string, grow: number) => (
	<g fill={fill} stroke={fill} strokeWidth={grow * 2} strokeLinejoin="round">
		<circle cx={125} cy={125} r={125} />
		{EYES.map((e) => (
			<path key={e.cx} d={eggPath(EYE_W, EYE_H, 1.28)} transform={`translate(${e.cx} ${e.cy}) rotate(${eggTilt(e.side)})`} />
		))}
	</g>
);

// 1930s-cartoon face (Miss Minutes reference): tall egg eyes with lashes popping
// over the top rim, mouth tucked just under them above the molecule. Sticker line
// art with a lower-right shade crescent and a gloss arc on the upper-left.
const spec: VectorRigSpec = {
	width: 250,
	height: 250,
	shoulderL: {x: 14, y: 150},
	shoulderR: {x: 236, y: 150},
	hipL: {x: 90, y: 242},
	hipR: {x: 160, y: 242},
	armLength: 60,
	legLength: 58,
	limbWidth: 10,
	limbColor: colors.arseSky,
	legWidth: 5,
	legColor: colors.arseSky,
	shoeColor: colors.arseBlue,
	shoeShade: colors.arseShade,
	shoeSize: 40,
	outline: OUTLINE,
	renderBody: ({mouth, blink, look, time}) => (
		<g>
			<InkedShape draw={drawSilhouette} base={colors.arseBlue} shade={colors.arseShade} outline={OUTLINE} shadeShift={{x: 10, y: 12}}>
				<Gloss d="M 22 150 A 104 104 0 0 1 30 82" width={7} color={colors.arseHighlight} />
				<circle cx={38} cy={66} r={3.6} fill={colors.arseHighlight} opacity={0.85} />
			</InkedShape>
			{/* Molecule breathes a little so ARSe always feels "charged". */}
			<ArseMolecule spin={Math.sin(time * 1.4) * 4} />
			{EYES.map((e) => (
				<EggEye key={e.cx} cx={e.cx} cy={e.cy} w={EYE_W} h={EYE_H} side={e.side} look={look} blink={blink} />
			))}
			<CartoonMouth cx={125} cy={36} w={34} open={mouth} />
		</g>
	),
};

export const ArseMascot: React.FC<{pose: MascotPose; height: number}> = ({pose, height}) => (
	<VectorMascot spec={spec} pose={pose} height={height} />
);
