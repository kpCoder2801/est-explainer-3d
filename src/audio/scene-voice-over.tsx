import {Audio} from '@remotion/media';
import React from 'react';
import {Sequence, staticFile, useVideoConfig} from 'remotion';
import {TimedLine} from '../storyboard/scene-timeline';

/** Plays each recorded line of a scene at its cue. Shared by the v1 and motion-graphics cuts. */
export const SceneVoiceOver: React.FC<{lines: TimedLine[]}> = ({lines}) => {
	const {fps} = useVideoConfig();
	return (
		<>
			{lines.map(
				(l) =>
					l.vo && (
						<Sequence key={l.vo.file} from={Math.round(l.start * fps)} premountFor={fps}>
							<Audio src={staticFile(l.vo.file)} />
						</Sequence>
					),
			)}
		</>
	);
};
