/// <reference path="typings/angular2/angular2.d.ts" />

import {Component, View, bootstrap, coreDirectives, NgStyle, formDirectives } from 'angular2/angular2';
import {NgGrid, NgGridItem} from "./NgGrid";
// import {NgTest} from "./NgTest";
// Annotation section
@Component({
	selector: 'my-app'
})
@View({
	templateUrl: 'app.html',
	styleUrls: ['app.css', 'NgGrid.css'],
	directives: [coreDirectives, NgStyle, NgGrid, NgGridItem, formDirectives]
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
	
	addBox() {
		this.boxes.push(this.curNum++);
	}
	
	eventThrown(e) {
		console.log("NgGrid has thrown an event!", e);
	}
}

bootstrap(MyAppComponent);