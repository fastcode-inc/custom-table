import { Component, Input } from '@angular/core';
import { TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MTExColumn, MTExRowData } from '../../models/tableExtModels';

@Component({
  selector: 'app-table-cell-editor',
  templateUrl: './table-cell-editor.component.html',
  styleUrls: ['./table-cell-editor.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
})
export class TableCellEditorComponent<T extends MTExRowData = MTExRowData> {
  /** Column definition — drives the type switch */
  @Input() column!: MTExColumn<T>;

  /** Current row data */
  @Input() row!: T;

  /** Row index */
  @Input() index!: number;

  /** Temporary editing data store (shared by reference with parent) */
  @Input() rowDataTemp: Record<string, T> = {};

  /** Cell-level editing state map (shared by reference with parent) */
  @Input() cellEditing: Record<string, boolean> = {};

  /** Custom inline editing template provided by consumer */
  @Input() inlineEditingTemplateRef?: TemplateRef<unknown>;

  /** Custom cell editing template provided by consumer */
  @Input() cellEditingTemplateRef?: TemplateRef<unknown>;

  /** Data object for the inline editing template */
  @Input() inlineEditingData: Record<string, unknown> = {};

  /** Convenience getter for the temp data for this row */
  get editData(): T {
    return this.rowDataTemp['e' + this.index];
  }

  /** Key used for cellEditing lookups */
  get cellEditingKey(): string {
    return this.index + '_' + this.column.field;
  }
}
