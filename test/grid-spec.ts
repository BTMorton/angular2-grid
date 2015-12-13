import { Renderer, KeyValueDiffers, DynamicComponentLoader } from 'angular2/core';
import { NgGrid, NgGridItem, NgGridPlaceholder } from '../dist/NgGrid';

export function main() {
	describe("NgGrid Directive", () => {
		it("should initialise element styles and config ngOnInit", () => {
			spyOn(NgGrid.prototype, "setConfig");
			var renderSpy = jasmine.createSpyObj('renderSpy', ['setElementStyle', 'setElementClass']);
			
			var ngGrid = new NgGrid(null, null, renderSpy, null);
			
			ngGrid.ngOnInit();
			
			expect(renderSpy.setElementClass).toHaveBeenCalled();
			expect(renderSpy.setElementStyle).toHaveBeenCalled();
			expect(ngGrid.setConfig).toHaveBeenCalled();
			
			(<any>renderSpy.setElementStyle).calls.reset();
			(<any>renderSpy.setElementClass).calls.reset();
			(<any>ngGrid.setConfig).calls.reset();
			
			ngGrid.autoStyle = false;
			ngGrid.ngOnInit();
			
			expect(renderSpy.setElementClass).toHaveBeenCalled();
			expect(renderSpy.setElementStyle).not.toHaveBeenCalled();
			expect(ngGrid.setConfig).toHaveBeenCalled();
		});
		
		it("should set dragEnable to the relevant value on enable/disable drag", () => {
			var ngGrid = new NgGrid(null, null, null, null);
			
			ngGrid.dragEnable = false;
			ngGrid.enableDrag();
			
			expect(ngGrid.dragEnable).toBe(true);
			
			ngGrid.disableDrag();
			
			expect(ngGrid.dragEnable).toBe(false);
		});
		
		it("should set resizeEnable to the relevant value on enable/disable resize", () => {
			var ngGrid = new NgGrid(null, null, null, null);
			
			ngGrid.resizeEnable = false;
			ngGrid.enableResize();
			
			expect(ngGrid.resizeEnable).toBe(true);
			
			ngGrid.disableResize();
			
			expect(ngGrid.resizeEnable).toBe(false);
		});
		
		it("should set the margins when calling setMargins", () => {
			var ngGrid = new NgGrid(null, null, null, null);
			
			ngGrid.setMargins(['5']);
			
			expect(ngGrid.marginTop).toBe(5);
			expect(ngGrid.marginRight).toBe(5);
			expect(ngGrid.marginBottom).toBe(5);
			expect(ngGrid.marginLeft).toBe(5);
			
			ngGrid.setMargins(['5', '10']);
			
			expect(ngGrid.marginTop).toBe(5);
			expect(ngGrid.marginRight).toBe(10);
			expect(ngGrid.marginBottom).toBe(5);
			expect(ngGrid.marginLeft).toBe(10);
			
			ngGrid.setMargins(['5', '10', '7']);
			
			expect(ngGrid.marginTop).toBe(5);
			expect(ngGrid.marginRight).toBe(10);
			expect(ngGrid.marginBottom).toBe(7);
			expect(ngGrid.marginLeft).toBe(10);
			
			ngGrid.setMargins(['5', '10', '7', '12']);
			
			expect(ngGrid.marginTop).toBe(5);
			expect(ngGrid.marginRight).toBe(10);
			expect(ngGrid.marginBottom).toBe(7);
			expect(ngGrid.marginLeft).toBe(12);
		});
		
		it("should fix collisions with other items", ()=> {
			var renderSpy = jasmine.createSpyObj("Renderer", ["setElementStyle", "setElementClass"]);
			var ngGrid = new NgGrid(null, null, renderSpy, null);
			var item1 = new NgGridItem(null, renderSpy, ngGrid);
			var item2 = new NgGridItem(null, renderSpy, ngGrid);
			var item3 = new NgGridItem(null, renderSpy, ngGrid);
			var item4 = new NgGridItem(null, renderSpy, ngGrid);
			
			item1.config = {col: 1, row: 1, sizex: 1, sizey: 1};
			item2.config = {col: 2, row: 1, sizex: 1, sizey: 3};
			item3.config = {col: 2, row: 2, sizex: 1, sizey: 1};
			item4.config = {col: 1, row: 3, sizex: 1, sizey: 1};
			
			expect((<any>item1)._col).toBe(1);
			expect((<any>item1)._row).toBe(1);
			expect((<any>item2)._col).toBe(2);
			expect((<any>item2)._row).toBe(1);
			expect((<any>item3)._col).toBe(3);
			expect((<any>item3)._row).toBe(2);
			expect((<any>item4)._col).toBe(1);
			expect((<any>item4)._row).toBe(3);
		});
		
		it("should fix cascade items up", ()=> {
			var renderSpy = jasmine.createSpyObj("Renderer", ["setElementStyle", "setElementClass"]);
			var ngGrid = new NgGrid(null, null, renderSpy, null);
			var item1 = new NgGridItem(null, renderSpy, ngGrid);
			var item2 = new NgGridItem(null, renderSpy, ngGrid);
			var item3 = new NgGridItem(null, renderSpy, ngGrid);
			var item4 = new NgGridItem(null, renderSpy, ngGrid);
			
			item1.config = {col: 1, row: 1, sizex: 4, sizey: 1};
			item2.config = {col: 2, row: 3, sizex: 1, sizey: 3};
			item3.config = {col: 2, row: 7, sizex: 2, sizey: 1};
			item4.config = {col: 1, row: 3, sizex: 1, sizey: 1};
			
			(<any>ngGrid)._cascadeGrid();
			
			expect((<any>item1)._col).toBe(1);
			expect((<any>item1)._row).toBe(1);
			expect((<any>item2)._col).toBe(2);
			expect((<any>item2)._row).toBe(2);
			expect((<any>item3)._col).toBe(2);
			expect((<any>item3)._row).toBe(5);
			expect((<any>item4)._col).toBe(1);
			expect((<any>item4)._row).toBe(2);
			
			try {
				(<any>ngGrid)._cascadeGrid({});
				expect(false).toBe(true);
			} catch(err) {
				
			}
			
			(<any>ngGrid)._cascadeGrid({col: 4, row: 1}, {x: 1, y: 1});
			
			expect((<any>item1)._col).toBe(1);
			expect((<any>item1)._row).toBe(2);
			expect((<any>item2)._col).toBe(2);
			expect((<any>item2)._row).toBe(3);
			expect((<any>item3)._col).toBe(2);
			expect((<any>item3)._row).toBe(6);
			expect((<any>item4)._col).toBe(1);
			expect((<any>item4)._row).toBe(3);
		});
	});
}