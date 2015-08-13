/// <reference path="typings/angular2/angular2.d.ts" />

import {View, Component, Directive, LifecycleEvent, ElementRef, Pipe, Pipes, Renderer, EventEmitter, HostMetadata, Host} from 'angular2/angular2';//, EventManager
// import {HostMetadata} from 'angular2/di';

@Directive({
	selector: '[ng-grid]',
	properties: ['config: ng-grid'],
	host: {
		'(^mousedown)': 'onMouseDown($event)',
		'(^mousemove)': 'onMouseMove($event)',
		'(^mouseup)': 'onMouseUp($event)',
		'(^touchstart)': 'onMouseDown($event)',
		'(^touchmove)': 'onMouseMove($event)',
		'(^touchend)': 'onMouseUp($event)'
	}
})
export class NgGrid {
	public onDragStart: EventEmitter = new EventEmitter();
	public onDrag: EventEmitter = new EventEmitter();
	public onDragStop: EventEmitter = new EventEmitter();
	public onResizeStart: EventEmitter = new EventEmitter();
	public onResize: EventEmitter = new EventEmitter();
	public onResizeStop: EventEmitter = new EventEmitter();
	
	public colWidth: number = 250;
	public rowHeight: number = 250;
	public marginTop: number = 10;
	public marginRight: number = 10;
	public marginBottom: number = 10;
	public marginLeft: number = 10;
	public isDragging: boolean = false;
	public isResizing: boolean = false;
	
	private _resizeEnable: boolean = true;
	private _dragEnable: boolean = true;
	private _items: List<NgGridItem> = [];
	private _draggingItem: NgGridItem = null;
	private _resizingItem: NgGridItem = null;
	private _resizeDirection: string = null;
	private _itemGrid = {1: {1: null}};
	private _config: any = {};
	private _containerWidth: number;
	private _containerHeight: number;
	private _maxCols:number = 0;
	private _maxRows:number = 0;
	private _minWidth: number = 100;
	private _minHeight: number = 100;
	private _posOffset:{left: number, top: number} = null;
	private _adding: boolean = false;
    private _cascade: string = 'up';
	
	private static CONST_DEFAULT_CONFIG = {
		'margins': [10],
		'draggable': true,
		'resizeable': true,
		'max_cols': 0,
		'max_rows': 0,
		'col_width': 250,
		'row_height': 250,
		'cascade': 'up',
		'min_width': 100,
		'min_height': 100
	};
	
	set config(v) {
		var defaults = NgGrid.CONST_DEFAULT_CONFIG;
		
		for (var x in defaults)
			if (v[x] == null)
				v[x] = defaults[x];
		
		this.setConfig(v);
	}
	
	
	constructor(private _ngEl: ElementRef, private _renderer: Renderer) {
		this._renderer.setElementAttribute(this._ngEl, 'class', 'grid');
	}
	
	public setConfig(config) {
		for (var x in config)
			this._config[x] = config[x];
		
		this.setMargins(this._config.margins);
		this.colWidth = this._config.col_width;
		this.rowHeight = this._config.row_height;
		this._dragEnable = this._config.draggable;
		this._resizeEnable = this._config.resizeable;
		this._maxRows = this._config.max_rows;
		this._maxCols = this._config.max_cols;
		this._minWidth = this._config.min_height;
		this._minHeight = this._config.min_width;
		this._cascade = this._config.cascade;
	}
	
	public setMargins(margins) {
		this.marginTop = margins[0];
		this.marginRight = margins.length >= 2 ? margins[1] : this.marginTop;
		this.marginBottom = margins.length >= 3 ? margins[2] : this.marginTop;
		this.marginLeft = margins.length >= 4 ? margins[3] : this.marginRight;
	}
	
	public enableDrag() { this._dragEnable = true; }
	public disableDrag() { this._dragEnable = false; }
	public enableResize() { this._resizeEnable = true; }
	public disableResize() { this._resizeEnable = false; }

