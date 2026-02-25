import { TestBed } from '@angular/core/testing';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';

import { TableExportService } from './table-export.service';

describe('TableExportService', () => {
  let service: TableExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('exportTable should write CSV and save with .csv extension', async () => {
    const addRowSpy = jasmine.createSpy('addRow');
    const mergeCellsSpy = jasmine.createSpy('mergeCells');

    const fakeWorksheet = {
      addRow: addRowSpy,
      mergeCells: mergeCellsSpy,
    } as any;

    const csvWriteBufferSpy = jasmine.createSpy('csvWriteBuffer').and.resolveTo(new ArrayBuffer(4));
    const xlsxWriteBufferSpy = jasmine.createSpy('xlsxWriteBuffer').and.resolveTo(new ArrayBuffer(4));

    const fakeWorkbook = {
      addWorksheet: jasmine.createSpy('addWorksheet').and.returnValue(fakeWorksheet),
      csv: { writeBuffer: csvWriteBufferSpy },
      xlsx: { writeBuffer: xlsxWriteBufferSpy },
    } as any;

    spyOn(ExcelJS as any, 'Workbook').and.returnValue(fakeWorkbook);
    const saveAsSpy = spyOn(FileSaver, 'saveAs');

    await service.exportTable({
      type: 'csv',
      fileName: 'report',
      visibleColumns: [
        { field: 'id', header: 'ID', type: 'number' } as any,
      ],
      columnGroups: [],
      data: [{ id: 1 }],
      hiddenRowIndices: [],
    });

    expect(fakeWorkbook.addWorksheet).toHaveBeenCalledWith('Sheet1');
    expect(addRowSpy).toHaveBeenCalled();
    expect(csvWriteBufferSpy).toHaveBeenCalled();
    expect(xlsxWriteBufferSpy).not.toHaveBeenCalled();
    expect(saveAsSpy).toHaveBeenCalled();
    expect(saveAsSpy.calls.mostRecent().args[1]).toBe('report.csv');
  });

  it('exportTable should write XLSX by default and skip hidden rows', async () => {
    const addRowSpy = jasmine.createSpy('addRow');

    const fakeWorksheet = {
      addRow: addRowSpy,
      mergeCells: jasmine.createSpy('mergeCells'),
    } as any;

    const xlsxWriteBufferSpy = jasmine.createSpy('xlsxWriteBuffer').and.resolveTo(new ArrayBuffer(4));

    const fakeWorkbook = {
      addWorksheet: jasmine.createSpy('addWorksheet').and.returnValue(fakeWorksheet),
      csv: { writeBuffer: jasmine.createSpy('csvWriteBuffer').and.resolveTo(new ArrayBuffer(4)) },
      xlsx: { writeBuffer: xlsxWriteBufferSpy },
    } as any;

    spyOn(ExcelJS as any, 'Workbook').and.returnValue(fakeWorkbook);
    const saveAsSpy = spyOn(FileSaver, 'saveAs');

    await service.exportTable({
      type: 'xlsx',
      fileName: 'report',
      visibleColumns: [
        { field: 'name', header: 'Name', type: 'string' } as any,
      ],
      columnGroups: [],
      data: [{ name: 'A' }, { name: 'B' }],
      hiddenRowIndices: [1],
    });

    expect(xlsxWriteBufferSpy).toHaveBeenCalled();
    expect(saveAsSpy.calls.mostRecent().args[1]).toBe('report.xlsx');

    // 1 header row + 1 visible data row
    expect(addRowSpy.calls.count()).toBe(2);
  });
});
