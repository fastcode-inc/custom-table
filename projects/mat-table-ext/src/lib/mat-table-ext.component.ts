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
import { MatTableDataSource } from '@angular/material/table';
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
  encapsulation: ViewEncapsulation.None,
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
export class MatTableExtComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  @ViewChild('columnMenuTrigger') columnMenuTrigger!: MatMenuTrigger;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('matTable', { read: ElementRef }) matTableRef!: ElementRef;

  // Table inputs
  @Input() dataSource!: MatTableDataSource<any>;
  @Input() columns: MTExColumn[] = [];
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
  @Input() toolbarTemplate: TemplateRef<any> | undefined;
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
  @Input() toolbarTemplateRef!: TemplateRef<any> | undefined;
  @Input() headerTemplateRef!: TemplateRef<any> | null;
  @Input() cellTemplateRef!: TemplateRef<any> | undefined;
  @Input() expansionTemplateRef!: TemplateRef<any> | undefined;
  @Input() popupEditingTemplateRef!: TemplateRef<any> | undefined;
  @Input() inlineEditingTemplateRef!: TemplateRef<any> | undefined;
  @Input() cellEditingTemplateRef!: TemplateRef<any> | undefined;
  @Input() cellPopupEditingTemplateRef!: TemplateRef<any> | undefined;
  @Input() cellTemplateRefMap: CellTemplateRefMap = {};
  @Input() tableClassName: string = '';
  @Input() columnGroups: MTExColumnGroup[] = [];
  @Input() frozenRowIndices: number[] = [];
  @Input() enableRowFreezing: boolean = false;
  @Input() pdfOrientation: 'portrait' | 'landscape' = 'portrait';

  // Table outputs
  @Output() inlineChange: EventEmitter<any> = new EventEmitter<RowChange>();
  @Output() cellChange: EventEmitter<any> = new EventEmitter<RowChange>();
  @Output() popupChange: EventEmitter<any> = new EventEmitter<RowChange>();
  @Output() rowDeleted: EventEmitter<any> = new EventEmitter<any>();
  @Output() scroll: EventEmitter<any> = new EventEmitter<any>();
  @Output() selectionChanged: EventEmitter<RowSelectionChange> =
    new EventEmitter<any>();
  @Output() expansionChange: EventEmitter<ExpansionChange> =
    new EventEmitter<any>();
  tableID = new Date().getTime();
  columnPinningOptions: MTExColumnPinOption[] = [];
  exportMenuCtrl: boolean = false;
  columnPinMenuCtrl: boolean = false;
  hideShowMenuCtrl: boolean = false;
  rowDataTemp: Record<string, MTExRow> = {};
  inlineEditingTemplateRefData: any = {};
  displayedColumns: string[] = [];
  showHideColumnsArray: MTExColumn[] = [];
  columnsList: string[] = [];
  columnsArray: MTExColumn[] = [];
  headersFiltersIds: string[] = [];
  columnsToDisplayWithExpand: string[] = [];
  selection = new SelectionModel<any>(false, []);
  hiddenCtrl = new SelectionModel<any>(true, []);
  tableData: MTExRow[] = [];
  filterValues: Record<string, string | number | boolean> = {};
  globalFilter = '';
  showHideFilter = '';
  individualFilter = '';
  toggleFilters = false;
  hideRows = false;
  expandedElement: any | null;
  currentRowIndex: number = -1;
  currentRow: MTExRow = {};
  cellEditing: Record<string, boolean> = {};
  hideShowMenuGroup: FormGroup = this.formBuilder.group({});
  menuX: number = 0;
  menuY: number = 0;
  dynamicDisplayedColumns: any[] = [
    { filter: false, name: 'select', show: false },
    { filter: false, name: 'edit', show: false },
    { filter: false, name: 'popup', show: false },
    { filter: false, name: 'delete', show: false },
    { filter: false, name: 'expand', show: false },
  ];
  inputPropertyKeys: string[] = [
    'dataSource',
    'columns',
    'inlineRowEditing',
    'popupRowEditing',
    'enableDelete',
    'enableRowFreezing',
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
    public dialog: MatDialog,
    public service: MatTableExtService,
    public formBuilder: FormBuilder,
    public domSanitizer: DomSanitizer,
    public matIconRegistry: MatIconRegistry,
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
updateColumns(updatedColumns: MTExColumn[]) {
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
    this.reCal(); // Re-apply paginator, sort, and filter
  }
  
  if (this.columnFilter) {
      this.setColumnFilter(true);
  }
  
  // Force change detection
  this.cdr.markForCheck();
  this.cdr.detectChanges();
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
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
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
  setPropertiesMap: any = {
    dataSource: (value: any) => this.setTableDataSource(value),
    columns: (value: any) => this.setColumnsData(value.currentValue),
    inlineRowEditing: (value: any) =>
      this.showHideColumn('edit', value.currentValue),
    popupRowEditing: (value: any) =>
      this.showHideColumn('popup', value.currentValue),
    enableDelete: (value: any) =>
      this.showHideColumn('delete', value.currentValue),
    enableRowFreezing: (value: any) =>
      this.showHideColumn('freeze', value.currentValue),
    rowSelection: (value: any) => this.setRowSelection(value.currentValue),
    multiRowSelection: (value: any) => {
      this.selection = new SelectionModel<any>(value.currentValue, []);
    },
    stickyHeader: (value: any) => {
      this.stickyHeader = value.currentValue;
    },
    stickyFooter: (value: any) => {
      this.stickyFooter = value.currentValue;
    },
    columnFilter: (value: any) => this.setColumnFilter(value.currentValue),
    globalSearch: (value: any) =>
      (this.dataSource.filterPredicate = this.createFilter()),
    expandRows: (value: any) => {
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
    sorting: (value: any) => (this.dataSource.sort = this.sort),
    columnGroups: (value: any) => {
      this.columnGroups = value.currentValue || [];
      this.cdr.detectChanges();
    },
  };
  /**
   * @description used set data source for table.
   * @param value data source value from user.
   */
  setTableDataSource(value: any) {
    if (value.currentValue) {
      this.tableData = value.currentValue.data;
      this.dataSource = value.currentValue;
      this.reCal();
    } else {
      this.dataSource = new MatTableDataSource([{}]);
    }
  }
  /**
   * @description used create seletion model and set selection column visibility.
   * @param value boolean value to show or hide selection Column from table.
   */
  setRowSelection(value: boolean) {
    this.selection = new SelectionModel<any>(true, []);
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
  }
  /**
   * @description This method returns the list of visible column names.
   * @returns list of visible column names.
   */
  getDisplayedColumns(): string[] {
    if (this.columnGroups.length === 0) {
      // No groups, place action columns at the end
      const actionColumns = ['select', 'edit', 'popup', 'delete', 'freeze'];
      const visibleColumns = this.dynamicDisplayedColumns.filter((cd) => cd.show);
      const dataColumns = visibleColumns.filter((cd) => !actionColumns.includes(cd.name)).map((cd) => cd.name);
      const actionCols = visibleColumns.filter((cd) => actionColumns.includes(cd.name)).map((cd) => cd.name);
      return [...dataColumns, ...actionCols];
    }
    
    // When groups exist, reorder: action columns, grouped columns, then ungrouped columns
    const actionColumns = ['select', 'edit', 'cellpopup', 'popup', 'delete', 'freeze'];
    const groupedFields = new Set<string>();
    
    // Collect all fields that belong to groups
    this.columnGroups.forEach(group => {
      group.columns.forEach(colField => groupedFields.add(colField));
    });
    
    const result: string[] = [];
    const visibleColumns = this.dynamicDisplayedColumns.filter((cd) => cd.show);
    
    // Add grouped columns first in the order they appear in groups
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
    
    // Add action columns at the end
    visibleColumns.forEach(col => {
      if (actionColumns.includes(col.name)) {
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
    const actionColumns = ['select', 'edit', 'popup', 'delete', 'freeze'];
    
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
    
    // Add action columns at the end if visible (they span only themselves)
    if (this.dynamicDisplayedColumns.find(c => c.name === 'select' && c.show)) {
      grouped.push('select');
    }
    if (this.dynamicDisplayedColumns.find(c => c.name === 'edit' && c.show)) {
      grouped.push('edit');
    }
    if (this.dynamicDisplayedColumns.find(c => c.name === 'popup' && c.show)) {
      grouped.push('popup');
    }
    if (this.dynamicDisplayedColumns.find(c => c.name === 'delete' && c.show)) {
      grouped.push('delete');
    }
    if (this.dynamicDisplayedColumns.find(c => c.name === 'freeze' && c.show)) {
      grouped.push('freeze');
    }
    
    return grouped;
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
  setColumnsData(columns: MTExColumn[]) {
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
  setColumnsList(columns: MTExColumn[]) {
    this.columnsList = [];
    this.displayedColumns = ['select', 'edit', 'popup', 'delete', 'freeze'];
    let columnsArray: DisplayColumn[] = [];
    columns.forEach((col) => {
      if (typeof col?.header == 'string') {
        this.columnsList.push(col?.header);
        this.displayedColumns.push(col?.field);
        columnsArray.push({ filter: true, name: col?.field, show: !col.hide });
      }
    });
    this.dynamicDisplayedColumns = [
      { filter: false, name: 'select', show: false },
      { filter: false, name: 'edit', show: false },
      { filter: false, name: 'popup', show: false },
      { filter: false, name: 'delete', show: false },
      { filter: false, name: 'freeze', show: false },
    ];
    this.dynamicDisplayedColumns = columnsArray.concat(
      this.dynamicDisplayedColumns
    );
  }
  /**
   * @description Take boolean value and name column and update its visibility status in table.
   * @param name name of the column to set visibility.
   * @param value boolean value to set visibility of the column.
   */
  showHideColumn(name: string, value: boolean) {
    this.dynamicDisplayedColumns.filter((a) => a.name == name)[0].show = value;
    if (this.columnFilter) {
      this.setColumnFilter(true);
    }
  }

  /**
   * @description Toggle freeze state for a specific row
   * @param index The row index to freeze/unfreeze
   */
  toggleRowFreeze(index: number): void {
    const frozenIndex = this.frozenRowIndices.indexOf(index);
    if (frozenIndex > -1) {
      // Unfreeze the row
      this.frozenRowIndices.splice(frozenIndex, 1);
    } else {
      // Freeze the row
      this.frozenRowIndices.push(index);
    }
    // Trigger change detection
    this.frozenRowIndices = [...this.frozenRowIndices];
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
    let columns: any = {};
    this.columnsArray.forEach((column: MTExColumn) => {
      if (column.field) columns[column.field] = searchValue;
    });
    this.dataSource.filter = JSON.stringify(columns);
  }
  /**
   * @description This method is used to apply column based filtering
   * @param searchValue value to be searched from table rows.
   * @param column filter will be applied based on this column field.
   */
  applyColumnFilter(searchValue: FilterSearchValue, column: MTExColumn) {
    this.individualFilter = column.field;
    this.filterValues[column.field] = searchValue[column.field];
    this.dataSource.filter = JSON.stringify(this.filterValues);
  }
  /**
   * @description This method will take row and its index enable inline editing tools on that row.
   * @param row row on which user wants to do edit.
   * @param index index of the row where inline editing will be enabled.
   */
  enableInlineEditing(row: any, index: number) {
    const rowData: any = {};
    rowData['e' + index] = { ...row };
    this.rowDataTemp = rowData;
    setTimeout(() => {
      this.tableData[index]['editable'] = !this.tableData[index]['editable'];
    }, 0);
  }
  /**
   * @description This method will create and return data to inline editing template.
   * @param row row on which user wants to do edit.
   * @param index index of the row where inline editing will be enabled.
   * @param column current column of the table.
   */
  getInlineEditingData(row: MTExRow, index: number, column: MTExColumn) {
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
    this.service.selectedRow.next(row);
  };
  /**
   * @description This method set data for in-cell editing.
   * @param row row on which user wants to do edit.
   * @param index index of the row where inline editing will be enabled.
   */
  setCellData(row: MTExRow, index: number) {
    this.currentRow = { ...row };
    this.currentRowIndex = index;
    this.rowDataTemp['e' + index] = { ...row };
  }
  /**
   * @description This will restore the data and cencel the inline editing.
   * @param row row on which user wants to do edit.
   * @param index index of the row where inline editing will be enabled.
   */
  cancelInlineEditing(row: MTExRow, index: number) {
    this.tableData.filter((a: any, i: number) => i == index)[0]['editable'] =
      !this.tableData.filter((a: any, i: number) => i == index)[0]['editable'];
    this.dataSource = new MatTableDataSource(this.tableData);
    this.rowDataTemp['e' + index] = {};
    this.service.selectedRow.next(undefined);
  }
  /**
   * @description This method will save and update the inline editing data and emit the update row and index.
   * @param row row on which user wants to do edit.
   * @param index index of the row where inline editing will be enabled.
   */
  saveInlineEditing(row: MTExRow, index: number) {
    if (!this.inlineEditingTemplateRef) {
      this.tableData[index] = { ...this.rowDataTemp['e' + index] };
      row = { ...this.rowDataTemp['e' + index] };
    } else {
      let changedData = this.service.selectedRow.value;
      if (changedData) {
        this.tableData[index] = { ...changedData };
      }
    }
    this.dataSource = new MatTableDataSource(this.tableData);
    this.rowDataTemp['e' + index] = {};
    let data: RowChange = {
      row: row,
      index: index,
    };
    this.inlineChange.emit(data);
    this.tableData[index]['editable'] = false;
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
          this.tableData[index] = { ...changedData };
        }
      } else {
        this.tableData[index] = { ...this.rowDataTemp['e' + index] };
      }
      this.dataSource = new MatTableDataSource(this.tableData);
      this.rowDataTemp['e' + index] = {};
      let data: RowChange = {
        row: { ...this.tableData[index] },
        index: index,
      };
      this.currentRowIndex = -1;
      this.cellChange.emit(data);
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
    this.rowDeleted.emit({ removedRow: row, fromIndex: index });
  }

  /**
   * @description This method will expand or collapse the row and emit expand event.
   * @param row row to be expanded or collapsed.
   * @param expand value used to expand or collapse the row.
   * @param index index of the row.
   */
  expandRow(row: MTExRow, expand: boolean, index: number) {
    if (this.expandRows) {
      this.expansionChange.emit({ data: row, expanded: expand, index: index });
      this.expandedElement = this.expandedElement === row ? null : row;
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
        let index = this.tableData.indexOf(row);
        if (data && index > -1) {
          this.tableData[index] = data;
          this.dataSource = new MatTableDataSource(this.tableData);
          let dataChange: RowChange = {
            row: data,
            index: index,
          };
          this.popupChange.emit(dataChange);
        }
      });
  }
  /**
   * @description This method is used to open cell popup editing dialog for a single cell.
   * @param row row which contains the cell to edit.
   * @param column column definition of the cell to edit.
   * @param rowIndex index of the row.
   */
  openCellPopupDialog(row: any, column: MTExColumn, rowIndex: number) {
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
          this.tableData[rowIndex][data.field] = data.value;
          this.dataSource = new MatTableDataSource(this.tableData);
          let dataChange: RowChange = {
            row: { ...this.tableData[rowIndex] },
            index: rowIndex,
          };
          this.cellChange.emit(dataChange);
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
  setToolbarMenuControls(columns: MTExColumn[]) {
    if (columns.length > 0 && this.showToolbar) {
      const group = this.formBuilder.group({});
      columns.forEach((column: MTExColumn) => {
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
  openPinnablePropertyMenu(column: MTExColumn, event: MouseEvent): void {
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
        (col: MTExColumn) => {
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
  openHideShowMenu(columns: MTExColumn[]) {
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
        if (!this.hiddenCtrl.isSelected(value)) {
          this.hiddenCtrl.toggle(value);
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
    }
    if (this.columnFilter) {
      this.dataSource.filterPredicate = this.createFilter();
    }
  }
/**
 * @description Check if a row index is in the frozen rows list.
 * @param index The row index to check
 * @returns True if the row is frozen
 */
  isRowFrozen(index: number): boolean {
    return this.frozenRowIndices.includes(index);
  }

  /**
     * @description Get the top position for a frozen row by calculating
     * actual heights of headers and preceding frozen rows from the DOM.
     * @param index The row index (render index)
     * @returns The top position in pixels, or null if not frozen
     */
  getFrozenRowTop(index: number): string | null {
    if (!this.isRowFrozen(index)) {
      return null;
    }

    // Access the native table element
    const tableElement = this.matTableRef?.nativeElement as HTMLElement;
    if (!tableElement) {
      return null;
    }

    // 1. Calculate the offset from Sticky Headers
    let currentTop = 0;

    if (this.stickyHeader) {
      // In v20 (MDC), the class is .mat-mdc-header-row
      const headerRows = tableElement.querySelectorAll('.mat-mdc-header-row');
      headerRows.forEach((row) => {
        currentTop += ((row as HTMLElement).offsetHeight);
      });
      currentTop =currentTop-1; // Small buffer to prevent overla
    }

    // 2. Calculate offset from previous frozen rows
    // Sort indices to ensure we process them top-to-bottom
    const sortedFrozenIndices = [...this.frozenRowIndices].sort((a, b) => a - b);

    // Find where the current row sits in the frozen stack
    const currentPositionInStack = sortedFrozenIndices.indexOf(index);

    // Get all rendered data rows to query their specific heights
    const allRows = tableElement.querySelectorAll('.mat-mdc-row');

    // Iterate ONLY through the frozen rows that are visually ABOVE the current one
    for (let i = 0; i < currentPositionInStack; i++) {
      const prevFrozenIndex = sortedFrozenIndices[i];
      const prevRowElement = allRows[prevFrozenIndex] as HTMLElement;

      // Add the actual height of the previous row to the accumulator
      if (prevRowElement) {
        currentTop += prevRowElement.offsetHeight;
      }
    }
    if(!this.stickyHeader){
      currentTop -= 1; // Small buffer to prevent overlap
    }
    return `${currentTop}px`;
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
    const actionColumns = ['select', 'edit', 'popup', 'delete', 'freeze'];
    
    // Get visible columns in the correct order (grouped first, ungrouped at end)
    let visibleColumns: MTExColumn[] = [];
    
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
    
    // Add data rows
    this.dataSource.data.forEach(row => {
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
    rows.forEach(row => {
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

      const actionColumns = ['select', 'edit', 'popup', 'delete', 'freeze'];

      // Get visible columns in the correct order (grouped first, ungrouped at end)
      let visibleColumns: MTExColumn[] = [];
      
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

      const rows = this.dataSource.data.map(row =>
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

      // 🔥 USE AS FUNCTION (NOT doc.autoTable)
      const tableConfig: any = {
        head: groupHeaders.length > 0 ? [...groupHeaders, headers] : [headers],
        body: rows,
        startY: startY,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      };
      
      // Add custom styling for group header row if it exists
      if (groupHeaders.length > 0) {
        tableConfig.didParseCell = (data: any) => {
          // Style first header row (group headers) differently
          if (data.section === 'head' && data.row.index === 0) {
            data.cell.styles.fillColor = [227, 242, 253]; // Lighter blue
            data.cell.styles.textColor = [21, 101, 192]; // Darker blue text
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.halign = 'center'; // Center align text
            
            // Add consistent border color to all group header cells
            data.cell.styles.lineWidth = 0.5;
            data.cell.styles.lineColor = [25, 118, 210]; // Primary blue (#1976d2)
          }
        };
      }
      
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
