export interface NgGridConfig {
	margins?: number[];
	draggable?: boolean;
	resizable?: boolean;
	max_cols?: number;
	max_rows?: number;
	visible_cols?: number;
	visible_rows?: number;
	min_cols?: number;
	min_rows?: number;
	col_width?: number;
	row_height?: number;
	cascade?: string;
	min_width?: number;
	min_height?: number;
	fix_to_grid?: boolean;
	auto_style?: boolean;
	auto_resize?: boolean;
	maintain_ratio?: boolean;
	prefer_new?: boolean;
	zoom_on_drag?: boolean;
}

export interface NgGridItemConfig {
	payload?: any,
	col?: number;
	row?: number;
	sizex?: number;
	sizey?: number;
	dragHandle?: string;
	resizeHandle?: string;
	fixed?: boolean;
	draggable?: boolean;
	resizable?: boolean;
	borderSize?: number;
	maxCols?: number;
	minCols?: number;
	maxRows?: number;
	minRows?: number;
}

export interface NgGridItemEvent {
	col: number;
	row: number;
	sizex: number;
	sizey: number;
	width: number;
	height: number;
	left: number;
	top: number;
}

export interface NgGridItemSize {
	x: number;
	y: number;
}

export interface NgGridItemPosition {
	col: number;
	row: number;
}
