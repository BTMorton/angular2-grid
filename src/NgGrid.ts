import { Component, View, Directive, ElementRef, Renderer, EventEmitter, DynamicComponentLoader, Host, ViewEncapsulation, Type, ComponentRef, KeyValueDiffer, KeyValueDiffers, OnInit, DoCheck } from 'angular2/core';

@Directive({
	selector: '[ngGrid]',
	inputs: ['config: ngGrid'],
	host: {
		'(mousedown)': '_onMouseDown($event)',
		'(mousemove)': '_onMouseMove($event)',
		'(mouseup)': '_onMouseUp($event)',
		'(touchstart)': '_onMouseDown($event)',
		'(touchmove)': '_onMouseMove($event)',
		'(touchend)': '_onMouseUp($event)',
		'(window:resize)': '_onResize($event)',
		'(document:mousemove)': '_onMouseMove($event)',
		'(document:mouseup)': '_onMouseUp($event)'
	},
	outputs: ['dragStart', 'drag', 'dragStop', 'resizeStart', 'resize', 'resizeStop']
})
export class NgGrid implements OnInit, DoCheck {
	//	Event Emitters
	public dragStart: EventEmitter<any> = new EventEmitter();
	public drag: EventEmitter<any> = new EventEmitter();
	public dragStop: EventEmitter<any> = new EventEmitter();
	public resizeStart: EventEmitter<any> = new EventEmitter();
	public resize: EventEmitter<any> = new EventEmitter();
	public resizeStop: EventEmitter<any> = new EventEmitter();
	
	//	Public variables
	public colWidth: number = 250;
	public rowHeight: number = 250;
	public minCols: number = 1;
	public minRows: number = 1;
	public marginTop: number = 10;
	public marginRight: number = 10;
	public marginBottom: number = 10;
	public marginLeft: number = 10;
	public isDragging: boolean = false;
	public isResizing: boolean = false;
	public autoStyle: boolean = true;
	public resizeEnable: boolean = true;
	public dragEnable: boolean = true;
	public cascade: string = 'up';
	
	//	Private variables
	private _items: Array<NgGridItem> = [];
	private _draggingItem: NgGridItem = null;
	private _resizingItem: NgGridItem = null;
	private _resizeDirection: string = null;
	private _itemGrid: { [key: number]: { [key: number]: NgGridItem } } = {1: {1: null}};
	private _containerWidth: number;
	private _containerHeight: number;
	private _maxCols:number = 0;
	private _maxRows:number = 0;
	private _minWidth: number = 100;
	private _minHeight: number = 100;
	private _setWidth: number = 250;
	private _setHeight: number = 250;
	private _posOffset:{left: number, top: number} = null;
	private _adding: boolean = false;
	private _placeholderRef: ComponentRef = null;
	private _fixToGrid: boolean = false;
	private _autoResize: boolean = false;
	private _differ: KeyValueDiffer;
	
	//	Default config
	private static CONST_DEFAULT_CONFIG = {
		'margins': [10],
		'draggable': true,
		'resizable': true,
		'max_cols': 0,
		'max_rows': 0,
		'col_width': 250,
		'row_height': 250,
		'cascade': 'up',
		'min_width': 100,
		'min_height': 100,
		'fix_to_grid': false,
		'auto_style': true,
		'auto_resize': false
	};
	private _config = NgGrid.CONST_DEFAULT_CONFIG;
	
	//	[ng-grid] attribute handler
	set config(v: any) {
		this._config = v;
		
		if (this._differ == null && v != null) {
			this._differ = this._differs.find(this._config).create(null);
		}
		
		this.setConfig(this._config);
	}
	
	//	Constructor
	constructor(private _differs: KeyValueDiffers, private _ngEl: ElementRef, private _renderer: Renderer, private _loader: DynamicComponentLoader) {}
	
	//	Public methods
	public ngOnInit(): void {
		this._renderer.setElementClass(this._ngEl, 'grid', true);
		if (this.autoStyle) this._renderer.setElementStyle(this._ngEl, 'position', 'relative');
		this.setConfig(this._config);
	}
	
