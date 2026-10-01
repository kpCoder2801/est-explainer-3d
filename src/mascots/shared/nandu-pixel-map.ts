/**
 * Nandu pixel map, hand-cleaned from assets/logos/nandu.png (≈33px cells in the source).
 * `#` body, `E` eye, `W` wing. Legs live in their own maps so they can step.
 * Shared by the sticker-style (v1) and motion-graphics Nandu rigs.
 */
export const BODY_ROWS = [
	'..##........',
	'##E##.......',
	'..###.......',
	'..#.........',
	'.##.........',
	'.##..####...',
	'.##.######..',
	'.######WW##.',
	'.##.########',
	'..#.####..##',
	'...#.##....#',
];
export const LEG_FRONT: Array<[number, number]> = [
	[5, 12],
	[5, 13],
	[4, 14],
	[3, 15],
	[4, 15],
];
export const LEG_BACK: Array<[number, number]> = [
	[7, 11],
	[8, 12],
	[8, 13],
	[7, 14],
	[6, 15],
	[7, 15],
];
export const NANDU_COLS = 12;
export const NANDU_ROWS = 16;

const cellsOf = (ch: string) =>
	BODY_ROWS.flatMap((row, y) => [...row].map((c, x) => (c === ch ? ([x, y] as [number, number]) : null)).filter(Boolean) as Array<[number, number]>);
// The eye cell is body-coloured underneath the eye so the outline has no hole there.
export const BODY_CELLS = [...cellsOf('#'), ...cellsOf('E')];
export const [EYE_CELL] = cellsOf('E');
export const WING_CELLS = cellsOf('W');
export const BEAK_CELLS = new Set(['0,1', '1,1']);
