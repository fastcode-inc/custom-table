/// <reference types="jasmine" />
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TablePrintService } from './table-print.service';

describe('TablePrintService', () => {
  let service: TablePrintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TablePrintService);
  });

  afterEach(() => {
    document.querySelectorAll('[id^="matTableExt"]').forEach(el => el.remove());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getPrintStyles should return expected CSS content', () => {
    const styles = service.getPrintStyles();

    expect(styles).toContain('table { border-collapse: collapse;');
    expect(styles).toContain('.mat-sort-header-arrow');
    expect(styles).toContain('@media print');
  });

  it('getActionColumnSelectors should return action selectors', () => {
    const selectors = service.getActionColumnSelectors();

    expect(selectors).toContain('th.action-column-cells');
    expect(selectors).toContain('[matColumnDef="select"]');
    expect(selectors).toContain('[matColumnDef="hide"]');
    expect(selectors.length).toBeGreaterThan(0);
  });

  it('sanitizeTableClone should remove scripts, event handlers, action columns and hidden rows', () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <table>
        <tr class="mat-mdc-header-row">
          <th>Name</th>
          <th class="action-column-cells">Action</th>
        </tr>
        <tr>
          <td onclick="alert(1)">Row 1</td>
          <td class="inline-edit-column-cell">Edit</td>
          <script>window['xss'] = true;</script>
        </tr>
        <tr>
          <td>Row 2</td>
          <td class="inline-edit-column-cell">Edit</td>
        </tr>
      </table>
    `;

    const sanitized = service.sanitizeTableClone(wrapper, [1]);

    expect(sanitized.querySelector('script')).toBeNull();
    expect(sanitized.querySelector('[onclick]')).toBeNull();
    expect(sanitized.querySelector('th.action-column-cells')).toBeNull();
    expect(sanitized.querySelector('td.inline-edit-column-cell')).toBeNull();

    const dataRows = sanitized.querySelectorAll('tr');
    expect(dataRows.length).toBe(2);
    expect(sanitized.textContent).toContain('Row 1');
    expect(sanitized.textContent).not.toContain('Row 2');
  });

  it('openPrintWindow should call window.open with expected params', () => {
    const openSpy = spyOn(window, 'open').and.returnValue(null);

    service.openPrintWindow();

    expect(openSpy).toHaveBeenCalledWith('', '', 'width=900,height=650');
  });

  it('sanitizeTableClone should handle table without header row and keep non-action cells', () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <table>
        <tr><td>Only Row</td></tr>
      </table>
    `;

    const sanitized = service.sanitizeTableClone(wrapper, []);
    expect(sanitized.querySelectorAll('tr').length).toBe(1);
    expect(sanitized.textContent).toContain('Only Row');
  });

  it('should collect action column indices from header cells', () => {
    const tableClone = document.createElement('table');
    tableClone.innerHTML = `
      <tr class="mat-mdc-header-row">
        <th>Name</th>
        <th class="action-column-cells">Action</th>
      </tr>
    `;

    const getIndices = (service as unknown as {
      getActionColumnIndices: (tableClone: HTMLElement) => number[];
    }).getActionColumnIndices;

    const indices = getIndices.call(service, tableClone);

    expect(indices).toEqual([1]);
  });

  it('should not remove cells when action column index is out of range', () => {
    const tableClone = document.createElement('table');
    tableClone.innerHTML = `
      <tr class="mat-mdc-header-row"><th>Name</th></tr>
      <tr><td>Alpha</td></tr>
    `;

    const removeCells = (service as unknown as {
      removeHiddenRowsAndActionCells: (
        tableClone: HTMLElement,
        hiddenRowIndexSet: Set<number>,
        actionColumnIndices: number[]
      ) => void;
    }).removeHiddenRowsAndActionCells;

    removeCells.call(service, tableClone, new Set<number>(), [5]);

    const dataCell = tableClone.querySelector('tr:nth-child(2) td') as HTMLElement | null;
    expect(dataCell?.textContent).toBe('Alpha');
  });

  it('should remove action cells when action column index exists', () => {
    const tableClone = document.createElement('table');
    tableClone.innerHTML = `
      <tr class="mat-mdc-header-row"><th>Name</th><th class="action-column-cells">Action</th></tr>
      <tr><td>Alpha</td><td>Edit</td></tr>
    `;

    const removeCells = (service as unknown as {
      removeHiddenRowsAndActionCells: (
        tableClone: HTMLElement,
        hiddenRowIndexSet: Set<number>,
        actionColumnIndices: number[]
      ) => void;
    }).removeHiddenRowsAndActionCells;

    removeCells.call(service, tableClone, new Set<number>(), [1]);

    const headerCells = tableClone.querySelectorAll('tr:nth-child(1) th');
    const dataCells = tableClone.querySelectorAll('tr:nth-child(2) td');
    expect(headerCells.length).toBe(1);
    expect(dataCells.length).toBe(1);
    expect((dataCells[0] as HTMLElement).textContent).toBe('Alpha');
  });

  it('printTable should return when table element is missing', () => {
    const openSpy = spyOn(service, 'openPrintWindow');

    service.printTable(12345, []);

    expect(openSpy).not.toHaveBeenCalled();
  });

  it('printTable should return when popup blocker prevents opening print window', () => {
    const tableContainer = document.createElement('div');
    tableContainer.id = 'matTableExt321';
    tableContainer.innerHTML = '<table><tr><td>Row</td></tr></table>';
    document.body.appendChild(tableContainer);

    const openSpy = spyOn(service, 'openPrintWindow').and.returnValue(null);
    const sanitizeSpy = spyOn(service, 'sanitizeTableClone').and.callThrough();

    service.printTable(321, []);

    expect(openSpy).toHaveBeenCalled();
    expect(sanitizeSpy).not.toHaveBeenCalled();
  });

  it('printTable should write content and trigger print flow', fakeAsync(() => {
    const tableContainer = document.createElement('div');
    tableContainer.id = 'matTableExt987';
    tableContainer.innerHTML = `
      <table>
        <tr class="mat-mdc-header-row"><th>Name</th><th class="action-column-cells">Action</th></tr>
        <tr><td>Alpha</td><td class="inline-edit-column-cell">Edit</td></tr>
      </table>
    `;
    document.body.appendChild(tableContainer);

    const fakeWindow = {
      document: {
        write: jasmine.createSpy('write'),
        close: jasmine.createSpy('close'),
      },
      print: jasmine.createSpy('print'),
      close: jasmine.createSpy('closeWindow'),
    } as unknown as Window;

    spyOn(service, 'openPrintWindow').and.returnValue(fakeWindow);

    service.printTable(987, []);

    expect(fakeWindow.document.write).toHaveBeenCalled();
    expect(fakeWindow.document.close).toHaveBeenCalled();

    tick(250);

    expect(fakeWindow.print).toHaveBeenCalled();
    expect(fakeWindow.close).toHaveBeenCalled();
  }));
});