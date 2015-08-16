/// <reference path="typings/angular2/angular2.d.ts" />

import {Directive, ElementRef, Renderer, EventEmitter, Host} from 'angular2/angular2';

@Directive({
	selector: '[ng-grid]',
	properties: ['config: ng-grid'],
	host: {
		'(^mousedown)': '_onMouseDown($event)',
		'(^mousemove)': '_onMouseMove($event)',
		// '(^document:mousemove)': '_onMouseMove($event)',
		'(^mouseup)': '_onMouseUp($event)',
		'(^touchstart)': '_onMouseDown($event)',
		'(^touchmove)': '_onMouseMove($event)',
		'(^touchend)': '_onMouseUp($event)'
	},
	events: ['onDragStart', 'onDrag', 'onDragStop', 'onResizeStart', 'onResize', 'onResizeStop']
})
export class NgGrid {
	//	Event Emitters
	public onDragStart: EventEmitter = new EventEmitter();
	public onDrag: EventEmitter = new EventEmitter();
	public onDragStop: EventEmitter = new EventEmitter();
	public onResizeStart: EventEmitter = new EventEmitter();
	public onResize: EventEmitter = new EventEmitter();
	public onResizeStop: EventEmitter = new EventEmitter();
	
	//	Public variables
	public colWidth: number = 250;
	public rowHeight: number = 250;
	public marginTop: number = 10;
	public marginRight: number = 10;
	public marginBottom: number = 10;
	public marginLeft: number = 10;
	public isDragging: boolean = false;
	public isResizing: boolean = false;
	
	//	Private variables
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
	
	//	Default config
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
	
	//	[ng-grid] attribute handler
	set config(v) {
		var defaults = NgGrid.CONST_DEFAULT_CONFIG;
		
		for (var x in defaults)
			if (v[x] == null)
				v[x] = defaults[x];
		
		this.setConfig(v);
	}
	
	//	Constructor
	constructor(private _ngEl: ElementRef, private _renderer: Renderer) {
		this._renderer.setElementAttribute(this._ngEl, 'class', 'grid');
	}
	
