import { Component, Directive, ElementRef, Renderer, EventEmitter, ComponentFactoryResolver, Host, ViewEncapsulation, Type, ComponentRef, KeyValueDiffer, KeyValueDiffers, OnInit, OnDestroy, DoCheck, ViewContainerRef, Output } from '@angular/core';
import { NgGridConfig, NgGridItemEvent, NgGridItemPosition, NgGridItemSize, NgGridRawPosition, NgGridItemDimensions } from '../interfaces/INgGrid';
import { NgGridItem } from './NgGridItem';
import { NgGridPlaceholder } from '../components/NgGridPlaceholder';

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
})
export class NgGrid implements OnInit, DoCheck, OnDestroy {
	//	Event Emitters
	@Output() public onDragStart: EventEmitter<NgGridItem> = new EventEmitter<NgGridItem>();
	@Output() public onDrag: EventEmitter<NgGridItem> = new EventEmitter<NgGridItem>();
	@Output() public onDragStop: EventEmitter<NgGridItem> = new EventEmitter<NgGridItem>();
	@Output() public onResizeStart: EventEmitter<NgGridItem> = new EventEmitter<NgGridItem>();
	@Output() public onResize: EventEmitter<NgGridItem> = new EventEmitter<NgGridItem>();
	@Output() public onResizeStop: EventEmitter<NgGridItem> = new EventEmitter<NgGridItem>();
	@Output() public onItemChange: EventEmitter<Array<NgGridItemEvent>> = new EventEmitter<Array<NgGridItemEvent>>();

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
	public minWidth: number = 100;
	public minHeight: number = 100;

	//	Private variables
	private _items: Array<NgGridItem> = [];
	private _draggingItem: NgGridItem = null;
	private _resizingItem: NgGridItem = null;
	private _resizeDirection: string = null;
	private _itemGrid: { [key: number]: { [key: number]: NgGridItem } } = {};//{ 1: { 1: null } };
	private _containerWidth: number;
	private _containerHeight: number;
	private _maxCols: number = 0;
	private _maxRows: number = 0;
	private _visibleCols: number = 0;
	private _visibleRows: number = 0;
	private _setWidth: number = 250;
	private _setHeight: number = 250;
	private _posOffset: NgGridRawPosition = null;
	private _adding: boolean = false;
	private _placeholderRef: ComponentRef<NgGridPlaceholder> = null;
	private _fixToGrid: boolean = false;
	private _autoResize: boolean = false;
	private _differ: KeyValueDiffer;
	private _destroyed: boolean = false;
	private _maintainRatio: boolean = false;
	private _aspectRatio: number;
	private _preferNew: boolean = false;
	private _zoomOnDrag: boolean = false;
	private _limitToScreen: boolean = false;
	private _curMaxRow: number = 0;
	private _curMaxCol: number = 0;
	private _dragReady: boolean = false;
	private _resizeReady: boolean = false;

	//	Default config
	private static CONST_DEFAULT_CONFIG: NgGridConfig = {
		margins: [10],
		draggable: true,
		resizable: true,
		max_cols: 0,
		max_rows: 0,
		visible_cols: 0,
		visible_rows: 0,
		col_width: 250,
		row_height: 250,
		cascade: 'up',
		min_width: 100,
		min_height: 100,
		fix_to_grid: false,
		auto_style: true,
		auto_resize: false,
		maintain_ratio: false,
		prefer_new: false,
		zoom_on_drag: false
	};
	private _config = NgGrid.CONST_DEFAULT_CONFIG;

	//	[ng-grid] attribute handler
	set config(v: NgGridConfig) {
		this.setConfig(v);

		if (this._differ == null && v != null) {
			this._differ = this._differs.find(this._config).create(null);
		}
	}

	//	Constructor
	constructor(private _differs: KeyValueDiffers,
				private _ngEl: ElementRef,
				private _renderer: Renderer,
				private componentFactoryResolver: ComponentFactoryResolver,
				private _containerRef: ViewContainerRef) {}

	//	Public methods
	public ngOnInit(): void {
		this._renderer.setElementClass(this._ngEl.nativeElement, 'grid', true);
		if (this.autoStyle) this._renderer.setElementStyle(this._ngEl.nativeElement, 'position', 'relative');
		this.setConfig(this._config);
	}

	public ngOnDestroy(): void {
		this._destroyed = true;
	}