	private _setAttr(name: string, val: string): void {
		this._renderer.setElementAttribute(this._ngEl, name, val);
	}
	
	public addItem(ngItem: NgGridItem) {
		this._items.push(ngItem);
		this.fixGridCollisions(ngItem.getGridPosition(), ngItem.getSize());
		console.log(ngItem.getGridPosition(), ngItem.getSize());
		this.addToGrid(ngItem);
	}
	
	public removeItem(ngItem: NgGridItem) {
		for (var x in this._items)
			if (this._items[x] == ngItem)
				this._items = this._items.splice(x, 1);
	}
	
	public onMouseDown(e) {
		console.log(e);
		var mousePos = this.getMousePosition(e);
		var item = this.getItemFromPosition(mousePos);
		
		if (item != null) {
			console.log(item, item.canResize(e), item.canDrag(e));
			if (item.canResize(e) != null) {
				this.resizeStart(e);
			} else if (item.canDrag(e)) {
				this.dragStart(e);
			}
		}
		
		return false;
	}
	
	private resizeStart(e) {
		var mousePos = this.getMousePosition(e);
		var item = this.getItemFromPosition(mousePos);
		
		this._resizingItem = item;
		this._resizeDirection = item.canResize(e);
		this.isResizing = true;
	}
	
	private dragStart(e) {
		var mousePos = this.getMousePosition(e);
		var item = this.getItemFromPosition(mousePos);
		var itemPos = item.getPosition();
		var pOffset = { 'left': (mousePos.left - itemPos.left), 'top': (mousePos.top - itemPos.top) }
		
		this._draggingItem = item;
		this._posOffset = pOffset;
		this.removeFromGrid(item);
		this.isDragging = true;
	}
	
	public onMouseMove(e) {
		if (this.isDragging) {
			this.drag(e);
		} else if (this.isResizing) {
			this.resize(e);
		} else {
			var mousePos = this.getMousePosition(e);
			var item = this.getItemFromPosition(mousePos);
			
			if (item) {
				item.onMouseMove(e);
			}
		}
	}
	
	public drag(e) {
		if (this.isDragging) {
			var mousePos = this.getMousePosition(e)
			this._draggingItem.setPosition((mousePos.left - this._posOffset.left), (mousePos.top - this._posOffset.top));
			
			var gridPos = this.calculateGridPosition(this._draggingItem);
			var dims = this._draggingItem.getSize();
			
			this.fixGridCollisions(gridPos, dims);
			
			this.addToGrid(this._draggingItem);
			this.cascadeGrid();
			this.removeFromGrid(this._draggingItem);
			
			this.setGridRows(gridPos.row + dims.y);
			this.setGridCols(gridPos.col + dims.x);
			
			return false;
		}
	}
	
	public resize(e) {
		if (this.isResizing) {
			var mousePos = this.getMousePosition(e)
			var itemPos = this._resizingItem.getPosition();
			var itemDims = this._resizingItem.getDimensions();
			var newW = this._resizeDirection == 'height' ? itemDims.width : (mousePos.left - itemPos.left + 10);
			var newH = this._resizeDirection == 'width' ? itemDims.height : (mousePos.top - itemPos.top + 10);
			
			if (newW < this._minWidth)
				newW = this._minWidth;
			if (newH < this._minHeight)
				newH = this._minHeight;
			
			this._resizingItem.setDimensions(newW, newH);
			
            var bigGrid = this.maxGridSize(itemPos.left + newW, itemPos.top + newH);
            // console.log(bigGrid);
            this.setGridCols(bigGrid.sizex);
            this.setGridRows(bigGrid.sizey);
			
			return false;
		}
	}
	
	public onMouseUp(e) {
		if (this.isDragging) {
			this.dragStop(e);
		} else if (this.isResizing) {
			this.resizeStop(e);
		}
	}
	
	public dragStop(e) {
		if (this.isDragging) {
			this.isDragging = false;
		
			var gridPos = this.calculateGridPosition(this._draggingItem);
			
			this._draggingItem.setGridPosition(gridPos.col, gridPos.row);
			this.addToGrid(this._draggingItem);
			
			this._draggingItem = null;
			this._posOffset = null;
			
			return false;
		}
	}
	
