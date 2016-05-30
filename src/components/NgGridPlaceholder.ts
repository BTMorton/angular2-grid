import { NgGrid } from "../directives/NgGrid"
import { NgGridItem } from "../directives/NgGridItem"
import { Component, Directive, ElementRef, Renderer, EventEmitter, DynamicComponentLoader, Host, ViewEncapsulation, Type, ComponentRef, KeyValueDiffer, KeyValueDiffers, OnInit, OnDestroy, DoCheck, ViewContainerRef, Output } from '@angular/core';

@Component({
	selector: 'div',
	template: ""
})
export class NgGridPlaceholder implements OnInit {
	private _sizex: number;
	private _sizey: number;
	private _col: number;
	private _row: number;
	private _ngGrid: NgGrid;
	private _cascadeMode: string;

	constructor(private _ngEl: ElementRef, private _renderer: Renderer) { }

	public registerGrid(ngGrid: NgGrid) {
		this._ngGrid = ngGrid;
	}

	public ngOnInit(): void {
		this._renderer.setElementClass(this._ngEl.nativeElement, 'grid-placeholder', true);
		if (this._ngGrid.autoStyle) this._renderer.setElementStyle(this._ngEl.nativeElement, 'position', 'absolute');
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

	//	Private methods
	private _setDimensions(w: number, h: number): void {
		this._renderer.setElementStyle(this._ngEl.nativeElement, 'width', w + "px");
		this._renderer.setElementStyle(this._ngEl.nativeElement, 'height', h + "px");
	}

	private _setPosition(x: number, y: number): void {
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
	}

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