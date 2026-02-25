import { Directive, OnInit, Renderer2, Input, ElementRef, OnChanges, OnDestroy, inject } from "@angular/core";

@Directive({
    selector: "[columnsResizable]",
    standalone: true
})
export class ResizeColumnDirective implements OnInit, OnChanges, OnDestroy {
    private readonly renderer = inject(Renderer2);
    private readonly elementRef = inject(ElementRef<HTMLElement>);
    
    private columnsResizable$: boolean = false;
    
    @Input() set columnsResizable(val: boolean) {
        this.columnsResizable$ = val;
    }
    
    get columnsResizable(): boolean {
        return this.columnsResizable$;
    }
    
    @Input() index!: number;
    
    private startX: number = 0;
    private startWidth: number = 0;
    private readonly column: HTMLElement;
    private table: HTMLElement | null = null;
    private pressed: boolean = false;
    private resizerElement: HTMLElement | null = null;
    private removeMouseDownListener: (() => void) | null = null;
    private removeMouseMoveListener: (() => void) | null = null;
    private removeMouseUpListener: (() => void) | null = null;
    private removeMouseEnterListener: (() => void) | null = null;
    private removeMouseLeaveListener: (() => void) | null = null;
    private relatedTables: HTMLElement[] = [];
    private readonly minColumnWidth = 40;

    constructor() {
        this.column = this.elementRef.nativeElement;
    }

    ngOnInit(): void {
        this.setupResizing();
    }
    ngOnChanges(): void {
        this.setupResizing();
    }
    
    ngOnDestroy(): void {
        this.cleanup();
    }
    
    private setupResizing(): void {
        if (this.columnsResizable$) {
            this.initializeResizer();
        } else {
            this.cleanup();
        }
    }
    
    private initializeResizer(): void {
        if (this.resizerElement) {
            return;
        }

        const row = this.renderer.parentNode(this.column) as HTMLElement;
        const thead = this.renderer.parentNode(row) as HTMLElement;
        this.table = this.renderer.parentNode(thead) as HTMLElement;
        if (!this.table) {
            return;
        }

        this.resizerElement = this.renderer.createElement("span");
        this.renderer.addClass(this.resizerElement, "resize-holder");
        this.renderer.setStyle(this.resizerElement, "display", "block");
        this.renderer.setStyle(this.resizerElement, "position", "absolute");
        this.renderer.setStyle(this.resizerElement, "height", "100%");
        this.renderer.setStyle(this.resizerElement, "width", "2px");
        this.renderer.setStyle(this.resizerElement, "cursor", "col-resize");
        this.renderer.setStyle(this.resizerElement, "z-index", "9999");
        this.renderer.setStyle(this.resizerElement, "top", "0");
        this.renderer.setStyle(this.resizerElement, "margin-left", "-16px");
        this.renderer.setStyle(this.resizerElement, "background-color", "transparent");
        this.renderer.setStyle(this.resizerElement, "transition", "background-color 120ms ease-in-out");
        this.renderer.insertBefore(this.column, this.resizerElement, this.column.firstChild);
        
        this.removeMouseDownListener = this.renderer.listen(this.resizerElement, "mousedown", this.onMouseDown);
        this.removeMouseEnterListener = this.renderer.listen(this.resizerElement, "mouseenter", this.onMouseEnter);
        this.removeMouseLeaveListener = this.renderer.listen(this.resizerElement, "mouseleave", this.onMouseLeave);
        this.removeMouseMoveListener = this.renderer.listen("document", "mousemove", this.onMouseMove);
        this.removeMouseUpListener = this.renderer.listen("document", "mouseup", this.onMouseUp);
    }
    
    private cleanup(): void {
        this.pressed = false;

        if (this.removeMouseDownListener) {
            this.removeMouseDownListener();
            this.removeMouseDownListener = null;
        }

        if (this.removeMouseMoveListener) {
            this.removeMouseMoveListener();
            this.removeMouseMoveListener = null;
        }

        if (this.removeMouseEnterListener) {
            this.removeMouseEnterListener();
            this.removeMouseEnterListener = null;
        }

        if (this.removeMouseLeaveListener) {
            this.removeMouseLeaveListener();
            this.removeMouseLeaveListener = null;
        }

        if (this.removeMouseUpListener) {
            this.removeMouseUpListener();
            this.removeMouseUpListener = null;
        }

        if (this.table) {
            this.renderer.removeClass(this.table, "resizing");
        }

        this.removeDragElementFromDom();
    }
    