	public resizeStop(e) {
		if (this.isResizing) {
			this.isResizing = false;
			
            var gridSize = this.calculateGridSize(this._resizingItem);
            console.log(gridSize);
            this._resizingItem.setSize(gridSize.sizex, gridSize.sizey);
            
            this._resizingItem = null;
            this._resizeDirection = null;
		}
	}
	
	maxGridSize(w: number, h: number):{sizex: number, sizey: number} {
		var sizex = Math.ceil(w / (this.colWidth + this.marginLeft + this.marginRight));
		var sizey = Math.ceil(h / (this.rowHeight + this.marginTop + this.marginBottom));
		return { 'sizex': sizex, 'sizey': sizey };
	}
	
	calculateGridSize(item: NgGridItem):{sizex: number, sizey: number} {
		var dims = item.getDimensions();
		
        dims.width += this.marginLeft + this.marginRight;
        dims.height += this.marginTop + this.marginBottom;
        
		var sizex = Math.max(1, Math.round(dims.width / (this.colWidth + this.marginLeft + this.marginRight)));
		var sizey = Math.max(1, Math.round(dims.height / (this.rowHeight + this.marginTop + this.marginBottom)));
		
		return { 'sizex': sizex, 'sizey': sizey };
	}
	
	calculateGridPosition(item: NgGridItem):{col: number, row: number} {
		var pos = item.getPosition();
		var col = Math.round(pos.left / (this.colWidth + this.marginLeft + this.marginRight)) + 1;
		var row = Math.round(pos.top / (this.rowHeight + this.marginTop + this.marginBottom)) + 1;
		return { 'col': col, 'row': row };
	}
	
	checkGridCollision(pos: {col: number, row: number}, dims: {x: number, y: number}):boolean {
		var positions = this.getCollisions(pos, dims);
		var collision = false;
		
		if (positions.length == 0) return false;
		
		positions.map(function(v) {
			collision = (v === null) ? collision : true;
		});
		
		return collision;
	}
	
	getCollisions(pos: {col: number, row: number}, dims: {x: number, y: number}):Array<NgGridItem> {
		var returns = [];
		
		for (var j = 0; j < dims.y; j++)
			if (this._itemGrid[pos.row + j] != null)
				for (var i = 0; i < dims.x; i++)
					if (this._itemGrid[pos.row + j][pos.col + i] != null)
						returns.push(this._itemGrid[pos.row + j][pos.col + i]);
		
		return returns;
	}
	
	fixGridCollisions(pos: {col: number, row: number}, dims: {x: number, y: number}) {
		while (this.checkGridCollision(pos, dims)) {
			var collisions = this.getCollisions(pos, dims);
			var me = this;
			
			this.removeFromGrid(collisions[0]);
			var itemPos = collisions[0].getGridPosition();
			var itemDims = collisions[0].getSize();
			
			switch (this._cascade) {
				case "up":
					if (itemPos.row == this._maxRows)
						itemPos.col++;
					else
						itemPos.row++;
					
					collisions[0].setGridPosition(itemPos.col, itemPos.row);
					break;
				case "down":
					if (itemPos.row == 1)
						itemPos.col++;
					else
						itemPos.row--;
					
					collisions[0].setGridPosition(itemPos.col, itemPos.row);
					break;
				case "left":
					if (itemPos.col == this._maxCols)
						itemPos.row++;
					else
						itemPos.col++;
					
					collisions[0].setGridPosition(itemPos.col, itemPos.row);
					break;
				case "right":
					if (itemPos.col == 1)
						itemPos.row++;
					else
						itemPos.col--;
					
					collisions[0].setGridPosition(itemPos.col, itemPos.row);
					break;
			}
			
			this.fixGridCollisions(itemPos, itemDims);
			
			this.addToGrid(collisions[0]);
		}
	}
	
