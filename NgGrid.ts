/// <reference path="typings/angular2/angular2.d.ts" />

import {View, Component, Directive, LifecycleEvent, ElementRef, Pipe, Pipes, Renderer, EventEmitter, HostMetadata, Host} from 'angular2/angular2';//, EventManager
// import {HostMetadata} from 'angular2/di';

@Directive({
    selector: '[ng-grid]',
    properties: ['config: ng-grid'],
	host: {
		'(^mousedown)': 'dragStart($event)',
		'(^mousemove)': 'drag($event)',
		'(^mouseup)': 'dragStop($event)',
		'(^touchstart)': 'dragStart($event)',
		'(^touchmove)': 'drag($event)',
		'(^touchend)': 'dragStop($event)'
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
	private _itemGrid = {1: {1: null}};
	private _config: any = {};
	private _containerWidth: number;
	private _containerHeight: number;
	private _maxCols:number = 0;
	private _maxRows:number = 0;
	private _posOffset:{left: number, top: number} = null;
	private _adding: boolean = false;
	
	private static CONST_DEFAULT_CONFIG = {'margins': [10], 'draggable': true, 'resizeable': true, 'max_cols': 0, 'max_rows': 0, 'col_width': 250, 'row_height': 250};
	
	set config(v) {
		console.log(v);
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
    	this.addToGrid(ngItem);
    }
    
    public removeItem(ngItem: NgGridItem) {
    	for (var x in this._items)
    		if (this._items[x] == ngItem)
    			this._items = this._items.splice(x, 1);
    }
    
    public dragStart(e) {
    	var mousePos = this.getMousePosition(e);
    	var item = this.getItemFromPosition(mousePos);
    	
    	if (item != null) {
			var handle = item.getDragHandle();
			
			if (handle) {
				var foundHandle = false;
				var paths = e.path;
				paths.pop();	//	Get rid of #document
				
				var last = null;
				
				for (var x in paths) {
					if (last !== null) {
						if (paths[x].querySelector(handle) == last) {
							foundHandle = true;
							break;
						}
					}
					
					last = paths[x];
				}
				
				if (!foundHandle) return false;
			}
			
    		this._draggingItem = item;
    		
    		var itemPos = item.getPosition();
    		this._posOffset = {
    			'left': (mousePos.left - itemPos.left),
    			'top': (mousePos.top - itemPos.top)
    		}
    		
    		this.removeFromGrid(item);
    		
    		this.isDragging = true;
    	}
    	
    	return false;
    }
    public drag(e) {
    	if (this.isDragging) {
    		var mousePos = this.getMousePosition(e)
    		this._draggingItem.setPosition((mousePos.left - this._posOffset.left), (mousePos.top - this._posOffset.top));
    		
    		var gridPos = this.calculateGridPosition(this._draggingItem);
    		gridPos = this.fixGridPosition(gridPos);
    		
    		this.setGridRows(gridPos.row);
    		this.setGridCols(gridPos.col);
    		
    		return false;
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
    
    calculateGridPosition(item: NgGridItem):{col: number, row: number} {
    	var pos = item.getPosition();
    	var col = Math.round(pos.left / (this.colWidth + this.marginLeft + this.marginRight)) + 1;
    	var row = Math.round(pos.top / (this.rowHeight + this.marginTop + this.marginBottom)) + 1;
    	return { 'col': col, 'row': row };
    }
    
    checkGridCollision(col: number, row: number):boolean {
    	if (this._itemGrid[row] === undefined) return false;
    	if (this._itemGrid[row][col] === undefined) return false;
    	return this._itemGrid[row][col] !== null;
    }
    
    fixGridPosition(pos: {col: number, row: number}): {col: number, row: number} {
    	while (this.checkGridCollision(pos.col, pos.row)) {
    		pos.col++;
    		
    		this.setGridCols(pos.col);
    		
    		if (this._maxCols > 0 && pos.col > this._maxCols) {
    			pos.col = 1;
    			pos.row++;
    			
    			this.setGridRows(pos.row);
    			
    			if (this._maxRows > 0 && pos.row > this._maxRows) {
    				throw new Error("Unable to calculate grid position");
    			}
    		}
    	}
    	
    	return pos;
    }
    
    addToGrid(item: NgGridItem) {
    	var pos = item.getGridPosition();
    	
    	if (this.checkGridCollision(pos.col, pos.row)) {
    		pos = this.fixGridPosition(pos);
    		item.setGridPosition(pos.col, pos.row);
    	}
    	
    	this.setGridRows(pos.row);
    	this.setGridCols(pos.col);
    	
    	if (this._itemGrid[pos.row][pos.col] == null) {
    		this._itemGrid[pos.row][pos.col] = item;
    		
    		this.updateSize(pos.col, pos.row);
    	} else
    		throw new Error("Cannot add item to grid. Space already taken.");
    }
    
    removeFromGrid(item: NgGridItem) {
    	var pos = item.getGridPosition();
    	
    	if (this._itemGrid[pos.row][pos.col] == item)
    		this._itemGrid[pos.row][pos.col] = null;
    	else
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
		console.log(v);
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
		var h = (this._ngGrid.rowHeight * this._sizex) + ((this._ngGrid.marginTop + this._ngGrid.marginBottom) * (this._sizex - 1));
		this.setDimensions(w, h);
	}
	
	getDragHandle() {
		return this._dragHandle;
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