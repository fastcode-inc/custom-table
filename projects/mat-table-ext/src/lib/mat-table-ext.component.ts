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
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
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
} from '../lib/models/tableExtModels';
import { MatTableExtService } from '../lib/mat-table-ext.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import * as XLSX from 'xlsx';
@Component({
  selector: 'mat-table-ext',
  templateUrl: 'mat-table-ext.component.html',
  styleUrls: ['mat-table-ext.scss'],
  encapsulation: ViewEncapsulation.None,
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

  // Table inputs
  @Input() dataSource!: MatTableDataSource<any>;
  @Input() columns: MTExColumn[] = [];
  @Input() columnResizable: boolean = false;
  @Input() stripedRows: boolean = false;
  @Input() rowHover: boolean = false;
  @Input() inlineRowEditing: boolean = false;
  @Input() inCellEditing: boolean = false;
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
  @Input() pageSizeOptions: number[] = [10, 50, 100];
  @Input() toolbarTemplateRef!: TemplateRef<any> | undefined;
  @Input() headerTemplateRef!: TemplateRef<any> | undefined;
  @Input() cellTemplateRef!: TemplateRef<any> | undefined;
  @Input() expansionTemplateRef!: TemplateRef<any> | undefined;
  @Input() popupEditingTemplateRef!: TemplateRef<any> | undefined;
  @Input() inlineEditingTemplateRef!: TemplateRef<any> | undefined;
  @Input() cellEditingTemplateRef!: TemplateRef<any> | undefined;
  @Input() cellTemplateRefMap: CellTemplateRefMap = {};

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
  columnFilterBySelection: any = false;
  rowDataTemp: any = {};
  inlineEditingTemplateRefData: any = {};
  displayedColumns: string[] = [];
  showHideColumnsArray: MTExColumn[] = [];
  columnsList: string[] = [];
  columnsArray: MTExColumn[] = [];
  headersFiltersIds: string[] = [];
  columnsToDisplayWithExpand: string[] = [];
  selection = new SelectionModel<any>(false, []);
  hiddenCtrl = new SelectionModel<any>(true, []);
  tableData: any = [];
  filterValues: any = {};
  globalFilter = '';
  showHideFilter = '';
  individualFilter = '';
  toggleFilters = false;
  hideRows = false;
  expandedElement: any | null;
  currentRowIndex: number = -1;
  currentRow: any = {};
  cellEditing: any = {};
  hideShowMenuGroup!: FormGroup;
  cellTemplate!: TemplateRef<any>;
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
    'rowSelection',
    'multiRowSelection',
    'stickyHeader',
    'stickyFooter',
    'columnFilter',
    'globalSearch',
    'expandRows',
    'sorting',
  ];

  constructor(
    public dialog: MatDialog,
    public service: MatTableExtService,
    public formBuildersService: FormBuilder,
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
  ngOnChanges(changes: SimpleChanges) {
    this.setPropertyValue(changes);
  }

  ngOnInit() {
    if (this.dataSource) {
      this.dataSource.filterPredicate = this.createFilter();
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
    let list = this.dynamicDisplayedColumns
      .filter((cd) => cd.show)
      .map((cd) => cd.name);
    return list;
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
    }
  }
  /**
   * @description set list of columns to display in table.
   * @param columns columns array from user input with configurations.
   */
  setColumnsList(columns: MTExColumn[]) {
    this.columnsList = [];
    this.displayedColumns = ['select', 'edit', 'popup', 'delete'];
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
   * @description This methohd create filter predicate function which will set search value to table filters
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
    this.tableData.splice(index, 1);
    this.dataSource = new MatTableDataSource(this.tableData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
      const group = this.formBuildersService.group({});
      columns.forEach((column: MTExColumn) => {
        const control = this.formBuildersService.control(true);
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
    var element = document.getElementById('matTableExt' + this.tableID);
    var ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
    ws = this.writeSheetData(ws);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `tablesheets.${type}`);
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
