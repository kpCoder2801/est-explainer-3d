import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// WebGL for the three.js cut; ANGLE gives a hardware-backed context in headless Chrome.
Config.setChromiumOpenGlRenderer('angle');
