import React from 'react';
import {STORYBOARD} from '../../storyboard/storyboard-script';
import {MgS01HelloScene} from './mg-s01-hello-scene';
import {MgS02WhoWeAreScene} from './mg-s02-who-we-are-scene';
import {MgS03PaymentTangleScene} from './mg-s03-payment-tangle-scene';
import {MgS04EstablePayScene} from './mg-s04-estable-pay-scene';
import {MgS05EstableWalletScene} from './mg-s05-estable-wallet-scene';
import {MgS06CoinMintsArseScene} from './mg-s06-coin-mints-arse-scene';
import {MgS07ArseInActionScene} from './mg-s07-arse-in-action-scene';
import {MgS08NanduSelfCustodyScene} from './mg-s08-nandu-self-custody-scene';
import {MgS09WhyEstableScene} from './mg-s09-why-estable-scene';
import {MgS10OutroScene} from './mg-s10-outro-scene';

const COMPONENTS: Record<string, React.FC> = {
	's01-hello': MgS01HelloScene,
	's02-who': MgS02WhoWeAreScene,
	's03-problem': MgS03PaymentTangleScene,
	's04-pay': MgS04EstablePayScene,
	's05-wallet': MgS05EstableWalletScene,
	's06-coin': MgS06CoinMintsArseScene,
	's07-arse-life': MgS07ArseInActionScene,
	's08-nandu': MgS08NanduSelfCustodyScene,
	's09-why': MgS09WhyEstableScene,
	's10-outro': MgS10OutroScene,
};

/** Motion-graphics scenes in storyboard order (durations come from the shared scene timing). */
export const MG_SCENES: Array<{id: string; Scene: React.FC}> = STORYBOARD.map((s) => ({id: s.id, Scene: COMPONENTS[s.id]}));
