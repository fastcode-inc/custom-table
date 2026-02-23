import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MTExColumn, MTExRowData } from '../../models/tableExtModels';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-column-pinning',
  templateUrl: './column-pinning.component.html',
  styleUrls: ['./column-pinning.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    TitleCasePipe
  ]
})
export class ColumnPinningComponent<T extends MTExRowData = MTExRowData> implements OnInit {
  @Input() columns!: MTExColumn<T>[];
  @Output() columnsChanged: EventEmitter<MTExColumn<T>[]> = new EventEmitter();
  icons = {
    left: 'pinLeft',
    right: 'pinRight',
    none: 'pinNone',
  };

  constructor() {}
  ngOnInit(): void {}
  /**
   * @description This method is called when pin value changes for a column.
   * @param column column of which to set the pin value
   */
  changeValue(column: MTExColumn<T>) {
    if (column.pinned) {
      if (column.pinned == 'left') {
        this.setColumnPinValue(column, 'right');
      } else if (column.pinned == 'right') {
        this.setColumnPinValue(column, null);
      }
    } else {
      this.setColumnPinValue(column, 'left');
    }
    
    // Create a new array reference to trigger change detection
    this.columnsChanged.emit([...this.columns]);
  }
  /**
   * @description This method is used to set the column pin value.
   * @param column column of which to set the pin value
   * @param value pin value to set
   */
  setColumnPinValue(column: MTExColumn<T>, value: 'left' | 'right' | null) {
    // Create a new array with updated column
    this.columns = this.columns.map(col => {
      if (column?.field == col.field) {
        return { ...col, pinned: value === null ? undefined : value };
      }
      return col;
    });
  }
}
