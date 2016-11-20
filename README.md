[![GitHub version](http://img.shields.io/github/release/BTMorton%2Fangular2-grid.svg)](https://github.com/BTMorton/angular2-grid)
[![npm version](http://img.shields.io/npm/v/angular2-grid.svg)](https://www.npmjs.com/package/angular2-grid)
[![bower version](http://img.shields.io/bower/v/angular2-grid.svg)](https://libraries.io/bower/angular2-grid)
[![license](http://img.shields.io/github/license/BTMorton%2Fangular2-grid.svg)](https://github.com/BTMorton/angular2-grid/blob/master/LICENSE)
[![open issues](http://img.shields.io/github/issues/BTMorton%2Fangular2-grid.svg)](https://github.com/BTMorton/angular2-grid/issues)

# Angular 2 Grid
Angular 2 grid is a drag/drop/resize grid-based plugin directive for [Angular 2](http://angular.io).
The demo included in this repo follows the [Angular 2 quick start](https://angular.io/docs/js/latest/quickstart.html)

#### Setup
----------

To use the Angular 2 Grid system, simply run `npm install angular2-grid` and then include the `NgGridModule` in your project module imports (see Example for more details).

If you want to help with development or try the demo, it's less simple, but not hard. First you'll need to install [Node](http://nodejs.org) and check out a copy of the repo. Then run:

```shell
$ npm install
$ typings install
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
    'margins': [10],            //  The size of the margins of each item. Supports up to four values in the same way as CSS margins. Can be updated using setMargins()
    'draggable': true,          //  Whether the items can be dragged. Can be updated using enableDrag()/disableDrag()
    'resizable': true,          //  Whether the items can be resized. Can be updated using enableResize()/disableResize()
    'max_cols': 0,              //  The maximum number of columns allowed. Set to 0 for infinite. Cannot be used with max_rows
    'max_rows': 0,              //  The maximum number of rows allowed. Set to 0 for infinite. Cannot be used with max_cols
    'visible_cols': 0,          //  The number of columns shown on screen when auto_resize is set to true. Set to 0 to not auto_resize. Will be overriden by max_cols
    'visible_rows': 0,          //  The number of rows shown on screen when auto_resize is set to true. Set to 0 to not auto_resize. Will be overriden by max_rows
    'min_cols': 0,              //  The minimum number of columns allowed. Can be any number greater than or equal to 1.
    'min_rows': 0,              //  The minimum number of rows allowed. Can be any number greater than or equal to 1.
    'col_width': 250,           //  The width of each column
    'row_height': 250,          //  The height of each row
    'cascade': 'up',            //  The direction to cascade grid items ('up', 'right', 'down', 'left')
    'min_width': 100,           //  The minimum width of an item. If greater than col_width, this will update the value of min_cols
    'min_height': 100,          //  The minimum height of an item. If greater than row_height, this will update the value of min_rows
    'fix_to_grid': false,       //  Fix all item movements to the grid
    'auto_style': true,         //  Automatically add required element styles at run-time
    'auto_resize': false,       //  Automatically set col_width/row_height so that max_cols/max_rows fills the screen. Only has effect is max_cols or max_rows is set
    'maintain_ratio': false,    //  Attempts to maintain aspect ratio based on the colWidth/rowHeight values set in the config
    'prefer_new': false,        //  When adding new items, will use that items position ahead of existing items
    'limit_to_screen': false,   //  When resizing the screen, with this true and auto_resize false, the grid will re-arrange to fit the screen size. Please note, at present this only works with cascade direction up.
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
    'resizable': true,      //  If the grid item can be resized. If this or the global setting is set to false, the item cannot be resized.
    'payload': null,        //  An optional custom payload (string/number/object) to be used to identify the item for serialization
    'maxCols': 0,           //  The maximum number of columns for a particular item. This value will only override the value from the grid (if set) if it is smaller
    'minCols': 0,           //  The minimum number of columns for a particular item. This value will only override the value from the grid if larger
    'maxRows': 0,           //  The maximum number of rows for a particular item. This value will only override the value from the grid (if set) if it is smaller
    'minRows': 0,           //  The minimum number of rows for a particular item. This value will only override the value from the grid if larger
    'minWidth': 0,          //  The minimum width of a particular item. This value will override the value from the grid, as well as the minimum columns if the resulting size is larger
    'minHeight': 0,         //  The minimum height of a particular item. This value will override the value from the grid, as well as the minimum rows if the resulting size is larger
}
```

#### Event Handling
-------------------

Both the `NgGrid` and `NgGridItem` throw events when an item is moved or resized. The grid has the following:

```javascript
onDragStart(item)     //  When an item starts being dragged. Returns reference to corresponding NgGridItem
onDrag(item)          //  When an item moves while dragging. Returns reference to corresponding NgGridItem
onDragStop(item)      //  When an item stops being dragged. Returns reference to corresponding NgGridItem
onResizeStart(item)   //  When an item starts being resized. Returns reference to corresponding NgGridItem
onResize(item)        //  When an item is resized. Returns reference to corresponding NgGridItem
onResizeStop(item)    //  When an item stops being resized. Returns reference to corresponding NgGridItem
onItemChange(items)   //  When any item stops being dragged or resized. Returns an array of NgGridItemEvents in the order in which each item was added to the grid
```

The individual items will also throw the following events:

```javascript
onDragStart()     //  When the item starts being dragged.
onDrag()          //  When the item moves while dragging.
onDragStop()      //  When the item stops being dragged.
onDragAny()       //  When the item starts/stops/is being dragged.
onResizeStart()   //  When the item starts being resized.
onResize()        //  When the item is resized.
onResizeStop()    //  When the item stops being resized.
onResizeAny()     //  When the item starts/stops/is being resized.
onChangeStart()   //  When the item starts being dragged or resized.
onChange()        //  When the item is dragged or resized.
onChangeStop()    //  When the item stops being dragged or resized.
onChangeAny()     //  When the item starts/stops/is being dragged or resized.
onItemChange()    //  When either the item's grid size or position is changed.
```

Each event will also provide the following object to any callback functions:

```javascript
interface NgGridItemEvent {
    payload: any,   //  The item's optional custom payload (string/number/object) to be used to identify the item for serialization
    col: number,    //  The item's column position within the grid
    row: number,    //  The item's row position within the grid
    sizex: number,  //  The item's column size within the grid
    sizey: number,  //  The item's row size within the grid
    width: number,  //  The item's raw width value
    height: number, //  The item's raw height value
    left: number,   //  The item's offset left value
    top: number     //  The item's offset top value
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

The `NgGrid` and `NgGridItem` can be configured by binding directly to the directive. The `NgGridItem` supports two-way binding so you don't need to bind to any of the above events. The `NgGridItemChange` event emits under the same conditions as `onChangeStop`. The only config values that will change are `col`, `row`, `sizex` and `sizey`; the rest of your configuration will persist. You can then use these values for serialization of the grid. By binding the configuration this way, you are able to update the values on the fly. Here is an example template of the grid with two-way item bindings:

```html
<div [ngGrid]="{'resizeable': false, 'margins': [5, 10]}">
    <div *ngFor="let box of boxes" [(ngGridItem)]="box.config">
        <div class="title">{{box.title}}</div>
        <p>{{box.text}}</p>
    </div>
</div>
```

In order to include the relevant files, you will need to import the `NgGridModule` to your app and add them to the `@NgModule` imports. This can be achieved by adding:

```typescript
import { NgGridModule } from 'angular2-grid';
```

to your typescript imports, and ensuring that your `@NgModule` annotation looks similar to the following:

```typescript
@NgModule({
    ...,
    imports: [
        ...,
        NgGridModule,    
        ...
    ],
    ...
})
```

As of the Angular 2 Release Candidate you will now need to have the following in your System.js configuration, assuming that you are following the same format as the [Angular 2 Quick Start](https://angular.io/docs/ts/latest/quickstart.html):

```
map: {
    'angular2-grid': 'node_modules/angular2-grid/dist'
}

packages: {
    'angular2-grid': { main: 'main.js',  defaultExtension: 'js' }
}
```

To use with [angular-cli](https://cli.angular.io/), you will need to add the above system.js configs to the respective user configuration objects in `system-config.ts`, and add the following to the `vendorNpmFiles` array in `angular-cli-build.js`:

```
'angular2-grid/dist/**/*.js'
```

To see a working typescript example project, check the [demo folder in the source](https://github.com/BTMorton/angular2-grid/tree/master/demo).
