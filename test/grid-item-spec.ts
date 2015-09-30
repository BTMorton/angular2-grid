import { NgGrid, NgGridItem, NgGridPlaceholder } from 'src/NgGrid';

export function main() {
	describe("NgGridItem Directive", () => {
		it("should generate a ngGrid item", () => {
			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
		});

		it("should set the element class on init", () => {
			var renderSpy = jasmine.createSpyObj('renderSpy', ['setElementClass', 'setElementStyle']);
			var ngEl: any = {};
			var ngGrid: any = {
				autoStyle: false
			};
			var ngGridItem: NgGridItem = new NgGridItem(ngEl, renderSpy, ngGrid);
			spyOn(ngGridItem, '_recalculateDimensions');
			spyOn(ngGridItem, '_recalculatePosition');
			ngGridItem.onInit();
			expect(renderSpy.setElementClass).toHaveBeenCalledWith(ngEl, 'grid-item', true);
			expect(renderSpy.setElementStyle).not.toHaveBeenCalled();
			expect((<any>ngGridItem)._recalculateDimensions).toHaveBeenCalled();
			expect((<any>ngGridItem)._recalculatePosition).toHaveBeenCalled();
		});

		it("should set the element style on init if autoStyle is enabled", () => {
			var renderSpy = jasmine.createSpyObj('renderSpy', ['setElementClass', 'setElementStyle']);
			var ngEl: any = {};
			var ngGrid: any = {
				autoStyle: true
			};
			var ngGridItem: NgGridItem = new NgGridItem(ngEl, renderSpy, ngGrid);
			spyOn(ngGridItem, '_recalculateDimensions');
			spyOn(ngGridItem, '_recalculatePosition');
			ngGridItem.onInit();
			expect(renderSpy.setElementClass).toHaveBeenCalledWith(ngEl, 'grid-item', true);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl,'position', 'absolute');
			expect((<any>ngGridItem)._recalculateDimensions).toHaveBeenCalled();
			expect((<any>ngGridItem)._recalculatePosition).toHaveBeenCalled();
		});

	});
}