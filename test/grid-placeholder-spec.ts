import { NgGrid, NgGridItem, NgGridPlaceholder } from 'src/NgGrid';

export function main() {
	describe("NgGridPlaceholder Component", () => {
		it("should generate a ngGrid placeholder", () => {
			var ngGridPlaceholder: NgGridPlaceholder = new NgGridPlaceholder(null, null, null);
		});

		it("should set the element class on init", () => {
			var renderSpy = jasmine.createSpyObj('renderSpy', ['setElementClass', 'setElementStyle']);
			var ngEl: any = {};
			var ngGrid: any = {
				autoStyle: false;
			};
			var ngGridPlaceholder: NgGridPlaceholder = new NgGridPlaceholder(renderSpy, ngEl, ngGrid);
			ngGridPlaceholder.onInit();
			expect(renderSpy.setElementClass).toHaveBeenCalledWith(ngEl, 'grid-placeholder', true);
			expect(renderSpy.setElementStyle).not.toHaveBeenCalled();
		});

		it("should set the element style on init if autoStyle is enabled", () => {
			var renderSpy = jasmine.createSpyObj('renderSpy', ['setElementClass', 'setElementStyle']);
			var ngEl: any = {};
			var ngGrid: any = {
				autoStyle: true;
			};
			var ngGridPlaceholder: NgGridPlaceholder = new NgGridPlaceholder(renderSpy, ngEl, ngGrid);
			ngGridPlaceholder.onInit();
			expect(renderSpy.setElementClass).toHaveBeenCalledWith(ngEl, 'grid-placeholder', true);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl,'position', 'absolute');
		});

		it("should set the size", () => {
			var ngGridPlaceholder: NgGridPlaceholder = new NgGridPlaceholder(null, null, null);
			spyOn(ngGridPlaceholder, '_recalculateDimensions');
			var newSizeX = 31;
			var newSizeY = 27;
			ngGridPlaceholder.setSize(newSizeX, newSizeY);
			expect(ngGridPlaceholder._sizex).toBe(newSizeX);
			expect(ngGridPlaceholder._sizey).toBe(newSizeY);
			expect(ngGridPlaceholder._recalculateDimensions).toHaveBeenCalled();
		});

		it("should set the grid position", () => {
			var ngGridPlaceholder: NgGridPlaceholder = new NgGridPlaceholder(null, null, null);
			spyOn(ngGridPlaceholder, '_recalculatePosition');
			var newCol = 31;
			var newRow = 27;
			ngGridPlaceholder.setGridPosition(newCol, newRow);
			expect(ngGridPlaceholder._col).toBe(newCol);
			expect(ngGridPlaceholder._row).toBe(newRow);
			expect(ngGridPlaceholder._recalculatePosition).toHaveBeenCalled();
		});

		it("should set the position according to the cascade type", () => {
			var renderSpy = jasmine.createSpyObj('renderSpy', ['setElementStyle']);
			var ngEl: any = {};
			var ngGrid: any = {};
			var ngGridPlaceholder: NgGridPlaceholder = new NgGridPlaceholder(renderSpy, ngEl, ngGrid);
			var newX = 31;
			var newY = 27;

			(<any>ngGridPlaceholder)._setPosition(newX, newY);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'left', "31px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'top', "27px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'right', null);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'bottom', null);
			renderSpy.setElementStyle.calls.reset();

			ngGrid.cascade = 'up';
			(<any>ngGridPlaceholder)._setPosition(newX, newY);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'left', "31px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'top', "27px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'right', null);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'bottom', null);
			renderSpy.setElementStyle.calls.reset();

			ngGrid.cascade = 'left';
			(<any>ngGridPlaceholder)._setPosition(newX, newY);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'left', "31px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'top', "27px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'right', null);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'bottom', null);
			renderSpy.setElementStyle.calls.reset();
			
			ngGrid.cascade = 'right';
			(<any>ngGridPlaceholder)._setPosition(newX, newY);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'right', "31px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'top', "27px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'left', null);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'bottom', null);
			renderSpy.setElementStyle.calls.reset();

			ngGrid.cascade = 'down';
			(<any>ngGridPlaceholder)._setPosition(newX, newY);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'left', "31px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'bottom', "27px");
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'right', null);
			expect(renderSpy.setElementStyle).toHaveBeenCalledWith(ngEl, 'top', null);
			renderSpy.setElementStyle.calls.reset();
		});

		it("should set the dimensions", () => {
			var renderSpy = jasmine.createSpyObj('renderSpy', ['setElementStyle']);
			var ngEl: any = {};
			var ngGridPlaceholder: NgGridPlaceholder = new NgGridPlaceholder(renderSpy, ngEl, null);
			var newWidth = 31;
			var newHeight = 27;
			(<any>)ngGridPlaceholder._setDimensions(newWidth, newHeight);
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
			var ngGridPlaceholder: NgGridPlaceholder = new NgGridPlaceholder(null, null, ngGrid);
			spyOn(ngGridPlaceholder, '_setPosition');
			ngGridPlaceholder._col = 7;
			ngGridPlaceholder._row = 8;

			(<any>)ngGridPlaceholder._recalculatePosition();
			expect(ngGridPlaceholder._setPosition).toHaveBeenCalledWith(37, 109);
		});

		it("should recalculate dimensions", () => {
			var ngGrid: any = {
				marginLeft: 1,
				marginRight: 2,
				colWidth: 3,
				marginTop: 4,
				marginBottom: 5,
				rowHeight: 6
			};
			var ngGridPlaceholder: NgGridPlaceholder = new NgGridPlaceholder(null, null, ngGrid);
			spyOn(ngGridPlaceholder, '_setDimensions');
			ngGridPlaceholder._sizex = 7;
			ngGridPlaceholder._sizey = 8;

			(<any>)ngGridPlaceholder._recalculateDimensions();
			expect(ngGridPlaceholder._setDimensions).toHaveBeenCalledWith(39, 111);
		});
	});
}