	public setConfig(config: any): void {
		var maxColRowChanged = false;
		for (var x in config) {
			var val = config[x];
			
			switch (x) {
				case 'margins':
					this.setMargins(val);
					break;
				case 'col_width':
					this.colWidth = parseInt(val);
					break;
				case 'row_height':
					this.rowHeight = parseInt(val);
					break;
				case 'auto_style':
					this.autoStyle = val ? true : false;
					break;
				case 'auto_resize':
					this._autoResize = val ? true : false;
					break;
				case 'draggable':
					this.dragEnable = val ? true : false;
					break;
				case 'resizable':
					this.resizeEnable = val ? true : false;
					break;
				case 'max_rows':
					maxColRowChanged = maxColRowChanged || this._maxRows != parseInt(val);
					this._maxRows = parseInt(val);
					break;
				case 'max_cols':
					maxColRowChanged = maxColRowChanged || this._maxCols != parseInt(val);
					this._maxCols = parseInt(val);
					break;
				case 'min_rows':
					this.minRows = Math.max(parseInt(val), 1);
					break;
				case 'min_cols':
					this.minCols = Math.max(parseInt(val), 1);
					break;
				case 'min_height':
					this._minHeight = parseInt(val);
					break;
				case 'min_width':
					this._minWidth = parseInt(val);
					break;
				case 'cascade':
					if (this.cascade != val) {
						this.cascade = val;
						this._cascadeGrid();
					}
					break;
				case 'fix_to_grid':
					this._fixToGrid = val ? true : false;
					break;
			}
		}
		
		if (maxColRowChanged) {
			if (this._maxCols > 0 && this._maxRows > 0) {	//	Can't have both, prioritise on cascade
				switch (this.cascade) {
					case "left":
					case "right":
						this._maxCols = 0;
						break;
					case "up":
					case "down":
					default:
						this._maxRows = 0;
						break;
				}
			}
			
			//	TODO: Put this somewhere else...
			// for (var r: number = 1; r <= this._getMaxRow(); r++) {
			// 	if (this._itemGrid[r] != null) {
			// 		for (var c: number = 1; c <= this._getMaxCol(); c++) {
			// 			if (this._itemGrid[r] != null && this._itemGrid[r][c] != null) {
			// 				var item: NgGridItem = this._itemGrid[r][c];
			// 				var pos: {'col': number, 'row': number} = item.getGridPosition();
			// 				var dims: {'x': number, 'y': number} = item.getSize();
							
			// 				if ((this._maxCols > 0 && (pos.col + dims.x - 1) > this._maxCols) || (this._maxRows > 0 && (pos.row + dims.y - 1) > this._maxRows)) {
			// 					this._removeFromGrid(item);
								
			// 					if (this._maxRows > 0 && dims.y > this._maxRows)
			// 						dims.y = this._maxRows;
			// 					else if (this._maxCols > 0 && dims.x > this._maxCols)
			// 						dims.x = this._maxCols;
								
			// 					item.setSize(dims.x, dims.y);
								
			// 					if (this._maxRows > 0 && (pos.row + dims.y) > this._maxRows)
			// 						pos.row = (this._maxRows - (dims.y - 1));
			// 					else if (this._maxCols > 0 && (pos.col + dims.x) > this._maxCols)
			// 						pos.col = (this._maxCols - (dims.x - 1));
								
			// 					item.setGridPosition(pos.col, pos.row);
								
			// 					this._fixGridCollisions(pos, dims);
			// 					this._addToGrid(item);
			// 				}
			// 			}
			// 		}
			// 	}
			// }
		}
		
		if (this._autoResize && this._maxCols > 0) {
			var maxWidth: number = this._ngEl.nativeElement.getBoundingClientRect().width;
			
			var colWidth: number = Math.floor(maxWidth / this._maxCols);
			colWidth -= (this.marginLeft + this.marginRight);
			if (colWidth > 0) this.colWidth = colWidth;
		} else if (this._autoResize && this._maxRows > 0) {
			var maxHeight: number = window.innerHeight;
			
			var rowHeight: number = Math.floor(maxHeight / this._maxRows);
			rowHeight -= (this.marginTop + this.marginBottom);
			if (rowHeight > 0) this.rowHeight = rowHeight;
		}

		var maxWidth = this._maxCols * this.colWidth;
		var maxHeight = this._maxRows * this.rowHeight;

		if (maxWidth > 0 && this._minWidth > maxWidth) this._minWidth = 0.75 * this.colWidth;
		if (maxHeight > 0 && this._minHeight > maxHeight) this._minHeight = 0.75 * this.rowHeight;

		if (this._minWidth > this.colWidth) this.minCols = Math.max(this.minCols, Math.ceil(this._minWidth / this.colWidth));
		if (this._minHeight > this.rowHeight) this.minRows = Math.max(this.minRows, Math.ceil(this._minHeight / this.rowHeight));

		if (this._maxCols > 0 && this.minCols > this._maxCols) this.minCols = 1;
		if (this._maxRows > 0 && this.minRows > this._maxRows) this.minRows = 1;
		
		for (var x in this._items) {
			this._removeFromGrid(this._items[x]);
			this._items[x].recalculateSelf();
			this._addToGrid(this._items[x]);
		}
		
		this._cascadeGrid();
		this._updateSize();
	}
	
	public getItemPosition(index: number): {col: number, row: number} {
		return this._items[index].getGridPosition();
	}
	
