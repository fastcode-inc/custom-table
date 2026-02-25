import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import {
  MTExColumn,
  MTExColumnGroup,
  TableExportOptions,
  TablePdfExportOptions,
} from '../models/tableExtModels';

@Injectable({
  providedIn: 'root',
})
export class TableExportService {
  /**
   * Export table data to Excel (.xlsx) or CSV (.csv).
   * @param options Export configuration including data, columns, groups, etc.
   */
  async exportTable(options: TableExportOptions): Promise<void> {
    const {
      type,
      fileName = 'tablesheets',
      visibleColumns,
      columnGroups,
      data,
      hiddenRowIndices,
    } = options;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    let currentRowIndex = 1; // ExcelJS rows are 1-indexed

    // Add group headers if they exist
    if (columnGroups.length > 0) {
      const groupRow: any[] = new Array(visibleColumns.length).fill('');
      const columnIndexMap: { [key: string]: number } = {};

      visibleColumns.forEach((col, idx) => {
        columnIndexMap[col.field] = idx + 1; // 1-indexed for ExcelJS columns
      });

      columnGroups.forEach((group) => {
        const groupCols = group.columns.filter((colField) =>
          visibleColumns.find((vc) => vc.field === colField)
        );

        if (groupCols.length > 0) {
          const firstColIndex = columnIndexMap[groupCols[0]];
          groupRow[firstColIndex - 1] = group.label;

          // Merge cells if group spans multiple columns
          if (groupCols.length > 1) {
            const lastColIndex =
              columnIndexMap[groupCols[groupCols.length - 1]];
            worksheet.mergeCells(
              currentRowIndex,
              firstColIndex,
              currentRowIndex,
              lastColIndex
            );
          }
        }
      });

      worksheet.addRow(groupRow);
      currentRowIndex++;
    }

    // Add column headers
    const headerRow = visibleColumns.map((col) => col.header || col.field);
    worksheet.addRow(headerRow);
    currentRowIndex++;

    // Add data rows (exclude hidden rows)
    data.forEach((row, index) => {
      if (hiddenRowIndices.includes(index)) {
        return;
      }
      const rowData = visibleColumns.map((col) => {
        const value = row[col.field];
        if (value === null || value === undefined) return '';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (value instanceof Date)
          return new Intl.DateTimeFormat('en-US').format(value);
        return value;
      });

      worksheet.addRow(rowData);
      currentRowIndex++;
    });

    // Write to buffer based on the requested file type
    let buffer: any;
    let blob: Blob;
    let resolvedType = type;

    if (resolvedType.toLowerCase() === 'csv') {
      buffer = await workbook.csv.writeBuffer();
      blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
    } else {
      // Default to xlsx
      buffer = await workbook.xlsx.writeBuffer();
      blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      resolvedType = 'xlsx';
    }

    FileSaver.saveAs(blob, `${fileName}.${resolvedType}`);
  }

