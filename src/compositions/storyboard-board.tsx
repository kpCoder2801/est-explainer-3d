import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {colors, fontInter, VIDEO} from '../brand/brand-tokens';
import {MASCOT_META} from '../mascots/mascot';
import {sceneFrames, SCENES} from '../scenes/scene-registry';
import {timeScene} from '../storyboard/scene-timeline';
import {STORYBOARD} from '../storyboard/storyboard-script';

/** Representative frame shown on the board; defaults to 65% through the scene. */
const KEY_FRAMES: Record<string, number> = {'s01-hello': 150, 's06-coin': 300, 's08-nandu': 340};
const keyFrame = (id: string) => KEY_FRAMES[id] ?? Math.round(sceneFrames(id) * 0.65);
const THUMB_SCALE = 0.5;
const COLS = 2;
export const BOARD = {width: 3840, rowHeight: 640, header: 260};
export const boardHeight = () => BOARD.header + Math.ceil(STORYBOARD.length / COLS) * BOARD.rowHeight + 40;

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

const Thumb: React.FC<{id: string; Scene: React.FC}> = ({id, Scene}) => (
	<div style={{width: VIDEO.width * THUMB_SCALE, height: VIDEO.height * THUMB_SCALE, overflow: 'hidden', borderRadius: 18, position: 'relative', border: `3px solid ${colors.tealBright}`, flexShrink: 0}}>
		<div style={{width: VIDEO.width, height: VIDEO.height, transform: `scale(${THUMB_SCALE})`, transformOrigin: '0 0', position: 'relative'}}>
			{/* A negative offset shows the scene's key frame while the board itself is at frame 0. */}
			<Sequence from={-keyFrame(id)}>
				<Scene />
			</Sequence>
		</div>
	</div>
);

/** One-page storyboard: every scene with thumbnail, timing, speaker lines and the action brief. */
export const StoryboardBoard: React.FC = () => {
	let clock = 0;
	const total = STORYBOARD.reduce((s, sc) => s + timeScene(sc).duration, 0);
	return (
		<AbsoluteFill style={{background: colors.bgDeep, fontFamily: fontInter, color: colors.white, padding: '60px 70px'}}>
			<div style={{fontSize: 72, fontWeight: 800}}>Estable — mascot explainer storyboard</div>
			<div style={{fontSize: 30, opacity: 0.7, marginTop: 10}}>
				{STORYBOARD.length} scenes · ≈{fmt(total)} estimated (timing re-flows to real voice-over) · 1920×1080 · 30fps · English
			</div>
			<div style={{display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, columnGap: 70, marginTop: 60}}>
				{STORYBOARD.map((sc, i) => {
					const {duration} = timeScene(sc);
					const from = clock;
					clock += duration;
					return (
						<div key={sc.id} style={{display: 'flex', gap: 34, height: BOARD.rowHeight - 40, marginBottom: 40}}>
							<Thumb id={sc.id} Scene={SCENES[i].Scene} />
							<div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14}}>
								<div style={{fontSize: 24, color: colors.tealBright, fontWeight: 700}}>
									S{String(i + 1).padStart(2, '0')} · {fmt(from)}–{fmt(from + duration)} · {duration.toFixed(1)}s
								</div>
								<div style={{fontSize: 40, fontWeight: 800}}>{sc.title}</div>
								{sc.lines.map((l, k) => (
									<div key={k} style={{fontSize: 24, lineHeight: 1.35}}>
										<span style={{color: MASCOT_META[l.speaker].color, fontWeight: 800}}>{MASCOT_META[l.speaker].name}: </span>“{l.text}”
									</div>
								))}
								<div style={{fontSize: 21, lineHeight: 1.4, opacity: 0.65, marginTop: 'auto'}}>{sc.visual}</div>
							</div>
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
