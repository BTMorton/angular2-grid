import { Renderer, KeyValueDiffers, DynamicComponentLoader } from 'angular2/angular2';
import { NgGrid, NgGridItem, NgGridPlaceholder } from '../dist/NgGrid';

export function main() {
	describe("NgGrid Directive", () => {
		it("should initialise element styles and config onInit", () => {
			spyOn(NgGrid.prototype, "setConfig");
			var renderSpy = jasmine.createSpyObj('renderSpy', ['setElementStyle', 'setElementClass']);
			
			var ngGrid = new NgGrid(null, null, renderSpy, null);
			
			ngGrid.onInit();
			
			expect(renderSpy.setElementClass).toHaveBeenCalled();
			expect(renderSpy.setElementStyle).toHaveBeenCalled();
			expect(ngGrid.setConfig).toHaveBeenCalled();
			
			(<any>renderSpy.setElementStyle).calls.reset();
			(<any>renderSpy.setElementClass).calls.reset();
			(<any>ngGrid.setConfig).calls.reset();
			
			ngGrid.autoStyle = false;
			ngGrid.onInit();
			
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
		
		
	});
}