import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import React, {useLayoutEffect} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fontInter} from '../../brand/brand-tokens';
import {BrandNetworkBackground} from '../../components/brand-network-background';
import {MASCOT_META, MascotId} from '../../mascots/mascot';
import {MascotAction, mouthFromText} from '../../mascots/shared/mascot-motion';
import {StudioEnvironment, ToyStudioLights} from '../kit/toy-studio';
import {ToyMascot} from '../mascots/toy-mascot';

const ACTIONS: MascotAction[] = ['idle', 'talk', 'walk', 'wave', 'point', 'jump', 'celebrate'];
const CAST: MascotId[] = ['estable', 'arse', 'nandu'];
const SAMPLE = 'Hello there, nice to meet you all today';
/** Orthographic zoom: one world unit = 100px, so the grid lines up with the HTML labels. */
const PX = 100;
const ROW_GROUND = [430, 740, 1040];

/** Slight downward look so the toys show their tops and the floor shadows read. */
const SheetCamera: React.FC = () => {
	const camera = useThree((s) => s.camera);
	useLayoutEffect(() => {
		camera.position.set(0, 4, 40);
		camera.lookAt(0, 0, 0);
		camera.updateProjectionMatrix();
	}, [camera]);
	return null;
};

/** 3D review sheet: every toy mascot performing every shared action — the 3D twin of `MascotActionSheet`. */
export const ToyMascotSheet: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const t = frame / fps;
	const colW = width / (ACTIONS.length + 1);
	const toWorld = (px: number, py: number): [number, number, number] => [(px - width / 2) / PX, (height / 2 - py) / PX, 0];

	return (
		<AbsoluteFill style={{fontFamily: fontInter, color: colors.white}}>
			<BrandNetworkBackground density={40} reveal={0.5} />
			<ThreeCanvas width={width} height={height} orthographic camera={{zoom: PX, near: 0.1, far: 200}} gl={{antialias: true, alpha: true}}>
				<SheetCamera />
				<StudioEnvironment />
				<ToyStudioLights />
				{CAST.map((id, row) =>
					ACTIONS.map((a, i) => (
						<group key={`${id}-${a}`} position={toWorld(colW * (i + 1.5), ROW_GROUND[row])}>
							<ToyMascot
								id={id}
								height={id === 'nandu' ? 1.9 : id === 'arse' ? 1.5 : 1.6}
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
						</group>
					)),
				)}
			</ThreeCanvas>
			{ACTIONS.map((a, i) => (
				<div key={a} style={{position: 'absolute', left: colW * (i + 1), width: colW, top: 40, textAlign: 'center', fontSize: 26, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: colors.tealBright}}>
					{a}
				</div>
			))}
			{CAST.map((id, row) => (
				<div key={id} style={{position: 'absolute', left: 30, top: ROW_GROUND[row] - 180, width: colW - 40}}>
					<div style={{fontSize: 34, fontWeight: 800}}>{MASCOT_META[id].name}</div>
					<div style={{fontSize: 18, opacity: 0.7}}>{MASCOT_META[id].role}</div>
				</div>
			))}
		</AbsoluteFill>
	);
};
