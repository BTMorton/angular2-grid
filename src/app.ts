import { Component, View, Self, Query, QueryList, ViewEncapsulation } from 'angular2/core';
import { CORE_DIRECTIVES, NgStyle, FORM_DIRECTIVES } from 'angular2/common';
import { bootstrap } from 'angular2/platform/browser';
import { NgGrid, NgGridItem } from "./NgGrid";

// Annotation section
@Component({
	selector: 'my-app'
})
@View({
	templateUrl: 'app.html',
	styleUrls: ['app.css', 'NgGrid.css'],
	directives: [CORE_DIRECTIVES, NgStyle, NgGrid, NgGridItem, FORM_DIRECTIVES],
	encapsulation: ViewEncapsulation.None
})
// Component controller
class MyAppComponent {
	private boxes = [1, 2, 3, 4];
	private rgb = '#efefef';
	private curNum: number = 5;
	private gridConfig = {
		'margins': [5],
		'draggable': true,
		'resizable': true,
		'max_cols': 6,
		'max_rows': 0,
		'min_cols': 1,
		'min_rows': 1,
		'col_width': 250,
		'row_height': 250,
		'cascade': 'up',
		'min_width': 100,
		'min_height': 100,
		'fix_to_grid': false,
		'auto_style': true,
		'auto_resize': true
	};
	private curItem = {
		'col': 0,
		'row': 0,
		'sizex': 0,
		'sizey': 0
	}
	private curItemCheck:number = 0;
	private itemPositions: Array<any> = [];
	
	get itemCheck() { return this.curItemCheck; }
	set itemCheck(v: number) {
		this.curItem = this.itemPositions[v];
		this.curItemCheck = v;
	}
	
	addBox() {
		this.boxes.push(this.curNum++);
	}
	
	removeBox() {
		if (this.boxes[this.curItemCheck]) this.boxes.splice(this.curItemCheck, 1);
	}
	
	updateItem(index: number, pos: { col: number, row: number, sizex: number, sizey: number }) {
		this.itemPositions[index] = pos;
		if (this.curItemCheck == index) this.curItem = pos;
	}
	
	onDrag(index: number, pos: { left: number, top: number }) {
		// Do something here
	}
	
	onResize(index: number, dims: { width: number, height: number }) {
		// Do something here
	}
}

bootstrap(MyAppComponent);