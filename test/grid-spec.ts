import { Renderer, KeyValueDiffers, DynamicComponentLoader } from 'angular2/angular2';
import { NgGrid, NgGridItem, NgGridPlaceholder } from 'src/NgGrid';

export function main() {
	describe("NgGrid Directive", () => {
		it("should initialise element styles and config onInit", () => {
			spyOn(Renderer.prototype, "setElementClass");
			spyOn(Renderer.prototype, "setElementStyle");
			spyOn(NgGrid.prototype, "setConfig");
			
			var renderer = new Renderer();
			var ngGrid = new NgGrid(null, null, renderer, null);
			
			ngGrid.onInit();
			
			expect(renderer.setElementClass).toHaveBeenCalled();
			expect(renderer.setElementStyle).toHaveBeenCalled();
			expect(ngGrid.setConfig).toHaveBeenCalled();
			
			(<any>renderer.setElementStyle).calls.reset();
			(<any>renderer.setElementClass).calls.reset();
			(<any>ngGrid.setConfig).calls.reset();
			
			ngGrid.autoStyle = false;
			ngGrid.onInit();
			
			expect(renderer.setElementClass).toHaveBeenCalled();
			expect(renderer.setElementStyle).not.toHaveBeenCalled();
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
			
			ngGrid.setMargins([5]);
			
			expect(ngGrid.marginTop).toBe(5);
			expect(ngGrid.marginRight).toBe(5);
			expect(ngGrid.marginBottom).toBe(5);
			expect(ngGrid.marginLeft).toBe(5);
			
			ngGrid.setMargins([5, 10]);
			
			expect(ngGrid.marginTop).toBe(5);
			expect(ngGrid.marginRight).toBe(10);
			expect(ngGrid.marginBottom).toBe(5);
			expect(ngGrid.marginLeft).toBe(10);
			
			ngGrid.setMargins([5, 10, 7]);
			
			expect(ngGrid.marginTop).toBe(5);
			expect(ngGrid.marginRight).toBe(10);
			expect(ngGrid.marginBottom).toBe(7);
			expect(ngGrid.marginLeft).toBe(10);
			
			ngGrid.setMargins([5, 10, 7, 12]);
			
			expect(ngGrid.marginTop).toBe(5);
			expect(ngGrid.marginRight).toBe(10);
			expect(ngGrid.marginBottom).toBe(7);
			expect(ngGrid.marginLeft).toBe(12);
		});
		
		
	});
}