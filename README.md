[![GitHub version](http://img.shields.io/github/release/BTMorton%2Fangular2-grid.svg)](https://github.com/BTMorton/angular2-grid)
[![npm version](http://img.shields.io/npm/v/angular2-grid.svg)](https://www.npmjs.com/package/angular2-grid)
[![bower version](http://img.shields.io/bower/v/angular2-grid.svg)](https://github.com/BTMorton/angular2-grid)
[![license](http://img.shields.io/github/license/BTMorton%2Fangular2-grid.svg)](https://github.com/BTMorton/angular2-grid/blob/master/LICENSE)
[![open issues](http://img.shields.io/github/issues/BTMorton%2Fangular2-grid.svg)](https://github.com/BTMorton/angular2-grid/issues)

# Angular 2 Grid
Angular 2 grid is a drag/drop/resize grid-based plugin directive for [Angular 2](http://angular.io).
The demo included in this repo follows the [Angular 2 quick start](https://angular.io/docs/js/latest/quickstart.html)

#### Setup
----------

To use the Angular 2 Grid system, simply run `npm install angular2-grid` and then include NgGrid.ts into your typescript compilation. No more work needed!

If you want to help with development or try the demo, it's less simple, but not hard. First you'll need to install [Node](http://nodejs.org) and check out a copy of the repo. Then run:

```shell
$ npm install --dev
$ gulp build
```

This will give you a fully compiled version of the demo that you can run using the HTTP server of your choice.

You can also use `gulp watch` to compile the demo and have gulp watch for any changes.

NOTE: By default Angular 2 and System.js are not listed as actual dependencies, but as peer dependencies, so that npm doesn't install them on systems that just require the install file. If they are not installed, this could cause gulp to break. To fix this, run `npm install angular2 systemjs` and rerun the build command.

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
    'max_rows': 0,          //  The maximum number of rows allowed. Set to 0 for infinite. Cannot be used with max_cols
    'min_cols': 0,          //  The minimum number of columns allowed. Can be any number greater than or equal to 1.
    'min_rows': 0,          //  The minimum number of rows allowed. Can be any number greater than or equal to 1.
    'col_width': 250,       //  The width of each column
    'row_height': 250,      //  The height of each row
    'cascade': 'up',        //  The direction to cascade grid items ('up', 'right', 'down', 'left')
    'min_width': 100,       //  The minimum width of an item. If greater than col_width, this will update the value of min_cols
    'min_height': 100,      //  The minimum height of an item. If greater than row_height, this will update the value of min_rows
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
    'resizeHandle': null,   //  The selector to be used for the resize handle. If null, uses 'borderSize' pixels from the right for horizontal resize, 
                            //    'borderSize' pixels from the bottom for vertical, and the square in the corner bottom-right for both
    'borderSize': 15,
    'fixed': false,         //  If the grid item should be cascaded or not. If yes, manual movement is required
    'draggable': true,      //  If the grid item can be dragged. If this or the global setting is set to false, the item cannot be dragged.
    'resizable': true       //  If the grid item can be resized. If this or the global setting is set to false, the item cannot be resized.
}
```

#### Event Handling
-------------------

Both the `NgGrid` and `NgGridItem` throw events when an item is moved or resized. The grid has the following:

```javascript
dragStart(item)     //  When an item starts being dragged. Returns reference to corresponding NgGridItem
drag(item)          //  When an item moves while dragging. Returns reference to corresponding NgGridItem
dragStop(item)      //  When an item stops being dragged. Returns reference to corresponding NgGridItem
resizeStart(item)   //  When an item starts being resized. Returns reference to corresponding NgGridItem
resize(item)        //  When an item is resized. Returns reference to corresponding NgGridItem
resizeStop(item)    //  When an item stops being resized. Returns reference to corresponding NgGridItem
```

The individual items will also throw the following events:

```javascript
dragStart({'left': number, 'top': number})              //  When the item starts being dragged. Returns object containing the item's raw left and top values
drag({'left': number, 'top': number})                   //  When the item moves while dragging. Returns object containing the item's raw left and top values
dragStop({'left': number, 'top': number})               //  When the item stops being dragged. Returns object containing the item's raw left and top values
resizeStart({'width': number, 'height': number})        //  When the item starts being resized. Returns object containing the item's raw width and height values
resize({'width': number, 'height': number})             //  When the item is resized. Returns object containing the item's raw width and height values
resizeStop({'width': number, 'height': number})         //  When the item stops being resized. Returns object containing the item's raw width and height values
itemChange({'col': number, 'row': number,               //  When the item's grid size or position is changed. Returns object containing the item's grid position and size
            'sizex': number, 'sizey': number})          //      The difference between this event and the above is that the values correspond to the psuedo-grid and not the dom positioning
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
<div [ngGrid]="{'resizeable': false, 'margins': [5, 10]}">
	<div *ngFor="#box of boxes" [ngGridItem]="{'dragHandle': '.title'}">
		<div class="title">{{box.title}}</div>
		<p>{{box.text}}</p>
	</div>
</div>
```

In order to include the relevant files, you will need to import `NgGrid` and `NgGridItem` to your app and add them to the `@View` directives.
