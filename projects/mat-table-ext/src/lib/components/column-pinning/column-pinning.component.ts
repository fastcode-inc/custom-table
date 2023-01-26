import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MTExColumn } from '../../models/tableExtModels';

@Component({
  selector: 'app-column-pinning',
  templateUrl: './column-pinning.component.html',
  styleUrls: ['./column-pinning.component.scss'],
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
    if (column.pinned) {
      if (column.pinned == 'left') {
        this.setColumnPinValue(column, 'right');
      } else if (column.pinned == 'right') {
        this.setColumnPinValue(column, undefined);
      }
    } else {
      this.setColumnPinValue(column, 'left');
    }
    this.columnsChanged.emit(this.columns);
  }
  /**
   * @description This method is used to set the column pin value.
   * @param column column of which to set the pin value
   * @param value pin value to set
   */
  setColumnPinValue(column: MTExColumn, value: 'left' | 'right' | undefined) {
    this.columns.forEach((col) => {
      if (column?.header == col.header) {
        col.pinned = value;
      }
    });
  }
}
