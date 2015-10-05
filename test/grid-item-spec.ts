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

		it("should drag", () => {
			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
			expect(ngGridItem.canDrag(null)).toBe(true);

			var target: any = {
				parentElement: jasmine.createSpyObj('parentElement', ['querySelector'])
			};
			target.parentElement.querySelector.and.returnValue(target);

			ngGridItem._dragHandle = "#id";
			expect(ngGridItem.canDrag({target: target})).toBe(true);
			expect(target.parentElement.querySelector).toHaveBeenCalledWith('#id');

			target.parentElement.querySelector.and.returnValue({});
			expect(ngGridItem.canDrag({target: target})).toBe(false);
			expect(target.parentElement.querySelector).toHaveBeenCalledWith('#id');
		});

		it("should resize", () => {
			var target: any = {
				parentElement: jasmine.createSpyObj('parentElement', ['querySelector'])
			};
			target.parentElement.querySelector.and.returnValue(target);
			var e: any = {target: target};

			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
			var getMousePositionSpy = spyOn(ngGridItem, '_getMousePosition');
			getMousePositionSpy.and.returnValue({left: 0, top: 0});

			ngGridItem._elemHeight = -150;
			expect(ngGridItem.canResize(e)).toBe(null);

			ngGridItem._elemHeight = 0;
			expect(ngGridItem.canResize(e)).toBe(null);

			ngGridItem._elemHeight = 1;
			expect(ngGridItem.canResize(e)).toBe('height');

			ngGridItem._elemHeight = 10;
			expect(ngGridItem.canResize(e)).toBe('height');

			ngGridItem._elemHeight = 14;
			expect(ngGridItem.canResize(e)).toBe('height');

			ngGridItem._elemHeight = 15;
			expect(ngGridItem.canResize(e)).toBe(null);

			ngGridItem._elemHeight = 150;
			expect(ngGridItem.canResize(e)).toBe(null);


			ngGridItem._elemWidth = -150;
			expect(ngGridItem.canResize(e)).toBe(null);

			ngGridItem._elemWidth = 0;
			expect(ngGridItem.canResize(e)).toBe(null);

			ngGridItem._elemWidth = 1;
			expect(ngGridItem.canResize(e)).toBe('width');

			ngGridItem._elemWidth = 10;
			expect(ngGridItem.canResize(e)).toBe('width');

			ngGridItem._elemWidth = 14;
			expect(ngGridItem.canResize(e)).toBe('width');

			ngGridItem._elemWidth = 15;
			expect(ngGridItem.canResize(e)).toBe(null);

			ngGridItem._elemWidth = 150;
			expect(ngGridItem.canResize(e)).toBe(null);


			ngGridItem._elemWidth = -150;
			ngGridItem._elemHeight = 150;
			expect(ngGridItem.canResize(e)).toBe(null);

			ngGridItem._elemWidth = 0;
			ngGridItem._elemHeight = 0;
			expect(ngGridItem.canResize(e)).toBe(null);

			ngGridItem._elemWidth = 1;
			ngGridItem._elemHeight = 1;
			expect(ngGridItem.canResize(e)).toBe('both');

			ngGridItem._elemWidth = 10;
			ngGridItem._elemHeight = 10;
			expect(ngGridItem.canResize(e)).toBe('both');

			ngGridItem._elemWidth = 14;
			ngGridItem._elemHeight = 14;
			expect(ngGridItem.canResize(e)).toBe('both');

			ngGridItem._elemWidth = 15;
			ngGridItem._elemHeight = 15;
			expect(ngGridItem.canResize(e)).toBe(null);

			ngGridItem._elemWidth = 150;
			ngGridItem._elemHeight = 150;
			expect(ngGridItem.canResize(e)).toBe(null);


			ngGridItem._resizeHandle = "#id";
			expect(ngGridItem.canResize(e)).toBe('both');

			target.parentElement.querySelector.and.returnValue({});
			expect(ngGridItem.canResize(e)).toBe(null);
		});
	});
}