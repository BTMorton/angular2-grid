import { Component, ViewEncapsulation, enableProdMode } from '@angular/core';
import { CORE_DIRECTIVES, FORM_DIRECTIVES } from '@angular/common';
import { bootstrap } from '@angular/platform-browser-dynamic';
import { NgGrid, NgGridConfig, NgGridItem, NgGridItemConfig, NgGridItemEvent } from "./main";

// Annotation section
@Component({
	selector: 'my-app',
	templateUrl: 'app.html',
	styleUrls: ['app.css', 'NgGrid.css', 'NgGrid_FixSmall.css'],
	directives: [CORE_DIRECTIVES, NgGrid, NgGridItem, FORM_DIRECTIVES],
	encapsulation: ViewEncapsulation.None
})
// Component controller
class MyAppComponent {
	private boxes = [];
	private rgb = '#efefef';
	private curNum: number = 5;
	private gridConfig = <NgGridConfig>{
		'margins': [5],
		'draggable': true,
		'resizable': true,
		'max_cols': 6,
		'max_rows': 0,
		'visible_cols': 0,
		'visible_rows': 0,
		'min_cols': 1,
		'min_rows': 1,
		'col_width': 250,
		'row_height': 250,
		'cascade': 'up',
		'min_width': 100,
		'min_height': 100,
		'fix_to_grid': false,
		'auto_style': true,
		'auto_resize': true,
		'maintain_ratio': false,
		'prefer_new': false,
		'zoom_on_drag': false
	};
	private curItemCheck: number = 0;
	private itemPositions: Array<any> = [];
	
	constructor() {
		for (var i = 0; i < 4; i++) {
			this.boxes[i] = { id: i + 1, config: this._generateDefaultItemConfig() };
		}
	}
	
	onClick() {
		alert("CLICK EVENT!");
	}
	
	get ratioDisabled(): boolean {
		return (this.gridConfig.max_rows > 0 && this.gridConfig.visible_cols > 0) ||
			(this.gridConfig.max_cols > 0 && this.gridConfig.visible_rows > 0) ||
			(this.gridConfig.visible_cols > 0 && this.gridConfig.visible_rows > 0);
	}
	
	get itemCheck() { return this.curItemCheck; }
	set itemCheck(v: number) {
		this.curItemCheck = v;
	}
	
	get curItem() {
		return this.boxes[this.curItemCheck].config;
	}
	
	addBox() {
		this.boxes.push({ id: this.curNum++, config: this._generateDefaultItemConfig() });
	}
	
	removeBox() {
		if (this.boxes[this.curItemCheck]) this.boxes.splice(this.curItemCheck, 1);
	}
	
	updateItem(index: number, pos: { col: number, row: number, sizex: number, sizey: number }) {
		// Do something here
	}
	
	onDrag(index: number, pos: { left: number, top: number }) {
		// Do something here
	}
	
	onResize(index: number, dims: { width: number, height: number }) {
		// Do something here
	}
	
	private _generateDefaultItemConfig(): any {
		return { 'dragHandle': '.handle', 'col': 1, 'row': 1, 'sizex': 1, 'sizey': 1 };
	}
	
	private _randomise() {
		for (var x in this.boxes) {
			this.boxes[x].config.col = Math.floor(Math.random() * 6) + 1;
			this.boxes[x].config.row = 1;
		}
	}
}

enableProdMode();
bootstrap(MyAppComponent);