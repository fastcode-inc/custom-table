import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, EventEmitter, Output } from '@angular/core';
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
import { UntypedFormBuilder, FormControl, UntypedFormGroup } from '@angular/forms';
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
} from '../lib/models/tableExtModels';
import { MatTableExtService } from '../lib/mat-table-ext.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
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
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
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
  @Output() selectionChanged: EventEmitter<RowSelectionChange> = new EventEmitter<any>();
  @Output() expansionChange: EventEmitter<ExpansionChange> = new EventEmitter<any>();

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
  headersFilters: MTExColumn[] = [];
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
  hideShowMenuGroup!: UntypedFormGroup;
  cellTemplate!: TemplateRef<any>;
  menuX: number = 0;
  menuY: number = 0;
  dynamicDisplayedColumns: any[] = [
    { filter: false, name: 'select', show: false },
    { filter: false, name: 'edit', show: false },
    { filter: false, name: 'popup', show: false },
    { filter: false, name: 'delete', show: false },
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
    public formBuildersService: UntypedFormBuilder,
    public domSanitizer: DomSanitizer,
    public matIconRegistry: MatIconRegistry
  ) {
    //used to add custom icons to registry
    this.addIconsToRegistry();
    if (this.dataSource) {
      this.tableData = this.dataSource.data;
    }
  }

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

  setColumnHideShow() {
    if (
      this.hideShowMenuGroup !== undefined &&
      this.hideShowMenuGroup !== null
    ) {
      this.updateColumnsHideShow(this.hideShowMenuGroup.value);
    }
  }
