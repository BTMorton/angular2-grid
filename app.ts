/// <reference path="typings/angular2/angular2.d.ts" />

import {Component, View, bootstrap, coreDirectives, NgStyle} from 'angular2/angular2';
import {NgGrid, NgGridItem} from "./NgGrid";
// import {NgTest} from "./NgTest";
// Annotation section
@Component({
	selector: 'my-app'
})
@View({
	templateUrl: 'app.html',
	styleUrls: ['app.css', 'NgGrid.css'],
	directives: [coreDirectives, NgStyle, NgGrid, NgGridItem]
})
// Component controller
class MyAppComponent {
	name: string;
	boxes = [1, 2, 3, 4];
	rgb = '#efefef';
	curNum = 5;
	
	
	constructor() {
		this.name = 'Ben';
	}
	
	addBox() {
		this.boxes.push(this.curNum++);
	}
}

bootstrap(MyAppComponent);