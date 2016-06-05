import { NgGrid } from "./NgGrid"
import { NgGridItemConfig, NgGridItemEvent, NgGridItemPosition, NgGridItemSize } from "../interfaces/INgGrid"
import { Component, Directive, ElementRef, Renderer, EventEmitter, DynamicComponentLoader, Host, ViewEncapsulation, Type, ComponentRef, KeyValueDiffer, KeyValueDiffers, OnInit, OnDestroy, DoCheck, ViewContainerRef, Output } from '@angular/core';

@Directive({
	selector: '[ngGridItem]',
	inputs: ['config: ngGridItem']
})
export class NgGridItem implements OnInit, OnDestroy {
	//	Event Emitters
	@Output() public onItemChange: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>(false);
	@Output() public onDragStart: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
	@Output() public onDrag: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
	@Output() public onDragStop: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
	@Output() public onDragAny: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
	@Output() public onResizeStart: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
	@Output() public onResize: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
	@Output() public onResizeStop: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
	@Output() public onResizeAny: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
	@Output() public onChangeStart: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
	@Output() public onChange: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
	@Output() public onChangeStop: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
	@Output() public onChangeAny: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
	@Output() public ngGridItemChange: EventEmitter<NgGridItemConfig> = new EventEmitter<NgGridItemConfig>();

	//	Default config
	private static CONST_DEFAULT_CONFIG: NgGridItemConfig = {
		col: 1,
		row: 1,
		sizex: 1,
		sizey: 1,
		dragHandle: null,
		resizeHandle: null,
		fixed: false,
		draggable: true,
		resizable: true,
		borderSize: 15
	}

	public isFixed: boolean = false;
	public isDraggable: boolean = true;
	public isResizable: boolean = true;

	//	Private variables
	private _payload: any;
	private _position: NgGridItemPosition = { col: 1, row: 1 };
	private _currentPosition: NgGridItemPosition = { col: 1, row: 1 };
	private _size: NgGridItemSize = { x: 1, y: 1 };
	private _config = NgGridItem.CONST_DEFAULT_CONFIG;
	private _dragHandle: string;
	private _resizeHandle: string;
	private _borderSize: number;
	private _elemWidth: number;
	private _elemHeight: number;
	private _elemLeft: number;
	private _elemTop: number;
	private _added: boolean = false;
	private _differ: KeyValueDiffer;
	private _cascadeMode: string;
	private _maxCols: number = 0;
	private _minCols: number = 0;
	private _maxRows: number = 0;
	private _minRows: number = 0;

	//	[ng-grid-item] handler
	set config(v: NgGridItemConfig) {
		var defaults = NgGridItem.CONST_DEFAULT_CONFIG;

		for (var x in defaults)
			if (v[x] == null)
				v[x] = defaults[x];

		this.setConfig(v);

		if (this._differ == null && v != null) {
			this._differ = this._differs.find(this._config).create(null);
		}

		if (!this._added) {
			this._added = true;
			this._ngGrid.addItem(this);
		}

		this._recalculateDimensions();
		this._recalculatePosition();
	}

	//	Constructor
	constructor(private _differs: KeyValueDiffers, private _ngEl: ElementRef, private _renderer: Renderer, private _ngGrid: NgGrid, public containerRef: ViewContainerRef) { }

