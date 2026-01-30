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
            this.removeDragElementFromDom();
        }
    }
    
    private initializeResizer(): void {
        const row = this.renderer.parentNode(this.column) as HTMLElement;
        const thead = this.renderer.parentNode(row) as HTMLElement;
        this.table = this.renderer.parentNode(thead) as HTMLElement;

        this.resizerElement = this.renderer.createElement("span");
        this.renderer.addClass(this.resizerElement, "resize-holder");
        this.renderer.setAttribute(this.resizerElement, 'id', `resizeHolderSpan-${this.index}`);
        this.renderer.appendChild(this.column, this.resizerElement);
        
        this.renderer.listen(this.resizerElement, "mousedown", this.onMouseDown);
        this.renderer.listen(this.table, "mousemove", this.onMouseMove);
        this.renderer.listen("document", "mouseup", this.onMouseUp);
    }
    
    private cleanup(): void {
        this.removeDragElementFromDom();
    }
    
    private readonly onMouseDown = (event: MouseEvent): void => {
        this.pressed = true;
        this.startX = event.pageX;
        this.startWidth = this.column.offsetWidth;
    };

    private readonly onMouseMove = (event: MouseEvent): void => {
        const offset = 5;
        if (this.pressed && event.buttons && this.table) {
            this.renderer.addClass(this.table, "resizing");
            
            // Calculate width of column
            const width = this.startWidth + (event.pageX - this.startX - offset);
            
            // Get table cells for this column index
            const tableRows = this.table.querySelectorAll(".mat-mdc-row");
            const tableCells = Array.from(tableRows).map(
                (row: Element) => row.querySelectorAll(".mat-mdc-cell").item(this.index)
            );
            
            // Set table header width
            this.renderer.setStyle(this.column, "width", `${width}px`);
            
            // Set table cells width
            tableCells.forEach((cell: Element | null) => {
                if (cell instanceof HTMLElement) {
                    this.renderer.setStyle(cell, "width", `${width}px`);
                }
            });
        }
    };

    private readonly onMouseUp = (event: MouseEvent): void => {
        if (this.pressed && this.table) {
            this.pressed = false;
            this.renderer.removeClass(this.table, "resizing");
        }
    };
    
    /**
     * @description This method is used to remove resizing handlers from the table headers when column resizing is disabled.
     */
    private removeDragElementFromDom(): void {
        if (this.resizerElement) {
            this.renderer.removeChild(this.column, this.resizerElement);
            this.resizerElement = null;
        }
        
        // Also remove any existing resizer elements with the old ID pattern
        const existingElement = document.getElementById(`resizeHolderSpan-${this.index}`);
        if (existingElement) {
            this.renderer.removeChild(this.column, existingElement);
        }
    }
}