  /**
   * Export table data to PDF using jspdf + jspdf-autotable.
   * @param options PDF export configuration including data, columns, styles, etc.
   */
  async exportToPDF(options: TablePdfExportOptions): Promise<void> {
    const {
      fileName = 'table-export',
      orientation,
      title,
      visibleColumns,
      columnGroups,
      data,
      hiddenRowIndices,
      headerStyles: inputHeaderStyles,
      groupHeaderStyles: inputGroupHeaderStyles,
    } = options;

    // Dynamic imports
    const JsPDF = (await import('jspdf')).default;
    const autoTableModule = await import('jspdf-autotable');
    const autoTable = autoTableModule.autoTable || autoTableModule.default;

    // Create PDF document
    const doc = new JsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    // Default header styles
    const headerStyles: any = inputHeaderStyles ?? {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    };

    // Prepare group headers if column groups exist
    let groupHeaders: any[] = [];
    const columnIndexMap: { [key: string]: number } = {};

    if (columnGroups.length > 0) {
      // Build column index map
      visibleColumns.forEach((col, idx) => {
        columnIndexMap[col.field] = idx;
      });

      // Create group header row
      const groupRow: any[] = [];

      columnGroups.forEach((group) => {
        const groupCols = group.columns.filter((colField) =>
          visibleColumns.find((vc) => vc.field === colField)
        );

        if (groupCols.length > 0) {
          groupRow.push({
            content: group.label,
            colSpan: groupCols.length,
            styles: { halign: 'center' },
          });
        }
      });

      // Add empty cells for ungrouped columns
      const groupedFields = new Set<string>();
      columnGroups.forEach((group) => {
        group.columns.forEach((colField) => groupedFields.add(colField));
      });

      const ungroupedCount = visibleColumns.filter(
        (col) => !groupedFields.has(col.field)
      ).length;

      for (let i = 0; i < ungroupedCount; i++) {
        groupRow.push({
          content: '',
          styles: { halign: 'center' },
        });
      }

      groupHeaders = [groupRow];
    }

    const headers = visibleColumns.map((col) => col.header || col.field);

    const rows = data
      .map((row, index) => ({ row, index }))
      .filter(({ index }) => !hiddenRowIndices.includes(index))
      .map(({ row }) =>
        visibleColumns.map((col) => {
          const value = row[col.field];
          if (value === null || value === undefined) return '';
          if (typeof value === 'boolean') return value ? 'Yes' : 'No';
          if (value instanceof Date)
            return new Intl.DateTimeFormat('en-US').format(value);
          return String(value);
        })
      );

    let startY = 10;
    if (title) {
      doc.text(title, 14, 15);
      startY = 20;
    }

    // Resolve group header styles
    const groupHeaderStyles: any =
      inputGroupHeaderStyles !== undefined
        ? inputGroupHeaderStyles
        : columnGroups.length > 0
          ? { ...headerStyles }
          : null;

    // Build table config
    const tableConfig: any = {
      head:
        groupHeaders.length > 0
          ? [...groupHeaders, headers]
          : [headers],
      body: rows,
      startY,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineWidth: 0,
      },
      headStyles: headerStyles,
    };

    // didParseCell: apply header/group header visual styles
    tableConfig.didParseCell = (cellData: any) => {
      // Group header row styling
      if (
        cellData.section === 'head' &&
        groupHeaders.length > 0 &&
        cellData.row.index === 0 &&
        groupHeaderStyles
      ) {
        if (groupHeaderStyles.fillColor)
          cellData.cell.styles.fillColor = groupHeaderStyles.fillColor;
        if (groupHeaderStyles.textColor)
          cellData.cell.styles.textColor = groupHeaderStyles.textColor;
        if (groupHeaderStyles.fontStyle)
          cellData.cell.styles.fontStyle = groupHeaderStyles.fontStyle;
        cellData.cell.styles.halign = 'center';
      }

      // Final header row (column labels) should use headerStyles
      if (
        cellData.section === 'head' &&
        cellData.row.index ===
          (groupHeaders.length > 0 ? groupHeaders.length : 0)
      ) {
        if (headerStyles.fillColor)
          cellData.cell.styles.fillColor = headerStyles.fillColor;
        if (headerStyles.textColor)
          cellData.cell.styles.textColor = headerStyles.textColor;
        if (headerStyles.fontStyle)
          cellData.cell.styles.fontStyle = headerStyles.fontStyle;
      }
    };

    // didDrawCell: draw only the bottom divider line for each cell
    tableConfig.didDrawCell = (cellData: any) => {
      try {
        const cell = cellData.cell;
        const docRef: any = doc;
        const lineColor = [200, 200, 200];
        const lineWidth = 0.5;

        const x1 = cell.x;
        const x2 = cell.x + cell.width;
        const y = cell.y + cell.height;

        docRef.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
        docRef.setLineWidth(lineWidth);
        docRef.line(x1, y, x2, y);
      } catch (err) {
        // don't block export on draw errors
      }
    };

    autoTable(doc, tableConfig);

    doc.save(`${fileName}.pdf`);
  }
}