	public onResizeStartEvent(): void {
		var event = this.getEventOutput();
		this.onResizeStart.emit(event);
		this.onResizeAny.emit(event);
		this.onChangeStart.emit(event);
		this.onChangeAny.emit(event);
	}
	public onResizeEvent(): void {
		var event = this.getEventOutput();
		this.onResize.emit(event);
		this.onResizeAny.emit(event);
		this.onChange.emit(event);
		this.onChangeAny.emit(event);
	}
	public onResizeStopEvent(): void {
		var event = this.getEventOutput();
		this.onResizeStop.emit(event);
		this.onResizeAny.emit(event);
		this.onChangeStop.emit(event);
		this.onChangeAny.emit(event);

		this._config.sizex = this._size.x;
		this._config.sizey = this._size.y;
		this.ngGridItemChange.emit(this._config);
	}
	public onDragStartEvent(): void {
		var event = this.getEventOutput();
		this.onDragStart.emit(event);
		this.onDragAny.emit(event);
		this.onChangeStart.emit(event);
		this.onChangeAny.emit(event);
	}
	public onDragEvent(): void {
		var event = this.getEventOutput();
		this.onDrag.emit(event);
		this.onDragAny.emit(event);
		this.onChange.emit(event);
		this.onChangeAny.emit(event);
	}
	public onDragStopEvent(): void {
		var event = this.getEventOutput();
		this.onDragStop.emit(event);
		this.onDragAny.emit(event);
		this.onChangeStop.emit(event);
		this.onChangeAny.emit(event);

		this._config.col = this._position.col;
		this._config.row = this._position.row;
		this.ngGridItemChange.emit(this._config);
	}
	public onCascadeEvent(): void {
		this._config.sizex = this._size.x;
		this._config.sizey = this._size.y;
		this._config.col = this._position.col;
		this._config.row = this._position.row;
		this.ngGridItemChange.emit(this._config);
	}

	public ngOnInit(): void {
		this._renderer.setElementClass(this._ngEl.nativeElement, 'grid-item', true);
		if (this._ngGrid.autoStyle) this._renderer.setElementStyle(this._ngEl.nativeElement, 'position', 'absolute');
		this._recalculateDimensions();
		this._recalculatePosition();

		if (!this._added) {
			this._added = true;
			this._ngGrid.addItem(this);
		}
	}

	//	Public methods
	public canDrag(e: any): boolean {
		if (!this.isDraggable) return false;

		if (this._dragHandle) {
			return this.findHandle(this._dragHandle, e.target);
		}

		return true;
	}
	
	public findHandle(handleSelector: string, startElement: HTMLElement): boolean {
		let targetElem = startElement;
		
		while (targetElem && targetElem != this._ngEl.nativeElement) {
			if (targetElem.matches(handleSelector)) return true;
			
			targetElem = targetElem.parentElement;
		}
		
		return false;
	}

	public canResize(e: any): string {
		if (!this.isResizable) return null;

		if (this._resizeHandle) {
			return this.findHandle(this._resizeHandle, e.target) ? 'both' : null;
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
			if (this._ngGrid.resizeEnable && !this._resizeHandle && this.isResizable) {
				var mousePos = this._getMousePosition(e);

				if (mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - this._borderSize
					&& mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - this._borderSize) {
					this._renderer.setElementStyle(this._ngEl.nativeElement, 'cursor', 'nwse-resize');
				} else if (mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - this._borderSize) {
					this._renderer.setElementStyle(this._ngEl.nativeElement, 'cursor', 'ew-resize');
				} else if (mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - this._borderSize) {
					this._renderer.setElementStyle(this._ngEl.nativeElement, 'cursor', 'ns-resize');
				} else if (this._ngGrid.dragEnable && this.canDrag(e)) {
					this._renderer.setElementStyle(this._ngEl.nativeElement, 'cursor', 'move');
				} else {
					this._renderer.setElementStyle(this._ngEl.nativeElement, 'cursor', 'default');
				}
			} else if (this._ngGrid.resizeEnable && this.canResize(e)) {
				this._renderer.setElementStyle(this._ngEl.nativeElement, 'cursor', 'nwse-resize');
			} else if (this._ngGrid.dragEnable && this.canDrag(e)) {
				this._renderer.setElementStyle(this._ngEl.nativeElement, 'cursor', 'move');
			} else {
				this._renderer.setElementStyle(this._ngEl.nativeElement, 'cursor', 'default');
			}
		}
	}

