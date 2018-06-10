import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { NgGridConfig, NgGridItemConfig, NgGridItemEvent, NgGrid } from 'angular2-grid';

interface Box {
    id: number;
    config: NgGridItemConfig;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
    @ViewChild(NgGrid)
    private grid: NgGrid;
    public curNum = 10;
    public boxes: Array<Box> = [];
    public gridConfig: NgGridConfig = <NgGridConfig>{
        'margins': [5],
        'draggable': true,
        'resizable': true,
        'max_cols': 0,
        'max_rows': 0,
        'visible_cols': 0,
        'visible_rows': 0,
        'min_cols': 1,
        'min_rows': 1,
        'col_width': 2,
        'row_height': 2,
        'cascade': 'up',
        'min_width': 50,
        'min_height': 50,
        'fix_to_grid': false,
        'auto_style': true,
        'auto_resize': false,
        'maintain_ratio': false,
        'prefer_new': false,
        'zoom_on_drag': false,
        'limit_to_screen': true,
        'element_based_row_height': false,
        'center_to_screen': false,
        'fix_item_position_direction': 'horizontal',
        'fix_collision_position_direction': 'horizontal',
    };
    private rgb = '#efefef';
    private curItemCheck = 0;
    private itemPositions: Array<any> = [];

    constructor() {
        for (let i = 1; i < this.curNum; i++) {
            const conf = this._generateDefaultItemConfig();
            conf.payload = i;
            this.boxes[i - 1] = { id: i, config: conf };
        }
    }

    get ratioDisabled(): boolean {
        return (this.gridConfig.max_rows > 0 && this.gridConfig.visible_cols > 0) ||
            (this.gridConfig.max_cols > 0 && this.gridConfig.visible_rows > 0) ||
            (this.gridConfig.visible_cols > 0 && this.gridConfig.visible_rows > 0);
    }

    get itemCheck(): number {
        return this.curItemCheck;
    }

    set itemCheck(v: number) {
        this.curItemCheck = v;
    }

    get curItem(): NgGridItemConfig {
        return this.boxes[this.curItemCheck] ? this.boxes[this.curItemCheck].config : {};
    }

    ngAfterViewInit(): void {
        //  Do something with NgGrid instance here
    }

    setMargin(marginSize: string): void {
        this.gridConfig.margins = [ parseInt(marginSize, 10) ];
    }

    addBox(): void {
        const conf: NgGridItemConfig = this._generateDefaultItemConfig();
        conf.payload = this.curNum++;
        this.boxes.push({ id: conf.payload, config: conf });
    }

    removeBox(): void {
        if (this.boxes[this.curItemCheck]) {
            this.boxes.splice(this.curItemCheck, 1);
        }
    }

    updateItem(index: number, event: NgGridItemEvent): void {
        // Do something here
    }

    onDrag(index: number, event: NgGridItemEvent): void {
        // Do something here
    }

    onResize(index: number, event: NgGridItemEvent): void {
        // Do something here
    }

    public randomise(): void {
        for (const box of this.boxes) {
            box.config.col = Math.floor(Math.random() * 6) + 1;
            box.config.row = 1;
        }
    }

    private _generateDefaultItemConfig(): NgGridItemConfig {
        return { 'dragHandle': '.handle', 'col': 1, 'row': 1, 'sizex': 1, 'sizey': 1 };
    }

}
