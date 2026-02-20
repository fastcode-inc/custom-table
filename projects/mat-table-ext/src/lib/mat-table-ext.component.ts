import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  AfterViewInit,
  ChangeDetectorRef,
  ElementRef,
  EventEmitter,
  Output,
} from '@angular/core';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  OnDestroy,
  SimpleChange,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { EditingComponent } from '../lib/components/editing/editing.component';
import {
  RowChange,
  DisplayColumn,
  MTExColumn,
  MTExColumnPinOption,
  RowSelectionChange,
  CellTemplateRefMap,
  ExpansionChange,
  FilterSearchValue,
  MTExRow,
  ColumnVisibility,
  MTExColumnGroup,
  RowPinning,
  MTExCellContext,
  MTExHeaderContext,
  MTExRowData,
  MTExInlineEditingContext,
  MTExCellEditingContext,
  MTExExpandedDetailContext,
} from '../lib/models/tableExtModels';
import { MatTableExtService } from '../lib/mat-table-ext.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ColumnPinningComponent } from './components/column-pinning/column-pinning.component';
import { FilterColumnsComponentComponent } from './components/filter-columns-component/filter-columns-component.component';
import { ResizeColumnDirective } from './directives/resize-column.directive';
@Component({
  selector: 'mat-table-ext',
  templateUrl: 'mat-table-ext.component.html',
  styleUrls: ['mat-table-ext.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatButtonModule,
    MatTooltipModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DragDropModule,
    ColumnPinningComponent,
    FilterColumnsComponentComponent,
    ResizeColumnDirective
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class MatTableExtComponent<T extends Record<string, unknown> = Record<string, unknown>> implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  @ViewChild('columnMenuTrigger') columnMenuTrigger!: MatMenuTrigger;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('matTable', { read: ElementRef }) matTableRef!: ElementRef;
  @ViewChild('MyTable') table!: MatTable<T>;
  @ViewChild('MyTable', { read: ElementRef }) tableElement!: ElementRef;

  // Table inputs
  @Input() dataSource!: MatTableDataSource<T>;
  @Input() columns: MTExColumn<T>[] = [];
  @Input() columnResizable: boolean = false;
  @Input() stripedRows: boolean = false;
  @Input() rowHover: boolean = false;
  @Input() inlineRowEditing: boolean = false;
  @Input() inCellEditing: boolean = false;
  @Input() cellPopupEditing: boolean = false;
  @Input() popupRowEditing: boolean = false;
  @Input() enableDelete: boolean = false;
  @Input() rowSelection: boolean = false;
  @Input() multiRowSelection: boolean = false;
  @Input() stickyFooter: boolean = false;
  @Input() stickyHeader: boolean = false;
  @Input() showFooterRow: boolean = false;
  @Input() columnFilter: boolean = false;
  @Input() loadingIndicator: boolean = false;
  @Input() sorting: boolean = false;
  @Input() showToolbar: boolean = false;
  @Input() toolbarTitle: string = '';
  @Input() tableHeight: string = '';
  @Input() toolbarHeight: string = '50px';
  @Input() tableWidth: string = '100%';
  @Input() scrollbarH: boolean = false;
  @Input() toolbarTemplate: TemplateRef<{$implicit: MatTableExtComponent<T>}> | undefined;
  @Input() columnHidable: boolean = false;
  @Input() columnPinnable: boolean = false;
  @Input() globalSearch: boolean = false;
  @Input() expandRows: boolean = false;
  @Input() dndColumns: boolean = false;
  @Input() showPaginator: boolean = true;
  @Input() showFirstLastButtons: boolean = false;
  @Input() exportButtonEnable: boolean = false;
  @Input() printButtonEnable: boolean = false;
  @Input() pageSizeOptions: number[] = [10, 50, 100];
  @Input() toolbarTemplateRef!: TemplateRef<{$implicit: MatTableExtComponent<T>}> | undefined;
  @Input() headerTemplateRef!: TemplateRef<MTExHeaderContext<T>> | null;
  @Input() cellTemplateRef!: TemplateRef<MTExCellContext<T>> | undefined;
  @Input() expansionTemplateRef!: TemplateRef<MTExExpandedDetailContext<T>> | undefined;
  @Input() popupEditingTemplateRef!: TemplateRef<MTExCellEditingContext<T>> | undefined;
  @Input() inlineEditingTemplateRef!: TemplateRef<MTExInlineEditingContext<T>> | undefined;
  @Input() cellEditingTemplateRef!: TemplateRef<MTExCellEditingContext<T>> | undefined;
  @Input() cellPopupEditingTemplateRef!: TemplateRef<MTExCellEditingContext<T>> | undefined;
  @Input() cellTemplateRefMap: CellTemplateRefMap<T> = {};
  @Input() tableClassName: string = '';
  @Input() columnGroups: MTExColumnGroup[] = [];
  @Input() hiddenRowIndices: number[] = [];
  @Input() enableRowHiding: boolean = false;
  @Input() enableRowPinning: boolean = false;
  @Input() topPinnedMaxHeight: string = ''; // Max height for top pinned table (e.g., '200px', '20vh')
  @Input() bottomPinnedMaxHeight: string = ''; // Max height for bottom pinned table (e.g., '200px', '20vh')
  @Input() rowPinningFn?: (row: T, index: number) => 'top' | 'bottom' | null;
  @Input() rowHidingFilterFn?: (row: T, index: number) => boolean;
  @Input() pdfOrientation: 'portrait' | 'landscape' = 'portrait';

  // Table outputs
  @Output() inlineChange: EventEmitter<RowChange<T>> = new EventEmitter<RowChange<T>>();
  @Output() cellChange: EventEmitter<RowChange<T>> = new EventEmitter<RowChange<T>>();
  @Output() popupChange: EventEmitter<RowChange<T>> = new EventEmitter<RowChange<T>>();
  @Output() rowDeleted: EventEmitter<T> = new EventEmitter<T>();
  @Output() scroll: EventEmitter<Event> = new EventEmitter<Event>();
  @Output() selectionChanged: EventEmitter<RowSelectionChange<T>> =
    new EventEmitter<RowSelectionChange<T>>();
  @Output() expansionChange: EventEmitter<ExpansionChange<T>> =
    new EventEmitter<ExpansionChange<T>>();
  @Output() rowPinningChange: EventEmitter<{row: T, position: 'top' | 'bottom' | null}> = 
    new EventEmitter<{row: T, position: 'top' | 'bottom' | null}>();
  tableID = new Date().getTime();
  private columnPinningOptions: MTExColumnPinOption[] = [];
  exportMenuCtrl: boolean = false;
  columnPinMenuCtrl: boolean = false;
  hideShowMenuCtrl: boolean = false;
  rowDataTemp: Record<string, T> = {};
  inlineEditingTemplateRefData: Record<string, unknown> = {};
  private displayedColumns: string[] = [];
  showHideColumnsArray: MTExColumn<T>[] = [];
  private columnsList: string[] = [];
  columnsArray: MTExColumn<T>[] = [];
  protected headersFiltersIds: string[] = [];
  protected columnsToDisplayWithExpand: string[] = [];
  selection = new SelectionModel<T>(false, []);
  hiddenCtrl = new SelectionModel<string>(true, []);
  tableData: T[] = [];
  private filterValues: Record<string, string | number | boolean> = {};
  pinnedTopRows: T[] = [];
  private pinnedBottomRows: T[] = [];
  private rowPinMenuPosition = { x: '0px', y: '0px' };
  rowPinMenuRow: T | null = null;
  globalFilter = '';
  showHideFilter = '';
  private individualFilter = '';
  toggleFilters = false;
  protected hideRows = false;
  expandedElement: T | null = null;
  currentRowIndex: number = -1;
  private currentRow: T = {} as T;
  cellEditing: Record<string, boolean> = {};
  // Store original sizes before entering edit mode
  private originalSizesBeforeEdit: {
    columnWidths: number[];
    rowHeight: number;
  } | null = null;
  hideShowMenuGroup: FormGroup = this.formBuilder.group({});
  menuX: number = 0;
  menuY: number = 0;
  private dynamicDisplayedColumns: any[] = [
    { filter: false, name: 'select', show: false },
    { filter: false, name: 'edit', show: false },
    { filter: false, name: 'popup', show: false },
    { filter: false, name: 'delete', show: false },
    { filter: false, name: 'freeze', show: false },
    { filter: false, name: 'hide', show: false },
    { filter: false, name: 'pin', show: false },
    { filter: false, name: 'expand', show: false },
  ];
  private inputPropertyKeys: string[] = [
    'dataSource',
    'columns',
    'inlineRowEditing',
    'popupRowEditing',
    'enableDelete',
    'enableRowFreezing',
    'enableRowHiding',
    'enableRowPinning',
    'rowSelection',
    'multiRowSelection',
    'stickyHeader',
    'stickyFooter',
    'columnFilter',
    'globalSearch',
    'expandRows',
    'sorting',
    'columnGroups',
  ];
  

  constructor(
    private dialog: MatDialog,
    private service: MatTableExtService<T>,
    private formBuilder: FormBuilder,
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    private cdr: ChangeDetectorRef
  ) {
    this.addIconsToRegistry();
    if (this.dataSource) {
      this.tableData = this.dataSource.data;
    }
  }
  /**
   *
   * @param changes changes captured each time user changes property value.
   */

  /**
 * Handle column pinning changes from ColumnPinningComponent
 * @param updatedColumns Updated columns array with new pinning states
 */
updateColumns(updatedColumns: MTExColumn<T>[]) {
  // Create a completely new columnsArray to trigger change detection
  this.columnsArray = updatedColumns.map(col => ({ ...col }));
  
  // Update showHideColumnsArray to keep it in sync
  this.showHideColumnsArray = [...this.columnsArray];

  // Re-apply column configurations
  this.setColumnsList(this.columnsArray);
  
  // Force complete table re-render by recreating the data source
  if (this.dataSource) {
    const currentData = [...this.dataSource.data];
    this.dataSource = new MatTableDataSource(currentData);
    this.pinnedTopDataSource = new MatTableDataSource(this.pinnedTopRows);
    this.pinnedBtmDataSource = new MatTableDataSource(this.pinnedBottomRows);
    this.reCal(); // Re-apply paginator, sort, and filter
  }
  
  if (this.columnFilter) {
      this.setColumnFilter(true);
  }
  
  // Force change detection
  this.cdr.markForCheck();
  this.cdr.detectChanges();
  // Re-sync column sizes in case column ordering/visibility changed
  if (this.enableRowPinning) {
    setTimeout(() => this.syncColumnSizesFromTop(), 80);
  }
}
  ngOnChanges(changes: SimpleChanges) {
    this.setPropertyValue(changes);
  }

  ngOnInit() {
    if (this.dataSource) {
      this.dataSource.filterPredicate = this.createFilter();
    }
    
    
    // Initialize FormGroup if not already initialized
    if (!this.hideShowMenuGroup || Object.keys(this.hideShowMenuGroup.controls).length === 0) {
      this.hideShowMenuGroup = this.formBuilder.group({});
    }
    
    // Initialize pinned rows if function provided
    if (this.enableRowPinning) {
      this.initializePinnedRows();
    }
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.setSorting();
    }
    
    // Calculate and set pinned row offsets
    this.updatePinnedRowOffsets();
    // Sync column sizes from top table to middle/bottom when pinning enabled
    if (this.enableRowPinning) {
      setTimeout(() => this.syncColumnSizesFromTop(), 150);
      window.addEventListener('resize', this.onWindowResizeBound);
    }
  }

  private setSorting() {
    if (this.enableRowPinning) {
      if (this.pinnedTopDataSource) {
        if (this.pinnedTopDataSource.sort) {
          this.pinnedTopDataSource.sort = this.sort;
        }
      }
      if (this.pinnedBtmDataSource) {
        if (this.pinnedBtmDataSource.sort) {
          this.pinnedBtmDataSource.sort = this.sort;
        }
      }
    }
  }

  /**
   * @description Calculate offsets for pinned rows based on sticky headers/footers
   */
  private updatePinnedRowOffsets(): void {
    if (!this.tableElement?.nativeElement || !this.enableRowPinning) return;

    setTimeout(() => {
      const table = this.tableElement.nativeElement as HTMLElement;
      
      // Calculate top offset (sticky header + group header + filter row)
      let topOffset = 0;
      
      if (this.stickyHeader) {
        // Get all header rows that are sticky
        const headerRows = table.querySelectorAll('.mat-mdc-header-row');
        headerRows.forEach((header: Element) => {
          topOffset += (header as HTMLElement).offsetHeight;
        });
      }
      
      // Calculate bottom offset (sticky footer + paginator)
      let bottomOffset = 0;
      
      if (this.stickyFooter) {
        const footerRow = table.querySelector('.mat-mdc-footer-row');
        if (footerRow) {
          bottomOffset += (footerRow as HTMLElement).offsetHeight;
        }
      }
      
      // Set base offsets
      table.style.setProperty('--pinned-top-base-offset', `${topOffset}px`);
      table.style.setProperty('--pinned-bottom-base-offset', `${bottomOffset}px`);
      
      // Calculate and set individual row offsets for stacked pinned rows
      this.updateStackedPinnedRowOffsets(table, topOffset, bottomOffset);
      // After offsets are updated, ensure column sizes are re-synced
      if (this.enableRowPinning) {
        setTimeout(() => this.syncColumnSizesFromTop(), 10);
      }
      
      console.log('Pinned row offsets:', { topOffset, bottomOffset });
    }, 100);
  }

  /**
   * @description Update offsets for each individual pinned row to stack them
   */
  private updateStackedPinnedRowOffsets(table: HTMLElement, baseTopOffset: number, baseBottomOffset: number): void {
    // Use setTimeout to ensure DOM is fully rendered with pinned classes
    setTimeout(() => {
      // Handle top pinned rows - stack them from top to bottom
      const topPinnedRows = table.querySelectorAll('.pinned-top-row');
      let currentTopOffset = baseTopOffset;
      
      topPinnedRows.forEach((row: Element, index: number) => {
        const htmlRow = row as HTMLElement;
        htmlRow.style.setProperty('--pinned-row-top-offset', `${currentTopOffset}px`);
        htmlRow.style.top = `${currentTopOffset}px`;
        
        // Add current row height to offset for next row
        if (index < topPinnedRows.length - 1) {
          currentTopOffset += htmlRow.offsetHeight;
        }
      });
      
      // Handle bottom pinned rows - stack them from bottom to top
      const bottomPinnedRows = table.querySelectorAll('.pinned-bottom-row');
      let currentBottomOffset = baseBottomOffset;
      
      // Process bottom rows in reverse order (from bottom to top)
      for (let i = bottomPinnedRows.length - 1; i >= 0; i--) {
        const htmlRow = bottomPinnedRows[i] as HTMLElement;
        htmlRow.style.setProperty('--pinned-row-bottom-offset', `${currentBottomOffset}px`);
        htmlRow.style.bottom = `${currentBottomOffset}px`;
        
        // Add current row height to offset for next row (going upward)
        if (i > 0) {
          currentBottomOffset += htmlRow.offsetHeight;
        }
      }
      // After stacking offsets are applied, re-sync column sizes to handle any layout changes
      if (this.enableRowPinning) {
        setTimeout(() => this.syncColumnSizesFromTop(), 60);
      }
    }, 50);
  }

  private onWindowResizeBound = () => {
    this.updatePinnedRowOffsets();
    this.syncColumnSizesFromTop();
  };

  /**
   * Copy header cell widths/heights from the top table and apply them to middle and bottom tables.
   * This ensures columns line up when the middle/bottom tables don't render headers.
   */
  private syncColumnSizesFromTop(): void {
    if (!this.enableRowPinning) return;

    try {
      const topId = `matTableExtTop${this.tableID}`;
      const bottomId = `matTableExtBtm${this.tableID}`;
      const topTable = document.getElementById(topId) as HTMLElement | null;
      const middleTable = document.getElementById(`matTableExt${this.tableID}`) as HTMLElement | null;
      const bottomTable = document.getElementById(bottomId) as HTMLElement | null;

      if (!topTable) return;

      const headerRow = topTable.querySelector(
        'tr.mat-mdc-header-row:not(.group-header-row), tr.mat-header-row:not(.group-header-row), thead tr:not(.group-header-row)'
      ) as HTMLElement | null;

      if (!headerRow) return;

      const headerCells = Array.from(headerRow.querySelectorAll('th, .mat-header-cell')) as HTMLElement[];
      if (!headerCells.length) return;

      const topTableWidth = topTable.getBoundingClientRect().width;
      [middleTable, bottomTable].forEach(tbl => {
        if (!tbl) return;
        tbl.style.width = topTable.style.width && topTable.style.width !== '' ? topTable.style.width : `${topTableWidth}px`;
      });

      // Use the header row height as the canonical row height to apply
      const headerRowHeight = Math.round(headerRow.getBoundingClientRect().height);

      headerCells.forEach((hc, index) => {
        const rect = hc.getBoundingClientRect();
        const w = Math.round(rect.width);

        [middleTable, bottomTable].forEach(tbl => {
          if (!tbl) return;

          // If a placeholder header exists in the target table, set its cell sizes
          const placeholderHeader = tbl.querySelector('tr.mat-mdc-header-row, tr.mat-header-row') as HTMLElement | null;
          if (placeholderHeader) {
            const phCells = placeholderHeader.querySelectorAll('th, .mat-header-cell');
            if (phCells && phCells[index]) {
              const el = phCells[index] as HTMLElement;
              el.style.minWidth = `${w}px`;
              el.style.maxWidth = `${w}px`;
              el.style.boxSizing = 'border-box';
              el.style.height = `${headerRowHeight}px`;
              el.style.minHeight = `${headerRowHeight}px`;
              el.style.maxHeight = `${headerRowHeight}px`;
            }
          }

          // Apply widths/heights directly to data cells (in case header placeholder is not present)
          const dataRow = tbl.querySelector('tr.mat-mdc-row, tr.mat-row') as HTMLElement | null;
          if (dataRow) {
            const dataCells = dataRow.querySelectorAll('td, .mat-cell');
            if (dataCells && dataCells[index]) {
              const cel = dataCells[index] as HTMLElement;
              cel.style.minWidth = `${w}px`;
              cel.style.maxWidth = `${w}px`;
              cel.style.boxSizing = 'border-box';
              cel.style.height = `${headerRowHeight}px`;
              cel.style.minHeight = `${headerRowHeight}px`;
              cel.style.maxHeight = `${headerRowHeight}px`;
            }

            // Set every data row's height to match the header row height for visual alignment
            const rows = tbl.querySelectorAll('tr.mat-mdc-row, tr.mat-row');
            rows.forEach((r: Element) => {
              const reh = r as HTMLElement;
              reh.style.height = `${headerRowHeight}px`;
              reh.style.minHeight = `${headerRowHeight}px`;
              reh.style.maxHeight = `${headerRowHeight}px`;
            });
          }
        });
      });
    } catch (err) {
      console.warn('syncColumnSizesFromTop failed', err);
    }
  }

  /**
   * Sync column sizes from the currently edited row in the middle table to top/bottom tables.
   * This ensures proper alignment when a row is in edit mode with different height.
   */
  private syncColumnSizesFromEditedRow(editedRowIndex: number): void {
    if (!this.enableRowPinning) return;

    try {
      const topTable = document.getElementById(`matTableExtTop${this.tableID}`) as HTMLElement | null;
      if (!topTable) return;

      // Capture original sizes from the top table header before modifying
      if (!this.originalSizesBeforeEdit) {
        const headerRow = topTable.querySelector(
          'tr.mat-mdc-header-row:not(.group-header-row), tr.mat-header-row:not(.group-header-row)'
        ) as HTMLElement | null;

        if (headerRow) {
          const headerCells = Array.from(headerRow.querySelectorAll('th, .mat-header-cell')) as HTMLElement[];
          const headerRowHeight = Math.round(headerRow.getBoundingClientRect().height);
          const columnWidths = headerCells.map(cell => Math.round(cell.getBoundingClientRect().width));
          
          this.originalSizesBeforeEdit = {
            columnWidths,
            rowHeight: headerRowHeight
          };
        }
      }

      const middleTable = document.getElementById(`matTableExt${this.tableID}`) as HTMLElement | null;
      const bottomTable = document.getElementById(`matTableExtBtm${this.tableID}`) as HTMLElement | null;

      if (!middleTable || !topTable) return;

      // Find the edited row in the middle table
      const editedRow = middleTable.querySelector(`tr.mat-mdc-row:nth-child(${editedRowIndex + 1})`) as HTMLElement | null;
      if (!editedRow) {
        // Fallback to normal sync if edited row not found
        this.syncColumnSizesFromTop();
        return;
      }

      const editedCells = Array.from(editedRow.querySelectorAll('td, .mat-cell')) as HTMLElement[];
      if (!editedCells.length) return;

      // Get the height of the edited row
      const editedRowHeight = Math.round(editedRow.getBoundingClientRect().height);

      // Sync widths and heights from edited row to top and bottom tables
      // First, collect all widths in a single pass (layout read)
      const cellWidths = editedCells.map(cell => Math.round(cell.getBoundingClientRect().width));

      // Then, apply style changes in a separate pass (layout write)
      cellWidths.forEach((w, index) => {
        [topTable, bottomTable].forEach(tbl => {
          if (!tbl) return;

          // Update header cells in top table
          if (tbl === topTable) {
            const headerRow = tbl.querySelector('tr.mat-mdc-header-row:not(.group-header-row), tr.mat-header-row:not(.group-header-row)') as HTMLElement | null;
            if (headerRow) {
              const headerCells = headerRow.querySelectorAll('th, .mat-header-cell');
              if (headerCells && headerCells[index]) {
                const hc = headerCells[index] as HTMLElement;
                hc.style.minWidth = `${w}px`;
                hc.style.maxWidth = `${w}px`;
                hc.style.boxSizing = 'border-box';
              }
            }
          }

          // Update data cells in both tables
          const dataRow = tbl.querySelector('tr.mat-mdc-row, tr.mat-row') as HTMLElement | null;
          if (dataRow) {
            const dataCells = dataRow.querySelectorAll('td, .mat-cell');
            if (dataCells && dataCells[index]) {
              const dc = dataCells[index] as HTMLElement;
              dc.style.minWidth = `${w}px`;
              dc.style.maxWidth = `${w}px`;
              dc.style.boxSizing = 'border-box';
            }

            // Set all data rows' height to match the edited row height
            // const rows = tbl.querySelectorAll('tr.mat-mdc-row, tr.mat-row');
            // rows.forEach((r: Element) => {
            //   const reh = r as HTMLElement;
            //   reh.style.height = `${editedRowHeight}px`;
            //   reh.style.minHeight = `${editedRowHeight}px`;
            //   reh.style.maxHeight = `${editedRowHeight}px`;
            // });
          }
        });
      });
    } catch (err) {
      console.warn('syncColumnSizesFromEditedRow failed', err);
    }
  }

  /**
   * Restore original column widths and row heights from before edit mode.
   */
  private restoreOriginalSizes(): void {
    if (!this.enableRowPinning || !this.originalSizesBeforeEdit) return;

    try {
      const topTable = document.getElementById(`matTableExtTop${this.tableID}`) as HTMLElement | null;
      const middleTable = document.getElementById(`matTableExt${this.tableID}`) as HTMLElement | null;
      const bottomTable = document.getElementById(`matTableExtBtm${this.tableID}`) as HTMLElement | null;

      if (!topTable) return;

      const { columnWidths, rowHeight } = this.originalSizesBeforeEdit;

      [topTable, middleTable, bottomTable].forEach(tbl => {
        if (!tbl) return;

        // Restore header cells in top table
        if (tbl === topTable) {
          const headerRow = tbl.querySelector(
            'tr.mat-mdc-header-row:not(.group-header-row), tr.mat-header-row:not(.group-header-row)'
          ) as HTMLElement | null;
          if (headerRow) {
            const headerCells = Array.from(headerRow.querySelectorAll('th, .mat-header-cell')) as HTMLElement[];
            headerCells.forEach((cell, index) => {
              if (columnWidths[index] !== undefined) {
                const w = columnWidths[index];
                cell.style.minWidth = `${w}px`;
                cell.style.maxWidth = `${w}px`;
                cell.style.boxSizing = 'border-box';
                cell.style.height = `${rowHeight}px`;
                cell.style.minHeight = `${rowHeight}px`;
                cell.style.maxHeight = `${rowHeight}px`;
              }
            });
          }
        }

        // Restore data cells
        const dataRow = tbl.querySelector('tr.mat-mdc-row, tr.mat-row') as HTMLElement | null;
        if (dataRow) {
          const dataCells = Array.from(dataRow.querySelectorAll('td, .mat-cell')) as HTMLElement[];
          dataCells.forEach((cell, index) => {
            if (columnWidths[index] !== undefined) {
              const w = columnWidths[index];
              cell.style.minWidth = `${w}px`;
              cell.style.maxWidth = `${w}px`;
              cell.style.boxSizing = 'border-box';
              cell.style.height = `${rowHeight}px`;
              cell.style.minHeight = `${rowHeight}px`;
              cell.style.maxHeight = `${rowHeight}px`;
            }
          });

          // Restore all data rows' height
          const rows = tbl.querySelectorAll('tr.mat-mdc-row, tr.mat-row');
          rows.forEach((r: Element) => {
            const reh = r as HTMLElement;
            reh.style.height = `${rowHeight}px`;
            reh.style.minHeight = `${rowHeight}px`;
            reh.style.maxHeight = `${rowHeight}px`;
          });
        }
      });

      // Clear the stored sizes
      this.originalSizesBeforeEdit = null;
    } catch (err) {
      console.warn('restoreOriginalSizes failed', err);
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowResizeBound);
  }
  /**
   * @description checks and updates the the column's hide and show properties.
   */
  setColumnHideShow() {
    if (
      this.hideShowMenuGroup !== undefined &&
      this.hideShowMenuGroup !== null
    ) {
      this.updateColumnsHideShow(this.hideShowMenuGroup.value);
    }
  }
  /**
   * @description set the properties of the table.
   * @param changes changes captured each time user changes property value.
   */
  setPropertyValue(changes: SimpleChanges) {
    let keys = Object.keys(changes);
    keys.forEach((property) => {
      if (this.inputPropertyKeys.includes(property)) {
        this.setPropertiesMap[property](changes[property]);
        setTimeout(() => this.syncColumnSizesFromTop(), 80);
      } else if (property == 'showToolbar') {
        if (changes['columns']) {
          this.setToolbarMenuControls(changes['columns'].currentValue);
        } else {
          this.setToolbarMenuControls(this.columnsArray);
        }
      }
    });
  }
  /**
   * @description This mapping is used to set and update changesin the table.
   */
  setPropertiesMap: Record<string, (value: SimpleChange) => void> = {
    dataSource: (value: SimpleChange) => this.setTableDataSource(value),
    columns: (value: SimpleChange) => this.setColumnsData(value.currentValue),
    inlineRowEditing: (value: SimpleChange) =>
      this.showHideColumn('edit', value.currentValue),
    popupRowEditing: (value: SimpleChange) =>
      this.showHideColumn('popup', value.currentValue),
    enableDelete: (value: SimpleChange) =>
      this.showHideColumn('delete', value.currentValue),
    enableRowFreezing: (value: SimpleChange) =>
      this.showHideColumn('freeze', value.currentValue),
    enableRowHiding: (value: SimpleChange) =>
      this.showHideColumn('hide', value.currentValue),
    enableRowPinning: (value: SimpleChange) => {
      this.showHideColumn('pin', value.currentValue);
      if (value.currentValue) {
        this.initializePinnedRows();
      }
    },
    rowSelection: (value: SimpleChange) => this.setRowSelection(value.currentValue),
    multiRowSelection: (value: SimpleChange) => {
      this.selection = new SelectionModel<T>(value.currentValue, []);
    },
    stickyHeader: (value: SimpleChange) => {
      this.stickyHeader = value.currentValue;
      // Recalculate pinned row offsets when sticky header changes
      setTimeout(() => this.updatePinnedRowOffsets(), 100);
    },
    stickyFooter: (value: SimpleChange) => {
      this.stickyFooter = value.currentValue;
      // Recalculate pinned row offsets when sticky footer changes
      setTimeout(() => this.updatePinnedRowOffsets(), 100);
    },
    columnFilter: (value: SimpleChange) => this.setColumnFilter(value.currentValue),
    globalSearch: (value: SimpleChange) =>
      (this.dataSource.filterPredicate = this.createFilter()),
    expandRows: (value: SimpleChange) => {
      this.loadingIndicator = true;
      this.dataSource = new MatTableDataSource(this.tableData);
      if (value.currentValue == true) {
        if (!this.displayedColumns.includes('expand')) {
          this.displayedColumns.push('expand');
          this.columnsToDisplayWithExpand = [...this.displayedColumns];
        }
      } else {
        this.columnsToDisplayWithExpand = [...this.displayedColumns];
        if (this.displayedColumns.includes('expand')) {
          let index = this.displayedColumns.indexOf('expand');
          this.displayedColumns.splice(index, 1);
        }
        this.expandedElement = null;
      }
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 200);
    },
    sorting: (value: SimpleChange) => {
      this.dataSource.sort = this.sort;
      if (this.enableRowPinning) {
        this.pinnedTopDataSource.sort = this.sort;
        this.pinnedBtmDataSource.sort = this.sort;
      }
    },
    columnGroups: (value: SimpleChange) => {
      this.columnGroups = value.currentValue || [];
      this.cdr.detectChanges();
      // When group headers change, re-sync column sizes for pinned tables
      if (this.enableRowPinning) {
        setTimeout(() => this.syncColumnSizesFromTop(), 80);
      }
    },
  };
  /**
   * @description used set data source for table.
   * @param value data source value from user.
   */
  setTableDataSource(value: SimpleChange) {
    if (value.currentValue) {
      this.tableData = value.currentValue.data;
      this.dataSource = value.currentValue;
      this.reCal();
    } else {
      this.dataSource = new MatTableDataSource([{} as T]);
    }
  }
  /**
   * @description used create seletion model and set selection column visibility.
   * @param value boolean value to show or hide selection Column from table.
   */
  setRowSelection(value: boolean) {
    this.selection = new SelectionModel<T>(true, []);
    this.updateSelectionColumnVisibility(value);
  }

  /**
   * @description create filter header row and assigns filter predicate to table data source.
   * @param value boolean value to change  visibility of column filter row.
   */
  setColumnFilter(value: boolean) {
    if (value) {
      let array: string[] = [];
      this.columnsArray.forEach((column, i) => {
        if (
          this.dynamicDisplayedColumns.filter((a) => a.name == column?.field)[0]
            .show
        ) {
          array.push(column?.field + '_' + i);
        }
      });
      this.headersFiltersIds = array;
      this.dataSource.filterPredicate = this.createFilter();
    } else {
      this.headersFiltersIds = [];
      this.dataSource.filter = '';
    }
    this.toggleFilters = value;
    setTimeout(() => this.syncColumnSizesFromTop(), 150);
  }
  /**
   * @description This method returns the list of visible column names.
   * @returns list of visible column names.
   */
  getDisplayedColumns(): string[] {
    if (this.columnGroups.length === 0) {
      // No groups, place select at start and other action columns at the end
      const actionColumns = ['select', 'edit', 'popup', 'delete', 'freeze', 'hide', 'pin'];
      const visibleColumns = this.dynamicDisplayedColumns.filter((cd) => cd.show);
      const dataColumns = visibleColumns.filter((cd) => !actionColumns.includes(cd.name)).map((cd) => cd.name);
      const selectCol = visibleColumns.find((cd) => cd.name === 'select');
      const otherActionCols = visibleColumns.filter((cd) => actionColumns.includes(cd.name) && cd.name !== 'select').map((cd) => cd.name);
      
      const result = [];
      if (selectCol) result.push('select');
      result.push(...dataColumns);
      result.push(...otherActionCols);
      return result;
    }
    
    // When groups exist, reorder: select first, grouped columns, ungrouped columns, then other action columns
    const actionColumns = ['select', 'edit', 'popup', 'delete', 'freeze', 'hide', 'pin'];
    const groupedFields = new Set<string>();
    
    // Collect all fields that belong to groups
    this.columnGroups.forEach(group => {
      group.columns.forEach(colField => groupedFields.add(colField));
    });
    
    const result: string[] = [];
    const visibleColumns = this.dynamicDisplayedColumns.filter((cd) => cd.show);
    
    // Add select column first if visible
    const selectCol = visibleColumns.find(c => c.name === 'select');
    if (selectCol) {
      result.push('select');
    }
    
    // Add grouped columns in the order they appear in groups
    this.columnGroups.forEach(group => {
      group.columns.forEach(colField => {
        const col = visibleColumns.find(c => c.name === colField);
        if (col && !result.includes(col.name)) {
          result.push(col.name);
        }
      });
    });
    
    // Add ungrouped data columns
    visibleColumns.forEach(col => {
      if (!actionColumns.includes(col.name) && !groupedFields.has(col.name) && !result.includes(col.name)) {
        result.push(col.name);
      }
    });
    
    // Add other action columns at the end (excluding select which is already at start)
    visibleColumns.forEach(col => {
      if (actionColumns.includes(col.name) && col.name !== 'select' && !result.includes(col.name)) {
        result.push(col.name);
      }
    });
    
    return result;
  }
  /**
   * @description This method returns the grouped column header definitions.
   * @returns list of grouped column definitions for header row.
   */
  getGroupedColumns(): string[] {
    if (this.columnGroups.length === 0) return [];
    
    const grouped: string[] = [];
    const groupedFields = new Set<string>();
    const actionColumns = ['select', 'edit', 'popup', 'delete', 'freeze', 'hide', 'pin'];
    
    // Collect all fields that belong to groups
    this.columnGroups.forEach(group => {
      group.columns.forEach(colField => groupedFields.add(colField));
    });
    
    // Add group headers for groups with visible columns
    this.columnGroups.forEach(group => {
      const visibleColumnsInGroup = group.columns.filter(colField => {
        const displayCol = this.dynamicDisplayedColumns.find(dc => dc.name === colField);
        return displayCol && displayCol.show;
      });
      
      if (visibleColumnsInGroup.length > 0) {
        grouped.push('group-' + group.name);
      }
    });
    
    // Add empty header placeholders for ungrouped columns at the end
    this.columnsArray.forEach(col => {
      if (!groupedFields.has(col.field) && !actionColumns.includes(col.field)) {
        const displayCol = this.dynamicDisplayedColumns.find(dc => dc.name === col.field);
        if (displayCol && displayCol.show) {
          grouped.push('ungrouped-' + col.field);
        }
      }
    });

    // Add placeholders for visible action columns so group header row has cells to align with action columns
    const actionPlaceholders = ['select', 'edit', 'popup', 'delete', 'freeze', 'hide', 'pin'];
    actionPlaceholders.forEach(act => {
      const display = this.dynamicDisplayedColumns.find(dc => dc.name === act);
      if (display && display.show) {
        grouped.push('ungrouped-' + act);
      }
    });
    
    return grouped;
  }

  /**
   * @description Returns filter column IDs including placeholders for action columns
   * @returns Array of filter column IDs with action column placeholders
   */
  getFilterColumns(): string[] {
    const filters: string[] = [];
    const actionColumns = ['select', 'edit', 'popup', 'delete', 'freeze', 'hide', 'pin'];
    
    // Get visible columns in display order
    const displayedCols = this.getDisplayedColumns();
    
    displayedCols.forEach(colName => {
      if (actionColumns.includes(colName)) {
        // Add filter placeholder for action column
        filters.push('filter-' + colName);
      } else {
        // Find the actual filter ID from headersFiltersIds
        const filterCol = this.headersFiltersIds.find(id => id.startsWith(colName + '_'));
        if (filterCol) {
          filters.push(filterCol);
        }
      }
    });
    
    return this.columnFilter ? filters : [];
  }
  /**
   * @param menuType type of menu to open from toolbar.
   * @param event mouse event to open menu on that location.
   */
  openMenu(menuType: string, event: MouseEvent) {
    this.menuX = event.clientX;
    this.menuY = event.clientY;
    switch (menuType) {
      case 'export': {
        this.exportMenuCtrl = true;
        this.menuTrigger.openMenu();
        break;
      }
      case 'hideShow': {
        this.hideShowMenuCtrl = true;
        this.openHideShowMenu(this.columnsArray);
        break;
      }
      case 'columnPin': {
        this.columnPinMenuCtrl = true;
        this.openHideShowMenu(this.columnsArray);
        break;
      }
    }
  }
  /**
   * @description triggers when menu is closed and reset the required controls.
   */
  menuClosed() {
    this.exportMenuCtrl = false;
  }
  /**
   * @description set list of columns to display in table.
   * @param columns columns array from user input.
   */
  setColumnsData(columns: MTExColumn<T>[]) {
    if (columns.length) {
      this.columnsArray = [...columns];
      this.setColumnsList(columns);
      this.setToolbarMenuControls(columns);
    }
  }
  /**
   * @description set list of columns to display in table.
   * @param columns columns array from user input with configurations.
   */
  setColumnsList(columns: MTExColumn<T>[]) {
    this.columnsList = [];
    this.displayedColumns = ['select', 'edit', 'popup', 'delete', 'freeze', 'hide', 'pin'];
    let columnsArray: DisplayColumn[] = [];
    columns.forEach((col) => {
      if (typeof col?.header == 'string') {
        this.columnsList.push(col?.header);
        this.displayedColumns.push(col?.field);
        columnsArray.push({ filter: true, name: col?.field, show: !col.hide });
      }
    });
    
    // Preserve the current state of action columns before resetting
    const currentActionColumns = this.dynamicDisplayedColumns.filter(dc => 
      ['select', 'edit', 'popup', 'delete', 'freeze', 'hide', 'pin'].includes(dc.name)
    );
    
    // Create new action columns array, preserving existing states
    const newActionColumns = [
      { filter: false, name: 'select', show: false },
      { filter: false, name: 'edit', show: false },
      { filter: false, name: 'popup', show: false },
      { filter: false, name: 'delete', show: false },
      { filter: false, name: 'freeze', show: false },
      { filter: false, name: 'hide', show: false },
      { filter: false, name: 'pin', show: false },
    ].map(actionCol => {
      const existing = currentActionColumns.find(c => c.name === actionCol.name);
      return existing ? { ...existing } : actionCol;
    });
    
    this.dynamicDisplayedColumns = columnsArray.concat(newActionColumns);
    // After updating columns, ensure sizes match the top header (if pinning enabled)
    if (this.enableRowPinning) {
      setTimeout(() => this.syncColumnSizesFromTop(), 80);
    }
  }
  /**
   * @description Take boolean value and name column and update its visibility status in table.
   * @param name name of the column to set visibility.
   * @param value boolean value to set visibility of the column.
   */
  showHideColumn(name: string, value: boolean) {
    const column = this.dynamicDisplayedColumns.filter((a) => a.name == name)[0];
    if (column) {
      column.show = value;
      if (this.enableRowPinning) {
        this.syncColumnSizesFromTop();
      }
    }
    if (this.columnFilter) {
      this.setColumnFilter(true);
    }
  }



  /**
   * @description Toggle hide state for a specific row
   * @param index The row index to hide/unhide
   */
  toggleRowHide(index: number): void {
    const hiddenIndex = this.hiddenRowIndices.indexOf(index);
    if (hiddenIndex > -1) {
      // Unhide the row
      this.hiddenRowIndices.splice(hiddenIndex, 1);
    } else {
      // Hide the row
      this.hiddenRowIndices.push(index);
    }
    // Trigger change detection
    this.hiddenRowIndices = [...this.hiddenRowIndices];
  }

  /**
   * @description Check if a row index is in the hidden rows list or matches the filter function.
   * @param index The row index to check
   * @returns True if the row is hidden
   */
  isRowHidden(index: number): boolean {
    // Check explicit hidden indices
    if (this.hiddenRowIndices.includes(index)) {
      return true;
    }
    
    // Check filter function if provided
    if (this.rowHidingFilterFn && this.dataSource?.data?.[index]) {
      return this.rowHidingFilterFn(this.dataSource.data[index], index);
    }
    
    return false;
  }

  /**
   * @description Unhide all hidden rows
   */
  unhideAllRows(): void {
    this.hiddenRowIndices = [];
  }

  /**
   * @description Open row pin menu
   * @param event Mouse event
   * @param row The row to pin
   */
  openRowPinMenu(event: MouseEvent, row: T): void {
    event.stopPropagation();
    this.rowPinMenuPosition = {
      x: event.clientX + 'px',
      y: event.clientY + 'px'
    };
    this.rowPinMenuRow = row;
  }

  /**
   * @description Close row pin menu
   */
  closeRowPinMenu(): void {
    this.rowPinMenuRow = null;
  }

  pinnedTopDataSource: MatTableDataSource<T> = new MatTableDataSource<T>([]);
  pinnedBtmDataSource: MatTableDataSource<T> = new MatTableDataSource<T>([]);

  /**
   * @description Pin row to top or bottom
   * @param row The row to pin
   * @param position 'top' or 'bottom'
   */
  pinRow(row: T, position: 'top' | 'bottom'): void {
    console.log('pinRow called:', { row, position, enableRowPinning: this.enableRowPinning });
    
    // Remove from other position if exists
    this.unpinRow(row);
    
    // Mark the row with pinning metadata
    (row as Record<string, unknown>)['_pinnedPosition'] = position;
    
    // Add to the selected position
    if (position === 'top') {
      if (!this.pinnedTopRows.includes(row)) {
        this.pinnedTopRows.push(row);
      }
      this.pinnedTopDataSource = new MatTableDataSource(this.pinnedTopRows);
    } else {
      if (!this.pinnedBottomRows.includes(row)) {
        this.pinnedBottomRows.push(row);
      }
      this.pinnedBtmDataSource = new MatTableDataSource(this.pinnedBottomRows);
    }
    
    console.log('After pinning:', { 
      pinnedTopRows: this.pinnedTopRows, 
      pinnedBottomRows: this.pinnedBottomRows,
      topLength: this.pinnedTopRows.length,
      bottomLength: this.pinnedBottomRows.length
    });
    
    this.rowPinningChange.emit({ row, position });
    this.closeRowPinMenu();
    this.updateDataSourceForPinning();
  }

  /**
   * @description Unpin row from any position
   * @param row The row to unpin
   */
  unpinRow(row: T): void {
    const topIndex = this.pinnedTopRows.indexOf(row);
    if (topIndex > -1) {
      this.pinnedTopRows.splice(topIndex, 1);
      this.pinnedTopDataSource = new MatTableDataSource(this.pinnedTopRows);
    }
    
    const bottomIndex = this.pinnedBottomRows.indexOf(row);
    if (bottomIndex > -1) {
      this.pinnedBottomRows.splice(bottomIndex, 1);
      this.pinnedBtmDataSource = new MatTableDataSource(this.pinnedBottomRows);
    }
    
    // Clear pinning metadata
    delete (row as Record<string, unknown>)['_pinnedPosition'];
    
    // Update the data source to trigger re-render
    this.updateDataSourceForPinning();
    
    this.rowPinningChange.emit({ row, position: null });
    this.closeRowPinMenu();
  }

  /**
   * @description Check if a row is pinned
   * @param row The row to check
   * @returns true if pinned
   */
  isRowPinned(row: T): boolean {
    return this.pinnedTopRows.includes(row) || this.pinnedBottomRows.includes(row);
  }

  /**
   * @description Get row pin position
   * @param row The row to check
   * @returns 'top', 'bottom', or null
   */
  getRowPinPosition(row: any): 'top' | 'bottom' | null {
    if (this.pinnedTopRows.includes(row)) return 'top';
    if (this.pinnedBottomRows.includes(row)) return 'bottom';
    return null;
  }

  /**
   * @description Get rows for main data section (excluding pinned rows)
   * @returns Array of non-pinned rows
   */
  getUnpinnedRows(): any[] {
    if (!this.dataSource?.data) return [];
    return this.dataSource.data.filter(row => 
      !this.pinnedTopRows.includes(row) && !this.pinnedBottomRows.includes(row)
    );
  }

  /**
   * @description Get combined data source with pinned rows
   */
  getCombinedDataSource(): any[] {
    if (!this.enableRowPinning || !this.dataSource?.data) {
      return this.dataSource?.data || [];
    }
    
    // Combine: pinnedTop + regular + pinnedBottom
    return [
      ...this.pinnedTopRows,
      ...this.dataSource.data.filter(row => !this.isRowPinned(row)),
      ...this.pinnedBottomRows
    ];
  }

  /**
   * @description Check if row is pinned to top (for CSS class binding)
   */
  isRowPinnedTop=(row: any): boolean=> {
    return this.pinnedTopRows.includes(row);
  }

  /**
   * @description Check if row is pinned to bottom (for CSS class binding)
   */
  isRowPinnedBottom = (row: any): boolean => {
    return this.pinnedBottomRows.includes(row);
  }

  /**
   * @description Initialize pinned rows based on function
   */
  initializePinnedRows(): void {
    if (!this.rowPinningFn || !this.dataSource?.data) return;
    
    this.pinnedTopRows = [];
    this.pinnedBottomRows = [];
    
    this.dataSource.data.forEach((row, index) => {
      const position = this.rowPinningFn!(row, index);
      if (position === 'top') {
        (row as Record<string, unknown>)['_pinnedPosition'] = 'top';
        this.pinnedTopRows.push(row);
      } else if (position === 'bottom') {
        (row as Record<string, unknown>)['_pinnedPosition'] = 'bottom';
        this.pinnedBottomRows.push(row);
      }
    });
    
    this.cdr.detectChanges();
  }

  /**
   * @description Update data source and recalculate pinned row offsets
   */
  private updateDataSourceForPinning(): void {
    // Trigger change detection
    this.cdr.detectChanges();
    
    // Force table to re-render rows
    if (this.table) {
      this.table.renderRows();
    }
    
    // Update offsets for sticky positioning
    this.updatePinnedRowOffsets();
  }

  /**
   * @description This method will position the selection column to first and also update its visibility.
   * @param value value used to set visibility of the selection column.
   */
  updateSelectionColumnVisibility(value: boolean) {
    let columnName = 'select';
    let column = this.dynamicDisplayedColumns.filter(
      (a) => a.name == columnName
    )[0];
    let index = this.dynamicDisplayedColumns.findIndex(
      (column: any) => column.name == columnName
    );
    if (index > -1) {
      this.dynamicDisplayedColumns.splice(index, 1);
      this.dynamicDisplayedColumns.unshift(column);
      this.dynamicDisplayedColumns.filter(
        (column) => column.name == columnName
      )[0].show = value;
    }
  }
  /**
   * @description This method is used to update the position of  column in columns array according to its dropped position.
   * @param event CdkDragDrop used to update column position in columns array.
   */
  onDrop(event: CdkDragDrop<any>) {
    if (this.dndColumns) {
      let adjustedValue = 0;
      if (
        this.dynamicDisplayedColumns[0].name == 'select' &&
        this.dynamicDisplayedColumns[0].show == false
      ) {
        adjustedValue = 1;
      }
      moveItemInArray(
        this.dynamicDisplayedColumns,
        event.previousIndex + adjustedValue,
        event.currentIndex + adjustedValue
      );
      if (this.enableRowPinning) {
        setTimeout(() => this.syncColumnSizesFromTop(), 80);
      }
    }
  }
  /**
   * @description This method create filter predicate function which will set search value to table filters
   * for both global and individual colum filtering.
   * @returns returns boolean value to filter rows in table.
   */
  createFilter(): (data: any, filter: string) => boolean {
    const tableFilterPredicate = (data: any, filter: string): boolean => {
      let result: boolean = true;
      // search all column fields
      if (this.globalFilter) {
        let expression = '';
        let keys = Object.keys(data);
        keys.forEach((key) => {
          expression =
            expression +
            `data.${key}.toString().trim().toLowerCase().indexOf(this.globalFilter.toLowerCase()) !== -1 ||`;
        });
        if (
          expression.charAt(expression.length - 2) +
            expression.charAt(expression.length - 1) ==
          '||'
        ) {
          expression = expression.substring(0, expression.length - 2);
        }
        result = eval(expression);
      }
      if (!result) {
        return false;
      }
      let searchString = JSON.parse(filter);
      //search single column field
      if (this.individualFilter) {
        return (
          data[this.individualFilter]
            .toString()
            .trim()
            .toLowerCase()
            .indexOf(
              searchString[this.individualFilter].toString().toLowerCase()
            ) !== -1
        );
      }
      return true;
    };
    return tableFilterPredicate;
  }
  /**
   * @description assigns the search value to mat table data source to apply the filter.
   * @param searchValue value to be searched from table rows.
   */
  applyGlobalFilter(searchValue: string) {
    this.globalFilter = searchValue;
    const columns: Record<string, string> = {};
    this.columnsArray.forEach((column: MTExColumn<T>) => {
      if (column.field) columns[column.field] = searchValue;
    });
    this.dataSource.filter = JSON.stringify(columns);
  }
  /**
   * @description This method is used to apply column based filtering
   * @param searchValue value to be searched from table rows.
   * @param column filter will be applied based on this column field.
   */
  applyColumnFilter(searchValue: FilterSearchValue, column: MTExColumn<T>) {
    this.individualFilter = column.field;
    const value = searchValue[column.field];
    if (value !== undefined && value !== null) {
      this.filterValues[column.field] = value as string | number | boolean;
    }
    this.dataSource.filter = JSON.stringify(this.filterValues);
    if (this.enableRowPinning) {
      setTimeout(() => this.syncColumnSizesFromTop(), 80);
    }
  }
  /**
   * @description This method will take row and its index enable inline editing tools on that row.
   * @param row row on which user wants to do edit.
   * @param index index of the row where inline editing will be enabled.
   */
  enableInlineEditing(row: any, index: number) {
    // Check if another row is currently in edit mode
    const currentEditIndex = this.tableData.findIndex((r: any) => r['editable'] === true);
    
    if (currentEditIndex !== -1 && currentEditIndex !== index) {
      // Disable the previous row's edit mode
      (this.tableData[currentEditIndex] as any)['editable'] = false;
      // Clear the temporary data for the previous row
      this.rowDataTemp['e' + currentEditIndex] = {} as T;
      // Restore original sizes when switching rows
      if (this.enableRowPinning && this.originalSizesBeforeEdit) {
        this.restoreOriginalSizes();
      }
    }
    
    const rowData: any = {};
    rowData['e' + index] = { ...row };
    this.rowDataTemp = rowData;
    
    setTimeout(() => {
      const wasEditable = (this.tableData[index] as any)['editable'];
      (this.tableData[index] as any)['editable'] = !(this.tableData[index] as any)['editable'];
      
      // If row is now in edit mode, sync sizes from this edited row
      if ((this.tableData[index] as any)['editable'] && this.enableRowPinning) {
        // Wait for DOM to update with edit controls
        setTimeout(() => {
          this.syncColumnSizesFromEditedRow(index);
        }, 100);
      } else if (!(this.tableData[index] as any)['editable'] && this.enableRowPinning) {
        // Row was disabled, restore original sizes
        this.restoreOriginalSizes();
      }
    }, 0);
  }
  /**
   * @description This method will create and return data to inline editing template.
   * @param row row on which user wants to do edit.
   * @param index index of the row where inline editing will be enabled.
   * @param column current column of the table.
   */
  getInlineEditingData(row: MTExRow, index: number, column: MTExColumn<T>) {
    this.inlineEditingTemplateRefData = {
      row: { ...row },
      column: { ...column },
      index: index,
      updateFunc: this.updateInlineTemplateData,
    };
    return this.inlineEditingTemplateRefData;
  }
  /**
   * @description This method will take data from inline editing template and update in table data source.
   * @param row updated row from inline editing template.
   */
  updateInlineTemplateData = (row: MTExRow) => {
    this.service.selectedRow.next(row as T);
  };
  /**
   * @description This method set data for in-cell editing.
   * @param row row on which user wants to do edit.
   * @param index index of the row where inline editing will be enabled.
   */
  setCellData(row: MTExRow, index: number) {
    // If there's already an inline edit in progress, cancel it first
    if (this.currentRowIndex !== -1 && this.currentRowIndex !== index) {
      // Find and cancel the previous inline editing row
      const previousEditableRow = this.tableData.find((r: any, i: number) => 
        i === this.currentRowIndex && r['editable']
      );
      if (previousEditableRow) {
        (previousEditableRow as any)['editable'] = false;
      }
      // Clear previous cell editing states
      Object.keys(this.cellEditing).forEach(key => {
        if (key.startsWith(this.currentRowIndex + '_')) {
          delete this.cellEditing[key];
        }
      });
      this.rowDataTemp['e' + this.currentRowIndex] = {} as T;
      
      // Restore sizes when switching from previous cell editing
      if (this.enableRowPinning) {
        this.restoreOriginalSizes();
      }
    }
    
    this.currentRow = { ...row } as T;
    this.currentRowIndex = index;
    this.rowDataTemp['e' + index] = { ...row } as T;
    
    // Sync column sizes from the edited row when cell editing starts
    if (this.enableRowPinning) {
      setTimeout(() => {
        this.syncColumnSizesFromEditedRow(index);
      }, 50);
    }
  }
  /**
   * @description This will restore the data and cencel the inline editing.
   * @param row row on which user wants to do edit.
   * @param index index of the row where inline editing will be enabled.
   */
  cancelInlineEditing(row: MTExRow, index: number) {
    (this.tableData.filter((a: any, i: number) => i == index)[0] as any)['editable'] =
      !(this.tableData.filter((a: any, i: number) => i == index)[0] as any)['editable'];
    this.dataSource = new MatTableDataSource(this.tableData);
    this.rowDataTemp['e' + index] = {} as T;
    this.service.selectedRow.next(null);
    
    // Restore original sizes after canceling edit mode
    if (this.enableRowPinning) {
      this.restoreOriginalSizes();
    }
  }
  /**
   * @description This method will save and update the inline editing data and emit the update row and index.
   * @param row row on which user wants to do edit.
   * @param index index of the row where inline editing will be enabled.
   */
  saveInlineEditing(row: MTExRow, index: number) {
    if (!this.inlineEditingTemplateRef) {
      this.tableData[index] = { ...this.rowDataTemp['e' + index] } as T;
      row = { ...this.rowDataTemp['e' + index] } as MTExRow;
    } else {
      let changedData = this.service.selectedRow.value;
      if (changedData) {
        this.tableData[index] = { ...changedData } as T;
      }
    }
    this.dataSource = new MatTableDataSource(this.tableData);
    this.rowDataTemp['e' + index] = {} as T;
    let data: RowChange<T> = {
      row: row as T,
      index: index,
    };
    this.inlineChange.emit(data);
    (this.tableData[index] as any)['editable'] = false;
    
    // Restore original sizes after saving edit mode
    if (this.enableRowPinning) {
      this.restoreOriginalSizes();
    }
  }
  /**
   * @description This method will save and update the cell editing data and emit the update row and index.
   */
  saveCellEditing() {
    this.cellEditing = {};
    let index = this.currentRowIndex;
    if (index > -1) {
      if (this.cellEditingTemplateRef) {
        let changedData = this.service.selectedRow.value;
        if (changedData) {
          this.tableData[index] = { ...changedData } as T;
        }
      } else {
        this.tableData[index] = { ...this.rowDataTemp['e' + index] } as T;
      }
      this.dataSource = new MatTableDataSource(this.tableData);
      this.rowDataTemp['e' + index] = {} as T;
      let data: RowChange<T> = {
        row: { ...this.tableData[index] } as T,
        index: index,
      };
      this.currentRowIndex = -1;
      this.cellChange.emit(data);
      
      // Restore original sizes after saving cell edits
      if (this.enableRowPinning) {
        this.restoreOriginalSizes();
      }
    }
  }
  /**
   * @description This method will delete the row from the given index and emit the deleted row and index.
   * @param row row to be deleted.
   * @param index index of the row to be deleted.
   */
  deleteRow(row: any, index: number) {
    // this.tableData.splice(index, 1);
    // this.dataSource = new MatTableDataSource(this.tableData);
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
    this.rowDeleted.emit(row as T);
  }

  /**
   * @description This method will expand or collapse the row and emit expand event.
   * @param row row to be expanded or collapsed.
   * @param expand value used to expand or collapse the row.
   * @param index index of the row.
   */
  expandRow(row: MTExRow, expand: boolean, index: number) {
    if (this.expandRows) {
      this.expansionChange.emit({ data: row as T, expanded: expand, index: index });
      this.expandedElement = this.expandedElement === (row as T) ? null : (row as T);
    }
  }
  /**
   * @description This method is used to set data for popup component and open editing dialog.
   * @param row row which used want to edit.
   */
  openEditingDialog(row: MTExRow) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.width = '40%';
    dialogConfig.height = '70%';
    dialogConfig.maxWidth = '100%';
    let rowData = { ...row };
    dialogConfig.data = {
      row: rowData,
      columns: [...this.columnsArray],
      templateRef: this.popupEditingTemplateRef,
    };
    this.dialog
      .open(EditingComponent, dialogConfig)
      .afterClosed()
      .subscribe((data) => {
        let index = this.tableData.indexOf(row as T);
        if (data && index > -1) {
          this.tableData[index] = data;
          this.dataSource = new MatTableDataSource(this.tableData);
          let dataChange: RowChange<T> = {
            row: data,
            index: index,
          };
          this.popupChange.emit(dataChange);
          if (this.enableRowPinning) {
            setTimeout(() => this.syncColumnSizesFromTop(), 80);
          }
        }
      });
  }
  /**
   * @description This method is used to open cell popup editing dialog for a single cell.
   * @param row row which contains the cell to edit.
   * @param column column definition of the cell to edit.
   * @param rowIndex index of the row.
   */
  openCellPopupDialog(row: any, column: MTExColumn<T>, rowIndex: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.width = '400px';
    dialogConfig.height = 'auto';
    dialogConfig.maxWidth = '100%';
    
    dialogConfig.data = {
      row: { ...row },
      column: column,
      rowIndex: rowIndex,
      isCellEdit: true,
      templateRef: this.cellPopupEditingTemplateRef,
    };
    
    this.dialog
      .open(EditingComponent, dialogConfig)
      .afterClosed()
      .subscribe((data) => {
        if (data && data.field && rowIndex > -1) {
          (this.tableData[rowIndex] as any)[data.field] = data.value;
          this.dataSource = new MatTableDataSource(this.tableData);
          let dataChange: RowChange<T> = {
            row: { ...this.tableData[rowIndex] } as T,
            index: rowIndex,
          };
          this.cellChange.emit(dataChange);
          if (this.enableRowPinning) {
            setTimeout(() => this.syncColumnSizesFromTop(), 80);
          }
        }
      });
  }
  /**
   * @description used to check whether all rows are selected.
   */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /**
   * @description this method is used to toggle the all and no rows selection.
   */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  /**
   * @description This method is used return aria-label for selection column checkboxs.
   * @param row row from table.
   * @returns labels for selection column checkboxs.
   */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.position + 1
    }`;
  }

  /**
   * @description create form control for columns for hiding and and pinning purpose
   * @param columns list of columns to be displayed
   */
  setToolbarMenuControls(columns: MTExColumn<T>[]) {
    if (columns.length > 0 && this.showToolbar) {
      const group = this.formBuilder.group({});
      columns.forEach((column: MTExColumn<T>) => {
        const control = this.formBuilder.control(true);
        group.addControl(column.field, control);
      });
      this.hideShowMenuGroup = group;
    }
  }

  /**
   * @param column current column
   * @param event mouse event used to set the menu position
   */
  openPinnablePropertyMenu(column: MTExColumn<T>, event: MouseEvent): void {
    this.menuX = event.clientX;
    this.menuY = event.clientY;
    let options: MTExColumnPinOption[] = [
      {
        label: 'Pin Left',
        value: 'left',
        selected: false,
        field: column.field,
      },
      {
        label: 'Pin Right',
        value: 'right',
        selected: false,
        field: column.field,
      },
      { label: 'No Pin', value: null, selected: false, field: column.field },
    ];
    if (column.pinned && column.pinned !== null) {
      options.forEach((opt: MTExColumnPinOption) => {
        if (opt.value === column.pinned) {
          opt.selected = true;
        }
      });
    } else if (column.pinned == null || column.pinned == 'null') {
      options[2].selected = true;
    }
    this.columnPinningOptions = options;
    this.columnMenuTrigger.openMenu();
  }
  /**
   * @description This method is used to reset menu checks when required.
   */
  resetMenuChecks() {
    this.hideShowMenuCtrl = false;
    this.showHideColumnsArray = [];
    this.columnPinMenuCtrl = false;
    this.columnPinningOptions = [];
  }
  /**
   * @description This method is used to filter columns for menus like pinning or hide show menu.
   * @param value search value to filter colunms
   */
  filterColumns(value: string) {
    if (value !== '') {
      this.showHideColumnsArray = this.columnsArray.filter(
        (col: MTExColumn<T>) => {
          return col.header!.toLowerCase().includes(value.toLowerCase());
        }
      );
    } else {
      this.showHideColumnsArray = this.columnsArray;
    }
  }
  /**
   * @description This method is used to open hide show column menu.
   * @param columns columns array to display in hide show menu.
   */
  openHideShowMenu(columns: MTExColumn<T>[]) {
    this.showHideColumnsArray = [...columns];
    this.columnMenuTrigger.openMenu();
  }
  /**
   * @param values columns
   */
  updateColumnsHideShow(values: ColumnVisibility) {
    let keys = Object.keys(values);
    keys.forEach((key: string) => {
      this.showHideColumn(key, values[key]);
    });
  }

  /**
   * @description This method is called when the table rows are scrolled.
   * @param event scroll event
   */
  onScroll(event: any) {
    this.scroll.emit(event);
  }
  /**
   * @param row row to be toggled
   * @param index index of toggled row
   */
  setSelectedRows(row: any, index: number) {
    this.selection.toggle(row);
    if (this.selection.isSelected(row)) {
      this.selectionChanged.emit({ row: row, index: index, isSelected: true });
    } else {
      this.selectionChanged.emit({ row: row, index: index, isSelected: false });
    }
  }
/**
 * @description This method is used to display all hidden rows.
 */
  showHiddenRows() {
    this.hideRows = false;
    this.selection.clear();
    this.hiddenCtrl.clear();
  }
/**
 * @description This method is used to hide all selected rows.
 */
  hideSelectedRows() {
    if (!this.selection.isEmpty()) {
      let values = [...this.selection.selected];
      values.forEach((value) => {
        const rowId = JSON.stringify(value);
        if (!this.hiddenCtrl.isSelected(rowId)) {
          this.hiddenCtrl.toggle(rowId);
        }
      });
      this.selection.clear();
      this.hideRows = true;
    }
  }
/**
 * @description This method is used to recalculate the required values for table.
 */
  reCal() {
    if (this.showPaginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sorting) {
      this.dataSource.sort = this.sort;
      if (this.enableRowPinning) {
        this.pinnedTopDataSource.sort = this.sort;
        this.pinnedBtmDataSource.sort = this.sort;
      }
    }
    if (this.columnFilter) {
      this.dataSource.filterPredicate = this.createFilter();
      if (this.pinnedTopDataSource) {
        if (this.pinnedTopDataSource.filterPredicate) {
          this.pinnedTopDataSource.filterPredicate = this.createFilter();
        }
      }
      if (this.pinnedBtmDataSource) {
      if (this.pinnedBtmDataSource.filterPredicate) {
        this.pinnedBtmDataSource.filterPredicate = this.createFilter();
      }
      }
    }
    this.cdr.detectChanges();
  }
/**
 * @description This method is called in constructor method to add SVGs into icon registration.
 */
  addIconsToRegistry() {
    let y = this.domSanitizer.bypassSecurityTrustResourceUrl(
      `assets/pinRight.svg`
    );
    let iconNames = ['pinLeft', 'pinRight', 'pinNone', 'pinned', 'pinIcon'];
    iconNames.forEach((icon) => {
      this.matIconRegistry.addSvgIcon(
        icon,
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          `assets/${icon}.svg`
        )
      );
    });
  }
/**
 * @description This method is used to export table data.
 * @param type type of file to be exported.
 */
  exportTable(type: string) {
    const actionColumns = ['select', 'edit', 'popup', 'delete', 'freeze', 'hide', 'pin'];
    
    // Get visible columns in the correct order (grouped first, ungrouped at end)
    let visibleColumns: MTExColumn<T>[] = [];
    
    if (this.columnGroups.length > 0) {
      const groupedFields = new Set<string>();
      
      // Collect all fields that belong to groups
      this.columnGroups.forEach(group => {
        group.columns.forEach(colField => groupedFields.add(colField));
      });
      
      // Add grouped columns first (in group order)
      this.columnGroups.forEach(group => {
        group.columns.forEach(colField => {
          const col = this.columnsArray.find(c => c.field === colField);
          const displayCol = this.dynamicDisplayedColumns.find(dc => dc.name === colField);
          if (col && displayCol && displayCol.show && !visibleColumns.includes(col)) {
            visibleColumns.push(col);
          }
        });
      });
      
      // Add ungrouped columns at the end
      this.columnsArray.forEach(col => {
        const displayCol = this.dynamicDisplayedColumns.find(dc => dc.name === col.field);
        if (!groupedFields.has(col.field) && displayCol && displayCol.show && 
            !actionColumns.includes(col.field) && !visibleColumns.includes(col)) {
          visibleColumns.push(col);
        }
      });
    } else {
      // No groups, use default order
      visibleColumns = this.columnsArray.filter(col => {
        const displayCol = this.dynamicDisplayedColumns.find(dc => dc.name === col.field);
        return displayCol && displayCol.show && !actionColumns.includes(col.field);
      });
    }

    const data: any[] = [];
    
    // Add group headers if they exist
    if (this.columnGroups.length > 0) {
      const groupRow: any[] = [];
      const columnIndexMap: { [key: string]: number } = {};
      
      visibleColumns.forEach((col, idx) => {
        columnIndexMap[col.field] = idx;
      });
      
      // Initialize group row with empty strings
      for (let i = 0; i < visibleColumns.length; i++) {
        groupRow.push('');
      }
      
      // Fill in group labels
      this.columnGroups.forEach(group => {
        const groupCols = group.columns.filter(colField => 
          visibleColumns.find(vc => vc.field === colField)
        );
        
        if (groupCols.length > 0) {
          const firstColIndex = columnIndexMap[groupCols[0]];
          groupRow[firstColIndex] = group.label;
        }
      });
      
      data.push(groupRow);
    }
    
    // Add column headers
    data.push(visibleColumns.map(col => col.header || col.field));
    
    // Add data rows (exclude hidden rows)
    this.dataSource.data.forEach((row, index) => {
      // Skip hidden rows
      if (this.hiddenRowIndices.includes(index)) {
        return;
      }
      const rowData = visibleColumns.map(col => {
        const value = row[col.field];
        if (value === null || value === undefined) return '';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (value instanceof Date) return new Intl.DateTimeFormat('en-US').format(value);
        return value;
      });
      data.push(rowData);
    });
    
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    
    // Add merge cells for group headers if they exist
    if (this.columnGroups.length > 0) {
      if (!ws['!merges']) {
        ws['!merges'] = [];
      }
      const columnIndexMap: { [key: string]: number } = {};
      
      visibleColumns.forEach((col, idx) => {
        columnIndexMap[col.field] = idx;
      });
      
      this.columnGroups.forEach(group => {
        const groupCols = group.columns.filter(colField => 
          visibleColumns.find(vc => vc.field === colField)
        );
        
        if (groupCols.length > 1 && ws['!merges']) {
          const firstColIndex = columnIndexMap[groupCols[0]];
          const lastColIndex = columnIndexMap[groupCols[groupCols.length - 1]];
          
          ws['!merges'].push({
            s: { r: 0, c: firstColIndex },
            e: { r: 0, c: lastColIndex }
          });
        }
      });
    }
    
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `tablesheets.${type}`);
  }
/**
 * @description This method is used to print the table with proper styling.
 */
  printTable() {
    const printContent = document.getElementById('matTableExt' + this.tableID);
    if (!printContent) return;

    const windowPrint = window.open('', '', 'width=900,height=650');
    if (!windowPrint) return;

    windowPrint.document.write('<html><head><title>Print Table</title>');
    windowPrint.document.write('<style>');
    windowPrint.document.write(`
      table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; font-weight: bold; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      .mat-sort-header-container { display: inline; }
      .mat-sort-header-arrow, .mat-sort-header-indicator { display: none !important; }
      button, .mat-icon { display: none !important; }
      @media print {
        .mat-mdc-table { page-break-inside: auto; }
        tr { page-break-inside: avoid; page-break-after: auto; }
        thead { display: table-header-group; }
      }
    `);
    windowPrint.document.write('</style></head><body>');
    
    // Clone the table and remove all action columns
    const tableClone = printContent.cloneNode(true) as HTMLElement;
    
    // Define action column class selectors
    const actionColumnSelectors = [
      'th.action-column-cells',
      'td.inline-edit-column-cell',
      // Remove columns by checking for action column names
      '[matColumnDef="select"]',
      '[matColumnDef="edit"]',
      '[matColumnDef="popup"]',
      '[matColumnDef="delete"]',
      '[matColumnDef="freeze"]',
      '[matColumnDef="hide"]',
    ];
    
    // Remove all matching elements
    actionColumnSelectors.forEach(selector => {
      const elements = tableClone.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
    
    // Also remove cells by index for action columns
    const actionColumnIndices: number[] = [];
    const headerRow = tableClone.querySelector('tr.mat-mdc-header-row');
    if (headerRow) {
      const headers = Array.from(headerRow.querySelectorAll('th'));
      headers.forEach((th, index) => {
        if (th.classList.contains('action-column-cells')) {
          actionColumnIndices.push(index);
        }
      });
    }
    
    // Remove cells at action column indices from all rows
    const rows = tableClone.querySelectorAll('tr');
    rows.forEach((row, rowIndex) => {
      // Remove hidden rows (accounting for header rows)
      const dataIndex = rowIndex - 1; // Subtract 1 for header row
      if (dataIndex >= 0 && this.hiddenRowIndices.includes(dataIndex)) {
        row.remove();
        return;
      }
      
      const cells = Array.from(row.querySelectorAll('th, td'));
      // Remove in reverse order to maintain correct indices
      for (let i = actionColumnIndices.length - 1; i >= 0; i--) {
        const index = actionColumnIndices[i];
        if (cells[index]) {
          cells[index].remove();
        }
      }
    });
    
    windowPrint.document.write(tableClone.outerHTML);
    windowPrint.document.write('</body></html>');
    windowPrint.document.close();
    
    setTimeout(() => {
      windowPrint.print();
      windowPrint.close();
    }, 250);
  }

  async exportToPDF() {
    try {
      // Correct jsPDF import
      const JsPDF = (await import('jspdf')).default;

      // Correct AutoTable import
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.autoTable || autoTableModule.default;

      // Create PDF with user-specified orientation
      const doc = new JsPDF({
        orientation: this.pdfOrientation,
        unit: 'mm',
        format: 'a4'
      });

      const actionColumns = ['select', 'edit', 'popup', 'delete', 'freeze', 'hide', 'pin'];

      // Get visible columns in the correct order (grouped first, ungrouped at end)
      let visibleColumns: MTExColumn<T>[] = [];
      
      if (this.columnGroups.length > 0) {
        const groupedFields = new Set<string>();
        
        // Collect all fields that belong to groups
        this.columnGroups.forEach(group => {
          group.columns.forEach(colField => groupedFields.add(colField));
        });
        
        // Add grouped columns first (in group order)
        this.columnGroups.forEach(group => {
          group.columns.forEach(colField => {
            const col = this.columnsArray.find(c => c.field === colField);
            const displayCol = this.dynamicDisplayedColumns.find(dc => dc.name === colField);
            if (col && displayCol && displayCol.show && !visibleColumns.includes(col)) {
              visibleColumns.push(col);
            }
          });
        });
        
        // Add ungrouped columns at the end
        this.columnsArray.forEach(col => {
          const displayCol = this.dynamicDisplayedColumns.find(dc => dc.name === col.field);
          if (!groupedFields.has(col.field) && displayCol && displayCol.show && 
              !actionColumns.includes(col.field) && !visibleColumns.includes(col)) {
            visibleColumns.push(col);
          }
        });
      } else {
        // No groups, use default order
        visibleColumns = this.columnsArray.filter(col => {
          const displayCol = this.dynamicDisplayedColumns.find(dc => dc.name === col.field);
          return displayCol && displayCol.show && !actionColumns.includes(col.field);
        });
      }

      // Prepare group headers if column groups exist
      let groupHeaders: any[] = [];
      let columnIndexMap: { [key: string]: number } = {};
      let groupColSpans: { [key: number]: number } = {};
      
      if (this.columnGroups.length > 0) {
        // Build column index map
        visibleColumns.forEach((col, idx) => {
          columnIndexMap[col.field] = idx;
        });
        
        // Create group header row
        const groupRow: any[] = [];
        let currentIndex = 0;
        
        this.columnGroups.forEach(group => {
          const groupCols = group.columns.filter(colField => 
            visibleColumns.find(vc => vc.field === colField)
          );
          
          if (groupCols.length > 0) {
            const firstColIndex = columnIndexMap[groupCols[0]];
            
            // Add the group header cell with content and colspan
            groupRow.push({
              content: group.label,
              colSpan: groupCols.length,
              styles: { halign: 'center' }
            });
            
            groupColSpans[firstColIndex] = groupCols.length;
            currentIndex = firstColIndex + groupCols.length;
          }
        });
        
        // Add empty cells for ungrouped columns
        const groupedFields = new Set<string>();
        this.columnGroups.forEach(group => {
          group.columns.forEach(colField => groupedFields.add(colField));
        });
        
        const ungroupedCount = visibleColumns.filter(col => 
          !groupedFields.has(col.field)
        ).length;
        
        for (let i = 0; i < ungroupedCount; i++) {
          groupRow.push({
            content: '',
            styles: { halign: 'center' }
          });
        }
        
        groupHeaders = [groupRow];
      }

      const headers = visibleColumns.map(col => col.header || col.field);

      const rows = this.dataSource.data
        .map((row, index) => ({
          row,
          index
        }))
        .filter(({ index }) => !this.hiddenRowIndices.includes(index))
        .map(({ row }) =>
          visibleColumns.map(col => {
            const value = row[col.field];
          if (value === null || value === undefined) return '';
          if (typeof value === 'boolean') return value ? 'Yes' : 'No';
          if (value instanceof Date)
            return new Intl.DateTimeFormat('en-US').format(value);
          return String(value);
        })
      );

      let startY = 10;
      if (this.toolbarTitle) {
        doc.text(this.toolbarTitle, 14, 15);
        startY = 20;
      }

      // Extract header styles from actual mat-table
      let headerStyles: any = {
        fillColor: [245, 245, 245],  // Default Material table header background (#f5f5f5)
        textColor: [0, 0, 0],        // Default Material table header text (black)
        fontStyle: 'bold'
      };

      // If headerTemplateRef is defined, extract styles from the actual header cells
      if (this.headerTemplateRef) {
        const headerCells = this.tableElement?.nativeElement?.querySelectorAll('.mat-mdc-header-cell');
        if (headerCells && headerCells.length > 0) {
          const firstHeader = headerCells[0] as HTMLElement;
          const computedStyles = window.getComputedStyle(firstHeader);
          
          // Extract background color
          const bgColor = computedStyles.backgroundColor;
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            const rgb = bgColor.match(/\d+/g);
            if (rgb && rgb.length >= 3) {
              headerStyles.fillColor = [parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2])];
            }
          }
          
          // Extract text color
          const textColor = computedStyles.color;
          if (textColor) {
            const rgb = textColor.match(/\d+/g);
            if (rgb && rgb.length >= 3) {
              headerStyles.textColor = [parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2])];
            }
          }
          
          // Extract font weight
          const fontWeight = computedStyles.fontWeight;
          if (fontWeight && (fontWeight === 'bold' || parseInt(fontWeight) >= 600)) {
            headerStyles.fontStyle = 'bold';
          } else {
            headerStyles.fontStyle = 'normal';
          }
        }
      }

      // Extract group header styles if groups exist
      let groupHeaderStyles: any = null;
      if (groupHeaders.length > 0) {
        // Extract from group-header-cell elements
        const groupHeaderCells = this.tableElement?.nativeElement?.querySelectorAll('.group-header-cell');
        if (groupHeaderCells && groupHeaderCells.length > 0) {
          const firstGroupHeader = groupHeaderCells[0] as HTMLElement;
          const computedStyles = window.getComputedStyle(firstGroupHeader);
          
          groupHeaderStyles = {};
          
          // Extract background color
          const bgColor = computedStyles.backgroundColor;
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            const rgb = bgColor.match(/\d+/g);
            if (rgb && rgb.length >= 3) {
              groupHeaderStyles.fillColor = [parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2])];
            }
          } else {
            // Default to same as header background
            groupHeaderStyles.fillColor = headerStyles.fillColor;
          }
          
          // Extract text color
          const textColor = computedStyles.color;
          if (textColor) {
            const rgb = textColor.match(/\d+/g);
            if (rgb && rgb.length >= 3) {
              groupHeaderStyles.textColor = [parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2])];
            }
          } else {
            // Default to same as header text
            groupHeaderStyles.textColor = headerStyles.textColor;
          }
          
          // Extract font weight
          const fontWeight = computedStyles.fontWeight;
          if (fontWeight && (fontWeight === 'bold' || parseInt(fontWeight) >= 600)) {
            groupHeaderStyles.fontStyle = 'bold';
          } else {
            groupHeaderStyles.fontStyle = 'normal';
          }
        } else {
          // No group header cells found, use same as regular headers
          groupHeaderStyles = { ...headerStyles };
        }
      }

      // Build table config without default grid borders. We'll draw only
      // bottom dividers manually in `didDrawCell` so there are no left/right borders.
      const tableConfig: any = {
        head: groupHeaders.length > 0 ? [...groupHeaders, headers] : [headers],
        body: rows,
        startY: startY,
        // Use 'plain' so autowire doesn't draw full grid borders
        theme: 'plain',
        styles: {
          fontSize: 9,
          cellPadding: 3,
          // ensure autTable doesn't draw default lines
          lineWidth: 0
        },
        headStyles: headerStyles
      };

      // didParseCell: apply header/group header visual styles (background/text/font)
      tableConfig.didParseCell = (data: any) => {
        // Group header row styling (if present)
        if (data.section === 'head' && groupHeaders.length > 0 && data.row.index === 0 && groupHeaderStyles) {
          if (groupHeaderStyles.fillColor) data.cell.styles.fillColor = groupHeaderStyles.fillColor;
          if (groupHeaderStyles.textColor) data.cell.styles.textColor = groupHeaderStyles.textColor;
          if (groupHeaderStyles.fontStyle) data.cell.styles.fontStyle = groupHeaderStyles.fontStyle;
          data.cell.styles.halign = 'center';
        }

        // Final header row (column labels) should use headerStyles
        if (data.section === 'head' && data.row.index === (groupHeaders.length > 0 ? groupHeaders.length : 0)) {
          if (headerStyles.fillColor) data.cell.styles.fillColor = headerStyles.fillColor;
          if (headerStyles.textColor) data.cell.styles.textColor = headerStyles.textColor;
          if (headerStyles.fontStyle) data.cell.styles.fontStyle = headerStyles.fontStyle;
        }
      };

      // didDrawCell: draw only the bottom divider line for each cell
      tableConfig.didDrawCell = (data: any) => {
        try {
          const cell = data.cell;
          const docRef: any = doc;
          // Determine stroke color and width for divider
          const lineColor = [200, 200, 200];
          const lineWidth = 0.5;

          // Coordinates: draw a horizontal line across the bottom of the cell
          const x1 = cell.x;
          const x2 = cell.x + cell.width;
          const y = cell.y + cell.height;

          docRef.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
          docRef.setLineWidth(lineWidth);
          docRef.line(x1, y, x2, y);
        } catch (err) {
          // don't block export on draw errors
        }
      };

      autoTable(doc, tableConfig);

      doc.save(`${this.toolbarTitle || 'table-export'}.pdf`);

    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  }


  /**
   * @description This method is used to split name of filter row header to get index.
   * @param value value to be splited for index.
   * @returns Will return index of column from value.
   */
  returnIndex(value: string): number {
    return Number(value.split('_')[1]);
  }
/**
 * @description This method is used to manage column filtering, expanded data for exporting.
 * @param ws work sheet
 * @returns custom generated worksheet to be used in export.
 */
  writeSheetData(ws: XLSX.WorkSheet): XLSX.WorkSheet {
    let displayedColumns = this.getDisplayedColumns();
    var nMerges = this.getMergeIndex(ws['!merges'] || []);
    var merges = ws['!merges'] || [];
    let data: XLSX.WorkSheet = {
      '!cols': [],
      '!rows': [],
      '!merges': nMerges,
    };
    var range = XLSX.utils.decode_range(ws['!ref'] || '');
    let extracolumns = ['popup', 'delete', 'select', 'edit'];
    let keys = Object.keys(ws);
    let nKey = 'A';
    keys.forEach((key, i) => {
      if (ws[key]?.v && typeof ws[key]?.v === 'string') {
        if (
          !extracolumns.includes(ws[key].v.toLowerCase()) &&
          displayedColumns.includes(ws[key].v.toLowerCase())
        ) {
          let lastRowIndex = range?.e?.r;
          data[key] = ws[key];
          let chr = key.charAt(0);
          for (let j = 2; j <= lastRowIndex; j++) {
            if (
              ws[chr + (j + 1)] !== undefined &&
              (typeof ws[chr + (j + 1)].v === 'string' ||
                typeof ws[chr + (j + 1)].v === 'number')
            ) {
              data[nKey + j] = ws[chr + (j + 1)];
            }
          }
          nKey = String.fromCharCode(nKey.charCodeAt(0) + 1);
        }
      }
    });
    if (this.rowSelection) {
      let chr = 'A';
      for (let i = 1; i < range.e.c + 1; i++) {
        data[chr + 1] = data[String.fromCharCode(chr.charCodeAt(0) + 1) + 1];
        chr = String.fromCharCode(chr.charCodeAt(0) + 1);
        if (i == range.e.c) {
          data[chr + 1] = undefined;
        }
      }
    }
    if (this.rowSelection && this.expandRows) {
      merges.forEach((merge) => {
        data['A' + merge.s.r] = ws['A' + (merge.s.r + 1)];
      });
    }
    range.e.r--;
    let nRef = XLSX.utils.encode_range(range);
    data['!ref'] = nRef;
    data['!fullref'] = nRef;
    return data;
  }
  getMergeIndex(merges: any[]) {
    var arr: any[] = [];
    merges.forEach((element: any) => {
      arr.push({
        e: {
          r: element.e.r == 0 ? element.e.r : element.e.r - 1,
          c: element.e.c,
        },
        s: {
          r: element.s.r == 0 ? element.s.r : element.s.r - 1,
          c: element.s.c,
        },
      });
    });
    return arr;
  }

  
}