	public getItemSize(index: number): {x: number, y: number} {
		return this._items[index].getSize();
	}
	
	public ngDoCheck(): boolean {
		if (this._differ != null) {
			var changes = this._differ.diff(this._config);
			
			if (changes != null) {
				this._applyChanges(changes);
				
				return true;
			}
		}
		
		return false;
	}
	
	public setMargins(margins: Array<string>): void {
		this.marginTop = parseInt(margins[0]);
		this.marginRight = margins.length >= 2 ? parseInt(margins[1]) : this.marginTop;
		this.marginBottom = margins.length >= 3 ? parseInt(margins[2]) : this.marginTop;
		this.marginLeft = margins.length >= 4 ? parseInt(margins[3]) : this.marginRight;
	}
	
	public enableDrag(): void {
		this.dragEnable = true;
	}
	
	public disableDrag(): void {
		this.dragEnable = false;
	}
	
	public enableResize(): void {
		this.resizeEnable = true;
	}
	
	public disableResize(): void {
		this.resizeEnable = false;
	}
	
	public addItem(ngItem: NgGridItem): void {
		var newPos = this._fixGridPosition(ngItem.getGridPosition(), ngItem.getSize());
		ngItem.setGridPosition(newPos.col, newPos.row);
		this._items.push(ngItem);
		this._addToGrid(ngItem);
		ngItem.recalculateSelf();
	}
	
	public removeItem(ngItem: NgGridItem): void {
		this._removeFromGrid(ngItem);
		
		for (var x in this._items)
			if (this._items[x] == ngItem)
				this._items.splice(x, 1);

		// Update position of all items
		this._cascadeGrid();
		this._updateSize();
		this._items.forEach((item) => item.recalculateSelf());
	}
	
	//	Private methods
	private _onResize(e: any): void {
		if (this._autoResize && this._maxCols > 0) {
			var maxWidth = this._ngEl.nativeElement.getBoundingClientRect().width;
			
			var colWidth = Math.floor(maxWidth / this._maxCols);
			colWidth -= (this.marginLeft + this.marginRight);
			this.colWidth = colWidth;
		} else if (this._autoResize && this._maxRows > 0) {
			var maxHeight = window.innerHeight;
			
			var rowHeight = Math.floor(maxHeight / this._maxRows);
			rowHeight -= (this.marginTop + this.marginBottom);
			this.rowHeight = rowHeight;
		}
		
		for (var x in this._items) {
			this._items[x].recalculateSelf();
		}
		
		this._updateSize();
	}
	
	private _applyChanges(changes: any): void {
		changes.forEachAddedItem((record: any) => { this._config[record.key] = record.currentValue; });
		changes.forEachChangedItem((record: any) => { this._config[record.key] = record.currentValue; });
		changes.forEachRemovedItem((record: any) => { delete this._config[record.key]; });
		
		this.setConfig(this._config);
	}
	
	private _onMouseDown(e: any): boolean {
		var mousePos = this._getMousePosition(e);
		var item = this._getItemFromPosition(mousePos);
		
		if (item != null) {
			if (this.resizeEnable && item.canResize(e) != null) {
				this._resizeStart(e);
				return false;
			} else if (this.dragEnable && item.canDrag(e)) {
				this._dragStart(e);
				return false;
			}
		}
		
		return true;
	}
	
	private _resizeStart(e: any): void {
		if (this.resizeEnable) {
			var mousePos = this._getMousePosition(e);
			var item = this._getItemFromPosition(mousePos);
			
			item.startMoving();
			this._resizingItem = item;
			this._resizeDirection = item.canResize(e);
			this._removeFromGrid(item);
			this._createPlaceholder(item.getGridPosition(), item.getSize());
			this.isResizing = true;
			
			this.resizeStart.next(item);
			item.resizeStart.next(item.getDimensions());
		}
	}
	
	private _dragStart(e: any): void {
		if (this.dragEnable) {
			var mousePos = this._getMousePosition(e);
			var item = this._getItemFromPosition(mousePos);
			var itemPos = item.getPosition();
			var pOffset = { 'left': (mousePos.left - itemPos.left), 'top': (mousePos.top - itemPos.top) }
			
			item.startMoving();
			this._draggingItem = item;
			this._posOffset = pOffset;
			this._removeFromGrid(item);
			this._createPlaceholder(item.getGridPosition(), item.getSize());
			this.isDragging = true;
			
			this.dragStart.next(item);
			item.dragStart.next(item.getPosition());
		}
	}
	
