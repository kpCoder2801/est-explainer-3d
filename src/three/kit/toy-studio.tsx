import {useThree} from '@react-three/fiber';
import React, {useLayoutEffect} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {colors} from '../../brand/brand-tokens';

/**
 * Reflections for the clearcoat: a neutral studio room baked into a PMREM once per
 * renderer. Neutral tone mapping keeps the brand hues close to their sRGB values.
 */
export const StudioEnvironment: React.FC<{intensity?: number}> = ({intensity = 0.3}) => {
	const {gl, scene} = useThree();
	useLayoutEffect(() => {
		gl.toneMapping = THREE.NeutralToneMapping;
		gl.toneMappingExposure = 1;
		const pmrem = new THREE.PMREMGenerator(gl);
		const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
		scene.environment = env;
		scene.environmentIntensity = intensity;
		return () => {
			scene.environment = null;
			env.dispose();
			pmrem.dispose();
		};
	}, [gl, scene, intensity]);
	return null;
};

/**
 * Three-point toy-photography rig: warm key from the top-left (matching the 2D cel
 * shading), cool fill from the right, and a teal rim from behind that separates the
 * mascots from the dark backdrop.
 */
export const ToyStudioLights: React.FC<{shadows?: boolean; rim?: string}> = ({shadows = false, rim = colors.tealBright}) => (
	<>
		<hemisphereLight args={[colors.white, colors.bgDeep, 0.35]} />
		<directionalLight
			position={[-4, 7, 6]}
			intensity={2.1}
			color="#fff6ea"
			castShadow={shadows}
			shadow-mapSize={[2048, 2048]}
			shadow-camera-left={-8}
			shadow-camera-right={8}
			shadow-camera-top={8}
			shadow-camera-bottom={-8}
			shadow-bias={-0.0004}
			shadow-radius={6}
		/>
		<directionalLight position={[6, 2, 4]} intensity={0.45} color="#cfe9ff" />
		<directionalLight position={[0, 4, -6]} intensity={1.6} color={rim} />
	</>
);