    private readonly onMouseDown = (event: MouseEvent): void => {
        if (!this.columnsResizable$ || !this.table) {
            return;
        }

        event.preventDefault();
        this.pressed = true;
        this.startX = event.pageX;
        this.startWidth = this.column.offsetWidth;
        this.relatedTables = this.getRelatedTables();

        this.relatedTables.forEach((table) => {
            this.renderer.addClass(table, "resizing");
        });
    };

    private readonly onMouseMove = (event: MouseEvent): void => {
        const offset = 5;
        if (this.pressed && this.table) {
            // Calculate width of column
            const width = this.startWidth + (event.pageX - this.startX - offset);
            const computedWidth = Math.max(width, this.minColumnWidth);

            this.applyColumnWidthToRelatedTables(computedWidth);
        }
    };

    private readonly onMouseEnter = (): void => {
        if (!this.resizerElement) {
            return;
        }

        this.renderer.setStyle(this.resizerElement, "background-color", "var(--mat-table-resize-hover-bg, rgba(0, 0, 0, 0.08))");
    };

    private readonly onMouseLeave = (): void => {
        if (!this.resizerElement || this.pressed) {
            return;
        }

        this.renderer.removeStyle(this.resizerElement, "background-color");
    };

    private readonly onMouseUp = (event: MouseEvent): void => {
        if (this.pressed) {
            this.pressed = false;

            this.relatedTables.forEach((table) => {
                this.renderer.removeClass(table, "resizing");
            });

            this.relatedTables = [];
        }

        if (this.resizerElement) {
            this.renderer.removeStyle(this.resizerElement, "background-color");
        }
    };

    private getRelatedTables(): HTMLElement[] {
        if (!this.table) {
            return [];
        }

        const container = this.table.closest("#tableContainer") as HTMLElement | null;
        if (!container) {
            return [this.table];
        }

        const tables = Array.from(container.querySelectorAll("table.mat-mdc-table")) as HTMLElement[];
        if (!tables.length) {
            return [this.table];
        }

        return tables;
    }

    private applyColumnWidthToRelatedTables(width: number): void {
        const widthPx = `${width}px`;
        const tables = this.relatedTables.length ? this.relatedTables : (this.table ? [this.table] : []);

        tables.forEach((table) => {
            this.applyWidthToHeaderCells(table, widthPx);
            this.applyWidthToDataCells(table, widthPx);
            this.applyWidthToFooterCells(table, widthPx);
        });
    }

    private applyWidthToHeaderCells(table: HTMLElement, widthPx: string): void {
        const headerRows = table.querySelectorAll("tr.mat-mdc-header-row, tr.mat-header-row");
        headerRows.forEach((row) => {
            const headerCell = row.querySelectorAll("th, .mat-mdc-header-cell, .mat-header-cell").item(this.index);
            this.applyWidthToElement(headerCell, widthPx);
        });
    }

    private applyWidthToDataCells(table: HTMLElement, widthPx: string): void {
        const dataRows = table.querySelectorAll("tr.mat-mdc-row, tr.mat-row");
        dataRows.forEach((row) => {
            const dataCell = row.querySelectorAll("td, .mat-mdc-cell, .mat-cell").item(this.index);
            this.applyWidthToElement(dataCell, widthPx);
        });
    }

    private applyWidthToFooterCells(table: HTMLElement, widthPx: string): void {
        const footerRows = table.querySelectorAll("tr.mat-mdc-footer-row, tr.mat-footer-row");
        footerRows.forEach((row) => {
            const footerCell = row.querySelectorAll("td, .mat-mdc-footer-cell, .mat-footer-cell").item(this.index);
            this.applyWidthToElement(footerCell, widthPx);
        });
    }

    private applyWidthToElement(element: Element | null, widthPx: string): void {
        if (!(element instanceof HTMLElement)) {
            return;
        }

        this.renderer.setStyle(element, "width", widthPx);
        this.renderer.setStyle(element, "min-width", widthPx);
        this.renderer.setStyle(element, "max-width", widthPx);
    }
    
    /**
     * @description This method is used to remove resizing handlers from the table headers when column resizing is disabled.
     */
    private removeDragElementFromDom(): void {
        if (this.resizerElement) {
            this.renderer.removeChild(this.column, this.resizerElement);
            this.resizerElement = null;
        }

        this.relatedTables = [];
    }
}