	public ngOnDestroy(): void {
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

	public getDimensions(): { width: number, height: number } {
		return { 'width': this._elemWidth, 'height': this._elemHeight }
	}

	public getSize(): NgGridItemSize {
		return this._size;
	}

	public getPosition(): { left: number, top: number } {
		return { 'left': this._elemLeft, 'top': this._elemTop }
	}

	public getGridPosition(): NgGridItemPosition {
		return this._currentPosition;
	}

	public getSavedPosition(): NgGridItemPosition {
		return this._position;
	}

	//	Setters
	public setConfig(config: NgGridItemConfig): void {
		this._config = config;

		this._payload = config.payload;
		this._position.col = this._currentPosition.col = config.col ? config.col : NgGridItem.CONST_DEFAULT_CONFIG.col;
		this._position.row = this._currentPosition.row = config.row ? config.row : NgGridItem.CONST_DEFAULT_CONFIG.row;
		this._size.x = config.sizex ? config.sizex : NgGridItem.CONST_DEFAULT_CONFIG.sizex;
		this._size.y = config.sizey ? config.sizey : NgGridItem.CONST_DEFAULT_CONFIG.sizey;
		this._dragHandle = config.dragHandle;
		this._resizeHandle = config.resizeHandle;
		this._borderSize = config.borderSize;
		this.isDraggable = config.draggable ? true : false;
		this.isResizable = config.resizable ? true : false;
		this.isFixed = config.fixed ? true : false;
		
		this._maxCols = !isNaN(config.maxCols) && isFinite(config.maxCols) ? config.maxCols : 0;
		this._minCols = !isNaN(config.minCols) && isFinite(config.minCols) ? config.minCols : 0;
		this._maxRows = !isNaN(config.maxRows) && isFinite(config.maxRows) ? config.maxRows : 0;
		this._minRows = !isNaN(config.minRows) && isFinite(config.minRows) ? config.minRows : 0;
		
		if (this._minCols > 0 && this._maxCols > 0 && this._minCols > this._maxCols) this._minCols = 0;
		if (this._minRows > 0 && this._maxRows > 0 && this._minRows > this._maxRows) this._minRows = 0;
		
		if (this._added) {
			this._ngGrid.updateItem(this);
		}
		
		this._size = this.fixResize(this._size);

		this._recalculatePosition();
		this._recalculateDimensions();
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

	public setSize(newSize: NgGridItemSize, update: boolean = true): void {
		newSize = this.fixResize(newSize);
		this._size = newSize;
		if (update) this._recalculateDimensions();

		this.onItemChange.emit(this.getEventOutput());
	}

	public setGridPosition(gridPosition: NgGridItemPosition, update: boolean = true): void {
		this._currentPosition = gridPosition;
		if (update) this._recalculatePosition();

		this.onItemChange.emit(this.getEventOutput());
	}

	public savePosition(newPosition: NgGridItemPosition): void {
		this._position = newPosition;
		this._currentPosition = newPosition;
		
		this._recalculatePosition();
		
		this.onItemChange.emit(this.getEventOutput());
	}

	public getEventOutput(): NgGridItemEvent {
		return <NgGridItemEvent>{
			payload: this._payload,
			col: this._currentPosition.col,
			row: this._currentPosition.row,
			sizex: this._size.x,
			sizey: this._size.y,
			width: this._elemWidth,
			height: this._elemHeight,
			left: this._elemLeft,
			top: this._elemTop
		};
	}

	public setPosition(x: number, y: number): void {
		switch (this._cascadeMode) {
			case 'up':
			case 'left':
			default:
				this._renderer.setElementStyle(this._ngEl.nativeElement, 'transform', 'translate(' + x + 'px, ' + y + 'px)');
				break;
			case 'right':
				this._renderer.setElementStyle(this._ngEl.nativeElement, 'transform', 'translate(' + -x + 'px, ' + y + 'px)');
				break;
			case 'down':
				this._renderer.setElementStyle(this._ngEl.nativeElement, 'transform', 'translate(' + x + 'px, ' + -y + 'px)');
				break;
		}
		this._elemLeft = x;
		this._elemTop = y;
	}

	public setCascadeMode(cascade: string): void {
		this._cascadeMode = cascade;
		switch (cascade) {
			case 'up':
			case 'left':
			default:
				this._renderer.setElementStyle(this._ngEl.nativeElement, 'left', "0px");
				this._renderer.setElementStyle(this._ngEl.nativeElement, 'top', "0px");
				this._renderer.setElementStyle(this._ngEl.nativeElement, 'right', null);
				this._renderer.setElementStyle(this._ngEl.nativeElement, 'bottom', null);
				break;
			case 'right':
				this._renderer.setElementStyle(this._ngEl.nativeElement, 'right', "0px");
				this._renderer.setElementStyle(this._ngEl.nativeElement, 'top', "0px");
				this._renderer.setElementStyle(this._ngEl.nativeElement, 'left', null);
				this._renderer.setElementStyle(this._ngEl.nativeElement, 'bottom', null);
				break;
			case 'down':
				this._renderer.setElementStyle(this._ngEl.nativeElement, 'left', "0px");
				this._renderer.setElementStyle(this._ngEl.nativeElement, 'bottom', "0px");
				this._renderer.setElementStyle(this._ngEl.nativeElement, 'right', null);
				this._renderer.setElementStyle(this._ngEl.nativeElement, 'top', null);
				break;
		}
	}

	public setDimensions(w: number, h: number): void {
		this._renderer.setElementStyle(this._ngEl.nativeElement, 'width', w + "px");
		this._renderer.setElementStyle(this._ngEl.nativeElement, 'height', h + "px");
		this._elemWidth = w;
		this._elemHeight = h;
	}

	public startMoving(): void {
		this._renderer.setElementClass(this._ngEl.nativeElement, 'moving', true);
		var style = window.getComputedStyle(this._ngEl.nativeElement);
		if (this._ngGrid.autoStyle) this._renderer.setElementStyle(this._ngEl.nativeElement, 'z-index', (parseInt(style.getPropertyValue('z-index')) + 1).toString());
	}

	public stopMoving(): void {
		this._renderer.setElementClass(this._ngEl.nativeElement, 'moving', false);
		var style = window.getComputedStyle(this._ngEl.nativeElement);
		if (this._ngGrid.autoStyle) this._renderer.setElementStyle(this._ngEl.nativeElement, 'z-index', (parseInt(style.getPropertyValue('z-index')) - 1).toString());
	}

	public recalculateSelf(): void {
		this._recalculatePosition();
		this._recalculateDimensions();
	}
	
	public fixResize(newSize: NgGridItemSize) {
		if (this._maxCols > 0 && newSize.x > this._maxCols) newSize.x = this._maxCols;
		if (this._maxRows > 0 && newSize.y > this._maxRows) newSize.y = this._maxRows;
		
		if (this._minCols > 0 && newSize.x < this._minCols) newSize.x = this._minCols;
		if (this._minRows > 0 && newSize.y < this._minRows) newSize.y = this._minRows;
		
		return newSize;
	}

	//	Private methods
	private _recalculatePosition(): void {
		var x = (this._ngGrid.colWidth + this._ngGrid.marginLeft + this._ngGrid.marginRight) * (this._currentPosition.col - 1) + this._ngGrid.marginLeft;
		var y = (this._ngGrid.rowHeight + this._ngGrid.marginTop + this._ngGrid.marginBottom) * (this._currentPosition.row - 1) + this._ngGrid.marginTop;

		this.setPosition(x, y);
	}

	private _recalculateDimensions(): void {
		if (this._size.x < this._ngGrid.minCols) this._size.x = this._ngGrid.minCols;
		if (this._size.y < this._ngGrid.minRows) this._size.y = this._ngGrid.minRows;

		var newWidth = Math.max(this._ngGrid.minWidth, this._ngGrid.colWidth * this._size.x);
		var newHeight = Math.max(this._ngGrid.minHeight, this._ngGrid.rowHeight * this._size.y);

		var w = newWidth + ((this._ngGrid.marginLeft + this._ngGrid.marginRight) * (this._size.x - 1));
		var h = newHeight + ((this._ngGrid.marginTop + this._ngGrid.marginBottom) * (this._size.y - 1));

		this.setDimensions(w, h);
	}

	private _getMousePosition(e: any): { left: number, top: number } {
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

	private _applyChanges(changes: any): void {
		changes.forEachAddedItem((record: any) => { this._config[record.key] = record.currentValue; });
		changes.forEachChangedItem((record: any) => { this._config[record.key] = record.currentValue; });
		changes.forEachRemovedItem((record: any) => { delete this._config[record.key]; });

		this.setConfig(this._config);
	}
}