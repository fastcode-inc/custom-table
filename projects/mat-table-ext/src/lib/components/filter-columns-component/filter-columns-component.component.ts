import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-filter-columns-component',
  templateUrl: './filter-columns-component.component.html',
  styleUrls: ['./filter-columns-component.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule
  ]
})
export class FilterColumnsComponentComponent implements OnInit {
  @Input() obj!: any;
  @Output() filterOutput: EventEmitter<any> = new EventEmitter<any>();
  stringCtrl: FormControl = new FormControl();
  numberCtrl: FormControl = new FormControl();
  dateCtrl: FormControl = new FormControl();
  textareaCtrl: FormControl = new FormControl();
  booleanCtrl: FormControl = new FormControl();
  selectionCtrl: FormControl = new FormControl();
  constructor() {}
  ngOnInit(): void {
    this.stringCtrl.valueChanges.subscribe((value) => {
      this.checkValue(value);
    });
    this.dateCtrl.valueChanges.subscribe((value) => {
      this.checkValue(value);
    });
    this.textareaCtrl.valueChanges.subscribe((value) => {
      this.checkValue(value);
    });
    this.numberCtrl.valueChanges.subscribe((value) => {
      this.checkValue(value);
    });
    this.booleanCtrl.valueChanges.subscribe((value) => {
      this.checkValue(value);
    });
    this.selectionCtrl.valueChanges.subscribe((value) => {
      this.checkValue(value);
    });
  }
  /**
   * @description This method is make value is valid and not null.
   * @param value value to check its type.
   */
  checkValue(value: any) {
    if (value || value == '') {
      this.emitOutput(value);
    } else if (value == null) {
      this.emitOutput('');
    }
  }
/**
 * @description This method will emit seach value to parent component.
 * @param value value on which base table rows are filtered. 
 */
  emitOutput(value: any) {
    let obj = { [this.obj.field]: value };
    this.filterOutput.emit(obj);
  }
}
