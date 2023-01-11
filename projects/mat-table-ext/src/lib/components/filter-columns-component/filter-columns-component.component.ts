import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-filter-columns-component',
  templateUrl: './filter-columns-component.component.html',
  styleUrls: ['./filter-columns-component.component.scss'],
})
export class FilterColumnsComponentComponent implements OnInit {
  @Input() obj!: any;
  @Output() filterOutput: EventEmitter<any> = new EventEmitter<any>();
  stringCtrl: FormControl = new FormControl();
  numberCtrl: FormControl = new FormControl();
  dateCtrl: FormControl = new FormControl();
  booleanCtrl: FormControl = new FormControl();
  selectionCtrl: FormControl = new FormControl();

  public type: any;
  constructor() {}
  ngOnInit(): void {
    this.stringCtrl.valueChanges.subscribe((value) => {
      this.checkValue(value);
    });
    this.dateCtrl.valueChanges.subscribe((value) => {
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
  checkValue(value: any) {
    if (value || value == '') {
      this.emitOutput(value);
    } else if (value == null) {
      this.emitOutput('');
    }
  }

  emitOutput(value: any) {
    let obj = { [this.obj.field]: value };
    this.filterOutput.emit(obj);
  }
}