	//	Public methods
	public setConfig(config): void {
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
	
	public setMargins(margins): void {
		this.marginTop = margins[0];
		this.marginRight = margins.length >= 2 ? margins[1] : this.marginTop;
		this.marginBottom = margins.length >= 3 ? margins[2] : this.marginTop;
		this.marginLeft = margins.length >= 4 ? margins[3] : this.marginRight;
	}
	
	public enableDrag(): void {
		this._dragEnable = true;
	}
	
	public disableDrag(): void {
		this._dragEnable = false;
	}
	
	public enableResize(): void {
		this._resizeEnable = true;
	}
	
	public disableResize(): void {
		this._resizeEnable = false;
	}
	
	public addItem(ngItem: NgGridItem): void {
		var newPos = this._fixGridPosition(ngItem.getGridPosition(), ngItem.getSize());
		ngItem.setGridPosition(newPos.col, newPos.row);
		this._items.push(ngItem);
		this._addToGrid(ngItem);
	}
	
	public removeItem(ngItem: NgGridItem): void {
		for (var x in this._items)
			if (this._items[x] == ngItem)
				this._items = this._items.splice(x, 1);
	}
	
	//	Private methods
	private _onMouseDown(e: any): boolean {
		var mousePos = this._getMousePosition(e);
		var item = this._getItemFromPosition(mousePos);
		
		if (item != null) {
			if (item.canResize(e) != null) {
				this._resizeStart(e);
			} else if (item.canDrag(e)) {
				this._dragStart(e);
			}
		}
		
		return false;
	}
	
	private _resizeStart(e: any): void {
		var mousePos = this._getMousePosition(e);
		var item = this._getItemFromPosition(mousePos);
		
		this._resizingItem = item;
		this._resizeDirection = item.canResize(e);
		this._removeFromGrid(item);
		this.isResizing = true;
		
		this.onResizeStart.next(item);
	}
	
	private _dragStart(e: any): void {
		var mousePos = this._getMousePosition(e);
		var item = this._getItemFromPosition(mousePos);
		var itemPos = item.getPosition();
		var pOffset = { 'left': (mousePos.left - itemPos.left), 'top': (mousePos.top - itemPos.top) }
		
		this._draggingItem = item;
		this._posOffset = pOffset;
		this._removeFromGrid(item);
		this.isDragging = true;
		
		this.onDragStart.next(item);
	}
	
	private _onMouseMove(e: any): boolean {
		if (e.buttons == 0 && this.isDragging) {
			this._dragStop(e);
		} else if (e.buttons == 0 && this.isDragging) {
			this._resizeStop(e);
		} else if (this.isDragging) {
			this._drag(e);
		} else if (this.isResizing) {
			this._resize(e);
		} else {
			var mousePos = this._getMousePosition(e);
			var item = this._getItemFromPosition(mousePos);
			
			if (item) {
				item.onMouseMove(e);
			}
		}
		
		return false;
	}
	
	private _drag(e: any): void {
		if (this.isDragging) {
			var mousePos = this._getMousePosition(e)
			this._draggingItem.setPosition((mousePos.left - this._posOffset.left), (mousePos.top - this._posOffset.top));
			
			var gridPos = this._calculateGridPosition(this._draggingItem);
			var dims = this._draggingItem.getSize();
			
			this._fixGridCollisions(gridPos, dims);
			this._cascadeGrid(gridPos, dims);
			
			this._updateSize(gridPos.col + dims.x - 1, gridPos.row + dims.y - 1);
			this.onDrag.next(this._draggingItem);
		}
	}
	
	private _resize(e: any): void {
		if (this.isResizing) {
			var mousePos = this._getMousePosition(e);
			var itemPos = this._resizingItem.getPosition();
			var itemDims = this._resizingItem.getDimensions();
			var newW = this._resizeDirection == 'height' ? itemDims.width : (mousePos.left - itemPos.left + 10);
			var newH = this._resizeDirection == 'width' ? itemDims.height : (mousePos.top - itemPos.top + 10);
			
			if (newW < this._minWidth)
				newW = this._minWidth;
			if (newH < this._minHeight)
				newH = this._minHeight;
			
			this._resizingItem.setDimensions(newW, newH);
			
			var calcSize = this._calculateGridSize(this._resizingItem);
			
			var iGridPos = this._resizingItem.getGridPosition();
			
			this._fixGridCollisions(iGridPos, this._resizingItem.getSize());
			this._cascadeGrid(iGridPos, calcSize);
			
            var bigGrid = this._maxGridSize(itemPos.left + newW, itemPos.top + newH);
            
            if (this._resizeDirection == 'height') bigGrid.x = iGridPos.col;
            if (this._resizeDirection == 'width') bigGrid.y = iGridPos.row;
            
            this._updateSize(bigGrid.x, bigGrid.y);
			this.onResize.next(this._resizingItem);
		}
	}
	
	private _onMouseUp(e: any): boolean {
		if (this.isDragging) {
			this._dragStop(e);
		} else if (this.isResizing) {
			this._resizeStop(e);
		}
		
		return false;
	}
	
	private _dragStop(e: any): void {
		if (this.isDragging) {
			this.isDragging = false;
		
			var gridPos = this._calculateGridPosition(this._draggingItem);
			
			this._draggingItem.setGridPosition(gridPos.col, gridPos.row);
			this._addToGrid(this._draggingItem);
			
			this._cascadeGrid();
			
			this._draggingItem = null;
			this._posOffset = null;
			this.onDragStop.next(this._draggingItem);
		}
	}
	
	private _resizeStop(e: any): void {
		if (this.isResizing) {
			this.isResizing = false;
			
            var gridSize = this._calculateGridSize(this._resizingItem);
            
            this._resizingItem.setSize(gridSize.x, gridSize.y);
			this._addToGrid(this._resizingItem);
            
            this._cascadeGrid();
            
            this._resizingItem = null;
            this._resizeDirection = null;
			this.onResizeStop.next(this._resizingItem);
		}
	}
	
	private _setAttr(name: string, val: string): void {
		this._renderer.setElementAttribute(this._ngEl, name, val);
	}
	
	private _maxGridSize(w: number, h: number): {x: number, y: number} {
		var sizex = Math.ceil((w + (this.colWidth / 2)) / (this.colWidth + this.marginLeft + this.marginRight));
		var sizey = Math.ceil((h + (this.rowHeight / 2)) / (this.rowHeight + this.marginTop + this.marginBottom));
		return { 'x': sizex, 'y': sizey };
	}
	
	private _calculateGridSize(item: NgGridItem): {x: number, y: number} {
		var dims = item.getDimensions();
		
        dims.width += this.marginLeft + this.marginRight;
        dims.height += this.marginTop + this.marginBottom;
        
		var sizex = Math.max(1, Math.round(dims.width / (this.colWidth + this.marginLeft + this.marginRight)));
		var sizey = Math.max(1, Math.round(dims.height / (this.rowHeight + this.marginTop + this.marginBottom)));
		
		return { 'x': sizex, 'y': sizey };
	}
	
	private _calculateGridPosition(item: NgGridItem): {col: number, row: number} {
		var pos = item.getPosition();
		var col = Math.round(pos.left / (this.colWidth + this.marginLeft + this.marginRight)) + 1;
		var row = Math.round(pos.top / (this.rowHeight + this.marginTop + this.marginBottom)) + 1;
		return { 'col': col, 'row': row };
	}
	
	private _checkGridCollision(pos: {col: number, row: number}, dims: {x: number, y: number}): boolean {
		var positions = this._getCollisions(pos, dims);
		
		if (positions == null || positions.length == 0) return false;
		
		var collision = false;
		
		positions.map(function(v) {
			collision = (v === null) ? collision : true;
		});
		
		return collision;
	}
	
	private _getCollisions(pos: {col: number, row: number}, dims: {x: number, y: number}): Array<NgGridItem> {
		var returns: Array<NgGridItem> = [];
		
		for (var j = 0; j < dims.y; j++)
			if (this._itemGrid[pos.row + j] != null)
				for (var i = 0; i < dims.x; i++)
					if (this._itemGrid[pos.row + j][pos.col + i] != null)
						returns.push(this._itemGrid[pos.row + j][pos.col + i]);
		
		return returns;
	}
	
	private _fixGridCollisions(pos: {col: number, row: number}, dims: {x: number, y: number}): void {
		while (this._checkGridCollision(pos, dims)) {
			var collisions = this._getCollisions(pos, dims);
			
			var me = this;
			this._removeFromGrid(collisions[0]);
			
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
			
			this._fixGridCollisions(itemPos, itemDims);
			
			this._addToGrid(collisions[0]);
		}
	}
	
	private _cascadeGrid(pos?: {col: number, row: number}, dims?: {x: number, y: number}): void {
		if (pos && !dims) throw new Error("Cannot cascade with only position and not dimensions");
		
		switch (this._cascade) {
			case "up":
				var lowRow: Array<number> = [0];
				
				for (var i:number = 1; i <= this._getMaxCol(); i++)
					lowRow[i] = 1;
				
				for (var r:number = 1; r <= this._getMaxRow(); r++) {
					if (this._itemGrid[r] == undefined) continue;
					
					for (var c:number = 1; c <= this._getMaxCol(); c++) {
						if (this._itemGrid[r] == undefined) break;
						if (r < lowRow[c]) continue;
						
						if (this._itemGrid[r][c] != null) {
							var item = this._itemGrid[r][c];
							var itemDims = item.getSize();
							var itemPos = item.getGridPosition();
							
							if (itemPos.col != c || itemPos.row != r) continue;	//	If this is not the element's start
							
							var lowest = lowRow[c];
							
							for (var i: number = 1; i < itemDims.x; i++) {
								lowest = Math.max(lowRow[(c + i)], lowest);
							}
							
							if (pos && (c + itemDims.x) > pos.col && c < (pos.col + dims.x)) {          //	If our element is in one of the item's columns
								if ((r >= pos.row && r < (pos.row + dims.y)) ||                         //	If this row is occupied by our element
										((itemDims.y > (pos.row - lowest)) &&                           //	Or the item can't fit above our element
										(r >= (pos.row + dims.y) && lowest < (pos.row + dims.y)))) {    //		And this row is below our element, but we haven't caught it
									lowest = Math.max(lowest, pos.row + dims.y);                        //	Set the lowest row to be below it
								}
							}
							
							if (lowest != itemPos.row) {	//	If the item is not already on this row move it up
								this._removeFromGrid(item);
								item.setGridPosition(c, lowest);
								this._addToGrid(item);
							}
							
							for (var i: number = 0; i < itemDims.x; i++) {
								lowRow[c+i] = lowest + itemDims.y;	//	Update the lowest row to be below the item
							}
							
						}
					}
				}
				break;
		}
	}
	
	private _fixGridPosition(pos: {col: number, row: number}, dims: {x: number, y: number}): {col: number, row: number} {
		while (this._checkGridCollision(pos, dims)) {
			pos.col++;
			
			this._updateSize(pos.col + dims.x - 1, null);
			
			if (this._maxCols > 0 && (pos.col + dims.x - 1) > this._maxCols) {
				pos.col = 1;
				pos.row++;
				
				this._updateSize(null, pos.row + dims.y - 1);
				
				if (this._maxRows > 0 && (pos.row + dims.y - 1) > this._maxRows) {
					throw new Error("Unable to calculate grid position");
				}
			}
		}
		
		return pos;
	}
	
	private _addToGrid(item: NgGridItem): void {
		var pos = item.getGridPosition();
		var dims = item.getSize();
		
		if (this._checkGridCollision(pos, dims)) {
			this._fixGridCollisions(pos, dims);
			pos = item.getGridPosition();
		}
		
		for (var j = 0; j < dims.y; j++) {
			if (this._itemGrid[pos.row + j] == null) this._itemGrid[pos.row + j] = {};
			for (var i = 0; i < dims.x; i++) {
				if (this._itemGrid[pos.row + j][pos.col + i] == null) {
					this._itemGrid[pos.row + j][pos.col + i] = item;
					
					this._updateSize(pos.col + dims.x - 1, pos.row + dims.y - 1);
				} else {
					throw new Error("Cannot add item to grid. Space already taken.");
				}
			}
		}
	}
	
	private _removeFromGrid(item: NgGridItem): void {
		for (var y in this._itemGrid)
			for (var x in this._itemGrid[y])
				if (this._itemGrid[y][x] == item)
					this._itemGrid[y][x] = null;
	}
	
	private _updateSize(col?: number, row?:number): void {
		col = (col == undefined) ? 0 : col;
		row = (row == undefined) ? 0 : row;
		
		this._filterGrid();
		
		var maxRow = Math.max(this._getMaxRow(), row);
		var maxCol = Math.max(this._getMaxCol(), col);
		
		this._renderer.setElementStyle(this._ngEl, 'width', (maxCol * (this.colWidth + this.marginLeft + this.marginRight))+"px");
		this._renderer.setElementStyle(this._ngEl, 'height', (maxRow * (this.rowHeight + this.marginTop + this.marginBottom)) + "px");
	}
	
	private _filterGrid(): void {
		var curMaxCol = this._getMaxCol();
		var curMaxRow = this._getMaxRow();
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
	
	private _getMaxRow(): number {
		return Math.max.apply(null, Object.keys(this._itemGrid));
	}
	
	private _getMaxCol(): number {
		var me = this;
		var maxes = [0];
		Object.keys(me._itemGrid).map(function(v) { maxes.push(Math.max.apply(null, Object.keys(me._itemGrid[v]))); });
		return Math.max.apply(null, maxes);
	}
	
	private _getMousePosition(e: any): {left: number, top: number} {
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
	
	private _getAbsoluteMousePosition(e: any): {left: number, top: number} {
		if (e.originalEvent && e.originalEvent.touches) {
			var oe = e.originalEvent;
			e = oe.touches.length ? oe.touches[0] : oe.changedTouches[0];
		}

		return {
			left: e.clientX,
			top: e.clientY
		};
	}
	
	private _getItemFromPosition(position: {left: number, top: number}): NgGridItem {
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
	//	Default config
	private static CONST_DEFAULT_CONFIG = {
		'col': 1,
		'row': 1,
		'sizex': 1,
		'sizey': 1,
		'dragHandle': null,
		'resizeHandle': null
	}
	
	//	Private variables
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
	
	//	[ng-grid-item] handler
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
		
		this._recalculateDimensions();
		this._recalculatePosition();
	}
	
	//	Constructor
	constructor(private _ngEl: ElementRef, private _renderer: Renderer, private _ngGrid:NgGrid) {//@Host()
		this._renderer.setElementAttribute(this._ngEl, 'class', 'grid-item');
		this._recalculateDimensions();
		this._recalculatePosition();
	}
	
	//	Public methods
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
			var mousePos = this._getMousePosition(e);
			
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
	
	public onMouseMove(e): void {
		if (this.canDrag(e)) {
			this._renderer.setElementStyle(this._ngEl, 'cursor', 'move');
		} else if (!this._resizeHandle) {
			var mousePos = this._getMousePosition(e);
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
		} else if (this.canResize(e)) {
			this._renderer.setElementStyle(this._ngEl, 'cursor', 'nwse-resize');
		} else {
			this._renderer.setElementStyle(this._ngEl, 'cursor', 'default');
		}
	}
	
	//	Getters
	public getDragHandle(): string {
		return this._dragHandle;
	}
	
	public getResizeHandle(): string {
		return this._resizeHandle;
	}
	
	public getDimensions(): {width: number, height: number} {
		return { 'width': this._elemWidth, 'height': this._elemHeight }
	}
	
	public getSize(): {x: number, y: number} {
		return { 'x': this._sizex, 'y': this._sizey }
	}
	
	public getPosition(): {left: number, top: number} {
		return { 'left': this._elemLeft, 'top': this._elemTop }
	}
	
	public getGridPosition(): {col: number, row: number} {
		return { 'col': this._col, 'row': this._row }
	}
	
	//	Setters
	public setConfig(config): void {
		this._col = config.col;
		this._row = config.row;
		this._sizex = config.sizex;
		this._sizey = config.sizey;
		this._dragHandle = config.dragHandle;
		this._resizeHandle = config.resizeHandle;
		
		this._recalculatePosition();
		this._recalculateDimensions();
	}
	
	public setSize(x, y): void {
		this._sizex = x;
		this._sizey = y;
		this._recalculateDimensions();
	}
	
	public setGridPosition(col, row): void {
		this._col = col;
		this._row = row;
		this._recalculatePosition();
	}
	
	public setPosition(x, y): void {
		this._renderer.setElementStyle(this._ngEl, 'left', x+"px");
		this._renderer.setElementStyle(this._ngEl, 'top', y+"px");
		this._elemLeft = x;
		this._elemTop = y;
	}
	
	public setDimensions(w, h): void {
		this._renderer.setElementStyle(this._ngEl, 'width', w+"px");
		this._renderer.setElementStyle(this._ngEl, 'height', h+"px");
		this._elemWidth = w;
		this._elemHeight = h;
	}
	
	//	Private methods
	private _recalculatePosition(): void {
		var x = (this._ngGrid.colWidth + this._ngGrid.marginLeft + this._ngGrid.marginRight) * (this._col - 1) + this._ngGrid.marginLeft;
		var y = (this._ngGrid.rowHeight + this._ngGrid.marginTop + this._ngGrid.marginBottom) * (this._row - 1) + this._ngGrid.marginRight;
		this.setPosition(x, y);
	}
	
	private _recalculateDimensions(): void {
		var w = (this._ngGrid.colWidth * this._sizex) + ((this._ngGrid.marginLeft + this._ngGrid.marginRight) * (this._sizex - 1));
		var h = (this._ngGrid.rowHeight * this._sizey) + ((this._ngGrid.marginTop + this._ngGrid.marginBottom) * (this._sizey - 1));
		this.setDimensions(w, h);
	}
	
	private _getMousePosition(e): {left: number, top: number} {
		if (e.originalEvent && e.originalEvent.touches) {
			var oe = e.originalEvent;
			e = oe.touches.length ? oe.touches[0] : oe.changedTouches[0];
		}
		
		var refPos = this._ngEl.nativeElement.getBoundingClientRect();
		
		return {
			left: e.clientX - refPos.left,
			top: e.clientY - refPos.top
		}
	}
}