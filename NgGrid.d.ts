/// <reference path="typings/angular2/angular2.d.ts" />
import { ElementRef, Renderer, EventEmitter } from 'angular2/angular2';
export declare class NgGrid {
    private _ngEl;
    private _renderer;
    onDragStart: EventEmitter;
    onDrag: EventEmitter;
    onDragStop: EventEmitter;
    onResizeStart: EventEmitter;
    onResize: EventEmitter;
    onResizeStop: EventEmitter;
    colWidth: number;
    rowHeight: number;
    marginTop: number;
    marginRight: number;
    marginBottom: number;
    marginLeft: number;
    isDragging: boolean;
    isResizing: boolean;
    private _resizeEnable;
    private _dragEnable;
    private _items;
    private _draggingItem;
    private _resizingItem;
    private _resizeDirection;
    private _itemGrid;
    private _config;
    private _containerWidth;
    private _containerHeight;
    private _maxCols;
    private _maxRows;
    private _minWidth;
    private _minHeight;
    private _posOffset;
    private _adding;
    private _cascade;
    private static CONST_DEFAULT_CONFIG;
    config: any;
    constructor(_ngEl: ElementRef, _renderer: Renderer);
    setConfig(config: any): void;
    setMargins(margins: any): void;
    enableDrag(): void;
    disableDrag(): void;
    enableResize(): void;
    disableResize(): void;
    private _setAttr(name, val);
    addItem(ngItem: NgGridItem): void;
    removeItem(ngItem: NgGridItem): void;
    onMouseDown(e: any): boolean;
    private resizeStart(e);
    private dragStart(e);
    onMouseMove(e: any): void;
    drag(e: any): boolean;
    resize(e: any): boolean;
    onMouseUp(e: any): void;
    dragStop(e: any): boolean;
    resizeStop(e: any): void;
    maxGridSize(w: number, h: number): {
        x: number;
        y: number;
    };
    calculateGridSize(item: NgGridItem): {
        x: number;
        y: number;
    };
    calculateGridPosition(item: NgGridItem): {
        col: number;
        row: number;
    };
    checkGridCollision(pos: {
        col: number;
        row: number;
    }, dims: {
        x: number;
        y: number;
    }): boolean;
    getCollisions(pos: {
        col: number;
        row: number;
    }, dims: {
        x: number;
        y: number;
    }): Array<NgGridItem>;
    fixGridCollisions(pos: {
        col: number;
        row: number;
    }, dims: {
        x: number;
        y: number;
    }): void;
    cascadeGrid(pos?: {
        col: number;
        row: number;
    }, dims?: {
        x: number;
        y: number;
    }): void;
    fixGridPosition(pos: {
        col: number;
        row: number;
    }, dims: {
        x: number;
        y: number;
    }): {
        col: number;
        row: number;
    };
    addToGrid(item: NgGridItem): void;
    removeFromGrid(item: NgGridItem): void;
    private updateSize(col?, row?);
    private filterGrid();
    private getMaxRow();
    private getMaxCol();
    private getMousePosition(e);
    private getAbsoluteMousePosition(e);
    getItemFromPosition(position: {
        left: number;
        top: number;
    }): NgGridItem;
}
export declare class NgGridItem {
    private _ngEl;
    private _renderer;
    private _ngGrid;
    private static CONST_DEFAULT_CONFIG;
    private _col;
    private _row;
    private _sizex;
    private _sizey;
    private _config;
    private _dragHandle;
    private _resizeHandle;
    private _elemWidth;
    private _elemHeight;
    private _elemLeft;
    private _elemTop;
    private _added;
    config: any;
    constructor(_ngEl: ElementRef, _renderer: Renderer, _ngGrid: NgGrid);
    canDrag(e: any): boolean;
    canResize(e: any): string;
    onMouseMove(e: any): void;
    private getMousePosition(e);
    setConfig(config: any): void;
    recalculateDimensions(): void;
    getDragHandle(): any;
    getResizeHandle(): any;
    getDimensions(): {
        width: number;
        height: number;
    };
    getSize(): {
        x: number;
        y: number;
    };
    setSize(x: any, y: any): void;
    recalculatePosition(): void;
    getPosition(): {
        left: number;
        top: number;
    };
    getGridPosition(): {
        col: number;
        row: number;
    };
    setGridPosition(col: any, row: any): void;
    setPosition(x: any, y: any): void;
    setDimensions(w: any, h: any): void;
}
