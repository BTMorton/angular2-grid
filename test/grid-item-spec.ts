import { NgGrid, NgGridItem } from '../dist/NgGrid';

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
			ngGridItem.ngOnInit();
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
			ngGridItem.ngOnInit();
			expect(renderSpy.setElementClass).toHaveBeenCalledWith(ngEl, 'grid-item', true);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'position', 'absolute');
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

			(<any>ngGridItem)._dragHandle = "#id";
			expect(ngGridItem.canDrag({ target: target })).toBe(true);
			expect(target.parentElement.querySelector).toHaveBeenCalledWith('#id');

			target.parentElement.querySelector.and.returnValue({});
			expect(ngGridItem.canDrag({ target: target })).toBe(false);
			expect(target.parentElement.querySelector).toHaveBeenCalledWith('#id');
		});

		it("should resize", () => {
			var target: any = {
				parentElement: jasmine.createSpyObj('parentElement', ['querySelector'])
			};
			target.parentElement.querySelector.and.returnValue(target);
			var e: any = { target: target };

			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
			var getMousePositionSpy = spyOn(ngGridItem, '_getMousePosition');
			getMousePositionSpy.and.returnValue({ left: 0, top: 0 });

			for (let size of [5, 10, 15]) {

				(<any>ngGridItem)._borderSize = size;
				(<any>ngGridItem)._elemHeight = -150;
				expect(ngGridItem.canResize(e)).toBe(null);

				(<any>ngGridItem)._elemHeight = 0;
				expect(ngGridItem.canResize(e)).toBe(null);

				(<any>ngGridItem)._elemHeight = 1;
				expect(ngGridItem.canResize(e)).toBe('height');

				(<any>ngGridItem)._elemHeight = size - 1;
				expect(ngGridItem.canResize(e)).toBe('height');

				(<any>ngGridItem)._elemHeight = size;
				expect(ngGridItem.canResize(e)).toBe(null);

				(<any>ngGridItem)._elemHeight = 150;
				expect(ngGridItem.canResize(e)).toBe(null);


				(<any>ngGridItem)._elemWidth = -150;
				expect(ngGridItem.canResize(e)).toBe(null);

				(<any>ngGridItem)._elemWidth = 0;
				expect(ngGridItem.canResize(e)).toBe(null);

				(<any>ngGridItem)._elemWidth = 1;
				expect(ngGridItem.canResize(e)).toBe('width');

				(<any>ngGridItem)._elemWidth = size - 1;
				expect(ngGridItem.canResize(e)).toBe('width');

				(<any>ngGridItem)._elemWidth = size;
				expect(ngGridItem.canResize(e)).toBe(null);

				(<any>ngGridItem)._elemWidth = 150;
				expect(ngGridItem.canResize(e)).toBe(null);


				(<any>ngGridItem)._elemWidth = -150;
				(<any>ngGridItem)._elemHeight = 150;
				expect(ngGridItem.canResize(e)).toBe(null);

				(<any>ngGridItem)._elemWidth = 0;
				(<any>ngGridItem)._elemHeight = 0;
				expect(ngGridItem.canResize(e)).toBe(null);

				(<any>ngGridItem)._elemWidth = 1;
				(<any>ngGridItem)._elemHeight = 1;
				expect(ngGridItem.canResize(e)).toBe('both');

				(<any>ngGridItem)._elemWidth = size - 1;
				(<any>ngGridItem)._elemHeight = size - 1;
				expect(ngGridItem.canResize(e)).toBe('both');

				(<any>ngGridItem)._elemWidth = size;
				(<any>ngGridItem)._elemHeight = size;
				expect(ngGridItem.canResize(e)).toBe(null);

				(<any>ngGridItem)._elemWidth = 150;
				(<any>ngGridItem)._elemHeight = 150;
				expect(ngGridItem.canResize(e)).toBe(null);
			}

			(<any>ngGridItem)._resizeHandle = "#id";
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
			expect((<any>ngGridItem)._getMousePosition).not.toHaveBeenCalled();
			expect(renderSpy.setElementStyle).not.toHaveBeenCalled();
			(<any>ngGridItem.canDrag).calls.reset();
			(<any>ngGridItem.canResize).calls.reset();
			(<any>ngGridItem)._getMousePosition.calls.reset();
			renderSpy.setElementStyle.calls.reset();

			ngGrid.autoStyle = true;
			ngGridItem.onMouseMove(e);
			expect(ngGridItem.canDrag).not.toHaveBeenCalled();
			expect(ngGridItem.canResize).not.toHaveBeenCalled();
			expect((<any>ngGridItem)._getMousePosition).not.toHaveBeenCalled();
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'cursor', 'default');
			(<any>ngGridItem.canDrag).calls.reset();
			(<any>ngGridItem.canResize).calls.reset();
			(<any>ngGridItem)._getMousePosition.calls.reset();
			renderSpy.setElementStyle.calls.reset();

			(<any>ngGridItem)._resizeHandle = true;
			ngGrid.resizeEnable = true;
			(<any>ngGridItem.canResize).and.returnValue(true);
			ngGridItem.onMouseMove(e);
			expect(ngGridItem.canDrag).not.toHaveBeenCalled();
			expect(ngGridItem.canResize).toHaveBeenCalled();
			expect((<any>ngGridItem)._getMousePosition).not.toHaveBeenCalled();
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'cursor', 'nwse-resize');
			(<any>ngGridItem.canDrag).calls.reset();
			(<any>ngGridItem.canResize).calls.reset();
			(<any>ngGridItem)._getMousePosition.calls.reset();
			renderSpy.setElementStyle.calls.reset();

			(<any>ngGridItem)._resizeHandle = false;
			(<any>ngGridItem)._elemWidth = 0;
			(<any>ngGridItem)._elemHeight = 0;
			(<any>ngGridItem)._borderSize = 15;
			ngGrid.resizeEnable = true;
			(<any>ngGridItem)._getMousePosition.and.returnValue({});
			ngGridItem.onMouseMove(e);
			expect(ngGridItem.canDrag).not.toHaveBeenCalled();
			expect(ngGridItem.canResize).not.toHaveBeenCalled();
			expect((<any>ngGridItem)._getMousePosition).toHaveBeenCalled();
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'cursor', 'default');
			(<any>ngGridItem.canDrag).calls.reset();
			(<any>ngGridItem.canResize).calls.reset();
			(<any>ngGridItem)._getMousePosition.calls.reset();
			renderSpy.setElementStyle.calls.reset();

			(<any>ngGridItem)._resizeHandle = false;
			(<any>ngGridItem)._elemWidth = 0;
			(<any>ngGridItem)._elemHeight = 10;
			(<any>ngGridItem)._borderSize = 15;
			ngGrid.resizeEnable = true;
			(<any>ngGridItem)._getMousePosition.and.returnValue({ left: 0, top: 0 });
			ngGridItem.onMouseMove(e);
			expect(ngGridItem.canDrag).not.toHaveBeenCalled();
			expect(ngGridItem.canResize).not.toHaveBeenCalled();
			expect((<any>ngGridItem)._getMousePosition).toHaveBeenCalled();
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'cursor', 'ns-resize');
			(<any>ngGridItem.canDrag).calls.reset();
			(<any>ngGridItem.canResize).calls.reset();
			(<any>ngGridItem)._getMousePosition.calls.reset();
			renderSpy.setElementStyle.calls.reset();

			(<any>ngGridItem)._resizeHandle = false;
			(<any>ngGridItem)._elemWidth = 10;
			(<any>ngGridItem)._elemHeight = 0;
			(<any>ngGridItem)._borderSize = 15;
			ngGrid.resizeEnable = true;
			(<any>ngGridItem)._getMousePosition.and.returnValue({ left: 0, top: 0 });
			ngGridItem.onMouseMove(e);
			expect(ngGridItem.canDrag).not.toHaveBeenCalled();
			expect(ngGridItem.canResize).not.toHaveBeenCalled();
			expect((<any>ngGridItem)._getMousePosition).toHaveBeenCalled();
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'cursor', 'ew-resize');
			(<any>ngGridItem.canDrag).calls.reset();
			(<any>ngGridItem.canResize).calls.reset();
			(<any>ngGridItem)._getMousePosition.calls.reset();
			renderSpy.setElementStyle.calls.reset();

			(<any>ngGridItem)._resizeHandle = false;
			(<any>ngGridItem)._elemWidth = 10;
			(<any>ngGridItem)._elemHeight = 10;
			(<any>ngGridItem)._borderSize = 15;
			ngGrid.resizeEnable = true;
			(<any>ngGridItem)._getMousePosition.and.returnValue({ left: 0, top: 0 });
			ngGridItem.onMouseMove(e);
			expect(ngGridItem.canDrag).not.toHaveBeenCalled();
			expect(ngGridItem.canResize).not.toHaveBeenCalled();
			expect((<any>ngGridItem)._getMousePosition).toHaveBeenCalled();
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'cursor', 'nwse-resize');
			(<any>ngGridItem.canDrag).calls.reset();
			(<any>ngGridItem.canResize).calls.reset();
			(<any>ngGridItem)._getMousePosition.calls.reset();
			renderSpy.setElementStyle.calls.reset();


			(<any>ngGridItem)._resizeHandle = false;
			ngGrid.dragEnable = true;
			(<any>ngGridItem.canDrag).and.returnValue(true);
			ngGridItem.onMouseMove(e);
			expect(ngGridItem.canDrag).toHaveBeenCalled();
			expect(ngGridItem.canResize).not.toHaveBeenCalled();
			expect((<any>ngGridItem)._getMousePosition).not.toHaveBeenCalled();
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'cursor', 'move');
			(<any>ngGridItem.canDrag).calls.reset();
			(<any>ngGridItem.canResize).calls.reset();
			(<any>ngGridItem)._getMousePosition.calls.reset();
			renderSpy.setElementStyle.calls.reset();
		});

		it("should remove the item", () => {
			var ngGridSpy: any = jasmine.createSpyObj('ngGridSpy', ['removeItem'])
			var ngGridItem: NgGridItem = new NgGridItem(null, null, ngGridSpy);
			(<any>ngGridItem)._added = false;
			ngGridItem.ngOnDestroy();
			expect(ngGridSpy.removeItem).not.toHaveBeenCalled();

			(<any>ngGridItem)._added = true;
			ngGridItem.ngOnDestroy();
			expect(ngGridSpy.removeItem).toHaveBeenCalledWith(ngGridItem);
		});

		it("should get element", () => {
			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
			var ngEl: any = {};
			(<any>ngGridItem)._ngEl = ngEl;
			expect(ngGridItem.getElement()).toBe(ngEl);
			(<any>ngGridItem)._ngEl = null;
			expect(ngGridItem.getElement()).toBe(null);
		});

		it("should get the drag handle", () => {
			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
			var dragHandle: string = "dragHandle";
			(<any>ngGridItem)._dragHandle = dragHandle;
			expect(ngGridItem.getDragHandle()).toBe(dragHandle);
			(<any>ngGridItem)._dragHandle = null;
			expect(ngGridItem.getDragHandle()).toBe(null);
		});

		it("should get the resize handle", () => {
			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
			var resizeHandle: string = "resizeHandle";
			(<any>ngGridItem)._resizeHandle = resizeHandle;
			expect(ngGridItem.getResizeHandle()).toBe(resizeHandle);
			(<any>ngGridItem)._resizeHandle = null;
			expect(ngGridItem.getResizeHandle()).toBe(null);
		});

		it("should get the dimensions", () => {
			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
			(<any>ngGridItem)._elemWidth = 100;
			(<any>ngGridItem)._elemHeight = 200;
			expect(ngGridItem.getDimensions().width).toBe(100);
			expect(ngGridItem.getDimensions().height).toBe(200);
			(<any>ngGridItem)._elemWidth = null;
			(<any>ngGridItem)._elemHeight = null;
			expect(ngGridItem.getDimensions().width).toBe(null);
			expect(ngGridItem.getDimensions().height).toBe(null);
		});

		it("should get the size", () => {
			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
			(<any>ngGridItem)._sizex = 100;
			(<any>ngGridItem)._sizey = 200;
			expect(ngGridItem.getSize().x).toBe(100);
			expect(ngGridItem.getSize().y).toBe(200);
			(<any>ngGridItem)._sizex = null;
			(<any>ngGridItem)._sizey = null;
			expect(ngGridItem.getSize().x).toBe(null);
			expect(ngGridItem.getSize().y).toBe(null);
		});

		it("should get the position", () => {
			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
			(<any>ngGridItem)._elemLeft = 100;
			(<any>ngGridItem)._elemTop = 200;
			expect(ngGridItem.getPosition().left).toBe(100);
			expect(ngGridItem.getPosition().top).toBe(200);
			(<any>ngGridItem)._elemLeft = null;
			(<any>ngGridItem)._elemTop = null;
			expect(ngGridItem.getPosition().left).toBe(null);
			expect(ngGridItem.getPosition().top).toBe(null);
		});

		it("should get the grid position", () => {
			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
			(<any>ngGridItem)._col = 100;
			(<any>ngGridItem)._row = 200;
			expect(ngGridItem.getGridPosition().col).toBe(100);
			expect(ngGridItem.getGridPosition().row).toBe(200);
			(<any>ngGridItem)._col = null;
			(<any>ngGridItem)._row = null;
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

		it("should set the size", () => {
			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
			spyOn(ngGridItem, '_recalculateDimensions');
			var newSizeX = 31;
			var newSizeY = 27;
			ngGridItem.setSize(newSizeX, newSizeY);
			expect((<any>ngGridItem)._sizex).toBe(newSizeX);
			expect((<any>ngGridItem)._sizey).toBe(newSizeY);
			expect((<any>ngGridItem)._recalculateDimensions).toHaveBeenCalled();
		});

		it("should set the grid position", () => {
			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);
			spyOn(ngGridItem, '_recalculatePosition');
			var newCol = 31;
			var newRow = 27;
			ngGridItem.setGridPosition(newCol, newRow);
			expect((<any>ngGridItem)._col).toBe(newCol);
			expect((<any>ngGridItem)._row).toBe(newRow);
			expect((<any>ngGridItem)._recalculatePosition).toHaveBeenCalled();
		});

		it("should set the position according to the cascade type", () => {
			var renderSpy = jasmine.createSpyObj('renderSpy', ['setElementStyle']);
			var ngEl: any = {};
			var ngGrid: any = {};
			var ngGridItem: NgGridItem = new NgGridItem(ngEl, renderSpy, ngGrid);
			var newX = 31;
			var newY = 27;

			(<any>ngGridItem).setPosition(newX, newY);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'left', "31px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'top', "27px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'right', null);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'bottom', null);
			(<any>renderSpy.setElementStyle).calls.reset();

			ngGrid.cascade = 'up';
			(<any>ngGridItem).setPosition(newX, newY);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'left', "31px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'top', "27px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'right', null);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'bottom', null);
			(<any>renderSpy.setElementStyle).calls.reset();

			ngGrid.cascade = 'left';
			(<any>ngGridItem).setPosition(newX, newY);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'left', "31px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'top', "27px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'right', null);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'bottom', null);
			(<any>renderSpy.setElementStyle).calls.reset();

			ngGrid.cascade = 'right';
			(<any>ngGridItem).setPosition(newX, newY);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'right', "31px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'top', "27px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'left', null);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'bottom', null);
			(<any>renderSpy.setElementStyle).calls.reset();

			ngGrid.cascade = 'down';
			(<any>ngGridItem).setPosition(newX, newY);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'left', "31px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'bottom', "27px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'right', null);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'top', null);
			(<any>renderSpy.setElementStyle).calls.reset();
		});

		it("should set the dimensions", () => {
			var renderSpy = jasmine.createSpyObj('renderSpy', ['setElementStyle']);
			var ngEl: any = {};
			var ngGridItem: NgGridItem = new NgGridItem(ngEl, renderSpy, null);
			var newWidth = 31;
			var newHeight = 27;
			(<any>ngGridItem).setDimensions(newWidth, newHeight);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'width', "31px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'height', "27px");
		});

		it("should recalculate the position", () => {
			var ngGrid: any = {
				marginLeft: 1,
				marginRight: 2,
				colWidth: 3,
				marginTop: 4,
				marginBottom: 5,
				rowHeight: 6
			};
			var ngGridItem: NgGridItem = new NgGridItem(null, null, ngGrid);
			spyOn(ngGridItem, 'setPosition');
			(<any>ngGridItem)._col = 7;
			(<any>ngGridItem)._row = 8;

			(<any>ngGridItem)._recalculatePosition();
			expect((<any>ngGridItem).setPosition).toHaveBeenCalledWith(37, 109);
		});

		it("should recalculate dimensions", () => {
			var ngGrid: any = {
				marginLeft: 1,
				marginRight: 2,
				colWidth: 3,
				marginTop: 4,
				marginBottom: 5,
				rowHeight: 6,
				minCols: 1,
				minRows: 1,
			};
			var ngGridItem: NgGridItem = new NgGridItem(null, null, ngGrid);
			spyOn(ngGridItem, 'setDimensions');
			(<any>ngGridItem)._sizex = 7;
			(<any>ngGridItem)._sizey = 8;

			(<any>ngGridItem)._recalculateDimensions();
			expect((<any>ngGridItem).setDimensions).toHaveBeenCalledWith(39, 111);

			ngGrid.minCols = 7;
			ngGrid.minRows = 8;

			(<any>ngGridItem)._sizex = 1;
			(<any>ngGridItem)._sizey = 1;

			(<any>ngGridItem)._recalculateDimensions();
			expect((<any>ngGridItem).setDimensions).toHaveBeenCalledWith(39, 111);
		});

		it("should recalculate position and dimensions when recalculating self", () => {
			spyOn(NgGridItem.prototype, "_recalculateDimensions");
			spyOn(NgGridItem.prototype, "_recalculatePosition");

			var ngGridItem: NgGridItem = new NgGridItem(null, null, null);

			ngGridItem.recalculateSelf();

			expect((<any>ngGridItem)._recalculatePosition).toHaveBeenCalled();
			expect((<any>ngGridItem)._recalculateDimensions).toHaveBeenCalled();
		});

		it("should add moving class and styles on startMoving", () => {
			var renderSpy = jasmine.createSpyObj('renderSpy', ['setElementStyle', 'setElementClass']);
			var styleSpy = jasmine.createSpyObj('styleSpy', ['getPropertyValue']);
			styleSpy.getPropertyValue.and.returnValue(100);
			var oldGetCompStyle = window.getComputedStyle;
			(<any>window).getComputedStyle = jasmine.createSpy("getComputedStyle").and.returnValue(styleSpy);

			var ngGrid: any = { 'autoStyle': false };
			var elem: any = { 'nativeElement': {} };

			var ngGridItem: NgGridItem = new NgGridItem(elem, renderSpy, ngGrid);
			ngGridItem.startMoving();

			expect(window.getComputedStyle).toHaveBeenCalledWith(elem.nativeElement);
			expect(renderSpy.setElementClass).toHaveBeenCalledWith(elem, 'moving', true);
			expect(renderSpy.setElementStyle).not.toHaveBeenCalled();
			expect(styleSpy.getPropertyValue).not.toHaveBeenCalled();

			ngGrid.autoStyle = true;
			ngGridItem.startMoving();

			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(elem, 'z-index', '101');
			expect(styleSpy.getPropertyValue).toHaveBeenCalledWith('z-index');

			(<any>window).getComputedStyle = oldGetCompStyle;
		});

		it("should remove moving class and styles on stopMoving", () => {
			var renderSpy = jasmine.createSpyObj('renderSpy', ['setElementStyle', 'setElementClass']);
			var styleSpy = jasmine.createSpyObj('styleSpy', ['getPropertyValue']);
			styleSpy.getPropertyValue.and.returnValue(100);
			var oldGetCompStyle = window.getComputedStyle;
			(<any>window).getComputedStyle = jasmine.createSpy("getComputedStyle").and.returnValue(styleSpy);

			var ngGrid: any = { 'autoStyle': false };
			var elem: any = { 'nativeElement': {} };

			var ngGridItem: NgGridItem = new NgGridItem(elem, renderSpy, ngGrid);
			ngGridItem.stopMoving();

			expect(window.getComputedStyle).toHaveBeenCalledWith(elem.nativeElement);
			expect(renderSpy.setElementClass).toHaveBeenCalledWith(elem, 'moving', false);
			expect(renderSpy.setElementStyle).not.toHaveBeenCalled();
			expect(styleSpy.getPropertyValue).not.toHaveBeenCalled();

			ngGrid.autoStyle = true;
			ngGridItem.stopMoving();

			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(elem, 'z-index', '99');
			expect(styleSpy.getPropertyValue).toHaveBeenCalledWith('z-index');

			(<any>window).getComputedStyle = oldGetCompStyle;
		});

		it("should attempt to calculate the mouse position", () => {
			var event: any = {
				clientX: 14234,
				clientY: 24323,
				'originalEvent': {
					'touches': null,
					'changedTouches': null
				}
			};
			var elem: any = {
				'nativeElement': {
					'getBoundingClientRect': jasmine.createSpy('elemSpy').and.returnValue({ 'left': 4353, 'top': 3554 })
				}
			}

			var ngGridItem: NgGridItem = new NgGridItem(elem, null, null);

			expect((<any>ngGridItem)._getMousePosition(event)).toEqual({ 'left': 9881, 'top': 20769 });

			event.originalEvent.touches = [];
			event.originalEvent.changedTouches = [{ 'clientX': 8658, 'clientY': 9757 }];

			expect((<any>ngGridItem)._getMousePosition(event)).toEqual({ 'left': 4305, 'top': 6203 });

			event.originalEvent.touches = [{ 'clientX': 34523, 'clientY': 7898 }];
			expect((<any>ngGridItem)._getMousePosition(event)).toEqual({ 'left': 30170, 'top': 4344 });
		});

		it("should add self to ngGrid, store config and recalculate when config is set", () => {
			spyOn(NgGridItem.prototype, '_recalculatePosition');
			spyOn(NgGridItem.prototype, '_recalculateDimensions');
			spyOn(NgGridItem.prototype, 'setConfig');

			var ngGrid: any = jasmine.createSpyObj('NgGridSpy', ['addItem']);
			var ngGridItem: NgGridItem = new NgGridItem(null, null, ngGrid);

			ngGridItem.config = { 'col': 5, 'row': 2 };

			expect(ngGridItem.setConfig).toHaveBeenCalled();
			expect(ngGrid.addItem).toHaveBeenCalledWith(ngGridItem);
			expect((<any>ngGridItem)._recalculatePosition).toHaveBeenCalled();
			expect((<any>ngGridItem)._recalculateDimensions).toHaveBeenCalled();
			expect((<any>ngGridItem)._added).toBe(true);

			ngGrid.addItem.calls.reset();
			ngGridItem.config = {};

			expect(ngGrid.addItem).not.toHaveBeenCalledWith(ngGridItem);
		});
	});
}