	public setConfig(config: NgGridConfig): void {
		this._config = config;

		var maxColRowChanged = false;
		for (var x in config) {
			var val = config[x];
			var intVal = !val ? 0 : parseInt(val);

			switch (x) {
				case 'margins':
					this.setMargins(val);
					break;
				case 'col_width':
					this.colWidth = Math.max(intVal, 1);
					break;
				case 'row_height':
					this.rowHeight = Math.max(intVal, 1);
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
					maxColRowChanged = maxColRowChanged || this._maxRows != intVal;
					this._maxRows = intVal < 0 ? 0 : intVal;
					break;
				case 'max_cols':
					maxColRowChanged = maxColRowChanged || this._maxCols != intVal;
					this._maxCols = intVal < 0 ? 0 : intVal;
					break;
				case 'visible_rows':
					this._visibleRows = Math.max(intVal, 0);
					break;
				case 'visible_cols':
					this._visibleCols = Math.max(intVal, 0);
					break;
				case 'min_rows':
					this.minRows = Math.max(intVal, 1);
					break;
				case 'min_cols':
					this.minCols = Math.max(intVal, 1);
					break;
				case 'min_height':
					this.minHeight = Math.max(intVal, 1);
					break;
				case 'min_width':
					this.minWidth = Math.max(intVal, 1);
					break;
				case 'zoom_on_drag':
					this._zoomOnDrag = val ? true : false;
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
				case 'maintain_ratio':
					this._maintainRatio = val ? true : false;
					break;
				case 'prefer_new':
					this._preferNew = val ? true : false;
					break;
				case 'limit_to_screen':
					this._limitToScreen = val ? true : false;
					break;
			}
		}

		if (this._maintainRatio) {
			if (this.colWidth && this.rowHeight) {
				this._aspectRatio = this.colWidth / this.rowHeight;
			} else {
				this._maintainRatio = false;
			}
		}

		if (maxColRowChanged) {
			if (this._maxCols > 0 && this._maxRows > 0) {	//	Can't have both, prioritise on cascade
				switch (this.cascade) {
					case 'left':
					case 'right':
						this._maxCols = 0;
						break;
					case 'up':
					case 'down':
					default:
						this._maxRows = 0;
						break;
				}
			}

			for (let item of this._items) {
				var pos = item.getGridPosition();
				var dims = item.getSize();

				this._removeFromGrid(item);

				if (this._maxCols > 0 && dims.x > this._maxCols) {
					dims.x = this._maxCols;
					item.setSize(dims);
				} else if (this._maxRows > 0 && dims.y > this._maxRows) {
					dims.y = this._maxRows;
					item.setSize(dims);
				}

				if (this._hasGridCollision(pos, dims) || !this._isWithinBounds(pos, dims)) {
					var newPosition = this._fixGridPosition(pos, dims);
					item.setGridPosition(newPosition);
				}

				this._addToGrid(item);
			}

			this._cascadeGrid();
		}

		this._calculateRowHeight();
		this._calculateColWidth();

		var maxWidth = this._maxCols * this.colWidth;
		var maxHeight = this._maxRows * this.rowHeight;

		if (maxWidth > 0 && this.minWidth > maxWidth) this.minWidth = 0.75 * this.colWidth;
		if (maxHeight > 0 && this.minHeight > maxHeight) this.minHeight = 0.75 * this.rowHeight;

		if (this.minWidth > this.colWidth) this.minCols = Math.max(this.minCols, Math.ceil(this.minWidth / this.colWidth));
		if (this.minHeight > this.rowHeight) this.minRows = Math.max(this.minRows, Math.ceil(this.minHeight / this.rowHeight));

		if (this._maxCols > 0 && this.minCols > this._maxCols) this.minCols = 1;
		if (this._maxRows > 0 && this.minRows > this._maxRows) this.minRows = 1;

		this._updateRatio();

		for (let item of this._items) {
			this._removeFromGrid(item);
			item.setCascadeMode(this.cascade);
		}

		this._updateLimit();

		for (let item of this._items) {
			item.recalculateSelf();
			this._addToGrid(item);
		}

		this._cascadeGrid();
		this._updateSize();
	}

	public getItemPosition(index: number): NgGridItemPosition {
		return this._items[index].getGridPosition();
	}

	public getItemSize(index: number): NgGridItemSize {
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
		this.marginTop = Math.max(parseInt(margins[0]), 0);
		this.marginRight = margins.length >= 2 ? Math.max(parseInt(margins[1]), 0) : this.marginTop;
		this.marginBottom = margins.length >= 3 ? Math.max(parseInt(margins[2]), 0) : this.marginTop;
		this.marginBottom = margins.length >= 3 ? Math.max(parseInt(margins[2]), 0) : this.marginTop;
		this.marginLeft = margins.length >= 4 ? Math.max(parseInt(margins[3]), 0) : this.marginRight;
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
		ngItem.setCascadeMode(this.cascade);
		if (!this._preferNew) {
			var newPos = this._fixGridPosition(ngItem.getGridPosition(), ngItem.getSize());
			ngItem.savePosition(newPos);
		}
		this._items.push(ngItem);
		this._addToGrid(ngItem);
		ngItem.recalculateSelf();
		ngItem.onCascadeEvent();
		this._emitOnItemChange();
	}

	public removeItem(ngItem: NgGridItem): void {
		this._removeFromGrid(ngItem);

		for (let x: number = 0; x < this._items.length; x++) {
			if (this._items[x] == ngItem) {
				this._items.splice(x, 1);
			}
		}

		if (this._destroyed) return;

		this._cascadeGrid();
		this._updateSize();
		this._items.forEach((item: NgGridItem) => item.recalculateSelf());
		this._emitOnItemChange();
	}

	public updateItem(ngItem: NgGridItem): void {
		this._removeFromGrid(ngItem);
		this._addToGrid(ngItem);
		this._cascadeGrid();
		this._updateSize();
		ngItem.onCascadeEvent();
	}