	private _onMouseMove(e: any): void {
		if (e.buttons == 0 && this.isDragging) {
			this._dragStop(e);
		} else if (e.buttons == 0 && this.isResizing) {
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
	}
	
	private _drag(e: any): void {
		if (this.isDragging) {
			var mousePos = this._getMousePosition(e);
			var newL = (mousePos.left - this._posOffset.left);
			var newT = (mousePos.top - this._posOffset.top);
			
			var itemPos = this._draggingItem.getGridPosition();
			var gridPos = this._calculateGridPosition(newL, newT);
			var dims = this._draggingItem.getSize();
			
			if (this._maxCols > 0 && gridPos.col > this._maxCols - (dims.x - 1))
				gridPos.col = this._maxCols - (dims.x - 1);
			
			if (this._maxRows > 0 && gridPos.row > this._maxRows - (dims.y - 1))
				gridPos.row = this._maxRows - (dims.y - 1);
			
			if (gridPos.col != itemPos.col || gridPos.row != itemPos.row) {
				this._draggingItem.setGridPosition(gridPos.col, gridPos.row);
				this._placeholderRef.instance.setGridPosition(gridPos.col, gridPos.row);
				
				if (['up', 'down', 'left', 'right'].indexOf(this.cascade) >= 0) {
					this._fixGridCollisions(gridPos, dims);
					this._cascadeGrid(gridPos, dims);
				}
			}
			if (!this._fixToGrid) {
				this._draggingItem.setPosition(newL, newT);
			}
			
			this.drag.next(this._draggingItem);
			this._draggingItem.drag.next(this._draggingItem.getPosition());
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
			
			var calcSize = this._calculateGridSize(newW, newH);
			var itemSize = this._resizingItem.getSize();
			var iGridPos = this._resizingItem.getGridPosition();
			
			if (this._maxCols > 0 && iGridPos.col + (calcSize.x - 1) > this._maxCols)
				calcSize.x = (this._maxCols - iGridPos.col) + 1;
			
			if (this._maxRows > 0 && iGridPos.row + (calcSize.y - 1) > this._maxRows)
				calcSize.y = (this._maxRows - iGridPos.row) + 1;
			
			if (calcSize.x != itemSize.x || calcSize.y != itemSize.y) {
				this._resizingItem.setSize(calcSize.x, calcSize.y);
				this._placeholderRef.instance.setSize(calcSize.x, calcSize.y);
				
				if (['up', 'down', 'left', 'right'].indexOf(this.cascade) >= 0) {
					this._fixGridCollisions(iGridPos, calcSize);
					this._cascadeGrid(iGridPos, calcSize);
				}
			}
			
			if (!this._fixToGrid)
				this._resizingItem.setDimensions(newW, newH);
			
			var bigGrid = this._maxGridSize(itemPos.left + newW + (2*e.movementX), itemPos.top + newH + (2*e.movementY));
			
			if (this._resizeDirection == 'height') bigGrid.x = iGridPos.col + itemSize.x;
			if (this._resizeDirection == 'width') bigGrid.y = iGridPos.row + itemSize.y;
			
			this.resize.next(this._resizingItem);
			this._resizingItem.resize.next(this._resizingItem.getDimensions());
		}
	}
	
	private _onMouseUp(e: any): boolean {
		if (this.isDragging) {
			this._dragStop(e);
			return false;
		} else if (this.isResizing) {
			this._resizeStop(e);
			return false;
		}
		
		return true;
	}
	
	private _dragStop(e: any): void {
		if (this.isDragging) {
			this.isDragging = false;
			
			var itemPos = this._draggingItem.getGridPosition();
			
			this._draggingItem.setGridPosition(itemPos.col, itemPos.row);
			this._addToGrid(this._draggingItem);
			
			this._cascadeGrid();
			
			this._draggingItem.stopMoving();
			this._draggingItem.dragStop.next(this._draggingItem.getPosition);
			this.dragStop.next(this._draggingItem);
			this._draggingItem = null;
			this._posOffset = null;
            this._placeholderRef.dispose();
		}
	}
	
	private _resizeStop(e: any): void {
		if (this.isResizing) {
			this.isResizing = false;
			
			var itemDims = this._resizingItem.getSize();
			
			this._resizingItem.setSize(itemDims.x, itemDims.y);
			this._addToGrid(this._resizingItem);
            
            this._cascadeGrid();
            
            this._resizingItem.stopMoving();
			this._resizingItem.resizeStop.next(this._resizingItem.getDimensions());
			this.resizeStop.next(this._resizingItem);
            this._resizingItem = null;
            this._resizeDirection = null;
            this._placeholderRef.dispose();
		}
	}
	
	private _maxGridSize(w: number, h: number): {x: number, y: number} {
		var sizex = Math.ceil(w / (this.colWidth + this.marginLeft + this.marginRight));
		var sizey = Math.ceil(h / (this.rowHeight + this.marginTop + this.marginBottom));
		return { 'x': sizex, 'y': sizey };
	}
	
	private _calculateGridSize(width: number, height: number): {x: number, y: number} {
        width += this.marginLeft + this.marginRight;
        height += this.marginTop + this.marginBottom;
        
		var sizex = Math.max(this.minCols, Math.round(width / (this.colWidth + this.marginLeft + this.marginRight)));
		if (this._maxCols > 0 && sizex > this._maxCols) sizex = this._maxCols;
		var sizey = Math.max(this.minRows, Math.round(height / (this.rowHeight + this.marginTop + this.marginBottom)));
		if (this._maxRows > 0 && sizey > this._maxRows) sizey = this._maxRows;
		
		return { 'x': sizex, 'y': sizey };
	}
	
	private _calculateGridPosition(left: number, top: number): {col: number, row: number} {
		var col = Math.max(1, Math.round(left / (this.colWidth + this.marginLeft + this.marginRight)) + 1);
		if (this._maxCols > 0 && col > this._maxCols) col = this._maxCols;
		var row = Math.max(1, Math.round(top / (this.rowHeight + this.marginTop + this.marginBottom)) + 1);
		if (this._maxRows > 0 && row > this._maxRows) row = this._maxRows;
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
			
			switch (this.cascade) {
				case "up":
				case "down":
				default:
					if (this._maxRows > 0 && itemPos.row + (itemDims.y - 1) >= this._maxRows) {
						itemPos.col++;
					} else {
						itemPos.row++;
					}
					
					collisions[0].setGridPosition(itemPos.col, itemPos.row);
					break;
				case "left":
				case "right":
					if (this._maxCols > 0 && itemPos.col + (itemDims.x - 1) >= this._maxCols) {
						itemPos.row++;
					} else {
						itemPos.col++;
					}
					
					collisions[0].setGridPosition(itemPos.col, itemPos.row);
					break;
			}
			
			this._fixGridCollisions(itemPos, itemDims);
			
			this._addToGrid(collisions[0]);
		}
	}
	
