import { TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { SimpleChange } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { MTExColumn } from './models/tableExtModels';

import { TableExportService } from './services/table-export.service';
import { TablePrintService } from './services/table-print.service';
import { MatTableExtService } from './services/mat-table-ext.service';

import { MatTableExtComponent } from './mat-table-ext.component';

@Component({
  standalone: true,
  imports: [MatTableExtComponent],
  template: `
    <mat-table-ext
      [dataSource]="dataSource"
      [columns]="columns"
      columnResizable
      stripedRows="true"
      rowHover="true"
      showPaginator="false"
      printButtonEnable="true"
      showToolbar="false"
    ></mat-table-ext>
  `,
})
class HostComponent {
  @ViewChild(MatTableExtComponent) table!: MatTableExtComponent;
  dataSource = new MatTableDataSource([{ id: 1, name: 'A' }]);
  columns: MTExColumn[] = [
    { field: 'id', header: 'ID', type: 'number' },
    { field: 'name', header: 'Name', type: 'string' },
  ];
}

describe('MatTableExtComponent', () => {
  const baseColumns: MTExColumn[] = [
    { field: 'id', header: 'ID', type: 'number' },
    { field: 'name', header: 'Name', type: 'string' },
  ];

  function createHost() {
    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();
    return { hostFixture, hostComponent: hostFixture.componentInstance, table: hostFixture.componentInstance.table };
  }

  function setVisibleDataColumns(table: MatTableExtComponent) {
    (table as any).dynamicDisplayedColumns = [
      { filter: true, name: 'id', show: true },
      { filter: true, name: 'name', show: true },
      { filter: false, name: 'select', show: false },
      { filter: false, name: 'edit', show: false },
      { filter: false, name: 'popup', show: false },
      { filter: false, name: 'delete', show: false },
      { filter: false, name: 'freeze', show: false },
      { filter: false, name: 'hide', show: false },
      { filter: false, name: 'pin', show: false },
    ];
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatTableExtComponent, NoopAnimationsModule],
      providers: [
        {
          provide: MatDialog,
          useValue: {
            open: () => ({ afterClosed: () => of(undefined) }),
          },
        },
        {
          provide: MatTableExtService,
          useValue: { selectedRow: new BehaviorSubject(null) },
        },
        {
          provide: TableExportService,
          useValue: {
            exportTable: () => Promise.resolve(),
            exportToPDF: () => Promise.resolve(),
          },
        },
        {
          provide: TablePrintService,
          useValue: { printTable: () => {} },
        },
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustResourceUrl: (url: string) => url,
          },
        },
        {
          provide: MatIconRegistry,
          useValue: {
            addSvgIcon: () => {},
            getNamedSvgIcon: () =>
              of(document.createElementNS('http://www.w3.org/2000/svg', 'svg')),
          },
        },
      ],
    })
    .compileComponents();
  });

  it('should create', () => {
    const { table } = createHost();
    expect(table).toBeTruthy();
  });

  it('should coerce boolean inputs using booleanAttribute transform', () => {
    const { table } = createHost();
    expect(table.columnResizable).toBeTrue();
    expect(table.stripedRows).toBeTrue();
    expect(table.rowHover).toBeTrue();
    expect(table.showPaginator).toBeFalse();
    expect(table.printButtonEnable).toBeTrue();
    expect(table.showToolbar).toBeFalse();
  });

  it('should apply setter side-effects for editing, selection, filtering and pagination options', () => {
    const { table } = createHost();
    const showHideSpy = spyOn(table, 'showHideColumn');
    const setRowSelectionSpy = spyOn(table as unknown as { setRowSelection: (value: boolean) => void }, 'setRowSelection');
    const sortMock = {
      sortChange: of({}),
      initialized: of(undefined),
      active: '',
      direction: '',
    };

    table.dataSource = new MatTableDataSource<Record<string, unknown>>([{ id: 1 }]);
    table.enableRowPinning = true;
    table.sort = sortMock as never;

    table.inlineRowEditing = true;
    table.popupRowEditing = true;
    table.enableDelete = true;
    table.rowSelection = true;
    table.multiRowSelection = true;
    table.globalSearch = true;
    table.sorting = true;
    table.pageSizeOptions = [25, 0, -1, 50];

    expect(showHideSpy).toHaveBeenCalledWith('edit', true);
    expect(showHideSpy).toHaveBeenCalledWith('popup', true);
    expect(showHideSpy).toHaveBeenCalledWith('delete', true);
    expect(setRowSelectionSpy).toHaveBeenCalledWith(true);
    expect(table.selection instanceof Object).toBeTrue();
    expect(typeof table.dataSource.filterPredicate).toBe('function');
    expect(table.dataSource.sort).toBe(table.sort);
    expect(table.pinnedTopDataSource.sort).toBe(table.sort);
    expect(table.pinnedBtmDataSource.sort).toBe(table.sort);
    expect(table.pageSizeOptions).toEqual([25, 50]);
  });

  it('should expose dataSource, columns and columnGroups via getters', () => {
    const { table } = createHost();
    const nextDataSource = new MatTableDataSource<Record<string, unknown>>([
      { id: 10, name: 'Z' },
    ]);
    const nextColumns = [
      { field: 'id', header: 'ID', type: 'number' },
      { field: 'name', header: 'Name', type: 'string' },
    ] as MTExColumn[];

    table.dataSource = nextDataSource;
    table.columns = nextColumns;
    table.columnGroups = [{ name: 'group1', label: 'Group 1', columns: ['id'] }];

    expect(table.dataSource).toBe(nextDataSource);
    expect(table.tableData).toEqual(nextDataSource.data);
    expect(table.columns).toBe(nextColumns);
    expect(table.columnGroups).toEqual([
      { name: 'group1', label: 'Group 1', columns: ['id'] },
    ]);

    table.columnGroups = null as unknown as never;
    expect(table.columnGroups).toEqual([]);
  });

  it('should normalize pageSizeOptions and keep defaults for invalid input', () => {
    const { table } = createHost();

    table.pageSizeOptions = [];
    expect(table.pageSizeOptions).toEqual([10, 50, 100]);

    table.pageSizeOptions = [15, -1, 0, 25, 50];
    expect(table.pageSizeOptions).toEqual([15, 25, 50]);
  });

  it('should apply sticky and row utility setter side effects', () => {
    const { table } = createHost();
    const offsetSpy = spyOn(
      table as unknown as { updatePinnedRowOffsets: () => void },
      'updatePinnedRowOffsets',
    );
    const showHideSpy = spyOn(table, 'showHideColumn');

    table.stickyHeader = true;
    table.stickyFooter = true;
    table.enableRowHiding = true;
    table.enableRowFreezing = true;

    expect(table.stickyHeader).toBeTrue();
    expect(table.stickyFooter).toBeTrue();
    expect(offsetSpy).toHaveBeenCalledTimes(2);
    expect(table.enableRowHiding).toBeTrue();
    expect(table.enableRowFreezing).toBeTrue();
    expect(showHideSpy).toHaveBeenCalledWith('hide', true);
    expect(showHideSpy).toHaveBeenCalledWith('freeze', true);
  });

  it('should apply enableRowPinning setter lifecycle and getter state', () => {
    const { table } = createHost();
    const tableAny = table as unknown as {
      isViewInitialized: boolean;
      initializePinnedRows: () => void;
      attachResizeListener: () => void;
      updatePinnedRowOffsets: () => void;
      detachResizeListener: () => void;
      clearResizeDebounceTimer: () => void;
      enableRowPinning: boolean;
    };

    tableAny.isViewInitialized = true;
    const initializeSpy = spyOn(tableAny, 'initializePinnedRows');
    const attachSpy = spyOn(tableAny, 'attachResizeListener');
    const updateSpy = spyOn(tableAny, 'updatePinnedRowOffsets');
    const detachSpy = spyOn(tableAny, 'detachResizeListener');
    const clearSpy = spyOn(tableAny, 'clearResizeDebounceTimer');

    tableAny.enableRowPinning = true;
    expect(table.enableRowPinning).toBeTrue();
    expect(initializeSpy).toHaveBeenCalled();
    expect(attachSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();

    tableAny.enableRowPinning = false;
    expect(table.enableRowPinning).toBeFalse();
    expect(detachSpy).toHaveBeenCalled();
    expect(clearSpy).toHaveBeenCalled();
  });

  it('should keep boolean getter states in sync with corresponding setters', () => {
    const { table } = createHost();

    table.inlineRowEditing = true;
    table.popupRowEditing = true;
    table.enableDelete = true;
    table.rowSelection = true;
    table.multiRowSelection = true;
    table.columnFilter = true;
    table.globalSearch = true;
    table.sorting = true;
    table.enableRowHiding = true;
    table.enableRowFreezing = true;

    expect(table.inlineRowEditing).toBeTrue();
    expect(table.popupRowEditing).toBeTrue();
    expect(table.enableDelete).toBeTrue();
    expect(table.rowSelection).toBeTrue();
    expect(table.multiRowSelection).toBeTrue();
    expect(table.columnFilter).toBeTrue();
    expect(table.globalSearch).toBeTrue();
    expect(table.sorting).toBeTrue();
    expect(table.enableRowHiding).toBeTrue();
    expect(table.enableRowFreezing).toBeTrue();
  });

  it('should execute invalid/guard branches for dataSource, columns and pageSizeOptions setters', () => {
    const { table } = createHost();
    const warningSpy = spyOn(table.validationWarning, 'emit');
    const validDataSource = new MatTableDataSource<Record<string, unknown>>([
      { id: 1, name: 'A' },
    ]);

    table.dataSource = validDataSource;
    table.dataSource = null as unknown as MatTableDataSource<Record<string, unknown>>;
    table.columns = null as unknown as MTExColumn[];
    table.pageSizeOptions = null as unknown as number[];
    table.pageSizeOptions = [-1, 0];

    expect(table.dataSource).toBe(validDataSource);
    expect(table.columns).toEqual([]);
    expect(table.pageSizeOptions).toEqual([]);
    expect(warningSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ code: 'MISSING_DATASOURCE', inputName: 'dataSource' }),
    );
    expect(warningSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ code: 'INVALID_COLUMNS', inputName: 'columns' }),
    );
    expect(warningSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ code: 'INVALID_PAGE_SIZE_OPTIONS', inputName: 'pageSizeOptions' }),
    );
  });

  it('should cover false-path branches for rowSelection and columnFilter setters/getters', () => {
    const { table } = createHost();
    const setRowSelectionSpy = spyOn(
      table as unknown as { setRowSelection: (value: boolean) => void },
      'setRowSelection',
    ).and.callThrough();
    const setColumnFilterSpy = spyOn(
      table as unknown as { setColumnFilter: (value: boolean) => void },
      'setColumnFilter',
    ).and.callThrough();

    table.dataSource = new MatTableDataSource<Record<string, unknown>>([{ id: 1 }]);
    table.rowSelection = false;
    table.columnFilter = false;

    expect(setRowSelectionSpy).toHaveBeenCalledWith(false);
    expect(setColumnFilterSpy).toHaveBeenCalledWith(false);
    expect(table.rowSelection).toBeFalse();
    expect(table.columnFilter).toBeFalse();
    expect((table as unknown as { headersFiltersIds: string[] }).headersFiltersIds).toEqual([]);
    expect(table.dataSource.filter).toBe('');
  });

  it('should cover enableRowPinning true branch when view is not initialized', () => {
    const { table } = createHost();
    const tableAny = table as unknown as {
      isViewInitialized: boolean;
      initializePinnedRows: () => void;
      attachResizeListener: () => void;
      updatePinnedRowOffsets: () => void;
      enableRowPinning: boolean;
    };

    tableAny.isViewInitialized = false;
    const initializeSpy = spyOn(tableAny, 'initializePinnedRows');
    const attachSpy = spyOn(tableAny, 'attachResizeListener');
    const updateSpy = spyOn(tableAny, 'updatePinnedRowOffsets');

    tableAny.enableRowPinning = true;

    expect(table.enableRowPinning).toBeTrue();
    expect(initializeSpy).toHaveBeenCalled();
    expect(attachSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('should cover sorting/globalSearch branches when dataSource is absent', () => {
    const { table } = createHost();
    const tableAny = table as unknown as {
      _dataSource: MatTableDataSource<Record<string, unknown>> | undefined;
      _enableRowPinning: boolean;
      sort: unknown;
    };
    const sortMock = {
      sortChange: of({}),
      initialized: of(undefined),
      active: 'id',
      direction: 'asc',
    };

    tableAny._dataSource = undefined;
    tableAny._enableRowPinning = false;
    tableAny.sort = sortMock;

    expect(() => {
      table.sorting = true;
      table.globalSearch = true;
    }).not.toThrow();

    expect(table.sorting).toBeTrue();
    expect(table.globalSearch).toBeTrue();
  });

  it('should cover columnGroups setter branch that requests sync only when row pinning is enabled', () => {
    const { table } = createHost();
    const requestSyncSpy = spyOn(
      table as unknown as { requestColumnSync: () => void },
      'requestColumnSync',
    );

    table.columnGroups = [{ name: 'g1', label: 'G1', columns: ['id'] }];
    expect(requestSyncSpy).not.toHaveBeenCalled();

    (table as unknown as { _enableRowPinning: boolean })._enableRowPinning = true;
    table.columnGroups = [{ name: 'g2', label: 'G2', columns: ['name'] }];

    expect(requestSyncSpy).toHaveBeenCalled();
    expect(table.columnGroups).toEqual([{ name: 'g2', label: 'G2', columns: ['name'] }]);
  });

  it('should cover expandRows branches when expand column already exists and when absent on collapse', () => {
    const { table } = createHost();
    const tableAny = table as unknown as {
      displayedColumns: string[];
      columnsToDisplayWithExpand: string[];
    };

    tableAny.displayedColumns = ['id', 'expand'];
    table.expandRows = true;
    expect(tableAny.displayedColumns.filter((c) => c === 'expand').length).toBe(1);

    tableAny.displayedColumns = ['id', 'name'];
    table.expandedElement = { id: 1 } as Record<string, unknown>;
    table.expandRows = false;

    expect(tableAny.displayedColumns).toEqual(['id', 'name']);
    expect(tableAny.columnsToDisplayWithExpand).toEqual(['id', 'name']);
    expect(table.expandedElement).toBeNull();
  });

  it('should create a fallback datasource in setTableDataSource when currentValue is missing', () => {
    const { table } = createHost();

    table.setTableDataSource(new SimpleChange(undefined, undefined, false));

    expect(table.dataSource).toBeTruthy();
    expect(Array.isArray(table.dataSource.data)).toBeTrue();
    expect(table.dataSource.data.length).toBe(1);
  });

  it('should toggle expand rows and keep expand column in sync', () => {
    const { table } = createHost();
    (table as any).displayedColumns = ['id', 'name'];
    table.expandedElement = { id: 1 } as Record<string, unknown>;

    table.expandRows = true;
    expect((table as any).columnsToDisplayWithExpand).toContain('expand');
    expect((table as any).displayedColumns).toContain('expand');

    table.expandRows = false;
    expect((table as any).columnsToDisplayWithExpand).toEqual(['id', 'name', 'expand']);
    expect((table as any).displayedColumns).toEqual(['id', 'name']);
    expect(table.expandedElement).toBeNull();
  });

  it('should apply global filter across row fields (case-insensitive)', () => {
    const { table } = createHost();
    table.dataSource = new MatTableDataSource<Record<string, unknown>>([
      { id: 1, name: 'Alpha' },
      { id: 2, name: 'BeTa' },
    ]);

    table.applyGlobalFilter('beta');
    const predicate = table.createFilter();

    expect(predicate({ id: 1, name: 'Alpha' }, table.dataSource.filter)).toBeFalse();
    expect(predicate({ id: 2, name: 'BeTa' }, table.dataSource.filter)).toBeTrue();
  });

  it('should apply individual column filter using the provided searchValue', () => {
    const { table } = createHost();
    table.dataSource = new MatTableDataSource<Record<string, unknown>>([
      { id: 1, name: 'Alpha' },
      { id: 2, name: 'Beta' },
    ]);

    const nameColumn = { field: 'name', header: 'Name', type: 'string' } as MTExColumn;
    table.applyColumnFilter({ name: 'et' } as unknown as Record<string, string>, nameColumn);
    const predicate = table.createFilter();

    expect(predicate({ id: 1, name: 'Alpha' }, table.dataSource.filter)).toBeFalse();
    expect(predicate({ id: 2, name: 'Beta' }, table.dataSource.filter)).toBeTrue();
  });

  it('should treat empty individual searchValue as non-restrictive for that column', () => {
    const { table } = createHost();
    table.dataSource = new MatTableDataSource<Record<string, unknown>>([
      { id: 1, name: 'Alpha' },
      { id: 2, name: 'Beta' },
    ]);

    const nameColumn = { field: 'name', header: 'Name', type: 'string' } as MTExColumn;
    table.applyColumnFilter({ name: '' } as unknown as Record<string, string>, nameColumn);
    const predicate = table.createFilter();

    expect(predicate({ id: 1, name: 'Alpha' }, table.dataSource.filter)).toBeTrue();
    expect(predicate({ id: 2, name: 'Beta' }, table.dataSource.filter)).toBeTrue();
  });

  it('should not throw when filter JSON is malformed', () => {
    const { table } = createHost();
    table.dataSource = new MatTableDataSource<Record<string, unknown>>([
      { id: 1, name: 'Alpha' },
    ]);

    table.applyColumnFilter({ name: 'Al' } as unknown as Record<string, string>, { field: 'name', header: 'Name', type: 'string' } as MTExColumn);
    const predicate = table.createFilter();

    expect(() => predicate({ id: 1, name: 'Alpha' }, '{bad-json')).not.toThrow();
    expect(predicate({ id: 1, name: 'Alpha' }, '{bad-json')).toBeTrue();
  });

  it('should configure and clear column filter metadata', () => {
    const { table } = createHost();
    const tableAny = table as any;

    table.columnsArray = [...baseColumns];
    tableAny.dynamicDisplayedColumns = [
      { filter: true, name: 'id', show: true },
      { filter: true, name: 'name', show: false },
      { filter: false, name: 'select', show: false },
    ];

    table.setColumnFilter(true);
    expect(tableAny.headersFiltersIds).toEqual(['id_0']);
    expect(table.columnIndexMap.get('id_0')).toBe(0);

    table.setColumnFilter(false);
    expect(tableAny.headersFiltersIds).toEqual([]);
    expect(table.dataSource.filter).toBe('');
  });

  it('should return grouped and filtered displayed columns in expected order', () => {
    const { table } = createHost();
    const tableAny = table as any;

    table.columnsArray = [...baseColumns, { field: 'city', header: 'City', type: 'string' } as MTExColumn];
    table.columnGroups = [{ name: 'Info', label: 'Info', columns: ['name'] }];
    tableAny.dynamicDisplayedColumns = [
      { filter: false, name: 'select', show: true },
      { filter: true, name: 'id', show: true },
      { filter: true, name: 'name', show: true },
      { filter: true, name: 'city', show: true },
      { filter: false, name: 'edit', show: true },
      { filter: false, name: 'popup', show: false },
      { filter: false, name: 'delete', show: false },
      { filter: false, name: 'freeze', show: false },
      { filter: false, name: 'hide', show: false },
      { filter: false, name: 'pin', show: false },
    ];

    expect(table.getDisplayedColumns()).toEqual(['select', 'name', 'id', 'city', 'edit']);
    expect(table.getGroupedColumns()).toEqual(['group-Info', 'ungrouped-id', 'ungrouped-city', 'ungrouped-select', 'ungrouped-edit']);
  });

  it('should build filter columns including action placeholders', () => {
    const { table } = createHost();
    const tableAny = table as any;

    table.columnsArray = [...baseColumns];
    table.columnGroups = [];
    table.columnFilter = true;
    tableAny.headersFiltersIds = ['id_0', 'name_1'];
    tableAny.dynamicDisplayedColumns = [
      { filter: false, name: 'select', show: true },
      { filter: true, name: 'id', show: true },
      { filter: true, name: 'name', show: true },
      { filter: false, name: 'edit', show: true },
      { filter: false, name: 'popup', show: false },
      { filter: false, name: 'delete', show: false },
      { filter: false, name: 'freeze', show: false },
      { filter: false, name: 'hide', show: false },
      { filter: false, name: 'pin', show: false },
    ];

    expect(table.getFilterColumns()).toEqual(['filter-select', 'id_0', 'name_1', 'filter-edit']);
  });


  it('should update select column visibility and preserve first position', () => {
    const { table } = createHost();
    const tableAny = table as any;

    tableAny.dynamicDisplayedColumns = [
      { filter: true, name: 'id', show: true },
      { filter: false, name: 'select', show: false },
      { filter: true, name: 'name', show: true },
    ];

    table.updateSelectionColumnVisibility(true);
    expect(tableAny.dynamicDisplayedColumns[0].name).toBe('select');
    expect(tableAny.dynamicDisplayedColumns[0].show).toBeTrue();
  });

  it('should toggle all rows selection state', () => {
    const { table } = createHost();
    table.multiRowSelection = true;
    table.dataSource = new MatTableDataSource<Record<string, unknown>>([
      { id: 1 },
      { id: 2 },
    ]);

    expect(table.isAllSelected()).toBeFalse();
    table.toggleAllRows();
    expect(table.isAllSelected()).toBeTrue();
    table.toggleAllRows();
    expect(table.isAllSelected()).toBeFalse();
  });

  it('should move selected rows into hidden controller and clear state', () => {
    const { table } = createHost();
    table.multiRowSelection = true;
    const rowA = { id: 1 };
    const rowB = { id: 2 };
    table.dataSource = new MatTableDataSource<Record<string, unknown>>([rowA, rowB]);
    table.selection.select(rowA, rowB);

    table.hideSelectedRows();
    expect(table.hiddenCtrl.isSelected(rowA)).toBeTrue();
    expect(table.hiddenCtrl.isSelected(rowB)).toBeTrue();

    table.showHiddenRows();
    expect(table.selection.isEmpty()).toBeTrue();
    expect(table.hiddenCtrl.isEmpty()).toBeTrue();
  });

  it('should initialize pinned rows from rowPinningFn', () => {
    const { table } = createHost();
    table.dataSource = new MatTableDataSource<Record<string, unknown>>([
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ]);
    table.rowPinningFn = (_row, index) => (index === 0 ? 'top' : index === 2 ? 'bottom' : null);

    table.initializePinnedRows();

    expect(table.pinnedTopRows.length).toBe(1);
    expect(table.pinnedBottomRows.length).toBe(1);
    expect((table.pinnedTopRows[0] as Record<string, unknown>)['_pinnedPosition']).toBe('top');
    expect((table.pinnedBottomRows[0] as Record<string, unknown>)['_pinnedPosition']).toBe('bottom');
  });

  it('should set global filter payload for all configured columns', () => {
    const { table } = createHost();
    table.columnsArray = [...baseColumns];

    table.applyGlobalFilter('abc');

    expect(table.globalFilter).toBe('abc');
    expect(table.dataSource.filter).toBe(JSON.stringify({ id: 'abc', name: 'abc' }));
  });

  it('should emit exportError when export service rejects', async () => {
    const { table } = createHost();
    table.columnsArray = [...baseColumns];
    const exportErrorSpy = spyOn(table.exportError, 'emit');
    const exportService = TestBed.inject(TableExportService);
    spyOn(exportService, 'exportTable').and.returnValue(Promise.reject(new Error('boom')));

    await table.exportTable('csv');

    expect(exportErrorSpy).toHaveBeenCalledWith({ type: 'csv', error: 'boom' });
  });

  it('should delegate printTable to TablePrintService', () => {
    const { table } = createHost();
    const printService = TestBed.inject(TablePrintService);
    const printSpy = spyOn(printService, 'printTable');

    table.hiddenRowIndices = [1, 2];
    table.printTable();

    expect(printSpy).toHaveBeenCalledWith(table.tableID, [1, 2]);
  });

  it('should export PDF with computed styles when header/group templates are present', async () => {
    const { table } = createHost();
    const exportService = TestBed.inject(TableExportService);
    const exportSpy = spyOn(exportService, 'exportToPDF').and.returnValue(
      Promise.resolve(),
    );

    table.columnsArray = [...baseColumns];
    setVisibleDataColumns(table);
    table.columnGroups = [{ name: 'meta', label: 'Meta', columns: ['id'] }];
    table.toolbarTitle = 'PDF Title';
    table.pdfOrientation = 'landscape';
    table.dataSource = new MatTableDataSource<Record<string, unknown>>([
      { id: 1, name: 'A' },
    ]);
    table.hiddenRowIndices = [0];
    table.headerTemplateRef = {} as never;

    const host = document.createElement('div');
    const headerCell = document.createElement('div');
    headerCell.className = 'mat-mdc-header-cell';
    const groupCell = document.createElement('div');
    groupCell.className = 'group-header-cell';
    host.appendChild(headerCell);
    host.appendChild(groupCell);
    table.tableElement = { nativeElement: host } as never;

    const getStyleSpy = spyOn(window, 'getComputedStyle').and.callFake(
      (el: Element) => {
        if ((el as HTMLElement).className.includes('group-header-cell')) {
          return {
            backgroundColor: 'transparent',
            color: 'rgb(20, 30, 40)',
            fontWeight: '500',
          } as CSSStyleDeclaration;
        }
        return {
          backgroundColor: 'rgb(1, 2, 3)',
          color: 'rgb(4, 5, 6)',
          fontWeight: '700',
        } as CSSStyleDeclaration;
      },
    );

    await table.exportToPDF();

    expect(exportSpy).toHaveBeenCalled();
    const payload = exportSpy.calls.mostRecent().args[0] as {
      fileName: string;
      orientation: string;
      title?: string;
      headerStyles: { fillColor: number[]; textColor: number[]; fontStyle: string };
      groupHeaderStyles: { fillColor: number[]; textColor: number[]; fontStyle: string } | null;
    };
    expect(payload.fileName).toBe('PDF Title');
    expect(payload.orientation).toBe('landscape');
    expect(payload.title).toBe('PDF Title');
    expect(payload.headerStyles.fillColor).toEqual([1, 2, 3]);
    expect(payload.headerStyles.textColor).toEqual([4, 5, 6]);
    expect(payload.headerStyles.fontStyle).toBe('bold');
    expect(payload.groupHeaderStyles?.fillColor).toEqual([1, 2, 3]);
    expect(payload.groupHeaderStyles?.textColor).toEqual([20, 30, 40]);
    expect(payload.groupHeaderStyles?.fontStyle).toBe('normal');
    expect(getStyleSpy).toHaveBeenCalled();
  });

  it('should emit exportError when exportToPDF rejects', async () => {
    const { table } = createHost();
    const exportService = TestBed.inject(TableExportService);
    const errorSpy = spyOn(table.exportError, 'emit');
    spyOn(exportService, 'exportToPDF').and.returnValue(
      Promise.reject(new Error('pdf boom')),
    );

    table.columnsArray = [...baseColumns];
    setVisibleDataColumns(table);
    table.dataSource = new MatTableDataSource<Record<string, unknown>>([
      { id: 1, name: 'A' },
    ]);

    await table.exportToPDF();

    expect(errorSpy).toHaveBeenCalledWith({
      type: 'pdf',
      error: 'pdf boom',
    });
  });

  it('should parse returnIndex and normalize merge indices', () => {
    const { table } = createHost();
    expect(table.returnIndex('name_3')).toBe(3);

    const normalized = table.getMergeIndex([
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } },
    ]);

    expect(normalized).toEqual([
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
    ]);
  });

  it('should open row pin menu and close it', () => {
    const { table } = createHost();
    const row = { id: 1 } as Record<string, unknown>;
    const stopPropagation = jasmine.createSpy('stopPropagation');

    table.openRowPinMenu({ clientX: 5, clientY: 10, stopPropagation } as unknown as MouseEvent, row);
    expect(stopPropagation).toHaveBeenCalled();
    expect(table.rowPinMenuRow).toBe(row);

    table.closeRowPinMenu();
    expect(table.rowPinMenuRow).toBeNull();
  });

  it('should filter columns and reset menu checks', () => {
    const { table } = createHost();
    table.columnsArray = [
      { field: 'id', header: 'Identifier', type: 'number' } as MTExColumn,
      { field: 'name', header: 'Name', type: 'string' } as MTExColumn,
    ];

    table.filterColumns('name');
    expect(table.showHideColumnsArray.length).toBe(1);
    expect(table.showHideColumnsArray[0].field).toBe('name');

    table.resetMenuChecks();
    expect(table.hideShowMenuCtrl).toBeFalse();
    expect(table.columnPinMenuCtrl).toBeFalse();
    expect(table.showHideColumnsArray).toEqual([]);
  });

  it('should update columns visibility via updateColumnsHideShow', () => {
    const { table } = createHost();
    const showHideSpy = spyOn(table, 'showHideColumn');

    table.updateColumnsHideShow({ id: true, name: false });

    expect(showHideSpy).toHaveBeenCalledWith('id', true);
    expect(showHideSpy).toHaveBeenCalledWith('name', false);
  });

  it('should open export/hideShow/columnPin menus and track cursor position', () => {
    const { table } = createHost();
    const menuTrigger = { openMenu: jasmine.createSpy('openMenu') };
    const openHideShowSpy = spyOn(table, 'openHideShowMenu');
    (table as unknown as { menuTrigger: unknown }).menuTrigger = menuTrigger;
    table.columnsArray = [...baseColumns];

    table.openMenu('export', { clientX: 10, clientY: 20 } as MouseEvent);
    expect(table.exportMenuCtrl).toBeTrue();
    expect(menuTrigger.openMenu).toHaveBeenCalled();
    expect(table.menuX).toBe(10);
    expect(table.menuY).toBe(20);

    table.openMenu('hideShow', { clientX: 11, clientY: 21 } as MouseEvent);
    expect(table.hideShowMenuCtrl).toBeTrue();
    expect(openHideShowSpy).toHaveBeenCalledWith(table.columnsArray);

    table.openMenu('columnPin', { clientX: 12, clientY: 22 } as MouseEvent);
    expect(table.columnPinMenuCtrl).toBeTrue();
  });

  it('should reset export menu state when menu closes', () => {
    const { table } = createHost();
    table.exportMenuCtrl = true;

    table.menuClosed();

    expect(table.exportMenuCtrl).toBeFalse();
  });

  it('should open pinnable property menu and select current pinned option', () => {
    const { table } = createHost();
    const trigger = { openMenu: jasmine.createSpy('openMenu') };
    (table as unknown as { columnMenuTrigger: unknown }).columnMenuTrigger =
      trigger;

    table.openPinnablePropertyMenu(
      {
        field: 'name',
        header: 'Name',
        type: 'string',
        pinned: 'right',
      } as MTExColumn,
      { clientX: 33, clientY: 44 } as MouseEvent,
    );

    expect(table.menuX).toBe(33);
    expect(table.menuY).toBe(44);
    expect((table as any).columnPinningOptions.find((o: { value: string; selected: boolean }) => o.value === 'right')?.selected).toBeTrue();
    expect(trigger.openMenu).toHaveBeenCalled();
  });

  it('should select no-pin option when pinned is null', () => {
    const { table } = createHost();
    const trigger = { openMenu: jasmine.createSpy('openMenu') };
    (table as unknown as { columnMenuTrigger: unknown }).columnMenuTrigger =
      trigger;

    table.openPinnablePropertyMenu(
      {
        field: 'name',
        header: 'Name',
        type: 'string',
      } as MTExColumn,
      { clientX: 5, clientY: 6 } as MouseEvent,
    );

    const none = (table as any).columnPinningOptions.find(
      (o: { value: string | null; selected: boolean }) => o.value === null,
    );
    expect(none?.selected).toBeTrue();
    expect(trigger.openMenu).toHaveBeenCalled();
  });

  it('should emit scroll and row delete events', () => {
    const { table } = createHost();
    const scrollSpy = spyOn(table.scroll, 'emit');
    const deleteSpy = spyOn(table.rowDeleted, 'emit');
    const event = new Event('scroll');
    const row = { id: 7 } as Record<string, unknown>;

    table.onScroll(event);
    table.deleteRow(row, 0);

    expect(scrollSpy).toHaveBeenCalledWith(event);
    expect(deleteSpy).toHaveBeenCalledWith(row);
  });

  it('should update row data and emit popupChange when editing dialog returns data', () => {
    const { table } = createHost();
    const popupSpy = spyOn(table.popupChange, 'emit');
    const dialog = TestBed.inject(MatDialog);
    const row = { id: 1, name: 'A' } as Record<string, unknown>;
    table.tableData = [row];
    table.columnsArray = [...baseColumns];
    spyOn(dialog, 'open').and.returnValue({
      afterClosed: () => of({ id: 1, name: 'Edited' }),
    } as never);

    table.openEditingDialog(row);

    expect((table.tableData[0] as Record<string, unknown>)['name']).toBe('Edited');
    expect(popupSpy).toHaveBeenCalledWith({
      row: { id: 1, name: 'Edited' },
      index: 0,
    });
  });

  it('should update cell value and emit cellChange when cell popup dialog returns data', () => {
    const { table } = createHost();
    const cellSpy = spyOn(table.cellChange, 'emit');
    const dialog = TestBed.inject(MatDialog);
    table.tableData = [{ id: 1, name: 'A' } as Record<string, unknown>];
    spyOn(dialog, 'open').and.returnValue({
      afterClosed: () => of({ field: 'name', value: 'Edited' }),
    } as never);

    table.openCellPopupDialog(
      table.tableData[0],
      { field: 'name', header: 'Name', type: 'string' } as MTExColumn,
      0,
    );

    expect((table.tableData[0] as Record<string, unknown>)['name']).toBe('Edited');
    expect(cellSpy).toHaveBeenCalledWith({
      row: { id: 1, name: 'Edited' },
      index: 0,
    });
  });

  it('should switch active cell editing row and clear previous edit state', () => {
    const { table } = createHost();
    const rowA = { id: 1, name: 'A', editable: true } as Record<string, unknown>;
    const rowB = { id: 2, name: 'B', editable: false } as Record<string, unknown>;
    const restoreSpy = spyOn(table as unknown as { restoreOriginalSizes: () => void }, 'restoreOriginalSizes');

    table.tableData = [rowA, rowB];
    table.currentRowIndex = 0;
    table.cellEditing = { '0_name': true } as Record<string, boolean>;
    table.enableRowPinning = true;

    table.setCellData(rowB, 1);

    expect((table.tableData[0] as Record<string, unknown>)['editable']).toBeFalse();
    expect(table.cellEditing['0_name']).toBeUndefined();
    expect(table.currentRowIndex).toBe(1);
    expect(restoreSpy).toHaveBeenCalled();
    expect(table.rowDataTemp['e1']).toEqual(rowB);
  });

  it('should expand and collapse row when expandRows enabled', () => {
    const { table } = createHost();
    const expansionSpy = spyOn(table.expansionChange, 'emit');
    const row = { id: 1 } as Record<string, unknown>;

    table.expandRows = true;
    table.expandRow(row, true, 0);
    expect(expansionSpy).toHaveBeenCalledWith({ data: row, expanded: true, index: 0 });
    expect(table.expandedElement).toBe(row);

    table.expandRow(row, false, 0);
    expect(table.expandedElement).toBeNull();
  });

  it('should handle inline editing save and cancel flows', () => {
    const { table } = createHost();
    table.tableData = [{ id: 1, name: 'A', editable: false } as unknown as Record<string, unknown>];
    const inlineSpy = spyOn(table.inlineChange, 'emit');

    table.enableInlineEditing(table.tableData[0], 0);
    table.rowDataTemp['e0'] = { id: 1, name: 'B', editable: true } as Record<string, unknown>;
    table.saveInlineEditing(table.tableData[0], 0);
    expect(inlineSpy).toHaveBeenCalled();

    table.enableInlineEditing(table.tableData[0], 0);
    table.cancelInlineEditing(table.tableData[0], 0);
    expect(table.rowDataTemp['e0']).toEqual({} as Record<string, unknown>);
  });

  it('should save cell editing and emit change', () => {
    const { table } = createHost();
    table.tableData = [{ id: 1, name: 'A' } as Record<string, unknown>];
    table.currentRowIndex = 0;
    table.rowDataTemp['e0'] = { id: 1, name: 'C' } as Record<string, unknown>;
    const cellSpy = spyOn(table.cellChange, 'emit');

    table.saveCellEditing();

    expect(cellSpy).toHaveBeenCalledWith({ row: { id: 1, name: 'C' }, index: 0 });
    expect(table.currentRowIndex).toBe(-1);
  });

  it('should process onDrop when dndColumns is enabled', () => {
    const { table } = createHost();
    const tableAny = table as any;
    table.dndColumns = true;
    tableAny.dynamicDisplayedColumns = [
      { filter: false, name: 'select', show: false },
      { filter: true, name: 'id', show: true },
      { filter: true, name: 'name', show: true },
    ];

    table.onDrop({ previousIndex: 0, currentIndex: 1 } as never);

    expect(tableAny.dynamicDisplayedColumns[1].name).toBe('name');
  });

  it('should adjust onDrop indices for hidden select column and request sync when pinning enabled', () => {
    const { table } = createHost();
    const tableAny = table as any;
    const requestSyncSpy = spyOn(
      table as unknown as { requestColumnSync: () => void },
      'requestColumnSync',
    );

    table.dndColumns = true;
    table.enableRowPinning = true;
    tableAny.dynamicDisplayedColumns = [
      { filter: false, name: 'select', show: false },
      { filter: true, name: 'id', show: true },
      { filter: true, name: 'name', show: true },
      { filter: true, name: 'city', show: true },
    ];

    table.onDrop({ previousIndex: 0, currentIndex: 2 } as never);

    expect(tableAny.dynamicDisplayedColumns[3].name).toBe('id');
    expect(requestSyncSpy).toHaveBeenCalled();
  });

  it('should recalculate paginator, sorting and predicates', () => {
    const { table } = createHost();
    const tableAny = table as any;
    const paginatorMock = {
      page: of({}),
      initialized: of(undefined),
      pageIndex: 0,
      pageSize: 10,
      length: 0,
    };
    const sortMock = {
      sortChange: of({}),
      initialized: of(undefined),
      active: '',
      direction: '',
    };

    table.showPaginator = true;
    table.sorting = true;
    table.columnFilter = true;
    table.enableRowPinning = true;
    table.paginator = paginatorMock as never;
    table.sort = sortMock as never;
    tableAny.pinnedTopDataSource.filterPredicate = (() => true) as never;
    tableAny.pinnedBtmDataSource.filterPredicate = (() => true) as never;

    table.reCal();

    expect(table.dataSource.paginator).toBe(table.paginator);
    expect(table.dataSource.sort).toBe(table.sort);
    expect(typeof table.dataSource.filterPredicate).toBe('function');
  });

  it('should attach and detach row pinning listeners when pinning is toggled', () => {
    const { table } = createHost();
    const tableAny = table as unknown as {
      isViewInitialized: boolean;
      attachResizeListener: () => void;
      detachResizeListener: () => void;
      clearResizeDebounceTimer: () => void;
      updatePinnedRowOffsets: () => void;
      enableRowPinning: boolean;
    };

    tableAny.isViewInitialized = true;
    const attachSpy = spyOn(tableAny, 'attachResizeListener');
    const detachSpy = spyOn(tableAny, 'detachResizeListener');
    const clearTimerSpy = spyOn(tableAny, 'clearResizeDebounceTimer');
    const updateOffsetsSpy = spyOn(tableAny, 'updatePinnedRowOffsets');

    tableAny.enableRowPinning = true;
    expect(attachSpy).toHaveBeenCalled();
    expect(updateOffsetsSpy).toHaveBeenCalled();

    tableAny.enableRowPinning = false;
    expect(detachSpy).toHaveBeenCalled();
    expect(clearTimerSpy).toHaveBeenCalled();
  });

  it('should toggle hidden row state and clear all hidden rows', () => {
    const { table } = createHost();

    table.toggleRowHide(0);
    expect(table.isRowHidden(0)).toBeTrue();

    table.toggleRowHide(0);
    expect(table.isRowHidden(0)).toBeFalse();

    table.toggleRowHide(0);
    table.toggleRowHide(1);
    table.unhideAllRows();
    expect(table.hiddenRowIndices).toEqual([]);
  });

  it('should respect rowHidingFilterFn in isRowHidden', () => {
    const { table } = createHost();
    table.rowHidingFilterFn = (_row: unknown, index: number) => index === 0;

    expect(table.isRowHidden(0)).toBeTrue();
    expect(table.isRowHidden(1)).toBeFalse();
  });

  it('should pin and unpin rows and expose pin position helpers', () => {
    const { table } = createHost();
    const row = table.dataSource.data[0];
    table.table = { renderRows: () => {} } as unknown as MatTable<Record<string, unknown>>;

    table.pinRow(row, 'top');
    expect(table.isRowPinned(row)).toBeTrue();
    expect(table.getRowPinPosition(row)).toBe('top');
    expect(table.isRowPinnedTop(row)).toBeTrue();
    expect(table.isRowPinnedBottom(row)).toBeFalse();

    table.unpinRow(row);
    expect(table.isRowPinned(row)).toBeFalse();
    expect(table.getRowPinPosition(row)).toBeNull();
  });

  it('should mark for check, render rows and update offsets in updateDataSourceForPinning', () => {
    const { table } = createHost();
    const tableAny = table as unknown as {
      updateDataSourceForPinning: () => void;
      updatePinnedRowOffsets: () => void;
      cdr: { markForCheck: () => void };
    };
    const renderRowsSpy = jasmine.createSpy('renderRows');
    const markSpy = spyOn(tableAny.cdr, 'markForCheck');
    const offsetsSpy = spyOn(tableAny, 'updatePinnedRowOffsets');
    table.table = { renderRows: renderRowsSpy } as never;

    tableAny.updateDataSourceForPinning();

    expect(markSpy).toHaveBeenCalled();
    expect(renderRowsSpy).toHaveBeenCalled();
    expect(offsetsSpy).toHaveBeenCalled();
  });

  it('should return combined and unpinned row views when row pinning is enabled', () => {
    const { table } = createHost();
    table.enableRowPinning = true;

    const rowA: Record<string, unknown> = { id: 1, name: 'A' };
    const rowB: Record<string, unknown> = { id: 2, name: 'B' };
    const rowC: Record<string, unknown> = { id: 3, name: 'C' };
    table.dataSource = new MatTableDataSource([rowA, rowB, rowC]);
    table.pinnedTopRows = [rowA];
    table.pinnedBottomRows = [rowC];

    expect(table.getUnpinnedRows()).toEqual([rowB]);
    expect(table.getCombinedDataSource()).toEqual([rowA, rowB, rowC]);
  });

  it('should emit selection state through checkboxLabel and setSelectedRows', () => {
    const { table } = createHost();
    const selectionSpy = spyOn(table.selectionChanged, 'emit');
    const row = { position: 0, id: 1 };

    table.setSelectedRows(row, 0);
    expect(selectionSpy).toHaveBeenCalledWith({ row, index: 0, isSelected: true });
    expect(table.checkboxLabel(row)).toContain('deselect row 1');

    table.setSelectedRows(row, 0);
    expect(selectionSpy).toHaveBeenCalledWith({ row, index: 0, isSelected: false });
  });

  it('should emit validationWarning when required/typed inputs are invalid', () => {
    const { table } = createHost();
    const warningSpy = spyOn(table.validationWarning, 'emit');

    table.dataSource = null as unknown as MatTableDataSource<Record<string, unknown>>;
    table.columns = 'bad-columns' as unknown as MTExColumn[];
    table.pageSizeOptions = [];

    expect(warningSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      code: 'MISSING_DATASOURCE',
      inputName: 'dataSource',
      severity: 'warning',
    }));
    expect(warningSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      code: 'INVALID_COLUMNS',
      inputName: 'columns',
      severity: 'warning',
    }));
    expect(warningSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      code: 'INVALID_PAGE_SIZE_OPTIONS',
      inputName: 'pageSizeOptions',
      severity: 'warning',
    }));
  });

  it('should execute ngOnChanges paths for dataSource, columns and showToolbar', () => {
    const { table } = createHost();
    const nextDataSource = new MatTableDataSource<Record<string, unknown>>([
      { id: 5, name: 'E' },
    ]);
    const nextColumns = [
      { field: 'id', header: 'ID', type: 'number' },
      { field: 'name', header: 'Name', type: 'string' },
    ] as MTExColumn[];
    const setTableSpy = spyOn(table, 'setTableDataSource').and.callThrough();
    const setColumnsSpy = spyOn(table, 'setColumnsData').and.callThrough();
    const toolbarSpy = spyOn(table, 'setToolbarMenuControls');

    (table as unknown as { ngOnChanges: (changes: Record<string, SimpleChange>) => void }).ngOnChanges({
      dataSource: new SimpleChange(null, nextDataSource, false),
      columns: new SimpleChange(null, nextColumns, false),
      showToolbar: new SimpleChange(false, true, false),
    });

    expect(setTableSpy).toHaveBeenCalled();
    expect(setColumnsSpy).toHaveBeenCalledWith(nextColumns);
    expect(toolbarSpy).toHaveBeenCalledWith(nextColumns);

    table.columnsArray = nextColumns;
    (table as unknown as { ngOnChanges: (changes: Record<string, SimpleChange>) => void }).ngOnChanges({
      showToolbar: new SimpleChange(false, true, false),
    });
    expect(toolbarSpy).toHaveBeenCalledWith(nextColumns);
  });

  it('should initialize predicates/form group and pin rows in ngOnInit', () => {
    const { table } = createHost();
    table.dataSource = new MatTableDataSource<Record<string, unknown>>([
      { id: 1 },
      { id: 2 },
    ]);
    (table as unknown as { _enableRowPinning: boolean })._enableRowPinning = true;
    const pinSpy = spyOn(table, 'initializePinnedRows');

    table.ngOnInit();

    expect(typeof table.dataSource.filterPredicate).toBe('function');
    expect(table.hideShowMenuGroup).toBeTruthy();
    expect(pinSpy).toHaveBeenCalled();
  });

  it('should run ngAfterViewInit wiring and ngAfterViewChecked dirty flags', () => {
    const { table } = createHost();
    const tableAny = table as unknown as {
      _enableRowPinning: boolean;
      isViewInitialized: boolean;
      columnSyncNeeded: boolean;
      offsetSyncNeeded: boolean;
      editedRowSyncIndex: number | null;
      loadingDismissNeeded: boolean;
      setSorting: () => void;
      updatePinnedRowOffsets: () => void;
      requestColumnSync: () => void;
      attachResizeListener: () => void;
      performOffsetSync: () => void;
      syncColumnSizesFromTop: () => void;
      syncColumnSizesFromEditedRow: (index: number) => void;
      cdr: { markForCheck: () => void };
    };
    const paginatorMock = {
      page: of({}),
      initialized: of(undefined),
      pageIndex: 0,
      pageSize: 10,
      length: 0,
    };
    const sortMock = {
      sortChange: of({}),
      initialized: of(undefined),
      active: '',
      direction: '',
    };

    table.dataSource = new MatTableDataSource<Record<string, unknown>>([{ id: 1 }]);
    table.paginator = paginatorMock as never;
    table.sort = sortMock as never;
    tableAny._enableRowPinning = true;

    const setSortingSpy = spyOn(tableAny, 'setSorting');
    const updateOffsetsSpy = spyOn(tableAny, 'updatePinnedRowOffsets');
    const requestSyncSpy = spyOn(tableAny, 'requestColumnSync');
    const attachSpy = spyOn(tableAny, 'attachResizeListener');

    table.ngAfterViewInit();

    expect(tableAny.isViewInitialized).toBeTrue();
    expect(table.dataSource.paginator).toBe(table.paginator);
    expect(table.dataSource.sort).toBe(table.sort);
    expect(setSortingSpy).toHaveBeenCalled();
    expect(updateOffsetsSpy).toHaveBeenCalled();
    expect(requestSyncSpy).toHaveBeenCalled();
    expect(attachSpy).toHaveBeenCalled();

    tableAny.offsetSyncNeeded = true;
    tableAny.columnSyncNeeded = true;
    tableAny.editedRowSyncIndex = 2;
    tableAny.loadingDismissNeeded = true;
    table.loadingIndicator = true;

    const performOffsetSpy = spyOn(tableAny, 'performOffsetSync');
    const syncTopSpy = spyOn(tableAny, 'syncColumnSizesFromTop');
    const syncEditedSpy = spyOn(tableAny, 'syncColumnSizesFromEditedRow');
    const markForCheckSpy = spyOn(tableAny.cdr, 'markForCheck');

    table.ngAfterViewChecked();

    expect(performOffsetSpy).toHaveBeenCalled();
    expect(syncTopSpy).toHaveBeenCalled();
    expect(syncEditedSpy).toHaveBeenCalledWith(2);
    expect(table.loadingIndicator).toBeFalse();
    expect(markForCheckSpy).toHaveBeenCalled();
    expect(tableAny.offsetSyncNeeded).toBeFalse();
    expect(tableAny.columnSyncNeeded).toBeFalse();
    expect(tableAny.editedRowSyncIndex).toBeNull();
    expect(tableAny.loadingDismissNeeded).toBeFalse();
  });

  it('should set table data and call reCal in setTableDataSource when currentValue exists', () => {
    const { table } = createHost();
    const nextDataSource = new MatTableDataSource<Record<string, unknown>>([
      { id: 11 },
      { id: 12 },
    ]);
    const recalcSpy = spyOn(table, 'reCal');

    table.setTableDataSource(new SimpleChange(null, nextDataSource, false));

    expect(table.dataSource).toBe(nextDataSource);
    expect(table.tableData).toEqual(nextDataSource.data);
    expect(recalcSpy).toHaveBeenCalled();
  });

  it('should delegate setColumnHideShow to updateColumnsHideShow with form values', () => {
    const { table } = createHost();
    const updateSpy = spyOn(table, 'updateColumnsHideShow');
    table.hideShowMenuGroup = {
      value: { id: true, name: false },
    } as never;

    table.setColumnHideShow();

    expect(updateSpy).toHaveBeenCalledWith(table.hideShowMenuGroup.value);
  });

  it('should detach listeners and clear timers in ngOnDestroy', () => {
    const { table } = createHost();
    const tableAny = table as unknown as {
      detachResizeListener: () => void;
      clearResizeDebounceTimer: () => void;
    };
    const detachSpy = spyOn(tableAny, 'detachResizeListener');
    const clearSpy = spyOn(tableAny, 'clearResizeDebounceTimer');

    table.ngOnDestroy();

    expect(detachSpy).toHaveBeenCalled();
    expect(clearSpy).toHaveBeenCalled();
  });

  it('should assign pinned sort instances in setSorting when pinned data sources already have sort', () => {
    const { table } = createHost();
    const tableAny = table as unknown as {
      _enableRowPinning: boolean;
      setSorting: () => void;
      sort: unknown;
    };
    const sortMock = {
      sortChange: of({}),
      initialized: of(undefined),
      active: 'id',
      direction: 'asc',
    };

    tableAny._enableRowPinning = true;
    table.pinnedTopDataSource.sort = sortMock as never;
    table.pinnedBtmDataSource.sort = sortMock as never;
    tableAny.sort = sortMock;

    tableAny.setSorting();

    expect(table.pinnedTopDataSource.sort).toBe(sortMock as never);
    expect(table.pinnedBtmDataSource.sort).toBe(sortMock as never);
  });

  it('should compute sticky offsets and request stacked row updates in performOffsetSync', () => {
    const { table } = createHost();
    const tableAny = table as unknown as {
      _enableRowPinning: boolean;
      updateStackedPinnedRowOffsets: (table: HTMLElement, top: number, bottom: number) => void;
      columnSyncNeeded: boolean;
      performOffsetSync: () => void;
    };
    const tableEl = document.createElement('div');
    const headerA = document.createElement('div');
    const headerB = document.createElement('div');
    const footer = document.createElement('div');

    headerA.className = 'mat-mdc-header-row';
    headerB.className = 'mat-mdc-header-row';
    footer.className = 'mat-mdc-footer-row';

    Object.defineProperty(headerA, 'offsetHeight', { value: 12, configurable: true });
    Object.defineProperty(headerB, 'offsetHeight', { value: 18, configurable: true });
    Object.defineProperty(footer, 'offsetHeight', { value: 9, configurable: true });

    tableEl.appendChild(headerA);
    tableEl.appendChild(headerB);
    tableEl.appendChild(footer);

    table.tableElement = { nativeElement: tableEl } as never;
    tableAny._enableRowPinning = true;
    table.stickyHeader = true;
    table.stickyFooter = true;

    const stackedSpy = spyOn(tableAny, 'updateStackedPinnedRowOffsets');

    tableAny.performOffsetSync();

    expect(tableEl.style.getPropertyValue('--pinned-top-base-offset')).toBe('30px');
    expect(tableEl.style.getPropertyValue('--pinned-bottom-base-offset')).toBe('9px');
    expect(stackedSpy).toHaveBeenCalledWith(tableEl, 30, 9);
    expect(tableAny.columnSyncNeeded).toBeTrue();
  });

  it('should sync header/data widths and heights from top table in syncColumnSizesFromTop', () => {
    const { table } = createHost();
    const tableAny = table as unknown as {
      _enableRowPinning: boolean;
      syncColumnSizesFromTop: () => void;
    };
    const topId = `matTableExtTop${table.tableID}`;
    const midId = `matTableExt${table.tableID}`;
    const btmId = `matTableExtBtm${table.tableID}`;

    const top = document.createElement('table');
    top.id = topId;
    const topHeaderRow = document.createElement('tr');
    topHeaderRow.className = 'mat-mdc-header-row';
    const topH1 = document.createElement('th');
    const topH2 = document.createElement('th');
    topHeaderRow.appendChild(topH1);
    topHeaderRow.appendChild(topH2);
    top.appendChild(topHeaderRow);

    const middle = document.createElement('table');
    middle.id = midId;
    const middleHeader = document.createElement('tr');
    middleHeader.className = 'mat-mdc-header-row';
    middleHeader.appendChild(document.createElement('th'));
    middleHeader.appendChild(document.createElement('th'));
    const middleRow = document.createElement('tr');
    middleRow.className = 'mat-mdc-row';
    middleRow.appendChild(document.createElement('td'));
    middleRow.appendChild(document.createElement('td'));
    middle.appendChild(middleHeader);
    middle.appendChild(middleRow);

    const bottom = document.createElement('table');
    bottom.id = btmId;
    const bottomHeader = document.createElement('tr');
    bottomHeader.className = 'mat-mdc-header-row';
    bottomHeader.appendChild(document.createElement('th'));
    bottomHeader.appendChild(document.createElement('th'));
    const bottomRow = document.createElement('tr');
    bottomRow.className = 'mat-mdc-row';
    bottomRow.appendChild(document.createElement('td'));
    bottomRow.appendChild(document.createElement('td'));
    bottom.appendChild(bottomHeader);
    bottom.appendChild(bottomRow);

    const getByIdSpy = spyOn(document, 'getElementById').and.callFake(
      (id: string) => {
        if (id === topId) return top;
        if (id === midId) return middle;
        if (id === btmId) return bottom;
        return null;
      },
    );

    Object.defineProperty(top, 'getBoundingClientRect', {
      value: () => ({ width: 500 }),
      configurable: true,
    });
    Object.defineProperty(topHeaderRow, 'getBoundingClientRect', {
      value: () => ({ height: 32 }),
      configurable: true,
    });
    Object.defineProperty(topH1, 'getBoundingClientRect', {
      value: () => ({ width: 110 }),
      configurable: true,
    });
    Object.defineProperty(topH2, 'getBoundingClientRect', {
      value: () => ({ width: 140 }),
      configurable: true,
    });

    tableAny._enableRowPinning = true;
    expect(() => tableAny.syncColumnSizesFromTop()).not.toThrow();

    expect(getByIdSpy).toHaveBeenCalledWith(topId);
    expect(getByIdSpy).toHaveBeenCalledWith(midId);
    expect(getByIdSpy).toHaveBeenCalledWith(btmId);
    expect(top.style.width === '' || top.style.width.endsWith('px')).toBeTrue();

    getByIdSpy.and.callThrough();
  });

  it('should fallback to syncColumnSizesFromTop when edited row is missing', () => {
    const { table } = createHost();
    const tableAny = table as unknown as {
      _enableRowPinning: boolean;
      syncColumnSizesFromEditedRow: (index: number) => void;
      syncColumnSizesFromTop: () => void;
    };

    const top = document.createElement('table');
    top.id = `matTableExtTop${table.tableID}`;
    const topHeaderRow = document.createElement('tr');
    topHeaderRow.className = 'mat-mdc-header-row';
    topHeaderRow.appendChild(document.createElement('th'));
    top.appendChild(topHeaderRow);

    const middle = document.createElement('table');
    middle.id = `matTableExt${table.tableID}`;

    const getByIdSpy = spyOn(document, 'getElementById').and.callFake(
      (id: string) => {
        if (id === `matTableExtTop${table.tableID}`) return top;
        if (id === `matTableExt${table.tableID}`) return middle;
        return null;
      },
    );

    Object.defineProperty(topHeaderRow, 'getBoundingClientRect', {
      value: () => ({ height: 30 }),
      configurable: true,
    });
    Object.defineProperty(topHeaderRow.children[0], 'getBoundingClientRect', {
      value: () => ({ width: 100 }),
      configurable: true,
    });

    tableAny._enableRowPinning = true;
    const syncTopSpy = spyOn(tableAny, 'syncColumnSizesFromTop');

    tableAny.syncColumnSizesFromEditedRow(3);

    expect(syncTopSpy).toHaveBeenCalled();
    getByIdSpy.and.callThrough();
  });

  it('should restore original widths/heights and clear cache in restoreOriginalSizes', () => {
    const { table } = createHost();
    const tableAny = table as unknown as {
      _enableRowPinning: boolean;
      originalSizesBeforeEdit: { columnWidths: number[]; rowHeight: number } | null;
      restoreOriginalSizes: () => void;
    };

    const top = document.createElement('table');
    top.id = `matTableExtTop${table.tableID}`;
    const topHeader = document.createElement('tr');
    topHeader.className = 'mat-mdc-header-row';
    topHeader.appendChild(document.createElement('th'));
    topHeader.appendChild(document.createElement('th'));
    top.appendChild(topHeader);

    const middle = document.createElement('table');
    middle.id = `matTableExt${table.tableID}`;
    const midRow = document.createElement('tr');
    midRow.className = 'mat-mdc-row';
    midRow.appendChild(document.createElement('td'));
    midRow.appendChild(document.createElement('td'));
    middle.appendChild(midRow);

    const bottom = document.createElement('table');
    bottom.id = `matTableExtBtm${table.tableID}`;
    const btmRow = document.createElement('tr');
    btmRow.className = 'mat-mdc-row';
    btmRow.appendChild(document.createElement('td'));
    btmRow.appendChild(document.createElement('td'));
    bottom.appendChild(btmRow);

    const getByIdSpy = spyOn(document, 'getElementById').and.callFake(
      (id: string) => {
        if (id === `matTableExtTop${table.tableID}`) return top;
        if (id === `matTableExt${table.tableID}`) return middle;
        if (id === `matTableExtBtm${table.tableID}`) return bottom;
        return null;
      },
    );

    tableAny._enableRowPinning = true;
    tableAny.originalSizesBeforeEdit = {
      columnWidths: [120, 180],
      rowHeight: 34,
    };

    tableAny.restoreOriginalSizes();

    expect((topHeader.children[0] as HTMLElement).style.minWidth).toBe('120px');
    expect(tableAny.originalSizesBeforeEdit).toBeNull();
    getByIdSpy.and.callThrough();
  });

  it('should emit validationWarning for invalid string input type during changes validation', () => {
    const { table } = createHost();
    const warningSpy = spyOn(table.validationWarning, 'emit');

    (table as unknown as { ngOnChanges: (changes: Record<string, SimpleChange>) => void }).ngOnChanges({
      toolbarTitle: new SimpleChange('', 123 as unknown as string, false),
    });

    expect(warningSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      code: 'INVALID_STRING_INPUT',
      inputName: 'toolbarTitle',
      severity: 'warning',
    }));
  });

  it('should execute updateColumns full branch when dataSource exists', () => {
    const { table } = createHost();
    const updatedColumns: MTExColumn[] = [
      { field: 'id', header: 'ID', type: 'number' },
      { field: 'name', header: 'Name', type: 'string', hide: true },
    ];
    const tableAny = table as unknown as {
      _columnFilter: boolean;
      _enableRowPinning: boolean;
      cdr: { markForCheck: () => void };
      requestColumnSync: () => void;
    };

    table.dataSource = new MatTableDataSource<Record<string, unknown>>([
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
    ]);
    table.pinnedTopRows = [{ id: 10 } as Record<string, unknown>];
    table.pinnedBottomRows = [{ id: 20 } as Record<string, unknown>];
    tableAny._columnFilter = true;
    tableAny._enableRowPinning = true;

    const setColumnsListSpy = spyOn(table, 'setColumnsList').and.callThrough();
    const recalcSpy = spyOn(table, 'reCal');
    const setColumnFilterSpy = spyOn(table, 'setColumnFilter');
    const markSpy = spyOn(tableAny.cdr, 'markForCheck');
    const requestSyncSpy = spyOn(tableAny, 'requestColumnSync');

    table.updateColumns(updatedColumns);

    expect(setColumnsListSpy).toHaveBeenCalledWith(updatedColumns);
    expect(table.columnsArray).toEqual(updatedColumns);
    expect(table.showHideColumnsArray).toEqual(updatedColumns);
    expect(recalcSpy).toHaveBeenCalled();
    expect(setColumnFilterSpy).toHaveBeenCalledWith(true);
    expect(markSpy).toHaveBeenCalled();
    expect(requestSyncSpy).toHaveBeenCalled();
    expect(table.dataSource.data).toEqual([{ id: 1, name: 'A' }, { id: 2, name: 'B' }]);
    expect(table.pinnedTopDataSource.data).toEqual(table.pinnedTopRows);
    expect(table.pinnedBtmDataSource.data).toEqual(table.pinnedBottomRows);
  });

  it('should execute updateColumns minimal branch when dataSource is absent', () => {
    const { table } = createHost();
    const updatedColumns: MTExColumn[] = [
      { field: 'id', header: 'ID', type: 'number' },
    ];
    const tableAny = table as unknown as {
      _dataSource: MatTableDataSource<Record<string, unknown>> | undefined;
      _columnFilter: boolean;
      _enableRowPinning: boolean;
      cdr: { markForCheck: () => void };
      requestColumnSync: () => void;
    };

    tableAny._dataSource = undefined;
    tableAny._columnFilter = false;
    tableAny._enableRowPinning = false;

    const recalcSpy = spyOn(table, 'reCal');
    const setColumnFilterSpy = spyOn(table, 'setColumnFilter');
    const markSpy = spyOn(tableAny.cdr, 'markForCheck');
    const requestSyncSpy = spyOn(tableAny, 'requestColumnSync');

    table.updateColumns(updatedColumns);

    expect(table.columnsArray).toEqual(updatedColumns);
    expect(table.showHideColumnsArray).toEqual(updatedColumns);
    expect(recalcSpy).not.toHaveBeenCalled();
    expect(setColumnFilterSpy).not.toHaveBeenCalled();
    expect(markSpy).toHaveBeenCalled();
    expect(requestSyncSpy).not.toHaveBeenCalled();
  });

  it('should not emit cellChange when cell popup dialog rowIndex is invalid', () => {
    const { table } = createHost();
    const cellSpy = spyOn(table.cellChange, 'emit');
    const dialog = TestBed.inject(MatDialog);
    table.tableData = [{ id: 1, name: 'A' } as Record<string, unknown>];
    spyOn(dialog, 'open').and.returnValue({
      afterClosed: () => of({ field: 'name', value: 'Edited' }),
    } as never);

    table.openCellPopupDialog(
      table.tableData[0],
      { field: 'name', header: 'Name', type: 'string' } as MTExColumn,
      -1,
    );

    expect((table.tableData[0] as Record<string, unknown>)['name']).toBe('A');
    expect(cellSpy).not.toHaveBeenCalled();
  });

  it('should switch inline editing rows and restore original sizes when pinning is active', () => {
    const { table } = createHost();
    const rowA = { id: 1, name: 'A', editable: true } as Record<string, unknown>;
    const rowB = { id: 2, name: 'B', editable: false } as Record<string, unknown>;
    const tableAny = table as unknown as {
      _enableRowPinning: boolean;
      originalSizesBeforeEdit: { columnWidths: number[]; rowHeight: number } | null;
      restoreOriginalSizes: () => void;
      requestEditedRowSync: (index: number) => void;
    };

    table.tableData = [rowA, rowB];
    tableAny._enableRowPinning = true;
    tableAny.originalSizesBeforeEdit = { columnWidths: [100], rowHeight: 30 };
    const restoreSpy = spyOn(tableAny, 'restoreOriginalSizes');
    const requestEditedSpy = spyOn(tableAny, 'requestEditedRowSync');

    table.enableInlineEditing(rowB, 1);

    expect((table.tableData[0] as Record<string, unknown>)['editable']).toBeFalse();
    expect(table.rowDataTemp['e0']).toBeUndefined();
    expect(restoreSpy).toHaveBeenCalled();
    expect(requestEditedSpy).toHaveBeenCalledWith(1);
  });

  it('should restore sizes when toggling inline edit off on the same row', () => {
    const { table } = createHost();
    const row = { id: 1, name: 'A', editable: true } as Record<string, unknown>;
    const tableAny = table as unknown as {
      _enableRowPinning: boolean;
      restoreOriginalSizes: () => void;
    };

    table.tableData = [row];
    tableAny._enableRowPinning = true;
    const restoreSpy = spyOn(tableAny, 'restoreOriginalSizes');

    table.enableInlineEditing(row, 0);

    expect((table.tableData[0] as Record<string, unknown>)['editable']).toBeFalse();
    expect(restoreSpy).toHaveBeenCalled();
  });

  it('should handle syncColumnSizesFromEditedRow with mismatched header/data cell counts', () => {
    const { table } = createHost();
    const tableAny = table as unknown as {
      _enableRowPinning: boolean;
      syncColumnSizesFromEditedRow: (index: number) => void;
    };

    const top = document.createElement('table');
    top.id = `matTableExtTop${table.tableID}`;
    const topHeaderRow = document.createElement('tr');
    topHeaderRow.className = 'mat-mdc-header-row';
    topHeaderRow.appendChild(document.createElement('th'));
    top.appendChild(topHeaderRow);

    const middle = document.createElement('table');
    middle.id = `matTableExt${table.tableID}`;
    const editedRow = document.createElement('tr');
    editedRow.className = 'mat-mdc-row';
    editedRow.appendChild(document.createElement('td'));
    editedRow.appendChild(document.createElement('td'));
    middle.appendChild(editedRow);

    const bottom = document.createElement('table');
    bottom.id = `matTableExtBtm${table.tableID}`;
    const bottomRow = document.createElement('tr');
    bottomRow.className = 'mat-mdc-row';
    bottomRow.appendChild(document.createElement('td'));
    bottom.appendChild(bottomRow);

    const getByIdSpy = spyOn(document, 'getElementById').and.callFake((id: string) => {
      if (id === `matTableExtTop${table.tableID}`) return top;
      if (id === `matTableExt${table.tableID}`) return middle;
      if (id === `matTableExtBtm${table.tableID}`) return bottom;
      return null;
    });

    Object.defineProperty(topHeaderRow, 'getBoundingClientRect', {
      value: () => ({ height: 30 }),
      configurable: true,
    });
    Object.defineProperty(topHeaderRow.children[0], 'getBoundingClientRect', {
      value: () => ({ width: 100 }),
      configurable: true,
    });
    Object.defineProperty(editedRow, 'getBoundingClientRect', {
      value: () => ({ height: 40 }),
      configurable: true,
    });
    Array.from(editedRow.children).forEach((cell, idx) => {
      Object.defineProperty(cell, 'getBoundingClientRect', {
        value: () => ({ width: idx === 0 ? 120 : 160 }),
        configurable: true,
      });
    });

    tableAny._enableRowPinning = true;

    expect(() => tableAny.syncColumnSizesFromEditedRow(0)).not.toThrow();
    expect((topHeaderRow.children[0] as HTMLElement).style.minWidth).toBe('120px');
    getByIdSpy.and.callThrough();
  });

  it('should handle resize callback guards and existing debounce timer', () => {
    const { table } = createHost();
    const tableAny = table as unknown as {
      _enableRowPinning: boolean;
      resizeDebounceTimer: number | null;
      onWindowResizeBound: () => void;
      updatePinnedRowOffsets: () => void;
      syncColumnSizesFromTop: () => void;
    };

    tableAny._enableRowPinning = false;
    expect(() => tableAny.onWindowResizeBound()).not.toThrow();

    tableAny._enableRowPinning = true;
    tableAny.resizeDebounceTimer = 123;

    const clearSpy = spyOn(window, 'clearTimeout');
    const setSpy = spyOn(window, 'setTimeout').and.callFake(((cb: TimerHandler) => {
      (cb as () => void)();
      return 999 as unknown as number;
    }) as unknown as typeof window.setTimeout);
    const offsetSpy = spyOn(tableAny, 'updatePinnedRowOffsets');
    const syncSpy = spyOn(tableAny, 'syncColumnSizesFromTop');

    tableAny.onWindowResizeBound();

    expect(clearSpy).toHaveBeenCalledWith(123);
    expect(setSpy).toHaveBeenCalled();

    expect(offsetSpy).toHaveBeenCalled();
    expect(syncSpy).toHaveBeenCalled();
  });

  it('should emit generic export error when exportToPDF rejects with non-Error value', async () => {
    const { table } = createHost();
    const exportService = TestBed.inject(TableExportService);
    const errorSpy = spyOn(table.exportError, 'emit');
    spyOn(exportService, 'exportToPDF').and.returnValue(Promise.reject('pdf boom'));

    table.columnsArray = [...baseColumns];
    setVisibleDataColumns(table);
    table.dataSource = new MatTableDataSource<Record<string, unknown>>([
      { id: 1, name: 'A' },
    ]);

    await table.exportToPDF();

    expect(errorSpy).toHaveBeenCalledWith({
      type: 'pdf',
      error: 'Export failed',
    });
  });

  it('should request sync in applyColumnFilter when row pinning is enabled', () => {
    const { table } = createHost();
    const requestSyncSpy = spyOn(
      table as unknown as { requestColumnSync: () => void },
      'requestColumnSync',
    );

    table.dataSource = new MatTableDataSource<Record<string, unknown>>([
      { id: 1, name: 'A' },
    ]);
    (table as unknown as { _enableRowPinning: boolean })._enableRowPinning = true;

    table.applyColumnFilter(
      { name: 'A' } as unknown as Record<string, string>,
      { field: 'name', header: 'Name', type: 'string' } as MTExColumn,
    );

    expect(requestSyncSpy).toHaveBeenCalled();
  });

  it('should restore sizes on cancelInlineEditing when row pinning is enabled', () => {
    const { table } = createHost();
    const tableAny = table as unknown as {
      _enableRowPinning: boolean;
      restoreOriginalSizes: () => void;
    };
    const row = { id: 1, name: 'A', editable: true } as Record<string, unknown>;

    table.tableData = [row];
    tableAny._enableRowPinning = true;
    const restoreSpy = spyOn(tableAny, 'restoreOriginalSizes');

    table.cancelInlineEditing(row, 0);

    expect(restoreSpy).toHaveBeenCalled();
  });

  it('should save inline editing via template data and restore sizes when pinning enabled', () => {
    const { table } = createHost();
    const service = TestBed.inject(MatTableExtService) as unknown as {
      selectedRow: BehaviorSubject<Record<string, unknown> | null>;
    };
    const tableAny = table as unknown as {
      _enableRowPinning: boolean;
      restoreOriginalSizes: () => void;
    };

    table.tableData = [{ id: 1, name: 'A', editable: true } as Record<string, unknown>];
    table.rowDataTemp['e0'] = { id: 1, name: 'Temp' } as Record<string, unknown>;
    table.inlineEditingTemplateRef = {} as never;
    service.selectedRow.next({ id: 1, name: 'Changed' });
    tableAny._enableRowPinning = true;
    const restoreSpy = spyOn(tableAny, 'restoreOriginalSizes');

    table.saveInlineEditing(table.tableData[0], 0);

    expect((table.tableData[0] as Record<string, unknown>)['name']).toBe('Changed');
    expect(restoreSpy).toHaveBeenCalled();
  });

  it('should save cell editing from template row and restore sizes when pinning enabled', () => {
    const { table } = createHost();
    const service = TestBed.inject(MatTableExtService) as unknown as {
      selectedRow: BehaviorSubject<Record<string, unknown> | null>;
    };
    const tableAny = table as unknown as {
      _enableRowPinning: boolean;
      restoreOriginalSizes: () => void;
    };

    table.tableData = [{ id: 1, name: 'A' } as Record<string, unknown>];
    table.currentRowIndex = 0;
    table.cellEditingTemplateRef = {} as never;
    service.selectedRow.next({ id: 1, name: 'TemplateChanged' });
    tableAny._enableRowPinning = true;
    const restoreSpy = spyOn(tableAny, 'restoreOriginalSizes');

    table.saveCellEditing();

    expect((table.tableData[0] as Record<string, unknown>)['name']).toBe('TemplateChanged');
    expect(restoreSpy).toHaveBeenCalled();
  });

  it('should return checkbox labels for select-all and deselect-all states', () => {
    const { table } = createHost();

    table.selection.clear();
    expect(table.checkboxLabel()).toBe('select all');

    table.selection.select(...table.dataSource.data);
    expect(table.checkboxLabel()).toBe('deselect all');
  });

  it('should keep hideShowMenuGroup unchanged when toolbar controls should not be created', () => {
    const { table } = createHost();
    const originalGroup = table.hideShowMenuGroup;

    table.showToolbar = false;
    table.setToolbarMenuControls(baseColumns);
    expect(table.hideShowMenuGroup).toBe(originalGroup);

    table.showToolbar = true;
    table.setToolbarMenuControls([]);
    expect(table.hideShowMenuGroup).toBe(originalGroup);
  });

  it('should emit generic error when exportTable rejects with non-Error', async () => {
    const { table } = createHost();
    const exportService = TestBed.inject(TableExportService);
    const errorSpy = spyOn(table.exportError, 'emit');
    spyOn(exportService, 'exportTable').and.returnValue(Promise.reject('boom'));

    table.columnsArray = [...baseColumns];
    table.dataSource = new MatTableDataSource<Record<string, unknown>>([
      { id: 1, name: 'A' },
    ]);

    await table.exportTable('xlsx');

    expect(errorSpy).toHaveBeenCalledWith({
      type: 'xlsx',
      error: 'Export failed',
    });
  });

  it('should use top table explicit width in syncColumnSizesFromTop', () => {
    const { table } = createHost();
    const tableAny = table as unknown as {
      _enableRowPinning: boolean;
      syncColumnSizesFromTop: () => void;
    };

    const topId = `matTableExtTop${table.tableID}`;
    const midId = `matTableExt${table.tableID}`;
    const btmId = `matTableExtBtm${table.tableID}`;

    const top = document.createElement('table');
    top.id = topId;
    top.style.width = '420px';
    const topHeaderRow = document.createElement('tr');
    topHeaderRow.className = 'mat-mdc-header-row';
    const topH = document.createElement('th');
    topHeaderRow.appendChild(topH);
    top.appendChild(topHeaderRow);

    const middle = document.createElement('table');
    middle.id = midId;
    const middleHeader = document.createElement('tr');
    middleHeader.className = 'mat-mdc-header-row';
    middleHeader.appendChild(document.createElement('th'));
    middle.appendChild(middleHeader);

    const bottom = document.createElement('table');
    bottom.id = btmId;
    const bottomHeader = document.createElement('tr');
    bottomHeader.className = 'mat-mdc-header-row';
    bottomHeader.appendChild(document.createElement('th'));
    bottom.appendChild(bottomHeader);

    const getByIdSpy = spyOn(document, 'getElementById').and.callFake((id: string) => {
      if (id === topId) return top;
      if (id === midId) return middle;
      if (id === btmId) return bottom;
      return null;
    });

    Object.defineProperty(top, 'getBoundingClientRect', {
      value: () => ({ width: 500 }),
      configurable: true,
    });
    Object.defineProperty(topHeaderRow, 'getBoundingClientRect', {
      value: () => ({ height: 30 }),
      configurable: true,
    });
    Object.defineProperty(topH, 'getBoundingClientRect', {
      value: () => ({ width: 111 }),
      configurable: true,
    });

    tableAny._enableRowPinning = true;
    tableAny.syncColumnSizesFromTop();

    expect(middle.style.width).toBe('420px');
    expect(bottom.style.width).toBe('420px');
    getByIdSpy.and.callThrough();
  });

  it('should use group-header fallback text color and bold style in exportToPDF', async () => {
    const { table } = createHost();
    const exportService = TestBed.inject(TableExportService);
    const exportSpy = spyOn(exportService, 'exportToPDF').and.returnValue(Promise.resolve());

    table.columnsArray = [...baseColumns];
    setVisibleDataColumns(table);
    table.columnGroups = [{ name: 'meta', label: 'Meta', columns: ['id'] }];
    table.dataSource = new MatTableDataSource<Record<string, unknown>>([{ id: 1, name: 'A' }]);
    table.headerTemplateRef = {} as never;

    const host = document.createElement('div');
    const headerCell = document.createElement('div');
    headerCell.className = 'mat-mdc-header-cell';
    const groupCell = document.createElement('div');
    groupCell.className = 'group-header-cell';
    host.appendChild(headerCell);
    host.appendChild(groupCell);
    table.tableElement = { nativeElement: host } as never;

    const getStyleSpy = spyOn(window, 'getComputedStyle').and.callFake((el: Element) => {
      if ((el as HTMLElement).className.includes('group-header-cell')) {
        return {
          backgroundColor: 'rgb(9, 8, 7)',
          color: '',
          fontWeight: '700',
        } as CSSStyleDeclaration;
      }
      return {
        backgroundColor: 'rgb(1, 2, 3)',
        color: 'rgb(4, 5, 6)',
        fontWeight: '400',
      } as CSSStyleDeclaration;
    });

    await table.exportToPDF();

    const payload = exportSpy.calls.mostRecent().args[0] as {
      groupHeaderStyles: { fillColor: number[]; textColor: number[]; fontStyle: string } | null;
    };
    expect(payload.groupHeaderStyles?.fillColor).toEqual([9, 8, 7]);
    expect(payload.groupHeaderStyles?.textColor).toEqual([4, 5, 6]);
    expect(payload.groupHeaderStyles?.fontStyle).toBe('bold');
    expect(getStyleSpy).toHaveBeenCalled();
  });
});
