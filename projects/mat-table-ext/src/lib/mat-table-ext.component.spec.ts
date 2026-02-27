import { TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { SimpleChange } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
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
  function createHost() {
    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();
    return { hostFixture, hostComponent: hostFixture.componentInstance, table: hostFixture.componentInstance.table };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatTableExtComponent],
      providers: [
        {
          provide: MatDialog,
          useValue: {},
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
});