	private _cascadeGrid(pos?: {col: number, row: number}, dims?: {x: number, y: number}): void {
		if (pos && !dims) throw new Error("Cannot cascade with only position and not dimensions");
		
		switch (this.cascade) {
			case "up":
			case "down":
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
							if (item.isFixed) continue;
							
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
			case "left":
			case "right":
				var lowCol: Array<number> = [0];
				
				for (var i:number = 1; i <= this._getMaxRow(); i++)
					lowCol[i] = 1;
				
				for (var r:number = 1; r <= this._getMaxRow(); r++) {
					if (this._itemGrid[r] == undefined) continue;
					
					for (var c:number = 1; c <= this._getMaxCol(); c++) {
						if (this._itemGrid[r] == undefined) break;
						if (c < lowCol[r]) continue;
						
						if (this._itemGrid[r][c] != null) {
							var item = this._itemGrid[r][c];
							var itemDims = item.getSize();
							var itemPos = item.getGridPosition();
							
							if (itemPos.col != c || itemPos.row != r) continue;	//	If this is not the element's start
							
							var lowest = lowCol[r];
							
							for (var i: number = 1; i < itemDims.y; i++) {
								lowest = Math.max(lowCol[(r + i)], lowest);
							}
							
							if (pos && (r + itemDims.y) > pos.row && r < (pos.row + dims.y)) {          //	If our element is in one of the item's rows
								if ((c >= pos.col && c < (pos.col + dims.x)) ||                         //	If this col is occupied by our element
										((itemDims.x > (pos.col - lowest)) &&                           //	Or the item can't fit above our element
										(c >= (pos.col + dims.x) && lowest < (pos.col + dims.x)))) {    //		And this col is below our element, but we haven't caught it
									lowest = Math.max(lowest, pos.col + dims.x);                        //	Set the lowest col to be below it
								}
							}
							
							if (lowest != itemPos.col) {	//	If the item is not already on this col move it up
								this._removeFromGrid(item);
								item.setGridPosition(lowest, r);
								this._addToGrid(item);
							}
							
							for (var i: number = 0; i < itemDims.y; i++) {
								lowCol[r+i] = lowest + itemDims.x;	//	Update the lowest col to be below the item
							}
							
						}
					}
				}
				break;
			default:
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
				this._itemGrid[pos.row + j][pos.col + i] = item;
				
				this._updateSize(pos.col + dims.x - 1, pos.row + dims.y - 1);
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
		
		this._renderer.setElementStyle(this._ngEl, 'width', "100%");//(maxCol * (this.colWidth + this.marginLeft + this.marginRight))+"px");
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
		if (((<any>window).TouchEvent && e instanceof TouchEvent) || (e.touches || e.changedTouches)) {
			e = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
		}
		
		var refPos = this._ngEl.nativeElement.getBoundingClientRect();
		
		var left = e.clientX - refPos.left;
		var top = e.clientY - refPos.top;
		
		if (this.cascade == "down") top = refPos.top + refPos.height - e.clientY;
		if (this.cascade == "right") left = refPos.left + refPos.width - e.clientX;
		
		return {
			left: left,
			top: top
		};
	}
	
	private _getAbsoluteMousePosition(e: any): {left: number, top: number} {
		if (((<any>window).TouchEvent && e instanceof TouchEvent) || (e.touches || e.changedTouches)) {
			e = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
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
	
	private _createPlaceholder(pos: {col: number, row:number}, dims: {x: number, y: number}) {
		var me = this;
		
		this._loader.loadNextToLocation((<Type>NgGridPlaceholder), (<any>this._ngEl).parentView._view.elementRefs[(<any>this._ngEl).boundElementIndex + 1]).then(componentRef => {
			me._placeholderRef = componentRef;
			var placeholder = componentRef.instance;
			// me._placeholder.setGrid(me);
			placeholder.setGridPosition(pos.col, pos.row);
			placeholder.setSize(dims.x, dims.y);
		});
	}
}

@Directive({
	selector: '[ngGridItem]',
	inputs: [ 'config: ngGridItem', 'gridPosition: ngGridPosition', 'gridSize: ngGridSize' ],
	outputs: ['itemChange', 'dragStart', 'drag', 'dragStop', 'resizeStart', 'resize', 'resizeStop']
})
export class NgGridItem implements OnInit {
	//	Event Emitters
	public itemChange: EventEmitter<any> = new EventEmitter();
	public dragStart: EventEmitter<any> = new EventEmitter();
	public drag: EventEmitter<any> = new EventEmitter();
	public dragStop: EventEmitter<any> = new EventEmitter();
	public resizeStart: EventEmitter<any> = new EventEmitter();
	public resize: EventEmitter<any> = new EventEmitter();
	public resizeStop: EventEmitter<any> = new EventEmitter();
	
	//	Default config
	private static CONST_DEFAULT_CONFIG: { 'col': number, 'row': number, 'sizex': number, 'sizey': number, 'dragHandle': string, 'resizeHandle': string, 'fixed': boolean, 'draggable': boolean, 'resizable': boolean, 'bordersize': number } = {
		'col': 1,
		'row': 1,
		'sizex': 1,
		'sizey': 1,
		'dragHandle': null,
		'resizeHandle': null,
		'fixed': false,
		'draggable': true,
		'resizable': true,
		'bordersize': 15
	}
	
	public gridPosition = {'col': 1, 'row': 1}
	public gridSize = {'x': 1, 'y': 1}
	public isFixed: boolean = false;
	public isDraggable: boolean = true;
	public isResizable: boolean = true;
	
	//	Private variables
	private _col: number = 1;
	private _row: number = 1;
	private _sizex: number = 1;
	private _sizey: number = 1;
	private _config: any;
	private _dragHandle: string;
	private _resizeHandle: string;
	private _borderSize: number;
	private _elemWidth: number;
	private _elemHeight: number;
	private _elemLeft: number;
	private _elemTop: number;
	private _added: boolean = false;
	
	//	[ng-grid-item] handler
	set config(v: any) {
		var defaults = NgGridItem.CONST_DEFAULT_CONFIG;
		
		for (var x in defaults)
			if (v[x] == null)
				v[x] = defaults[x];
			
		this.setConfig(v);
		
		if (!this._added) {
			this._added = true;
			this._ngGrid.addItem(this);
		}
		
		this._recalculateDimensions();
		this._recalculatePosition();
	}
	
	//	Constructor
	constructor(private _ngEl: ElementRef, private _renderer: Renderer, private _ngGrid:NgGrid) {}
	
	public ngOnInit(): void {
		this._renderer.setElementClass(this._ngEl, 'grid-item', true);
		if (this._ngGrid.autoStyle) this._renderer.setElementStyle(this._ngEl, 'position', 'absolute');
		this._recalculateDimensions();
		this._recalculatePosition();
	}
	
	//	Public methods
	public canDrag(e: any): boolean {
		if (!this.isDraggable) return false;
		
		if (this._dragHandle) {
			var parent = e.target.parentElement;
			
			return parent.querySelector(this._dragHandle) == e.target;
		}
		
		return true;
	}
	
	public canResize(e: any): string {
		if (!this.isResizable) return null;
		
		if (this._resizeHandle) {
			var parent = e.target.parentElement;

			return parent.querySelector(this._resizeHandle) == e.target ? 'both' : null;
		}
		
		var mousePos = this._getMousePosition(e);

		if (mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - this._borderSize
			&& mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - this._borderSize) {
			return 'both';
		} else if (mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - this._borderSize) {
			return 'width';
		} else if (mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - this._borderSize) {
			return 'height';
		}
		
		return null;
	}
	
	public onMouseMove(e: any): void {
		if (this._ngGrid.autoStyle) {
			if (this._ngGrid.dragEnable && this.canDrag(e)) {
				this._renderer.setElementStyle(this._ngEl, 'cursor', 'move');
			} 
			if (this._ngGrid.resizeEnable && !this._resizeHandle && this.isResizable) {
				var mousePos = this._getMousePosition(e);

				if (mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - this._borderSize
					&& mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - this._borderSize) {
					this._renderer.setElementStyle(this._ngEl, 'cursor', 'nwse-resize');
				} else if (mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - this._borderSize) {
					this._renderer.setElementStyle(this._ngEl, 'cursor', 'ew-resize');
				} else if (mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - this._borderSize) {
					this._renderer.setElementStyle(this._ngEl, 'cursor', 'ns-resize');
				} else if (this._ngGrid.dragEnable && this.canDrag(e)) {
					this._renderer.setElementStyle(this._ngEl, 'cursor', 'move');
				} else {
					this._renderer.setElementStyle(this._ngEl, 'cursor', 'default');
				}
			} else if (this._ngGrid.resizeEnable && this.canResize(e)) {
				this._renderer.setElementStyle(this._ngEl, 'cursor', 'nwse-resize');
			} else {
				this._renderer.setElementStyle(this._ngEl, 'cursor', 'default');
			}
		}
	}
	
	public onDestroy(): void {
		if (this._added) this._ngGrid.removeItem(this);
	}
	
	//	Getters
	public getElement(): ElementRef {
		return this._ngEl;
	}
	
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
	public setConfig(config: any): void {
		this._col = config.col;
		this._row = config.row;
		this._sizex = config.sizex;
		this._sizey = config.sizey;
		this._dragHandle = config.dragHandle;
		this._resizeHandle = config.resizeHandle;
		this._borderSize = config.borderSize;
		this.isDraggable = config.draggable ? true : false;
		this.isResizable = config.resizable ? true : false;
		this.isFixed = config.fixed ? true : false;
		
		this._recalculatePosition();
		this._recalculateDimensions();
	}
	
	public setSize(x: number, y: number): void {
		this._sizex = x;
		this._sizey = y;
		this.gridSize = { 'x': this._sizex, 'y': this._sizey };
		this._recalculateDimensions();
		
		this.itemChange.next({'col': this._col, 'row': this._row, 'sizex': this._sizex, 'sizey': this._sizey});
	}
	
	public setGridPosition(col: number, row: number): void {
		this._col = col;
		this._row = row;
		this.gridPosition = {'col': this._col, 'row': this._row};
		
		this._recalculatePosition();
		
		this.itemChange.next({'col': this._col, 'row': this._row, 'sizex': this._sizex, 'sizey': this._sizey});
	}
	
	public setPosition(x: number, y: number): void {
		switch (this._ngGrid.cascade) {
			case 'up':
			case 'left':
			default:
				this._renderer.setElementStyle(this._ngEl, 'left', x+"px");
				this._renderer.setElementStyle(this._ngEl, 'top', y+"px");
				this._renderer.setElementStyle(this._ngEl, 'right', null);
				this._renderer.setElementStyle(this._ngEl, 'bottom', null);
				break;
			case 'right':
				this._renderer.setElementStyle(this._ngEl, 'right', x+"px");
				this._renderer.setElementStyle(this._ngEl, 'top', y+"px");
				this._renderer.setElementStyle(this._ngEl, 'left', null);
				this._renderer.setElementStyle(this._ngEl, 'bottom', null);
				break;
			case 'down':
				this._renderer.setElementStyle(this._ngEl, 'left', x+"px");
				this._renderer.setElementStyle(this._ngEl, 'bottom', y+"px");
				this._renderer.setElementStyle(this._ngEl, 'right', null);
				this._renderer.setElementStyle(this._ngEl, 'top', null);
				break;
		}
		this._elemLeft = x;
		this._elemTop = y;
	}
	
	public setDimensions(w: number, h: number): void {
		this._renderer.setElementStyle(this._ngEl, 'width', w+"px");
		this._renderer.setElementStyle(this._ngEl, 'height', h+"px");
		this._elemWidth = w;
		this._elemHeight = h;
	}
	
	public startMoving(): void {
		this._renderer.setElementClass(this._ngEl, 'moving', true);
		var style = window.getComputedStyle(this._ngEl.nativeElement);
		if (this._ngGrid.autoStyle) this._renderer.setElementStyle(this._ngEl, 'z-index', (parseInt(style.getPropertyValue('z-index')) + 1).toString());
	}
	
	public stopMoving(): void {
		this._renderer.setElementClass(this._ngEl, 'moving', false);
		var style = window.getComputedStyle(this._ngEl.nativeElement);
		if (this._ngGrid.autoStyle) this._renderer.setElementStyle(this._ngEl, 'z-index', (parseInt(style.getPropertyValue('z-index')) - 1).toString());
	}
	
	public recalculateSelf(): void {
		this._recalculatePosition();
		this._recalculateDimensions();
	}
	
	//	Private methods
	private _recalculatePosition(): void {
		var x = (this._ngGrid.colWidth + this._ngGrid.marginLeft + this._ngGrid.marginRight) * (this._col - 1) + this._ngGrid.marginLeft;
		var y = (this._ngGrid.rowHeight + this._ngGrid.marginTop + this._ngGrid.marginBottom) * (this._row - 1) + this._ngGrid.marginTop;
		
		this.setPosition(x, y);
	}
	
	private _recalculateDimensions(): void {
		if (this._sizex < this._ngGrid.minCols) this._sizex = this._ngGrid.minCols;
		if (this._sizey < this._ngGrid.minRows) this._sizey = this._ngGrid.minRows;
		
		var w = (this._ngGrid.colWidth * this._sizex) + ((this._ngGrid.marginLeft + this._ngGrid.marginRight) * (this._sizex - 1));
		var h = (this._ngGrid.rowHeight * this._sizey) + ((this._ngGrid.marginTop + this._ngGrid.marginBottom) * (this._sizey - 1));
		
		this.setDimensions(w, h);
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
		}
	}
}

@Component({
	selector: 'div'
})
@View({
	template: ""
})
export class NgGridPlaceholder implements OnInit {
	private _sizex: number;
	private _sizey: number;
	private _col: number;
	private _row: number;
	
	constructor (private _ngEl: ElementRef, private _renderer: Renderer, private _ngGrid: NgGrid) {}
	
	public ngOnInit(): void {
		this._renderer.setElementClass(this._ngEl, 'grid-placeholder', true);
		if (this._ngGrid.autoStyle) this._renderer.setElementStyle(this._ngEl, 'position', 'absolute');
	}
	
	public setSize(x: number, y: number): void {
		this._sizex = x;
		this._sizey = y;
		this._recalculateDimensions();
	}
	
	public setGridPosition(col: number, row: number): void {
		this._col = col;
		this._row = row;
		this._recalculatePosition();
	}
	
	private _setPosition(x: number, y: number): void {
		switch (this._ngGrid.cascade) {
			case 'up':
			case 'left':
			default:
				this._renderer.setElementStyle(this._ngEl, 'left', x+"px");
				this._renderer.setElementStyle(this._ngEl, 'top', y+"px");
				this._renderer.setElementStyle(this._ngEl, 'right', null);
				this._renderer.setElementStyle(this._ngEl, 'bottom', null);
				break;
			case 'right':
				this._renderer.setElementStyle(this._ngEl, 'right', x+"px");
				this._renderer.setElementStyle(this._ngEl, 'top', y+"px");
				this._renderer.setElementStyle(this._ngEl, 'left', null);
				this._renderer.setElementStyle(this._ngEl, 'bottom', null);
				break;
			case 'down':
				this._renderer.setElementStyle(this._ngEl, 'left', x+"px");
				this._renderer.setElementStyle(this._ngEl, 'bottom', y+"px");
				this._renderer.setElementStyle(this._ngEl, 'right', null);
				this._renderer.setElementStyle(this._ngEl, 'top', null);
				break;
		}
	}
	
	private _setDimensions(w: number, h: number): void {
		this._renderer.setElementStyle(this._ngEl, 'width', w+"px");
		this._renderer.setElementStyle(this._ngEl, 'height', h+"px");
	}
	
	//	Private methods
	private _recalculatePosition(): void {
		var x = (this._ngGrid.colWidth + this._ngGrid.marginLeft + this._ngGrid.marginRight) * (this._col - 1) + this._ngGrid.marginLeft;
		var y = (this._ngGrid.rowHeight + this._ngGrid.marginTop + this._ngGrid.marginBottom) * (this._row - 1) + this._ngGrid.marginTop;
		this._setPosition(x, y);
	}
	
	private _recalculateDimensions(): void {
		var w = (this._ngGrid.colWidth * this._sizex) + ((this._ngGrid.marginLeft + this._ngGrid.marginRight) * (this._sizex - 1));
		var h = (this._ngGrid.rowHeight * this._sizey) + ((this._ngGrid.marginTop + this._ngGrid.marginBottom) * (this._sizey - 1));
		this._setDimensions(w, h);
	}
}