	cascadeGrid() {
		
	}
	
	fixGridPosition(pos: {col: number, row: number}, dims: {x: number, y: number}): {col: number, row: number} {
		while (this.checkGridCollision(pos, dims)) {
			pos.col++;
			
			this.setGridCols(pos.col + dims.x);
			
			if (this._maxCols > 0 && pos.col > this._maxCols) {
				pos.col = 1;
				pos.row++;
				
				this.setGridRows(pos.row + dims.y);
				
				if (this._maxRows > 0 && pos.row > this._maxRows) {
					throw new Error("Unable to calculate grid position");
				}
			}
		}
		
		return pos;
	}
	
	addToGrid(item: NgGridItem) {
		var pos = item.getGridPosition();
		var dims = item.getSize();
		
		if (this.checkGridCollision(pos, dims)) {
			this.fixGridCollisions(pos, dims);
			pos = item.getGridPosition();
		}
		
		this.setGridRows(pos.row + dims.y);
		this.setGridCols(pos.col + dims.x);
		console.log(pos, dims);
		
		for (var j = 0; j < dims.y; j++) {
			if (this._itemGrid[pos.row + j] != null) {
				for (var i = 0; i < dims.x; i++) {
					if (this._itemGrid[pos.row + j][pos.col + i] == null) {
						this._itemGrid[pos.row + j][pos.col + i] = item;
				
						this.updateSize(pos.col, pos.row);
					} else {
						throw new Error("Cannot add item to grid. Space already taken.");
					}
				}
			}
		}
	}
	
	removeFromGrid(item: NgGridItem) {
		for (var y in this._itemGrid)
			for (var x in this._itemGrid[y])
				if (this._itemGrid[y][x] == item)
					this._itemGrid[y][x] = null;
	}
	
	private setGridRows(row) {
		var maxRow = Math.max.apply(null, Object.keys(this._itemGrid));
		
		if (row > maxRow) {
			for (var i = 1; i <= row; i++)
				if (this._itemGrid[i] === undefined) this._itemGrid[i] = {};
			
			this.updateSize();
		}
	}
	
	private setGridCols(col) {
		var maxCol = Math.max.apply(null, Object.keys(this._itemGrid[1]));
		
		if (col > maxCol) {
			for (var x in this._itemGrid)
				for (var i = 1; i <= col; i++)
					if (this._itemGrid[x][i] === undefined) this._itemGrid[x][i] = null;
				
			
			this.updateSize();
		}
	}
	
	private updateSize(col?: number, row?:number) {
		col = (col == undefined) ? 0 : col;
		row = (row == undefined) ? 0 : row;
		
		var maxRow = Math.max(Math.max.apply(null, Object.keys(this._itemGrid)), row);
		var maxCol = Math.max(Math.max.apply(null, Object.keys(this._itemGrid[1])), col);
		
		this._renderer.setElementStyle(this._ngEl, 'width', (maxCol * (this.colWidth + this.marginLeft + this.marginRight))+"px");
		this._renderer.setElementStyle(this._ngEl, 'height', (maxRow * (this.rowHeight + this.marginTop + this.marginBottom)) + "px");
	}
	
	private getMousePosition(e): {left: number, top: number} {
		if (e.originalEvent && e.originalEvent.touches) {
			var oe = e.originalEvent;
			e = oe.touches.length ? oe.touches[0] : oe.changedTouches[0];
		}
		
		var refPos = this._ngEl.nativeElement.getBoundingClientRect();
		
		return {
			left: e.clientX - refPos.left,
			top: e.clientY - refPos.top
		};
	}
	
	private getAbsoluteMousePosition(e): {left: number, top: number} {
		if (e.originalEvent && e.originalEvent.touches) {
			var oe = e.originalEvent;
			e = oe.touches.length ? oe.touches[0] : oe.changedTouches[0];
		}

		return {
			left: e.clientX,
			top: e.clientY
		};
	}
	
