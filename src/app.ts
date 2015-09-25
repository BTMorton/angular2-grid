import {Component, View, bootstrap, CORE_DIRECTIVES, NgStyle, FORM_DIRECTIVES, Self, Query, QueryList, ViewEncapsulation } from 'angular2/angular2';
import {NgGrid, NgGridItem} from "NgGrid";
// import {NgTest} from "./NgTest";
// Annotation section
@Component({
	selector: 'my-app'
})
@View({
	templateUrl: 'app.html',
	styleUrls: ['app.css', 'NgGrid.css'],
	directives: [CORE_DIRECTIVES, NgStyle, NgGrid, NgGridItem, FORM_DIRECTIVES],
	encapsulation: ViewEncapsulation.NONE
})
// Component controller
class MyAppComponent {
	private boxes = [1, 2, 3, 4];
	private rgb = '#efefef';
	private curNum: number = 5;
	private gridConfig = {
		'margins': [5],
		'draggable': true,
		'resizeable': true,
		'max_cols': 6,
		'max_rows': 0,
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
	private curItemCheck:number = 1;
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
		this.boxes.splice(this.curItemCheck, 1);
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