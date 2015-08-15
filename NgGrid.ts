/// <reference path="typings/angular2/angular2.d.ts" />

import {View, Component, Directive, LifecycleEvent, ElementRef, Pipe, Pipes, Renderer, EventEmitter, HostMetadata, Host} from 'angular2/angular2';//, EventManager
// import {HostMetadata} from 'angular2/di';

@Directive({
	selector: '[ng-grid]',
	properties: ['config: ng-grid'],
	host: {
		'(^mousedown)': 'onMouseDown($event)',
		'(^mousemove)': 'onMouseMove($event)',
		// '(^document:mousemove)': 'onMouseMove($event)',
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
		var newPos = this.fixGridPosition(ngItem.getGridPosition(), ngItem.getSize());
		ngItem.setGridPosition(newPos.col, newPos.row);
		this._items.push(ngItem);
		this.addToGrid(ngItem);
	}
	
	public removeItem(ngItem: NgGridItem) {
		for (var x in this._items)
			if (this._items[x] == ngItem)
				this._items = this._items.splice(x, 1);
	}
	
	public onMouseDown(e) {
		var mousePos = this.getMousePosition(e);
		var item = this.getItemFromPosition(mousePos);
		
		if (item != null) {
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
		this.removeFromGrid(item);
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
		if (e.buttons == 0 && this.isDragging) {
			this.dragStop(e);
		} else if (e.buttons == 0 && this.isDragging) {
			this.resizeStop(e);
		} else if (this.isDragging) {
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
			this.cascadeGrid(gridPos, dims);
			
			this.updateSize(gridPos.col + dims.x - 1, gridPos.row + dims.y - 1);
			
			return false;
		}
	}
	
	public resize(e) {
		if (this.isResizing) {
			var mousePos = this.getMousePosition(e);
			var itemPos = this._resizingItem.getPosition();
			var itemDims = this._resizingItem.getDimensions();
			var newW = this._resizeDirection == 'height' ? itemDims.width : (mousePos.left - itemPos.left + 10);
			var newH = this._resizeDirection == 'width' ? itemDims.height : (mousePos.top - itemPos.top + 10);
			
			if (newW < this._minWidth)
				newW = this._minWidth;
			if (newH < this._minHeight)
				newH = this._minHeight;
			
			this._resizingItem.setDimensions(newW, newH);
			
			var calcSize = this.calculateGridSize(this._resizingItem);
			
			var iGridPos = this._resizingItem.getGridPosition();
			
			this.fixGridCollisions(iGridPos, this._resizingItem.getSize());
			this.cascadeGrid(iGridPos, calcSize);
			
            var bigGrid = this.maxGridSize(itemPos.left + newW, itemPos.top + newH);
            
            if (this._resizeDirection == 'height') bigGrid.x = iGridPos.col;
            if (this._resizeDirection == 'width') bigGrid.y = iGridPos.row;
            
            this.updateSize(bigGrid.x, bigGrid.y);
			
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
			
			this.cascadeGrid();
			
			this._draggingItem = null;
			this._posOffset = null;
			
			return false;
		}
	}
	
	public resizeStop(e) {
		if (this.isResizing) {
			this.isResizing = false;
			
            var gridSize = this.calculateGridSize(this._resizingItem);
            
            this._resizingItem.setSize(gridSize.x, gridSize.y);
			this.addToGrid(this._resizingItem);
            
            this.cascadeGrid();
            
            this._resizingItem = null;
            this._resizeDirection = null;
		}
	}
	
	private maxGridSize(w: number, h: number):{x: number, y: number} {
		var sizex = Math.ceil((w + (this.colWidth / 2)) / (this.colWidth + this.marginLeft + this.marginRight));
		var sizey = Math.ceil((h + (this.rowHeight / 2)) / (this.rowHeight + this.marginTop + this.marginBottom));
		return { 'x': sizex, 'y': sizey };
	}
	
	private calculateGridSize(item: NgGridItem):{x: number, y: number} {
		var dims = item.getDimensions();
		
        dims.width += this.marginLeft + this.marginRight;
        dims.height += this.marginTop + this.marginBottom;
        
		var sizex = Math.max(1, Math.round(dims.width / (this.colWidth + this.marginLeft + this.marginRight)));
		var sizey = Math.max(1, Math.round(dims.height / (this.rowHeight + this.marginTop + this.marginBottom)));
		
		return { 'x': sizex, 'y': sizey };
	}
	
	private calculateGridPosition(item: NgGridItem):{col: number, row: number} {
		var pos = item.getPosition();
		var col = Math.round(pos.left / (this.colWidth + this.marginLeft + this.marginRight)) + 1;
		var row = Math.round(pos.top / (this.rowHeight + this.marginTop + this.marginBottom)) + 1;
		return { 'col': col, 'row': row };
	}
	
	private checkGridCollision(pos: {col: number, row: number}, dims: {x: number, y: number}):boolean {
		var positions = this.getCollisions(pos, dims);
		
		if (positions == null || positions.length == 0) return false;
		
		var collision = false;
		
		positions.map(function(v) {
			collision = (v === null) ? collision : true;
		});
		
		return collision;
	}
	
	private getCollisions(pos: {col: number, row: number}, dims: {x: number, y: number}):Array<NgGridItem> {
		var returns = [];
		
		for (var j = 0; j < dims.y; j++)
			if (this._itemGrid[pos.row + j] != null)
				for (var i = 0; i < dims.x; i++)
					if (this._itemGrid[pos.row + j][pos.col + i] != null)
						returns.push(this._itemGrid[pos.row + j][pos.col + i]);
		
		return returns;
	}
	
	private fixGridCollisions(pos: {col: number, row: number}, dims: {x: number, y: number}) {
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
	
	private cascadeGrid(pos?: {col: number, row: number}, dims?: {x: number, y: number}) {
		switch (this._cascade) {
			case "up":
				var lowRow: Array<number> = [0];
				
				for (var i:number = 1; i <= this.getMaxCol(); i++)
					lowRow[i] = 1;
				
				for (var r:number = 1; r <= this.getMaxRow(); r++) {
					if (this._itemGrid[r] == undefined) continue;
					
					for (var c:number = 1; c <= this.getMaxCol(); c++) {
						if (this._itemGrid[r] == undefined) break;
						if (r < lowRow[c]) continue;
						
						if (this._itemGrid[r][c] != null) {
							var item = this._itemGrid[r][c];
							var itemDims = item.getSize();
							var itemPos = item.getGridPosition();
							
							if (itemPos.col != c || itemPos.row != r) continue;	//	If this is not the element's start
							
							if (pos && c >= pos.col && c < (pos.col + dims.x)) {	//	If our element is in this column
								if (r >= pos.row && r < (pos.row + dims.y)) {	//	If this row is occupied by our element
									lowRow[c] = pos.row + dims.y;	//	Set the lowest row to be below it
								} else if (itemDims.y > (pos.row - lowRow[c])) {	//	If the item can't fit above our element
									lowRow[c] = pos.row + dims.y;	//	Set the lowest row to be below our element
								}
							}
							
							if (lowRow[c] != itemPos.row) {	//	If the item is not already on this row move it up
								this.removeFromGrid(item);
								item.setGridPosition(c, lowRow[c]);
								this.addToGrid(item);
							}
							
							lowRow[c] += itemDims.y;	//	Update the lowest row to be below the item
						}
					}
				}
				break;
		}
	}
	
	private fixGridPosition(pos: {col: number, row: number}, dims: {x: number, y: number}): {col: number, row: number} {
		while (this.checkGridCollision(pos, dims)) {
			pos.col++;
			
			this.updateSize(pos.col + dims.x - 1, null);
			
			if (this._maxCols > 0 && (pos.col + dims.x - 1) > this._maxCols) {
				pos.col = 1;
				pos.row++;
				
				this.updateSize(null, pos.row + dims.y - 1);
				
				if (this._maxRows > 0 && (pos.row + dims.y - 1) > this._maxRows) {
					throw new Error("Unable to calculate grid position");
				}
			}
		}
		
		return pos;
	}
	
	public addToGrid(item: NgGridItem) {
		var pos = item.getGridPosition();
		var dims = item.getSize();
		
		if (this.checkGridCollision(pos, dims)) {
			this.fixGridCollisions(pos, dims);
			pos = item.getGridPosition();
		}
		
		for (var j = 0; j < dims.y; j++) {
			if (this._itemGrid[pos.row + j] == null) this._itemGrid[pos.row + j] = {};
			for (var i = 0; i < dims.x; i++) {
				if (this._itemGrid[pos.row + j][pos.col + i] == null) {
					this._itemGrid[pos.row + j][pos.col + i] = item;
					
					this.updateSize(pos.col + dims.x - 1, pos.row + dims.y - 1);
				} else {
					throw new Error("Cannot add item to grid. Space already taken.");
				}
			}
		}
	}
	
	public removeFromGrid(item: NgGridItem) {
		for (var y in this._itemGrid)
			for (var x in this._itemGrid[y])
				if (this._itemGrid[y][x] == item)
					this._itemGrid[y][x] = null;
	}
	
	private updateSize(col?: number, row?:number) {
		col = (col == undefined) ? 0 : col;
		row = (row == undefined) ? 0 : row;
		
		this.filterGrid();
		
		var maxRow = Math.max(this.getMaxRow(), row);
		var maxCol = Math.max(this.getMaxCol(), col);
		
		this._renderer.setElementStyle(this._ngEl, 'width', (maxCol * (this.colWidth + this.marginLeft + this.marginRight))+"px");
		this._renderer.setElementStyle(this._ngEl, 'height', (maxRow * (this.rowHeight + this.marginTop + this.marginBottom)) + "px");
	}
	
	private filterGrid() {
		var curMaxCol = this.getMaxCol();
		var curMaxRow = this.getMaxRow();
		var maxCol = 0;
		var maxRow = 0;
		
		for (var r:number = 1; r <= curMaxRow; r++) {
			if (this._itemGrid[r] == undefined) continue;
			
			for (var c:number = 1; c <= curMaxCol; c++) {
				if (this._itemGrid[r][c] != null) {
					maxCol = Math.max(maxCol, c);
					maxRow = Math.max(maxRow, r);
				}
			}
		}
		
		if (curMaxRow != maxRow)
			for (var r: number = maxRow + 1; r <= curMaxRow; r++)
				if (this._itemGrid[r] !== undefined)
					delete this._itemGrid[r];
		
		if (curMaxCol != maxCol)
			for (var r: number = 1; r <= maxRow; r++) {
				if (this._itemGrid[r] == undefined) continue;
				
				for (var c: number = maxCol + 1; c <= curMaxCol; c++)
					if (this._itemGrid[r][c] !== undefined)
						delete this._itemGrid[r][c];
			}
	}
	
	private getMaxRow() {
		return Math.max.apply(null, Object.keys(this._itemGrid));
	}
	
	private getMaxCol() {
		var me = this;
		var maxes = [0];
		Object.keys(me._itemGrid).map(function(v) { maxes.push(Math.max.apply(null, Object.keys(me._itemGrid[v]))); });
		return Math.max.apply(null, maxes);
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
	
	private getItemFromPosition(position: {left: number, top: number}): NgGridItem {
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
	private static CONST_DEFAULT_CONFIG = {
		'col': 1,
		'row': 1,
		'sizex': 1,
		'sizey': 1,
		'dragHandle': null,
		'resizeHandle': null
	};
	
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
	private _added: boolean = false;
	
	set config(v) {
		var defaults = NgGridItem.CONST_DEFAULT_CONFIG;
		
		for (var x in defaults)
			if (v[x] == null)
				v[x] = defaults[x];
			
		this.setConfig(v);
		
		if (!this._added) {
			this._ngGrid.addItem(this);
			this._added = true;
		}
	}
	
	constructor(private _ngEl: ElementRef, private _renderer: Renderer, private _ngGrid:NgGrid) {//@Host()
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