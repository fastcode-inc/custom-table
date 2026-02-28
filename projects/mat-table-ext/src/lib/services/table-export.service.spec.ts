import { TestBed } from '@angular/core/testing';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import { MTExColumn } from '../models/tableExtModels';

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
    };

    const csvWriteBufferSpy = jasmine.createSpy('csvWriteBuffer').and.resolveTo(new ArrayBuffer(4));
    const xlsxWriteBufferSpy = jasmine.createSpy('xlsxWriteBuffer').and.resolveTo(new ArrayBuffer(4));

    const fakeWorkbook = {
      addWorksheet: jasmine.createSpy('addWorksheet').and.returnValue(fakeWorksheet),
      csv: { writeBuffer: csvWriteBufferSpy },
      xlsx: { writeBuffer: xlsxWriteBufferSpy },
    };

    spyOn(
      ExcelJS as unknown as { Workbook: () => unknown },
      'Workbook'
    ).and.returnValue(fakeWorkbook);
    const saveAsSpy = spyOn(FileSaver, 'saveAs');

    await service.exportTable({
      type: 'csv',
      fileName: 'report',
      visibleColumns: [
        { field: 'id', header: 'ID', type: 'number' } as MTExColumn,
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
    };

    const xlsxWriteBufferSpy = jasmine.createSpy('xlsxWriteBuffer').and.resolveTo(new ArrayBuffer(4));

    const fakeWorkbook = {
      addWorksheet: jasmine.createSpy('addWorksheet').and.returnValue(fakeWorksheet),
      csv: { writeBuffer: jasmine.createSpy('csvWriteBuffer').and.resolveTo(new ArrayBuffer(4)) },
      xlsx: { writeBuffer: xlsxWriteBufferSpy },
    };

    spyOn(
      ExcelJS as unknown as { Workbook: () => unknown },
      'Workbook'
    ).and.returnValue(fakeWorkbook);
    const saveAsSpy = spyOn(FileSaver, 'saveAs');

    await service.exportTable({
      type: 'xlsx',
      fileName: 'report',
      visibleColumns: [
        { field: 'name', header: 'Name', type: 'string' } as MTExColumn,
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

  it('exportTable should include group header row, merge group columns, and format typed values', async () => {
    const addRowSpy = jasmine.createSpy('addRow');
    const mergeCellsSpy = jasmine.createSpy('mergeCells');

    const fakeWorksheet = {
      addRow: addRowSpy,
      mergeCells: mergeCellsSpy,
    };

    const fakeWorkbook = {
      addWorksheet: jasmine.createSpy('addWorksheet').and.returnValue(fakeWorksheet),
      csv: { writeBuffer: jasmine.createSpy('csvWriteBuffer').and.resolveTo(new ArrayBuffer(4)) },
      xlsx: { writeBuffer: jasmine.createSpy('xlsxWriteBuffer').and.resolveTo(new ArrayBuffer(4)) },
    };

    spyOn(
      ExcelJS as unknown as { Workbook: () => unknown },
      'Workbook'
    ).and.returnValue(fakeWorkbook);
    const saveAsSpy = spyOn(FileSaver, 'saveAs');

    const sampleDate = new Date('2026-02-28T00:00:00.000Z');

    await service.exportTable({
      type: 'xlsx',
      fileName: 'grouped-report',
      visibleColumns: [
        { field: 'id', header: 'ID', type: 'number' } as MTExColumn,
        { field: 'active', header: 'Active', type: 'boolean' } as MTExColumn,
        { field: 'joinedAt', header: 'Joined', type: 'date' } as MTExColumn,
      ],
      columnGroups: [
        { name: 'meta', label: 'Meta', columns: ['id', 'active'] },
      ],
      data: [
        { id: 1, active: true, joinedAt: sampleDate },
        { id: 2, active: false, joinedAt: null },
      ],
      hiddenRowIndices: [],
    });

    expect(mergeCellsSpy).toHaveBeenCalled();
    expect(addRowSpy.calls.count()).toBeGreaterThanOrEqual(4);

    const firstDataRow = addRowSpy.calls.allArgs()[2][0] as unknown[];
    expect(firstDataRow[1]).toBe('Yes');
    expect(typeof firstDataRow[2]).toBe('string');

    const secondDataRow = addRowSpy.calls.allArgs()[3][0] as unknown[];
    expect(secondDataRow[1]).toBe('No');
    expect(secondDataRow[2]).toBe('');

    expect(saveAsSpy.calls.mostRecent().args[1]).toBe('grouped-report.xlsx');
  });

  it('exportTable should use default file name and fallback to field when header is missing', async () => {
    const addRowSpy = jasmine.createSpy('addRow');

    const fakeWorksheet = {
      addRow: addRowSpy,
      mergeCells: jasmine.createSpy('mergeCells'),
    };

    const fakeWorkbook = {
      addWorksheet: jasmine.createSpy('addWorksheet').and.returnValue(fakeWorksheet),
      csv: { writeBuffer: jasmine.createSpy('csvWriteBuffer').and.resolveTo(new ArrayBuffer(4)) },
      xlsx: { writeBuffer: jasmine.createSpy('xlsxWriteBuffer').and.resolveTo(new ArrayBuffer(4)) },
    };

    spyOn(
      ExcelJS as unknown as { Workbook: () => unknown },
      'Workbook'
    ).and.returnValue(fakeWorkbook);
    const saveAsSpy = spyOn(FileSaver, 'saveAs');

    await service.exportTable({
      type: 'xlsx',
      visibleColumns: [
        { field: 'status', type: 'string' } as MTExColumn,
      ],
      columnGroups: [],
      data: [{ status: 'Open' }],
      hiddenRowIndices: [],
    });

    const headerRow = addRowSpy.calls.allArgs()[0][0] as string[];
    expect(headerRow).toEqual(['status']);
    expect(saveAsSpy.calls.mostRecent().args[1]).toBe('tablesheets.xlsx');
  });

  it('exportToPDF should complete with title and grouped headers', async () => {
    await expectAsync(
      service.exportToPDF({
        fileName: 'pdf-export',
        orientation: 'landscape',
        title: 'My Title',
        visibleColumns: [
          { field: 'id', header: 'ID', type: 'number' } as MTExColumn,
          { field: 'name', header: 'Name', type: 'string' } as MTExColumn,
        ],
        columnGroups: [
          { name: 'main', label: 'Main', columns: ['id', 'name'] },
        ],
        data: [
          { id: 1, name: 'Alpha' },
          { id: 2, name: 'Beta' },
        ],
        hiddenRowIndices: [1],
        headerStyles: {
          fillColor: [240, 240, 240],
          textColor: [10, 10, 10],
          fontStyle: 'bold',
        },
        groupHeaderStyles: {
          fillColor: [220, 220, 220],
          textColor: [0, 0, 0],
          fontStyle: 'normal',
        },
      })
    ).toBeResolved();
  });

  it('exportToPDF should complete without title and without groups', async () => {
    await expectAsync(
      service.exportToPDF({
        fileName: 'pdf-export-min',
        orientation: 'portrait',
        visibleColumns: [
          { field: 'name', header: 'Name', type: 'string' } as MTExColumn,
        ],
        columnGroups: [],
        data: [{ name: 'Gamma' }],
        hiddenRowIndices: [],
      })
    ).toBeResolved();
  });

  it('exportToPDF should cover default/fallback branches for fileName, headers, grouping and row value conversion', async () => {
    const JsPDFModule = await import('jspdf');
    const autoTableModule = await import('jspdf-autotable');

    expect(JsPDFModule).toBeTruthy();
    expect(autoTableModule).toBeTruthy();

    const sampleDate = new Date('2026-03-01T00:00:00.000Z');

    await expectAsync(
      service.exportToPDF({
        orientation: 'portrait',
        visibleColumns: [
          { field: 'id', type: 'number' } as MTExColumn,
          { field: 'flag', header: 'Flag', type: 'boolean' } as MTExColumn,
          { field: 'joinedAt', header: 'Joined', type: 'date' } as MTExColumn,
          { field: 'note', header: 'Note', type: 'string' } as MTExColumn,
        ],
        columnGroups: [
          { name: 'meta', label: 'Meta', columns: ['id', 'flag'] },
        ],
        data: [
          { id: 1, flag: false, joinedAt: sampleDate, note: null },
          { id: 2, flag: true, joinedAt: undefined, note: 'ok' },
        ],
        hiddenRowIndices: [],
      })
    ).toBeResolved();
  });
});
