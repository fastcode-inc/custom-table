import { Directive, OnInit, Renderer2, Input, ElementRef, OnChanges } from "@angular/core";

@Directive({
    selector: "[columnsResizable]"
})
export class ResizeColumnDirective implements OnInit, OnChanges {
    columnsResizable$: boolean = false;
    @Input() set columnsResizable(val: boolean) {
        this.columnsResizable$ = val;
    }
    get columnsResizable() {
        return this.columnsResizable$;
    }
    @Input() index!: number;
    private startX!: number;
    private startWidth!: number;
    private column: HTMLElement;
    private table!: HTMLElement;
    private pressed!: boolean;

    constructor(private renderer: Renderer2, private el: ElementRef) {
        this.column = this.el.nativeElement;
    }

    ngOnInit() {
        if (this.columnsResizable$) {
            const row = this.renderer.parentNode(this.column);
            const thead = this.renderer.parentNode(row);
            this.table = this.renderer.parentNode(thead);

            const resizer = this.renderer.createElement("span");
            this.renderer.addClass(resizer, "resize-holder");
            this.renderer.setAttribute(resizer, 'id', "resizeHolderSpan");
            this.renderer.appendChild(this.column, resizer);
            this.renderer.listen(resizer, "mousedown", this.onMouseDown);
            this.renderer.listen(this.table, "mousemove", this.onMouseMove);
            this.renderer.listen("document", "mouseup", this.onMouseUp);
        }
        else {
            this.removeDragElementFromDom();
        }
    }
    ngOnChanges() {
        if (this.columnsResizable$) {
            const row = this.renderer.parentNode(this.column);
            const thead = this.renderer.parentNode(row);
            const resizer = this.renderer.createElement("span");
            this.table = this.renderer.parentNode(thead);
            this.renderer.addClass(resizer, "resize-holder");
            this.renderer.setAttribute(resizer, 'id', "resizeHolderSpan");
            this.renderer.appendChild(this.column, resizer);
            this.renderer.listen(resizer, "mousedown", this.onMouseDown);
            this.renderer.listen(this.table, "mousemove", this.onMouseMove);
            this.renderer.listen("document", "mouseup", this.onMouseUp);
        }
        else {
            this.removeDragElementFromDom();
        }
    }
    
    onMouseDown = (event: MouseEvent) => {
        this.pressed = true;
        this.startX = event.pageX;
        this.startWidth = this.column.offsetWidth;
    };

    onMouseMove = (event: MouseEvent) => {
        const offset = 5;
        if (this.pressed && event.buttons) {
            this.renderer.addClass(this.table, "resizing");
            // Calculate width of column
            let width =
                this.startWidth + (event.pageX - this.startX - offset);
            const tableCells = Array.from(this.table.querySelectorAll(".mat-row")).map(
                (row: any) => row.querySelectorAll(".mat-cell").item(this.index)
            );
            // Set table header width
            this.renderer.setStyle(this.column, "width", `${width}px`);
            // Set table cells width
            for (const cell of tableCells) {
                if (cell && cell !== null)
                this.renderer.setStyle(cell, "width", `${width}px`);
            }
        }
    };

    onMouseUp = (event: MouseEvent) => {
        if (this.pressed) {
            this.pressed = false;
            this.renderer.removeClass(this.table, "resizing");
        }
    };
    /**
     * @description This method is used remove resizing handlers from the table headers when column resizing is disabled.
     */
    removeDragElementFromDom() {
        let ele = document.getElementById('resizeHolderSpan')
        if (ele && ele !== null && ele !== undefined) {
            this.renderer.removeChild(this.column, ele);
        }
    }
}