	public triggerCascade(): void {
		this._cascadeGrid(null, null, false);
	}

	//	Private methods
	private _calculateColWidth(): void {
		if (this._autoResize) {
			if (this._maxCols > 0 || this._visibleCols > 0) {
				var maxCols = this._maxCols > 0 ? this._maxCols : this._visibleCols;
				var maxWidth: number = this._ngEl.nativeElement.getBoundingClientRect().width;

				var colWidth: number = Math.floor(maxWidth / maxCols);
				colWidth -= (this.marginLeft + this.marginRight);
				if (colWidth > 0) this.colWidth = colWidth;

				if (this.colWidth < this.minWidth || this.minCols > this._config.min_cols) {
					this.minCols = Math.max(this._config.min_cols, Math.ceil(this.minWidth / this.colWidth));
				}
			}
		}
	}

	private _calculateRowHeight(): void {
		if (this._autoResize) {
			if (this._maxRows > 0 || this._visibleRows > 0) {
				var maxRows = this._maxRows > 0 ? this._maxRows : this._visibleRows;
				var maxHeight: number = window.innerHeight;

				var rowHeight: number = Math.max(Math.floor(maxHeight / maxRows), this.minHeight);
				rowHeight -= (this.marginTop + this.marginBottom);
				if (rowHeight > 0) this.rowHeight = rowHeight;

				if (this.rowHeight < this.minHeight || this.minRows > this._config.min_rows) {
					this.minRows = Math.max(this._config.min_rows, Math.ceil(this.minHeight / this.rowHeight));
				}
			}
		}
	}

	private _updateRatio(): void {
		if (this._autoResize && this._maintainRatio) {
			if (this._maxCols > 0 && this._visibleRows <= 0) {
				this.rowHeight = this.colWidth / this._aspectRatio;
			} else if (this._maxRows > 0 && this._visibleCols <= 0) {
				this.colWidth = this._aspectRatio * this.rowHeight;
			} else if (this._maxCols == 0 && this._maxRows == 0) {
				if (this._visibleCols > 0) {
					this.rowHeight = this.colWidth / this._aspectRatio;
				} else if (this._visibleRows > 0) {
					this.colWidth = this._aspectRatio * this.rowHeight;
				}
			}
		}
	}

	private _updateLimit(): void {
		if (!this._autoResize && this._limitToScreen) {
			this._limitGrid(this._getContainerColumns());
		}
	}

	private _onResize(e: any): void {
		this._calculateColWidth();
		this._calculateRowHeight();

		this._updateRatio();

		for (let item of this._items) {
			this._removeFromGrid(item);
		}

		this._updateLimit();

		for (let item of this._items) {
			this._addToGrid(item);
			item.recalculateSelf();
		}

		this._updateSize();
	}

	private _applyChanges(changes: any): void {
		changes.forEachAddedItem((record: any) => { this._config[record.key] = record.currentValue; });
		changes.forEachChangedItem((record: any) => { this._config[record.key] = record.currentValue; });
		changes.forEachRemovedItem((record: any) => { delete this._config[record.key]; });

		this.setConfig(this._config);
	}

