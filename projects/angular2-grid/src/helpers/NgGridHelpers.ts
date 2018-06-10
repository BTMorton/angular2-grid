import { NgGridItem } from "../directives/NgGridItem";

export function generateUuid(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

export function sortItemsByPositionHorizontal(a: NgGridItem, b: NgGridItem): number {
	if (a.col === b.col) { return a.row - b.row; }
	return a.col - b.col;
}

export function sortItemsByPositionVertical(a: NgGridItem, b: NgGridItem): number {
	if (a.row === b.row) { return a.col - b.col; }
	return a.row - b.row;
}
