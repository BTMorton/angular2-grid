# Angular 2 Grid
Angular 2 grid is a drag/drop/resize grid-based plugin directive for [Angular 2](http://angular.io).
The demo included in this repo follows the [Angular 2 quick start](https://angular.io/docs/js/latest/quickstart.html)

#### Setup
----------

First you'll need to install [Node](http://nodejs.org). Then run:

```shell
$ npm install -g tsd typescript
$ tsd install angular2/
$ tsc -m commonjs -t es5 -d --sourcemap --emitDecoratorMetadata --experimentalDecorators
```

This will give you a fully compiled version of the demo that you can run using the HTTP server of your choice. Currently, it points to the following locations to get the required angular files:
```
- https://github.jspm.io/jmcriffey/bower-traceur-runtime@0.0.87/traceur-runtime.js
- https://jspm.io/system@0.16.js
- https://code.angularjs.org/2.0.0-alpha.34/angular2.dev.js
```

#### Config
-----------

To use this in your own application, all you need to do is add the `[ng-grid]` attribute to your container element and `[ng-grid-item]` to each item. You can use this in conjunction with `NgFor` to create a truly dynamic angular grid.

To configure the grid with your own options, it is as easy as adding them as the attribute value. The defaults for the grid are:

```javascript
{
    'margins': [10],        //  The size of the margins of each item. Supports up to four values in the same way as CSS margins. Can be updated using setMargins()
    'draggable': true,      //  Whether the items can be dragged. Can be updated using enableDrag()/disableDrag()
    'resizeable': true,     //  Whether the items can be resized. Can be updated using enableResize()/disableResize()
    'max_cols': 0,          //  The maximum number of columns allowed. Set to 0 for infinite. Cannot be used with max_rows
    'max_rows': 0,          //  The maximum number of rows allowed. Set to 0 for infinite. Cannot be used with max_rows
    'col_width': 250,       //  The width of each column
    'row_height': 250,      //  The height of each row
    'cascade': 'up',        //  The direction to cascade grid items ('up', 'right', 'down', 'left')
    'min_width': 100,       //  The minimum width of an item
    'min_height': 100,      //  The minimum height of an item
    'fix_to_grid': false,   //  Fix all item movements to the grid
    'auto_style': true,     //  Automatically add required element styles at run-time
    'auto_resize': false,   //  Automatically set col_width/row_height so that max_cols/max_rows fills the screen. Only has effect is max_cols or max_rows is set
}
```

The defaults for the grid item are:

```javascript
{
    'col': 1,               //  The start column for the item
    'row': 1,               //  The start row for the item
    'sizex': 1,             //  The start width in terms of columns for the item
    'sizey': 1,             //  The start height in terms of rows for the item
    'dragHandle': null,     //  The selector to be used for the drag handle. If null, uses the whole item
    'resizeHandle': null    //  The selector to be used for the resize handle. If null, uses 15 pixels from the right for horizontal resize, 
                            //    15 pixels from the bottom for vertical, and the square in the corner bottom-right for both
}
```

#### Styling
------------

There are three elements that can be styled with angular2-grid, the grid itself `.grid`, the items `.grid-item` and the placeholder `.placeholder`. The demo includes some basic styling in NgGrid.css which you can include in your app's `styleUrls` property. It also includes some @media queries styles to handle responsiveness on smaller screens. This simple force the boxes to full width and puts them inline in their original order. This is optional functionality and does not need to be included. In order for correct functionality, the required styles are added by the classes themselves at run-time:

```css
.grid {
	position: relative;
}

.grid-item {
	position: absolute;
}

.grid-item.moving {
	z-index: z-index + 1;
}

.placeholder {
	position: absolute;
}
```

You can prevent these styles being automatically added by setting the value of `'auto_size'` to be `false`. You will then need to ensure that they are correctly incorporated into your user styles instead.

NOTE: The grid system sets the values `width, height, left, top` in CSS to move and resize the elements. This cannot be disabled.

#### Example
------------

```html
<div [ng-grid]="{'resizeable': false, 'margins': [5, 10]}">
	<div *ng-for="#box of boxes" [ng-grid-item]="{'dragHandle': '.title'}">
		<div class="title">{{box.title}}</div>
		<p>{{box.text}}</p>
	</div>
</div>
```

In order to include the relevant files, you will need to import `NgGrid` and `NgGridItem` to your app and add them to the `@View` directives.