	getItemFromPosition(position: {left: number, top: number}): NgGridItem {
		for (var x in this._items) {
			var size = this._items[x].getDimensions();
			var pos = this._items[x].getPosition();
			
			if (position.left > (pos.left + this.marginLeft) && position.left < (pos.left + this.marginLeft + size.width) &&
				position.top > (pos.top + this.marginTop) && position.top < (pos.top + this.marginTop + size.height)) {
				return this._items[x];
			}
		}
		
		return null;
	}
}

@Directive({
	selector: '[ng-grid-item]',
	properties: [ 'config: ng-grid-item' ]
})
export class NgGridItem {
	private static CONST_DEFAULT_CONFIG = {'col': 1, 'row': 1, 'sizex': 1, 'sizey': 1, 'dragHandle': null, 'resizeHandle': null};
	
	private _col: number = 1;
	private _row: number = 1;
	private _sizex: number = 1;
	private _sizey: number = 1;
	private _config: any;
	private _dragHandle: any;
	private _resizeHandle: any;
	private _elemWidth: number;
	private _elemHeight: number;
	private _elemLeft: number;
	private _elemTop: number;
	
	set config(v) {
		var defaults = NgGridItem.CONST_DEFAULT_CONFIG;
		
		for (var x in defaults)
			if (v[x] == null)
				v[x] = defaults[x];
			
		this.setConfig(v);
	}
	
	constructor(private _ngEl: ElementRef, private _renderer: Renderer, private _ngGrid:NgGrid) {//@Host()
		_ngGrid.addItem(this);
		this._renderer.setElementAttribute(this._ngEl, 'class', 'grid-item');
		this.recalculateDimensions();
		this.recalculatePosition();
	}
	
	public canDrag(e: any): boolean {
		if (this._dragHandle) {
			var foundHandle;
			var paths = e.path;
			paths.pop();    //    Get rid of #document
			
			var last = null;
			
			for (var x in paths) {
				if (last !== null) {
					if (paths[x].querySelector(this._dragHandle) == last) {
						foundHandle = true;
						break;
					}
				}
				
				last = paths[x];
			}
			
			return foundHandle;
		}
		
		return true;
	}
	
	public canResize(e: any): string {
		if (this._resizeHandle) {
			var foundHandle;
			var paths = e.path;
			paths.pop();    //    Get rid of #document
			
			var last = null;
			
			for (var x in paths) {
				if (last !== null) {
					if (paths[x].querySelector(this._resizeHandle) == last) {
						foundHandle = true;
						break;
					}
				}
				
				last = paths[x];
			}
			
			return foundHandle ? 'both' : null;
		} else {
			var mousePos = this.getMousePosition(e);
			
			if (mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - 15
				&& mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - 15) {
				return 'both';
			} else if (mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - 15) {
				return 'width';
			} else if (mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - 15) {
				return 'height';
			}
			
			return null;
		}
	}
	
	public onMouseMove(e) {
        if (!this._resizeHandle) {
			var mousePos = this.getMousePosition(e);
			var dims = this.getDimensions();

			if (mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - 15
				&& mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - 15) {
				this._renderer.setElementStyle(this._ngEl, 'cursor', 'nwse-resize');
			} else if (mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - 15) {
				this._renderer.setElementStyle(this._ngEl, 'cursor', 'ew-resize');
			} else if (mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - 15) {
				this._renderer.setElementStyle(this._ngEl, 'cursor', 'ns-resize');
			} else {
				this._renderer.setElementStyle(this._ngEl, 'cursor', 'default');
			}
		}
	}
	
	private getMousePosition(e): {left: number, top: number} {
		if (e.originalEvent && e.originalEvent.touches) {
			var oe = e.originalEvent;
			e = oe.touches.length ? oe.touches[0] : oe.changedTouches[0];
		}
		
		var refPos = this._ngEl.nativeElement.getBoundingClientRect();
		
		return {
			left: e.clientX - refPos.left,
			top: e.clientY - refPos.top
		};
	}
	
