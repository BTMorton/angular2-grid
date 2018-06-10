import { NgGridItem } from "../directives/NgGridItem";

export class NgGridHelper {
	public static generateUuid(): string {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			// tslint:disable:no-bitwise
			let r = Math.random() * 16 | 0;
			let v = c === "x" ? r : (r & 0x3 | 0x8);
			return v.toString(16);
			// tslint:enable:no-bitwise
		});
	}

	public static sortItemsByPositionHorizontal(a: NgGridItem, b: NgGridItem): number {
		if (a.col === b.col) { return a.row - b.row; }
		return a.col - b.col;
	}

	public static sortItemsByPositionVertical(a: NgGridItem, b: NgGridItem): number {
		if (a.row === b.row) { return a.col - b.col; }
		return a.row - b.row;
	}
}
