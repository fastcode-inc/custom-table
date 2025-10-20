import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MTExColumn } from '../../models/tableExtModels';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-column-pinning',
  templateUrl: './column-pinning.component.html',
  styleUrls: ['./column-pinning.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    TitleCasePipe
  ]
})
export class ColumnPinningComponent implements OnInit {
  @Input() columns!: MTExColumn[];
  @Output() columnsChanged: EventEmitter<MTExColumn[]> = new EventEmitter();
  public icons = {
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
  changeValue(column: MTExColumn) {
    console.log('changeValue called for column:', column);
    
    if (column.pinned) {
      if (column.pinned == 'left') {
        this.setColumnPinValue(column, 'right');
      } else if (column.pinned == 'right') {
        this.setColumnPinValue(column, null);
      }
    } else {
      this.setColumnPinValue(column, 'left');
    }
    
    console.log('After setColumnPinValue, columns:', this.columns);
    
    // Create a new array reference to trigger change detection
    this.columnsChanged.emit([...this.columns]);
  }
  /**
   * @description This method is used to set the column pin value.
   * @param column column of which to set the pin value
   * @param value pin value to set
   */
  setColumnPinValue(column: MTExColumn, value: 'left' | 'right' | null) {
    console.log('setColumnPinValue called with column:', column, 'value:', value);
    
    // Create a new array with updated column
    this.columns = this.columns.map(col => {
      if (column?.field == col.field) {
        console.log('Found matching column by field, updating pinned from', col.pinned, 'to', value);
        return { ...col, pinned: value };
      }
      return col;
    });
    
    console.log('Updated columns array:', this.columns);
  }
}