	setConfig(config) {
		this._col = config.col;
		this._row = config.row;
		this._sizex = config.sizex;
		this._sizey = config.sizey;
		this._dragHandle = config.dragHandle;
		this._resizeHandle = config.resizeHandle;
		
		this.recalculateDimensions();
	}
	
	recalculateDimensions() {
		var w = (this._ngGrid.colWidth * this._sizex) + ((this._ngGrid.marginLeft + this._ngGrid.marginRight) * (this._sizex - 1));
		var h = (this._ngGrid.rowHeight * this._sizey) + ((this._ngGrid.marginTop + this._ngGrid.marginBottom) * (this._sizey - 1));
		this.setDimensions(w, h);
	}
	
	getDragHandle() {
		return this._dragHandle;
	}
	
	getResizeHandle() {
		return this._resizeHandle;
	}
	
	getDimensions():{width: number, height: number} {
		return { 'width': this._elemWidth, 'height': this._elemHeight };
	}
	
	getSize():{x: number, y: number} {
		return { 'x': this._sizex, 'y': this._sizey };
	}
	
	setSize(x, y) {
		this._sizex = x;
		this._sizey = y;
		this.recalculateDimensions();
	}
	
	recalculatePosition() {
		var x = (this._ngGrid.colWidth + this._ngGrid.marginLeft + this._ngGrid.marginRight) * (this._col - 1) + this._ngGrid.marginLeft;
		var y = (this._ngGrid.rowHeight + this._ngGrid.marginTop + this._ngGrid.marginBottom) * (this._row - 1) + this._ngGrid.marginRight;
		this.setPosition(x, y);
	}
	
	getPosition():{left: number, top: number} {
		return { 'left': this._elemLeft, 'top': this._elemTop };
	}
	
	getGridPosition():{col: number, row: number} {
		return { 'col': this._col, 'row': this._row };
	}
	
	setGridPosition(col, row) {
		this._col = col;
		this._row = row;
		this.recalculatePosition();
	}
	
	setPosition(x, y) {
		this._renderer.setElementStyle(this._ngEl, 'left', x+"px");
		this._renderer.setElementStyle(this._ngEl, 'top', y+"px");
		this._elemLeft = x;
		this._elemTop = y;
	}
	
	setDimensions(w, h) {
		this._renderer.setElementStyle(this._ngEl, 'width', w+"px");
		this._renderer.setElementStyle(this._ngEl, 'height', h+"px");
		this._elemWidth = w;
		this._elemHeight = h;
	}
}

// @Component {
// 	selector: 'ng-grid-handle',
// 	hostListeners: {
// 		'mousedown': 'resizeStart()',
// 		'mousemove': 'resize()',
// 		'mouseup': 'resizeStop()',
// 		'touchstart': 'resizeStart()',
// 		'touchmove': 'resize()',
// 		'touchend': 'resizeStop()'
// 	}
// }
// @View {
// 	template: '<div class="handle"></div>'
// }
// export class NgGridHandle {
// 	private isResizing: boolean = false;
	
// 	constructor(private _ngEl: ElementRef, private _renderer: Renderer, private _eventManager: EventManager, private @Parent() _ngGridItem: NgGridItem, private @Parent() _ngGrid: NgGrid) {
		
//     }
	
// 	resizeStart(e) {
//         e.preventDefault();
// 		if (!this._ngGrid.resizeEnable || this.isResizing) return;
		
// 		this.isResizing = true;
// 		this.onResizeStart(e);
// 		this._ngGridItem.resizeStart();
// 	}
	
// 	resize(e) {
//         e.preventDefault();
// 		if (!this.isResizing) return;
		
// 		var offset = this.getOffset(e);
		
// 		this.onResize.next(e, location);
// 		this._ngGridItem.resize();
// 	}
	
// 	resizeEnd(e) {
//         e.preventDefault();
// 		if (!this.isResizing) return;
		
// 		this.isResizing = false;
		
// 		var offset = this.getOffset(e);
		
// 		this._ngGridItem.resizeEnd();
// 	}
// }