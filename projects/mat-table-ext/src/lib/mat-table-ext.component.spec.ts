import { TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';

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
      showToolbar="false"
    ></mat-table-ext>
  `,
})
class HostComponent {
  @ViewChild(MatTableExtComponent) table!: MatTableExtComponent;
  dataSource = new MatTableDataSource([{ id: 1, name: 'A' }]);
  columns = [
    { field: 'id', header: 'ID', type: 'number' },
    { field: 'name', header: 'Name', type: 'string' },
  ] as any;
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
    expect(table.showToolbar).toBeFalse();
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
    table.rowHidingFilterFn = (_row: any, index: number) => index === 0;

    expect(table.isRowHidden(0)).toBeTrue();
    expect(table.isRowHidden(1)).toBeFalse();
  });

  it('should pin and unpin rows and expose pin position helpers', () => {
    const { table } = createHost();
    const row = table.dataSource.data[0] as any;
    table.table = { renderRows: () => {} } as any;

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

    const rowA = { id: 1, name: 'A' } as any;
    const rowB = { id: 2, name: 'B' } as any;
    const rowC = { id: 3, name: 'C' } as any;
    table.dataSource = new MatTableDataSource([rowA, rowB, rowC]);
    table.pinnedTopRows = [rowA];
    table.pinnedBottomRows = [rowC];

    expect(table.getUnpinnedRows()).toEqual([rowB]);
    expect(table.getCombinedDataSource()).toEqual([rowA, rowB, rowC]);
  });

  it('should emit selection state through checkboxLabel and setSelectedRows', () => {
    const { table } = createHost();
    const selectionSpy = spyOn(table.selectionChanged, 'emit');
    const row = { position: 0, id: 1 } as any;

    table.setSelectedRows(row, 0);
    expect(selectionSpy).toHaveBeenCalledWith({ row, index: 0, isSelected: true });
    expect(table.checkboxLabel(row)).toContain('deselect row 1');

    table.setSelectedRows(row, 0);
    expect(selectionSpy).toHaveBeenCalledWith({ row, index: 0, isSelected: false });
  });
});
