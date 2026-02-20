import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MTExColumn, MTExColumnType, MTExRowData } from '../../models/tableExtModels';
import { MatTableExtService } from '../../mat-table-ext.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-editing',
  templateUrl: './editing.component.html',
  styleUrls: ['./editing.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    TitleCasePipe
  ]
})
export class EditingComponent<T extends MTExRowData = MTExRowData> implements OnInit {
  public templateRef!: TemplateRef<EditingTemplateContext<T>>;
  public keys: string[] = [];
  public templateKeys: string[] = [];
  public types: Record<string, MTExColumnType> = {};
  public templateTypes: Record<string, MTExColumnType> = {};
  public columns: MTExColumn<T>[] = [];
  public templateRow: Partial<T> = {};
  public isCellEdit: boolean = false;
  public cellColumn!: MTExColumn<T>;
  public cellValue: unknown;
  public cellField: string = '';
  
  constructor(
    public dialogRef: MatDialogRef<EditingComponent<T>>,
    @Inject(MAT_DIALOG_DATA) public dialogData: EditingDialogData<T>,
    public service: MatTableExtService<T>
  ) { }
  
  ngOnInit(): void {
    // Check if this is cell-level editing
    if (this.dialogData.isCellEdit) {
      this.isCellEdit = true;
      this.cellColumn = this.dialogData.column!;
      this.cellField = this.cellColumn.field;
      this.cellValue = (this.dialogData.row as Record<string, unknown>)[this.cellField];
      
      // Handle selection type
      if (this.cellColumn.type === 'selection') {
        this.types[this.cellField] = 'selection';
      } else {
        this.types[this.cellField] = this.cellColumn.type;
      }
      
      this.templateRef = this.dialogData.templateRef!;
    } else {
      this.setData(this.dialogData);
    }
  }
/**
 * @description This method is used to set data for editing.
 * @param value dialog Data
 */
  setData(value: EditingDialogData<T>) {
    const row = value.row as Record<string, unknown>;
    const types: Record<string, MTExColumnType> = {};
    this.keys = [];
    this.columns = value.columns;
    this.columns.forEach((column) => {
      this.keys.push(column.field);
      if (column.type == 'selection') {
        types[column.field] = column.type;
        const temp = row[column.field];
        row[column.field] = {
          value: temp,
          options: column.options,
        };
      } else {
        types[column.field] = column.type;
      }
    });
    this.types = types;
    this.setTemplateRef(value);
  }
/**
 * @description This method is used to set the data when data comes in from cus template.
 * @param value template value
 */
  setTemplateRef(value: EditingDialogData<T>) {
    if (value.templateRef !== undefined) {
      this.templateRow = { ...value.row as Partial<T> };
      const types: Record<string, MTExColumnType> = {};
      this.templateKeys = [];
      this.columns.forEach((column) => {
        this.templateKeys.push(column.field);
        if (column.type == 'selection') {
          types[column.field] = column.type;
          const temp = (this.templateRow as Record<string, unknown>)[column.field];
          (this.templateRow as Record<string, unknown>)[column.field] = {
            value: temp,
            options: column.options,
          };
        } else {
          types[column.field] = column.type;
        }
      });
      this.templateTypes = types;
      this.templateRef = value.templateRef;
    }
  }
  /**
   * @description This method is triggered when dialog is closed and also emits the dialog closed event data.
   */
  closeDialog() {
    if (this.isCellEdit) {
      // Return single cell data
      this.dialogRef.close({
        field: this.cellField,
        value: this.cellValue
      });
    } else {
      // Return full row data
      const rowData = { ...this.dialogData.row } as Record<string, unknown>;
      this.keys.forEach((key: string) => {
        if (this.types[key] === 'selection') {
          const temp = (rowData[key] as {value: unknown}).value;
          rowData[key] = temp;
        }
      });
      this.dialogRef.close(rowData as T);
    }
  }  /**
   * @description This method is called when the dialog is closed custom template action.
   * @param row row to be edited.
   * @param keys keys of columns
   * @param types column types
   */
  closeTemplateDialog(row: Partial<T>, keys: string[], types: Record<string, MTExColumnType>) {
    const rowData = { ...row } as Record<string, unknown>;
    keys.forEach((key: string) => {
      if (types[key] === 'selection') {
        const temp = (rowData[key] as {value: unknown}).value;
        rowData[key] = temp;
      }
    });
    this.dialogRef.close(rowData);
  }

  getSelectionValue(key: string): unknown {
    return this.getSelectionObject(key)?.value;
  }

  setSelectionValue(key: string, value: unknown): void {
    const row = this.dialogData.row as Record<string, unknown>;
    const selection = this.getSelectionObject(key);
    if (selection) {
      selection.value = value;
      row[key] = selection;
    }
  }

  getSelectionOptions(key: string): string[] {
    return this.getSelectionObject(key)?.options ?? [];
  }

  private getSelectionObject(key: string): { value: unknown; options?: string[] } | null {
    const row = this.dialogData.row as Record<string, unknown>;
    const value = row[key];
    if (value && typeof value === 'object' && 'value' in (value as Record<string, unknown>)) {
      return value as { value: unknown; options?: string[] };
    }
    return null;
  }
}

/** Interface for editing dialog data */
export interface EditingDialogData<T extends MTExRowData = MTExRowData> {
  row: T;
  columns: MTExColumn<T>[];
  templateRef?: TemplateRef<EditingTemplateContext<T>>;
  isCellEdit?: boolean;
  column?: MTExColumn<T>;
}

export interface EditingTemplateData<T extends MTExRowData = MTExRowData> {
  row: Partial<T>;
  columns: MTExColumn<T>[];
  columnKeys: string[];
  columnTypes: Record<string, MTExColumnType>;
  closeDialog: (row: Partial<T>, keys: string[], types: Record<string, MTExColumnType>) => void;
}

export interface EditingTemplateContext<T extends MTExRowData = MTExRowData> {
  $implicit: EditingTemplateData<T>;
}
