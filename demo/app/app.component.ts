import {Component} from 'angular2/core';
import {NgGrid, NgGridItem} from 'angular2-grid';

@Component({
    selector: 'my-app',
    template: '<h1>My First Angular 2 App</h1><div class="grid" [ngGrid]="{\'max_cols\': 6, \'auto_resize\': true}"><div class="grid-item" [ngGridItem]="{\'sizex\': 2, \'sizey\': 3}"></div></div>',
    directives: [NgGrid, NgGridItem]
})
export class AppComponent {}