	private _onMouseDown(e: MouseEvent): boolean {
		var mousePos = this._getMousePosition(e);
		var item = this._getItemFromPosition(mousePos);

		if (item != null) {
			if (this.resizeEnable && item.canResize(e)) {
				this._resizeReady = true;
			} else if (this.dragEnable && item.canDrag(e)) {
				this._dragReady = true;
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
			this._createPlaceholder(item);
			this.isResizing = true;
			this._resizeReady = false;

			this.onResizeStart.emit(item);
			item.onResizeStartEvent();
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
			this._createPlaceholder(item);
			this.isDragging = true;
			this._dragReady = false;

			this.onDragStart.emit(item);
			item.onDragStartEvent();

			if (this._zoomOnDrag) {
				this._zoomOut();
			}
		}
	}

	private _zoomOut(): void {
		this._renderer.setElementStyle(this._ngEl.nativeElement, 'transform', 'scale(0.5, 0.5)');
	}

	private _resetZoom(): void {
		this._renderer.setElementStyle(this._ngEl.nativeElement, 'transform', '');
	}

	private _onMouseMove(e: any): boolean {
		if (this._resizeReady) {
			this._resizeStart(e);
			return false;
		} else if (this._dragReady) {
			this._dragStart(e);
			return false;
		}

		if (this.isDragging) {
			this._drag(e);
			return false;
		} else if (this.isResizing) {
			this._resize(e);
			return false;
		} else {
			var mousePos = this._getMousePosition(e);
			var item = this._getItemFromPosition(mousePos);

			if (item) {
				item.onMouseMove(e);
			}
		}

		return true;
	}

	private _drag(e: any): void {
		if (this.isDragging) {
			if (window.getSelection) {
				if (window.getSelection().empty) {
					window.getSelection().empty();
				} else if (window.getSelection().removeAllRanges) {
					window.getSelection().removeAllRanges();
				}
			} else if ((<any>document).selection) {
				(<any>document).selection.empty();
			}

			var mousePos = this._getMousePosition(e);
			var newL = (mousePos.left - this._posOffset.left);
			var newT = (mousePos.top - this._posOffset.top);

			var itemPos = this._draggingItem.getGridPosition();
			var gridPos = this._calculateGridPosition(newL, newT);
			var dims = this._draggingItem.getSize();

			if (!this._isWithinBoundsX(gridPos, dims))
				gridPos.col = this._maxCols - (dims.x - 1);

			if (!this._isWithinBoundsY(gridPos, dims))
				gridPos.row = this._maxRows - (dims.y - 1);

			if (!this._autoResize && this._limitToScreen) {
				if ((gridPos.col + dims.x - 1) > this._getContainerColumns()) {
					gridPos.col = this._getContainerColumns() - (dims.x - 1);
				}
			}

			if (gridPos.col != itemPos.col || gridPos.row != itemPos.row) {
				this._draggingItem.setGridPosition(gridPos, this._fixToGrid);
				this._placeholderRef.instance.setGridPosition(gridPos);

				if (['up', 'down', 'left', 'right'].indexOf(this.cascade) >= 0) {
					this._fixGridCollisions(gridPos, dims, true);
					this._cascadeGrid(gridPos, dims);
				}
			}
			if (!this._fixToGrid) {
				this._draggingItem.setPosition(newL, newT);
			}

			this.onDrag.emit(this._draggingItem);
			this._draggingItem.onDragEvent();
		}
	}

	private _resize(e: any): void {
		if (this.isResizing) {
			if (window.getSelection) {
				if (window.getSelection().empty) {
					window.getSelection().empty();
				} else if (window.getSelection().removeAllRanges) {
					window.getSelection().removeAllRanges();
				}
			} else if ((<any>document).selection) {
				(<any>document).selection.empty();
			}

			var mousePos = this._getMousePosition(e);
			var itemPos = this._resizingItem.getPosition();
			var itemDims = this._resizingItem.getDimensions();
			var newW = this._resizeDirection == 'height' ? itemDims.width : (mousePos.left - itemPos.left + 10);
			var newH = this._resizeDirection == 'width' ? itemDims.height : (mousePos.top - itemPos.top + 10);

			if (newW < this.minWidth)
				newW = this.minWidth;
			if (newH < this.minHeight)
				newH = this.minHeight;
			if (newW < this._resizingItem.minWidth)
				newW = this._resizingItem.minWidth;
			if (newH < this._resizingItem.minHeight)
				newH = this._resizingItem.minHeight;

			var calcSize = this._calculateGridSize(newW, newH);
			var itemSize = this._resizingItem.getSize();
			var iGridPos = this._resizingItem.getGridPosition();

			if (!this._isWithinBoundsX(iGridPos, calcSize))
				calcSize.x = (this._maxCols - iGridPos.col) + 1;

			if (!this._isWithinBoundsY(iGridPos, calcSize))
				calcSize.y = (this._maxRows - iGridPos.row) + 1;

			calcSize = this._resizingItem.fixResize(calcSize);

			if (calcSize.x != itemSize.x || calcSize.y != itemSize.y) {
				this._resizingItem.setSize(calcSize, false);
				this._placeholderRef.instance.setSize(calcSize);

				if (['up', 'down', 'left', 'right'].indexOf(this.cascade) >= 0) {
					this._fixGridCollisions(iGridPos, calcSize, true);
					this._cascadeGrid(iGridPos, calcSize);
				}
			}

			if (!this._fixToGrid)
				this._resizingItem.setDimensions(newW, newH);

			var bigGrid = this._maxGridSize(itemPos.left + newW + (2 * e.movementX), itemPos.top + newH + (2 * e.movementY));

			if (this._resizeDirection == 'height') bigGrid.x = iGridPos.col + itemSize.x;
			if (this._resizeDirection == 'width') bigGrid.y = iGridPos.row + itemSize.y;

			this.onResize.emit(this._resizingItem);
			this._resizingItem.onResizeEvent();
		}
	}

	private _onMouseUp(e: any): boolean {
		if (this.isDragging) {
			this._dragStop(e);
			return false;
		} else if (this.isResizing) {
			this._resizeStop(e);
			return false;
		} else if (this._dragReady || this._resizeReady) {
			this._dragReady = false;
			this._resizeReady = false;
		}

		return true;
	}

	private _dragStop(e: any): void {
		if (this.isDragging) {
			this.isDragging = false;

			var itemPos = this._draggingItem.getGridPosition();

			this._draggingItem.savePosition(itemPos);
			this._addToGrid(this._draggingItem);

			this._cascadeGrid();

			this._draggingItem.stopMoving();
			this._draggingItem.onDragStopEvent();
			this.onDragStop.emit(this._draggingItem);
			this._draggingItem = null;
			this._posOffset = null;
			this._placeholderRef.destroy();

			this._emitOnItemChange();

			if (this._zoomOnDrag) {
				this._resetZoom();
			}
		}
	}

	private _resizeStop(e: any): void {
		if (this.isResizing) {
			this.isResizing = false;

			var itemDims = this._resizingItem.getSize();

			this._resizingItem.setSize(itemDims);
			this._addToGrid(this._resizingItem);

			this._cascadeGrid();

			this._resizingItem.stopMoving();
			this._resizingItem.onResizeStopEvent();
			this.onResizeStop.emit(this._resizingItem);
			this._resizingItem = null;
			this._resizeDirection = null;
			this._placeholderRef.destroy();

			this._emitOnItemChange();
		}
	}

	private _maxGridSize(w: number, h: number): NgGridItemSize {
		var sizex = Math.ceil(w / (this.colWidth + this.marginLeft + this.marginRight));
		var sizey = Math.ceil(h / (this.rowHeight + this.marginTop + this.marginBottom));
		return { 'x': sizex, 'y': sizey };
	}

	private _calculateGridSize(width: number, height: number): NgGridItemSize {
		width += this.marginLeft + this.marginRight;
		height += this.marginTop + this.marginBottom;

		var sizex = Math.max(this.minCols, Math.round(width / (this.colWidth + this.marginLeft + this.marginRight)));
		var sizey = Math.max(this.minRows, Math.round(height / (this.rowHeight + this.marginTop + this.marginBottom)));

		if (!this._isWithinBoundsX({ col: 1, row: 1 }, { x: sizex, y: sizey })) sizex = this._maxCols;
		if (!this._isWithinBoundsY({ col: 1, row: 1 }, { x: sizex, y: sizey })) sizey = this._maxRows;

		return { 'x': sizex, 'y': sizey };
	}

	private _calculateGridPosition(left: number, top: number): NgGridItemPosition {
		var col = Math.max(1, Math.round(left / (this.colWidth + this.marginLeft + this.marginRight)) + 1);
		var row = Math.max(1, Math.round(top / (this.rowHeight + this.marginTop + this.marginBottom)) + 1);

		if (!this._isWithinBoundsX({ col: col, row: row }, { x: 1, y: 1 })) col = this._maxCols;
		if (!this._isWithinBoundsY({ col: col, row: row }, { x: 1, y: 1 })) row = this._maxRows;

		return { 'col': col, 'row': row };
	}

	private _hasGridCollision(pos: NgGridItemPosition, dims: NgGridItemSize): boolean {
		var positions = this._getCollisions(pos, dims);

		if (positions == null || positions.length == 0) return false;

		return positions.some((v: NgGridItem) => {
			return !(v === null);
		});
	}

	private _getCollisions(pos: NgGridItemPosition, dims: NgGridItemSize): Array<NgGridItem> {
		const returns: Array<NgGridItem> = [];

		for (let j: number = 0; j < dims.y; j++) {
			if (this._itemGrid[pos.row + j] != null) {
				for (let i: number = 0; i < dims.x; i++) {
					if (this._itemGrid[pos.row + j][pos.col + i] != null) {
						const item: NgGridItem = this._itemGrid[pos.row + j][pos.col + i];

						if (returns.indexOf(item) < 0)
							returns.push(item);

						const itemPos: NgGridItemPosition = item.getGridPosition();
						const itemDims: NgGridItemSize = item.getSize();

						i = itemPos.col + itemDims.x - pos.col;
					}
				}
			}
		}

		return returns;
	}

	private _fixGridCollisions(pos: NgGridItemPosition, dims: NgGridItemSize, shouldSave: boolean = false): void {
		while (this._hasGridCollision(pos, dims)) {
			const collisions: Array<NgGridItem> = this._getCollisions(pos, dims);

			this._removeFromGrid(collisions[0]);

			const itemPos: NgGridItemPosition = collisions[0].getGridPosition();
			const itemDims: NgGridItemSize = collisions[0].getSize();

			switch (this.cascade) {
				case 'up':
				case 'down':
				default:
					const oldRow: number = itemPos.row;
					itemPos.row = pos.row + dims.y;

					if (!this._isWithinBoundsY(itemPos, itemDims)) {
						itemPos.col = pos.col + dims.x;
						itemPos.row = oldRow;
					}
					break;
				case 'left':
				case 'right':
					const oldCol: number = itemPos.col;
					itemPos.col = pos.col + dims.x;

					if (!this._isWithinBoundsX(itemPos, itemDims)) {
						itemPos.col = oldCol;
						itemPos.row = pos.row + dims.y;
					}
					break;
			}

			if (shouldSave) {
				collisions[0].savePosition(itemPos);
			} else {
				collisions[0].setGridPosition(itemPos);
			}

			this._fixGridCollisions(itemPos, itemDims, shouldSave);
			this._addToGrid(collisions[0]);
			collisions[0].onCascadeEvent();
		}
	}

	private _limitGrid(maxCols: number): void {
		const items: Array<NgGridItem> = this._items.slice();

		items.sort((a: NgGridItem, b: NgGridItem) => {
			let aPos: NgGridItemPosition = a.getSavedPosition();
			let bPos: NgGridItemPosition = b.getSavedPosition();

			if (aPos.row == bPos.row) {
				return aPos.col == bPos.col ? 0 : (aPos.col < bPos.col ? -1 : 1);
			} else {
				return aPos.row < bPos.row ? -1 : 1;
			}
		});

		const columnMax: { [col: number]: number } = {};
		const largestGap: { [col: number]: number } = {};

		for (let i: number = 1; i <= maxCols; i++) {
			columnMax[i] = 1;
			largestGap[i] = 1;
		}

		const curPos: NgGridItemPosition = { col: 1, row: 1 };
		let currentRow: number = 1;

		const willCascade: (item: NgGridItem, col: number) => boolean = (item: NgGridItem, col: number) => {
			for (let i: number = col; i < col + item.sizex; i++) {
				if (columnMax[i] == currentRow) return true;
			}

			return false;
		};

		interface GridBlock {
			start: number;
			end: number;
			length: number;
		}

		while (items.length > 0) {
			const columns: Array<GridBlock> = [];
			let newBlock: GridBlock = {
				start: 1,
				end: 1,
				length: 0,
			};

			for (let col: number = 1; col <= maxCols; col++) {
				if (columnMax[col] <= currentRow) {
					if (newBlock.length == 0) {
						newBlock.start = col;
					}

					newBlock.length++;
					newBlock.end = col + 1;
				} else if (newBlock.length > 0) {
					columns.push(newBlock);

					newBlock = {
						start: col,
						end: col,
						length: 0,
					};
				}
			}

			if (newBlock.length > 0) {
				columns.push(newBlock);
			}

			let tempColumns: Array<number> = columns.map((block: GridBlock) => block.length);
			const currentItems: Array<NgGridItem> = [];

			while (items.length > 0) {
				const item = items[0];

				if (item.row > currentRow) break;

				let fits: boolean = false;
				for (let x in tempColumns) {
					if (item.sizex <= tempColumns[x]) {
						tempColumns[x] -= item.sizex;
						fits = true;
						break;
					} else if (item.sizex > tempColumns[x]) {
						tempColumns[x] = 0;
					}
				}

				if (fits) {
					currentItems.push(items.shift());
				} else {
					break;
				}
			}

			if (currentItems.length > 0) {
				const itemPositions: Array<number> = [];
				let lastPosition: number = maxCols;

				for (let i = currentItems.length - 1; i >= 0; i--) {
					let maxPosition = 1;

					for (let j = columns.length - 1; j >= 0; j--) {
						if (columns[j].start > lastPosition) continue;
						if (columns[j].start > (maxCols - currentItems[i].sizex)) continue;
						if (columns[j].length < currentItems[i].sizex) continue;
						if (lastPosition < columns[j].end && (lastPosition - columns[j].start) < currentItems[i].sizex) continue;

						maxPosition = (lastPosition < columns[j].end ? lastPosition : columns[j].end) - currentItems[i].sizex
						break;
					}

					itemPositions[i] = Math.min(maxPosition, currentItems[i].row == currentRow ? currentItems[i].col : 1);
					lastPosition = itemPositions[i];
				}

				let minPosition: number = 1;
				let currentItem: number = 0;

				while (currentItems.length > 0) {
					const item: NgGridItem = currentItems.shift();

					for (let j = 0; j < columns.length; j++) {
						if (columns[j].length < item.sizex) continue;
						if (minPosition > columns[j].end) continue;
						if (minPosition > columns[j].start && (columns[j].end - minPosition) < item.sizex) continue;
						if (minPosition <  columns[j].start) minPosition = columns[j].start;
						break;
					}

					item.setGridPosition({ col: Math.max(minPosition, itemPositions[currentItem]), row: currentRow });

					minPosition = item.currentCol + item.sizex;
					currentItem++;

					for (let i: number = item.currentCol; i < item.currentCol + item.sizex; i++) {
						columnMax[i] = item.currentRow + item.sizey;
					}
				}
			} else if (currentItems.length === 0 && columns.length === 1 && columns[0].length >= maxCols) {	//	Only one block, but no items fit. Means the next item is too large
				const item: NgGridItem = items.shift();

				item.setGridPosition({ col: 1, row: currentRow });

				for (let i: number = item.currentCol; i < item.currentCol + item.sizex; i++) {
					columnMax[i] = item.currentRow + item.sizey;
				}
			}

			let newRow: number = 0;

			for (let x in columnMax) {
				if (columnMax[x] > currentRow && (newRow == 0 || columnMax[x] < newRow)) {
					newRow = columnMax[x];
				}
			}

			currentRow = newRow <= currentRow ? currentRow + 1 : newRow;
		}
	}

	private _cascadeGrid(pos?: NgGridItemPosition, dims?: NgGridItemSize, shouldSave: boolean = true): void {
		if (this._destroyed) return;
		if (pos && !dims) throw new Error('Cannot cascade with only position and not dimensions');

		if (this.isDragging && this._draggingItem && !pos && !dims) {
			pos = this._draggingItem.getGridPosition();
			dims = this._draggingItem.getSize();
		} else if (this.isResizing && this._resizingItem && !pos && !dims) {
			pos = this._resizingItem.getGridPosition();
			dims = this._resizingItem.getSize();
		}

		switch (this.cascade) {
			case 'up':
			case 'down':
				const lowRow: Array<number> = [0];

				for (let i: number = 1; i <= this._curMaxCol; i++)
					lowRow[i] = 1;

				for (let r: number = 1; r <= this._curMaxRow; r++) {
					if (this._itemGrid[r] == undefined) continue;

					for (let c: number = 1; c <= this._curMaxCol; c++) {
						if (this._itemGrid[r] == undefined) break;
						if (r < lowRow[c]) continue;

						if (this._itemGrid[r][c] != null) {
							const item: NgGridItem = this._itemGrid[r][c];
							if (item.isFixed) continue;

							const itemDims: NgGridItemSize = item.getSize();
							const itemPos: NgGridItemPosition = item.getGridPosition();

							if (itemPos.col != c || itemPos.row != r) continue;	//	If this is not the element's start

							let lowest: number = lowRow[c];

							for (let i: number = 1; i < itemDims.x; i++) {
								lowest = Math.max(lowRow[(c + i)], lowest);
							}

							if (pos && (c + itemDims.x) > pos.col && c < (pos.col + dims.x)) {          //	If our element is in one of the item's columns
								if ((r >= pos.row && r < (pos.row + dims.y)) ||                         //	If this row is occupied by our element
									((itemDims.y > (pos.row - lowest)) &&                               //	Or the item can't fit above our element
										(r >= (pos.row + dims.y) && lowest < (pos.row + dims.y)))) {    //		And this row is below our element, but we haven't caught it
									lowest = Math.max(lowest, pos.row + dims.y);                        //	Set the lowest row to be below it
								}
							}

							const newPos: NgGridItemPosition = { col: c, row: lowest };

							if (lowest != itemPos.row && this._isWithinBoundsY(newPos, itemDims)) {	//	If the item is not already on this row move it up
								this._removeFromGrid(item);

								if (shouldSave) {
									item.savePosition(newPos);
								} else {
									item.setGridPosition(newPos);
								}

								item.onCascadeEvent();
								this._addToGrid(item);
							}

							for (let i: number = 0; i < itemDims.x; i++) {
								lowRow[c + i] = lowest + itemDims.y;	//	Update the lowest row to be below the item
							}
						}
					}
				}
				break;
			case 'left':
			case 'right':
				const lowCol: Array<number> = [0];

				for (let i: number = 1; i <= this._curMaxRow; i++)
					lowCol[i] = 1;

				for (let r: number = 1; r <= this._curMaxRow; r++) {
					if (this._itemGrid[r] == undefined) continue;

					for (let c: number = 1; c <= this._curMaxCol; c++) {
						if (this._itemGrid[r] == undefined) break;
						if (c < lowCol[r]) continue;

						if (this._itemGrid[r][c] != null) {
							const item: NgGridItem = this._itemGrid[r][c];
							const itemDims: NgGridItemSize = item.getSize();
							const itemPos: NgGridItemPosition = item.getGridPosition();

							if (itemPos.col != c || itemPos.row != r) continue;	//	If this is not the element's start

							let lowest: number = lowCol[r];

							for (let i: number = 1; i < itemDims.y; i++) {
								lowest = Math.max(lowCol[(r + i)], lowest);
							}

							if (pos && (r + itemDims.y) > pos.row && r < (pos.row + dims.y)) {          //	If our element is in one of the item's rows
								if ((c >= pos.col && c < (pos.col + dims.x)) ||                         //	If this col is occupied by our element
									((itemDims.x > (pos.col - lowest)) &&                               //	Or the item can't fit above our element
										(c >= (pos.col + dims.x) && lowest < (pos.col + dims.x)))) {    //		And this col is below our element, but we haven't caught it
									lowest = Math.max(lowest, pos.col + dims.x);                        //	Set the lowest col to be below it
								}
							}

							const newPos: NgGridItemPosition = { col: lowest, row: r };

							if (lowest != itemPos.col && this._isWithinBoundsX(newPos, itemDims)) {	//	If the item is not already on this col move it up
								this._removeFromGrid(item);

								if (shouldSave) {
									item.savePosition(newPos);
								} else {
									item.setGridPosition(newPos);
								}

								item.onCascadeEvent();
								this._addToGrid(item);
							}

							for (let i: number = 0; i < itemDims.y; i++) {
								lowCol[r + i] = lowest + itemDims.x;	//	Update the lowest col to be below the item
							}
						}
					}
				}
				break;
			default:
				break;
		}
	}

	private _fixGridPosition(pos: NgGridItemPosition, dims: NgGridItemSize): NgGridItemPosition {
		while (this._hasGridCollision(pos, dims) || !this._isWithinBounds(pos, dims)) {
			if (this._hasGridCollision(pos, dims)) {
				switch (this.cascade) {
					case 'up':
					case 'down':
					default:
						pos.row++;
						break;
					case 'left':
					case 'right':
						pos.col++;
						break;
				}
			}


			if (!this._isWithinBoundsY(pos, dims)) {
				pos.col++;
				pos.row = 1;
			}
			if (!this._isWithinBoundsX(pos, dims)) {
				pos.row++;
				pos.col = 1;
			}
		}
		return pos;
	}

	private _isWithinBoundsX(pos: NgGridItemPosition, dims: NgGridItemSize) {
		return (this._maxCols == 0 || (pos.col + dims.x - 1) <= this._maxCols);
	}
	private _isWithinBoundsY(pos: NgGridItemPosition, dims: NgGridItemSize) {
		return (this._maxRows == 0 || (pos.row + dims.y - 1) <= this._maxRows);
	}
	private _isWithinBounds(pos: NgGridItemPosition, dims: NgGridItemSize) {
		return this._isWithinBoundsX(pos, dims) && this._isWithinBoundsY(pos, dims);
	}

	private _addToGrid(item: NgGridItem): void {
		let pos: NgGridItemPosition = item.getGridPosition();
		const dims: NgGridItemSize = item.getSize();

		if (this._hasGridCollision(pos, dims)) {
			this._fixGridCollisions(pos, dims);
			pos = item.getGridPosition();
		}

		for (let j: number = 0; j < dims.y; j++) {
			if (this._itemGrid[pos.row + j] == null) this._itemGrid[pos.row + j] = {};

			for (let i: number = 0; i < dims.x; i++) {
				this._itemGrid[pos.row + j][pos.col + i] = item;

				this._updateSize(pos.col + dims.x - 1, pos.row + dims.y - 1);
			}
		}
	}

	private _removeFromGrid(item: NgGridItem): void {
		for (let y in this._itemGrid)
			for (let x in this._itemGrid[y])
				if (this._itemGrid[y][x] == item)
					delete this._itemGrid[y][x];
	}

	private _updateSize(col?: number, row?: number): void {
		if (this._destroyed) return;
		col = (col == undefined) ? this._getMaxCol() : col;
		row = (row == undefined) ? this._getMaxRow() : row;

		let maxCol: number = Math.max(this._curMaxCol, col);
		let maxRow: number = Math.max(this._curMaxRow, row);

		if (maxCol != this._curMaxCol || maxRow != this._curMaxRow) {
			this._curMaxCol = maxCol;
			this._curMaxRow = maxRow;
		}

		this._renderer.setElementStyle(this._ngEl.nativeElement, 'width', '100%');//(maxCol * (this.colWidth + this.marginLeft + this.marginRight))+'px');
		this._renderer.setElementStyle(this._ngEl.nativeElement, 'height', (this._getMaxRow() * (this.rowHeight + this.marginTop + this.marginBottom)) + 'px');
	}

	private _getMaxRow(): number {
		return Math.max.apply(null, this._items.map((item: NgGridItem) => item.getGridPosition().row + item.getSize().y - 1));
	}

	private _getMaxCol(): number {
		return Math.max.apply(null, this._items.map((item: NgGridItem) => item.getGridPosition().col + item.getSize().x - 1));
	}

	private _getMousePosition(e: any): NgGridRawPosition {
		if (((<any>window).TouchEvent && e instanceof TouchEvent) || (e.touches || e.changedTouches)) {
			e = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
		}

		const refPos: any = this._ngEl.nativeElement.getBoundingClientRect();

		let left: number = e.clientX - refPos.left;
		let top: number = e.clientY - refPos.top;

		if (this.cascade == 'down') top = refPos.top + refPos.height - e.clientY;
		if (this.cascade == 'right') left = refPos.left + refPos.width - e.clientX;

		if (this.isDragging && this._zoomOnDrag) {
			left *= 2;
			top *= 2;
		}

		return {
			left: left,
			top: top
		};
	}

	private _getAbsoluteMousePosition(e: any): NgGridRawPosition {
		if (((<any>window).TouchEvent && e instanceof TouchEvent) || (e.touches || e.changedTouches)) {
			e = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
		}

		return {
			left: e.clientX,
			top: e.clientY
		};
	}

	private _getContainerColumns(): number {
		const maxWidth: number = this._ngEl.nativeElement.getBoundingClientRect().width;
		return Math.floor(maxWidth / (this.colWidth + this.marginLeft + this.marginRight));
	}

	private _getItemFromPosition(position: NgGridRawPosition): NgGridItem {
		for (let item of this._items) {
			const size: NgGridItemDimensions = item.getDimensions();
			const pos: NgGridRawPosition = item.getPosition();

			if (position.left > (pos.left + this.marginLeft) && position.left < (pos.left + this.marginLeft + size.width) &&
				position.top > (pos.top + this.marginTop) && position.top < (pos.top + this.marginTop + size.height)) {
				return item;
			}
		}

		return null;
	}

	private _createPlaceholder(item: NgGridItem): void {
		const pos: NgGridItemPosition = item.getGridPosition();
		const dims: NgGridItemSize = item.getSize();

        const factory = this.componentFactoryResolver.resolveComponentFactory(NgGridPlaceholder);
        var componentRef: ComponentRef<NgGridPlaceholder> = item.containerRef.createComponent(factory);
        this._placeholderRef = componentRef;
        const placeholder: NgGridPlaceholder = componentRef.instance;
        placeholder.registerGrid(this);
        placeholder.setCascadeMode(this.cascade);
        placeholder.setGridPosition({ col: pos.col, row: pos.row });
        placeholder.setSize({ x: dims.x, y: dims.y });
	}

	private _emitOnItemChange() {
		this.onItemChange.emit(this._items.map((item: NgGridItem) => item.getEventOutput()));
	}
}