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
		
		it("should update the cursor", () => {
			var e: any = {};
			var ngEl: any = {};
			var renderSpy = jasmine.createSpyObj('renderSpy', ['setElementStyle']);
			var ngGrid: any = {
				autoStyle: false,
				dragEnable: false,
				resizeEnable: false,
			};
			var ngGridItem: NgGridItem = new NgGridItem(ngEl, renderSpy, ngGrid);
			spyOn(ngGridItem, 'canDrag');
			spyOn(ngGridItem, 'canResize');
			spyOn(ngGridItem, '_getMousePosition');

			ngGridItem.onMouseMove(e);
			expect(ngGridItem.canDrag).not.toHaveBeenCalled();
			expect(ngGridItem.canResize).not.toHaveBeenCalled();
			expect(ngGridItem._getMousePosition).not.toHaveBeenCalled();
			expect(renderSpy.setElementStyle).not.toHaveBeenCalled();
			ngGridItem.canDrag.calls.reset();
			ngGridItem.canResize.calls.reset();
			ngGridItem._getMousePosition.calls.reset();
			renderSpy.setElementStyle.calls.reset();

			ngGrid.autoStyle = true;
			ngGridItem.onMouseMove(e);
			expect(ngGridItem.canDrag).not.toHaveBeenCalled();
			expect(ngGridItem.canResize).not.toHaveBeenCalled();
			expect(ngGridItem._getMousePosition).not.toHaveBeenCalled();
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'cursor', 'default');
			ngGridItem.canDrag.calls.reset();
			ngGridItem.canResize.calls.reset();
			ngGridItem._getMousePosition.calls.reset();
			renderSpy.setElementStyle.calls.reset();

			ngGridItem._resizeHandle = true;
			ngGrid.resizeEnable = true;
			ngGridItem.canResize.and.returnValue(true);
			ngGridItem.onMouseMove(e);
			expect(ngGridItem.canDrag).not.toHaveBeenCalled();
			expect(ngGridItem.canResize).toHaveBeenCalled();
			expect(ngGridItem._getMousePosition).not.toHaveBeenCalled();
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'cursor', 'nwse-resize');
			ngGridItem.canDrag.calls.reset();
			ngGridItem.canResize.calls.reset();
			ngGridItem._getMousePosition.calls.reset();
			renderSpy.setElementStyle.calls.reset();

			ngGridItem._resizeHandle = false;
			ngGridItem._elemWidth = 0;
			ngGridItem._elemHeight = 0;
			ngGrid.resizeEnable = true;
			ngGridItem._getMousePosition.and.returnValue({});
			ngGridItem.onMouseMove(e);
			expect(ngGridItem.canDrag).not.toHaveBeenCalled();
			expect(ngGridItem.canResize).not.toHaveBeenCalled();
			expect(ngGridItem._getMousePosition).toHaveBeenCalled();
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'cursor', 'default');
			ngGridItem.canDrag.calls.reset();
			ngGridItem.canResize.calls.reset();
			ngGridItem._getMousePosition.calls.reset();
			renderSpy.setElementStyle.calls.reset();

			ngGridItem._resizeHandle = false;
			ngGridItem._elemWidth = 0;
			ngGridItem._elemHeight = 10;
			ngGrid.resizeEnable = true;
			ngGridItem._getMousePosition.and.returnValue({left: 0, top: 0});
			ngGridItem.onMouseMove(e);
			expect(ngGridItem.canDrag).not.toHaveBeenCalled();
			expect(ngGridItem.canResize).not.toHaveBeenCalled();
			expect(ngGridItem._getMousePosition).toHaveBeenCalled();
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'cursor', 'ns-resize');
			ngGridItem.canDrag.calls.reset();
			ngGridItem.canResize.calls.reset();
			ngGridItem._getMousePosition.calls.reset();
			renderSpy.setElementStyle.calls.reset();

			ngGridItem._resizeHandle = false;
			ngGridItem._elemWidth = 10;
			ngGridItem._elemHeight = 0;
			ngGrid.resizeEnable = true;
			ngGridItem._getMousePosition.and.returnValue({left: 0, top: 0});
			ngGridItem.onMouseMove(e);
			expect(ngGridItem.canDrag).not.toHaveBeenCalled();
			expect(ngGridItem.canResize).not.toHaveBeenCalled();
			expect(ngGridItem._getMousePosition).toHaveBeenCalled();
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'cursor', 'ew-resize');
			ngGridItem.canDrag.calls.reset();
			ngGridItem.canResize.calls.reset();
			ngGridItem._getMousePosition.calls.reset();
			renderSpy.setElementStyle.calls.reset();

			ngGridItem._resizeHandle = false;
			ngGridItem._elemWidth = 10;
			ngGridItem._elemHeight = 10;
			ngGrid.resizeEnable = true;
			ngGridItem._getMousePosition.and.returnValue({left: 0, top: 0});
			ngGridItem.onMouseMove(e);
			expect(ngGridItem.canDrag).not.toHaveBeenCalled();
			expect(ngGridItem.canResize).not.toHaveBeenCalled();
			expect(ngGridItem._getMousePosition).toHaveBeenCalled();
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'cursor', 'nwse-resize');
			ngGridItem.canDrag.calls.reset();
			ngGridItem.canResize.calls.reset();
			ngGridItem._getMousePosition.calls.reset();
			renderSpy.setElementStyle.calls.reset();


			ngGridItem._resizeHandle = false;
			ngGrid.dragEnable = true;
			ngGridItem.canDrag.and.returnValue(true);
			ngGridItem.onMouseMove(e);
			expect(ngGridItem.canDrag).toHaveBeenCalled();
			expect(ngGridItem.canResize).not.toHaveBeenCalled();
			expect(ngGridItem._getMousePosition).not.toHaveBeenCalled();
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'cursor', 'move');
			ngGridItem.canDrag.calls.reset();
			ngGridItem.canResize.calls.reset();
			ngGridItem._getMousePosition.calls.reset();
			renderSpy.setElementStyle.calls.reset();
		});

		it("should remove the item", () => {
			var ngGridSpy: any = jasmine.createSpyObj('ngGridSpy', ['removeItem'])
			var ngGridItem: NgGridItem = new NgGridItem(null, null, ngGridSpy);
			(<any>ngGridItem)._added = false;
			ngGridItem.onDestroy();
			expect(ngGridSpy.removeItem).not.toHaveBeenCalled();

			(<any>ngGridItem)._added = true;
			ngGridItem.onDestroy();
			expect(ngGridSpy.removeItem).toHaveBeenCalledWith(ngGridItem);
		});

		it("should get element", () => {
			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
			var ngEl: any = {};
			ngGridItem._ngEl = ngEl;
			expect(ngGridItem.getElement()).toBe(ngEl);
			ngGridItem._ngEl = null;
			expect(ngGridItem.getElement()).toBe(null);
		});

		it("should get the drag handle", () => {
			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
			var dragHandle: string = "dragHandle";
			ngGridItem._dragHandle = dragHandle;
			expect(ngGridItem.getDragHandle()).toBe(dragHandle);
			ngGridItem._dragHandle = null;
			expect(ngGridItem.getDragHandle()).toBe(null);
		});

		it("should get the resize handle", () => {
			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
			var resizeHandle: string = "resizeHandle";
			ngGridItem._resizeHandle = resizeHandle;
			expect(ngGridItem.getResizeHandle()).toBe(resizeHandle);
			ngGridItem._resizeHandle = null;
			expect(ngGridItem.getResizeHandle()).toBe(null);
		});

		it("should get the dimensions", () => {
			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
			ngGridItem._elemWidth = 100;
			ngGridItem._elemHeight = 200;
			expect(ngGridItem.getDimensions().width).toBe(100);
			expect(ngGridItem.getDimensions().height).toBe(200);
			ngGridItem._elemWidth = null;
			ngGridItem._elemHeight = null;
			expect(ngGridItem.getDimensions().width).toBe(null);
			expect(ngGridItem.getDimensions().height).toBe(null);
		});

		it("should get the size", () => {
			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
			ngGridItem._sizex = 100;
			ngGridItem._sizey = 200;
			expect(ngGridItem.getSize().x).toBe(100);
			expect(ngGridItem.getSize().y).toBe(200);
			ngGridItem._sizex = null;
			ngGridItem._sizey = null;
			expect(ngGridItem.getSize().x).toBe(null);
			expect(ngGridItem.getSize().y).toBe(null);
		});

		it("should get the position", () => {
			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
			ngGridItem._elemLeft = 100;
			ngGridItem._elemTop = 200;
			expect(ngGridItem.getPosition().left).toBe(100);
			expect(ngGridItem.getPosition().top).toBe(200);
			ngGridItem._elemLeft = null;
			ngGridItem._elemTop = null;
			expect(ngGridItem.getPosition().left).toBe(null);
			expect(ngGridItem.getPosition().top).toBe(null);
		});

		it("should get the grid position", () => {
			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
			ngGridItem._col = 100;
			ngGridItem._row = 200;
			expect(ngGridItem.getGridPosition().col).toBe(100);
			expect(ngGridItem.getGridPosition().row).toBe(200);
			ngGridItem._col = null;
			ngGridItem._row = null;
			expect(ngGridItem.getGridPosition().col).toBe(null);
			expect(ngGridItem.getGridPosition().row).toBe(null);
		});

		it("should set the config", () => {
			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
			spyOn(ngGridItem, '_recalculatePosition');
			spyOn(ngGridItem, '_recalculateDimensions');
			var config: any = {
				col: 1,
				row: 2,
				sizex: 3,
				sizey: 4,
				dragHandle: '5',
				resizeHandle: '6'
			};
			ngGridItem.setConfig(config);
			expect((<any>ngGridItem)._col).toBe(1);
			expect((<any>ngGridItem)._row).toBe(2);
			expect((<any>ngGridItem)._sizex).toBe(3);
			expect((<any>ngGridItem)._sizey).toBe(4);
			expect((<any>ngGridItem)._dragHandle).toBe('5');
			expect((<any>ngGridItem)._resizeHandle).toBe('6');
			expect((<any>ngGridItem)._recalculatePosition).toHaveBeenCalled();
			expect((<any>ngGridItem)._recalculateDimensions).toHaveBeenCalled();
		});


	});
}