import React from 'react';
import {VIDEO} from '../brand/brand-tokens';
import {timeScene} from '../storyboard/scene-timeline';
import {STORYBOARD} from '../storyboard/storyboard-script';
import {S01HelloScene} from './s01-hello-scene';
import {S02WhoWeAreScene} from './s02-who-we-are-scene';
import {S03PaymentTangleScene} from './s03-payment-tangle-scene';
import {S04EstablePayScene} from './s04-estable-pay-scene';
import {S05EstableWalletScene} from './s05-estable-wallet-scene';
import {S06CoinMintsArseScene} from './s06-coin-mints-arse-scene';
import {S07ArseInActionScene} from './s07-arse-in-action-scene';
import {S08NanduSelfCustodyScene} from './s08-nandu-self-custody-scene';
import {S09WhyEstableScene} from './s09-why-estable-scene';
import {S10OutroScene} from './s10-outro-scene';
import {sceneById} from './scene-frame';

const COMPONENTS: Record<string, React.FC> = {
	's01-hello': S01HelloScene,
	's02-who': S02WhoWeAreScene,
	's03-problem': S03PaymentTangleScene,
	's04-pay': S04EstablePayScene,
	's05-wallet': S05EstableWalletScene,
	's06-coin': S06CoinMintsArseScene,
	's07-arse-life': S07ArseInActionScene,
	's08-nandu': S08NanduSelfCustodyScene,
	's09-why': S09WhyEstableScene,
	's10-outro': S10OutroScene,
};

/** Every scene component, in storyboard order. */
export const SCENES: Array<{id: string; Scene: React.FC}> = STORYBOARD.map((s) => ({id: s.id, Scene: COMPONENTS[s.id]}));

export const sceneFrames = (id: string) => Math.ceil(timeScene(sceneById(id)).duration * VIDEO.fps);
