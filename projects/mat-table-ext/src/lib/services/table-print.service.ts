import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TablePrintService {
  private readonly printWindowFeatures = 'width=900,height=650';
  private readonly tableIdPrefix = 'matTableExt';

  getPrintStyles(): string {
    return `
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
    `;
  }

  getActionColumnSelectors(): string[] {
    return [
      'th.action-column-cells',
      'td.inline-edit-column-cell',
      '[matColumnDef="select"]',
      '[matColumnDef="edit"]',
      '[matColumnDef="popup"]',
      '[matColumnDef="delete"]',
      '[matColumnDef="freeze"]',
      '[matColumnDef="hide"]',
    ];
  }

  openPrintWindow(): Window | null {
    return window.open('', '', this.printWindowFeatures);
  }

  sanitizeTableClone(printContent: HTMLElement, hiddenRowIndices: number[]): HTMLElement {
    const tableClone = printContent.cloneNode(true) as HTMLElement;
    const hiddenRowIndexSet = new Set(hiddenRowIndices);

    this.removeScriptsAndInlineHandlers(tableClone);
    this.removeActionColumnsBySelectors(tableClone);

    const actionColumnIndices = this.getActionColumnIndices(tableClone);
    this.removeHiddenRowsAndActionCells(tableClone, hiddenRowIndexSet, actionColumnIndices);

    return tableClone;
  }

  private removeScriptsAndInlineHandlers(tableClone: HTMLElement): void {
    tableClone.querySelectorAll('script').forEach(scriptElement => scriptElement.remove());

    tableClone.querySelectorAll('*').forEach(element => {
      Array.from(element.attributes).forEach(attr => {
        if (attr.name.toLowerCase().startsWith('on')) {
          element.removeAttribute(attr.name);
        }
      });
    });
  }

  private removeActionColumnsBySelectors(tableClone: HTMLElement): void {
    this.getActionColumnSelectors().forEach(selector => {
      tableClone.querySelectorAll(selector).forEach(element => element.remove());
    });
  }

  private getActionColumnIndices(tableClone: HTMLElement): number[] {
    const actionColumnIndices: number[] = [];
    const headerRow = tableClone.querySelector('tr.mat-mdc-header-row');
    if (!headerRow) {
      return actionColumnIndices;
    }

    const headers = Array.from(headerRow.querySelectorAll('th'));
    headers.forEach((header, index) => {
      if (header.classList.contains('action-column-cells')) {
        actionColumnIndices.push(index);
      }
    });

    return actionColumnIndices;
  }

  private removeHiddenRowsAndActionCells(
    tableClone: HTMLElement,
    hiddenRowIndexSet: Set<number>,
    actionColumnIndices: number[]
  ): void {
    const rows = tableClone.querySelectorAll('tr');
    rows.forEach((row, rowIndex) => {
      const dataIndex = rowIndex - 1;
      if (dataIndex >= 0 && hiddenRowIndexSet.has(dataIndex)) {
        row.remove();
        return;
      }

      const cells = Array.from(row.querySelectorAll('th, td'));
      for (let index = actionColumnIndices.length - 1; index >= 0; index--) {
        const actionColumnIndex = actionColumnIndices[index];
        if (cells[actionColumnIndex]) {
          cells[actionColumnIndex].remove();
        }
      }
    });
  }

  printTable(tableID: number, hiddenRowIndices: number[]): void {
    const printContent = document.getElementById(this.tableIdPrefix + tableID);
    if (!printContent) {
      return;
    }

    const windowPrint = this.openPrintWindow();
    if (!windowPrint) {
      return;
    }

    windowPrint.document.write('<html><head><title>Print Table</title>');
    windowPrint.document.write('<style>');
    windowPrint.document.write(this.getPrintStyles());
    windowPrint.document.write('</style></head><body>');

    const tableClone = this.sanitizeTableClone(printContent, hiddenRowIndices);
    windowPrint.document.write(tableClone.outerHTML);
    windowPrint.document.write('</body></html>');
    windowPrint.document.close();

    setTimeout(() => {
      windowPrint.print();
      windowPrint.close();
    }, 250);
  }
}