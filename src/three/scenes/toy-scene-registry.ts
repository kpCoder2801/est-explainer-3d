import React from 'react';
import {STORYBOARD} from '../../storyboard/storyboard-script';
import {ToyS01HelloScene} from './toy-s01-hello-scene';
import {ToyS02WhoWeAreScene} from './toy-s02-who-we-are-scene';
import {ToyS03PaymentTangleScene} from './toy-s03-payment-tangle-scene';
import {ToyS04EstablePayScene} from './toy-s04-estable-pay-scene';
import {ToyS05EstableWalletScene} from './toy-s05-estable-wallet-scene';
import {ToyS06CoinMintsArseScene} from './toy-s06-coin-mints-arse-scene';
import {ToyS07ArseInActionScene} from './toy-s07-arse-in-action-scene';
import {ToyS08NanduSelfCustodyScene} from './toy-s08-nandu-self-custody-scene';
import {ToyS09WhyEstableScene} from './toy-s09-why-estable-scene';
import {ToyS10OutroScene} from './toy-s10-outro-scene';

const COMPONENTS: Record<string, React.FC> = {
	's01-hello': ToyS01HelloScene,
	's02-who': ToyS02WhoWeAreScene,
	's03-problem': ToyS03PaymentTangleScene,
	's04-pay': ToyS04EstablePayScene,
	's05-wallet': ToyS05EstableWalletScene,
	's06-coin': ToyS06CoinMintsArseScene,
	's07-arse-life': ToyS07ArseInActionScene,
	's08-nandu': ToyS08NanduSelfCustodyScene,
	's09-why': ToyS09WhyEstableScene,
	's10-outro': ToyS10OutroScene,
};

/** 3D scenes in storyboard order (durations come from the shared scene timing). */
export const TOY_SCENES: Array<{id: string; Scene: React.FC}> = STORYBOARD.map((s) => ({id: s.id, Scene: COMPONENTS[s.id]}));