/** 
 * @description set the properties of the table
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
    expandRows: (value: any) =>
      (this.columnsToDisplayWithExpand = [...this.displayedColumns, 'expand']),
    sorting: (value: any) => (this.dataSource.sort = this.sort),
  };

  setTableDataSource(value: any) {
    if (value.currentValue) {
      this.tableData = value.currentValue.data;
      this.dataSource = value.currentValue;
      this.reCal();
    } else {
      this.dataSource = new MatTableDataSource([{}]);
    }
  }

  setRowSelection(value: boolean) {
    this.selection = new SelectionModel<any>(true, []);
    this.showSelectionColumn('select', value);
  }

  setColumnFilter(value: boolean) {
    if (value) {
      this.headersFiltersIds = this.columnsArray.map(
        (column, i) => column.field + '_' + i
      );
      let array: MTExColumn[] = [];
      this.columnsArray.forEach((column, i) => {
        let obj = {
          type: column?.type,
          field: column?.field + '_' + i,
        };
        array.push(obj);
      });
      this.headersFilters = array;
      this.dataSource.filterPredicate = this.createFilter();
    } else {
      this.headersFilters = [];
      this.headersFiltersIds = [];
      this.dataSource.filter = '';
    }
    this.toggleFilters = value;
  }

  getDisplayedColumns(): string[] {
    let list = this.dynamicDisplayedColumns
      .filter((cd) => cd.show)
      .map((cd) => cd.name);
    return list;
  }

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

  menuClosed() {
    this.exportMenuCtrl = false;
  }

  setColumnsData(columns: MTExColumn[]) {
    if (columns.length) {
      this.columnsArray = [...columns];
      this.setColumnsList(columns);
    }
  }

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

  showHideColumn(name: string, value: boolean) {
    this.dynamicDisplayedColumns.filter((a) => a.name == name)[0].show = value;
  }

  showSelectionColumn(name: string, value: boolean) {
    let column = this.dynamicDisplayedColumns.filter((a) => a.name == name)[0];
    let index = this.dynamicDisplayedColumns.findIndex(
      (column: any) => column.name == name
    );
    if (index > -1) {
      this.dynamicDisplayedColumns.splice(index, 1);
      this.dynamicDisplayedColumns.unshift(column);
      this.dynamicDisplayedColumns.filter(
        (column) => column.name == name
      )[0].show = value;
    }
  }

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
        // result = eval(expression);
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

  applyFilter(event: any) {
    this.globalFilter = event;
    let columns: any = {};
    this.columnsArray.forEach((column: MTExColumn) => {
      if (column.field) columns[column.field] = event;
    });
    this.dataSource.filter = JSON.stringify(columns);
  }

  applySingleFilter(event: any, column: any) {
    this.individualFilter = column.field;
    this.filterValues[column.field] = event[column.field];
    this.dataSource.filter = JSON.stringify(this.filterValues);
  }

  enableInlineEditing(row: any, i: number) {
    const rowData: any = {};
    rowData['e' + i] = { ...row };
    this.rowDataTemp = rowData;
    setTimeout(() => {
      this.tableData[i]['editable'] = !this.tableData[i]['editable'];
    }, 0);
  }

  getInlineEditingData(row: any, index: number, column: any) {
    this.inlineEditingTemplateRefData = {
      row: { ...row },
      column: { ...column },
      index: index,
      updateFunc: this.updateInlineTemplateData,
    };
    return this.inlineEditingTemplateRefData;
  }

  updateInlineTemplateData = (row: any) => {
    this.service.selectedRow.next(row);
  };

  setCellData(row: any, i: number) {
    this.currentRow = { ...row };
    this.currentRowIndex = i;
    this.rowDataTemp['e' + i] = { ...row };
  }

  cancelInlineEditing(row: any, i: number) {
    this.tableData.filter((a: any) => a.id == row.id)[0]['editable'] =
      !this.tableData.filter((a: { id: any }) => a.id == row.id)[0]['editable'];
    this.dataSource = new MatTableDataSource(this.tableData);
    this.rowDataTemp['e' + i] = {};
    this.service.selectedRow.next(undefined);
  }

  saveInlineEditing(row: any, index: number) {
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

  deleteRow(row: any, index: number) {
    this.tableData.splice(index, 1);
    this.dataSource = new MatTableDataSource(this.tableData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.rowDeleted.emit({ removedRow: row, fromIndex: index });
  }

  // function trigger when row expanded or collapsed.
  expandRow(row: any, expand: boolean, index: number) {
    if (this.expandRows) {
      this.expansionChange.emit({ data: row, expanded: expand, index: index });
      this.expandedElement = this.expandedElement === row ? null : row;
    }
  }

  openEditingDialog(row: any, index?: any) {
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

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1
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
   * 
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

  resetMenuChecks() {
    this.hideShowMenuCtrl = false;
    this.showHideColumnsArray = [];
    this.columnPinMenuCtrl = false;
    this.columnPinningOptions = [];
  }

  filterColumns(value: any) {
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

  openHideShowMenu(columns: MTExColumn[]) {
    this.showHideColumnsArray = [...columns];
    this.columnMenuTrigger.openMenu();
  }

  updateColumnsHideShow(values: any) {
    let keys = Object.keys(values);
    keys.forEach((key: string) => {
      this.showHideColumn(key, values[key]);
    });
  }

  //function to emit scroll event.
  onScroll(event: any) {
    this.scroll.emit(event);
  }
  /**
   * 
   * @param row row to be toggled
   * @param index index of toggled row
   */
  //function to emit event when user select or deselect row.
  setSelectedRows(row: any, index: number) {
    this.selection.toggle(row);
    if (this.selection.isSelected(row)) {
      this.selectionChanged.emit({ row: row, index: index, isSelected: true });
    } else {
      this.selectionChanged.emit({ row: row, index: index, isSelected: false });
    }
  }
  //function to show all hidden rows.
  showHiddenRows() {
    this.hideRows = false;
    this.selection.clear();
    this.hiddenCtrl.clear();
  }
  //function to hide selected rows.
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
  //function to reassign values when dataSource is changed.
  reCal(): void {
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

  addIconsToRegistry() {
    let y = this.domSanitizer.bypassSecurityTrustResourceUrl(`../../assets/pinRight.svg`);
    let iconNames = ['pinLeft', 'pinRight', 'pinNone', 'pinned', 'pinIcon'];
    iconNames.forEach((icon) => {
      this.matIconRegistry.addSvgIcon(
        icon,
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          `../../assets/${icon}.svg`
        )
      );
    });
  }
}
