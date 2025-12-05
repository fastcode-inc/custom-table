import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MTExColumn } from '../../models/tableExtModels';
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
export class EditingComponent implements OnInit {
  public templateRef!: TemplateRef<any>;
  public keys: string[] = [];
  public templateKeys: string[] = [];
  public types: any = {};
  public templateTypes: any = {};
  public columns: MTExColumn[] = [];
  public templateRow: any = {};
  
  constructor(
    public dialogRef: MatDialogRef<EditingComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public service: MatTableExtService
  ) { }
  
  ngOnInit(): void {
    this.setData(this.dialogData);
  }
/**
 * @description This method is used to set data for editing.
 * @param value dialog Data
 */
  setData(value: any) {
    let row = value.row;
    let types: any = {};
    this.keys = [];
    this.columns = value.columns;
    this.columns.forEach((column) => {
      this.keys.push(column.field);
      if (column.type == 'selection') {
        types[column.field] = column.type;
        let temp = row[column.field];
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
  setTemplateRef(value: any) {
    if (value.templateRef !== undefined) {
      this.templateRow = { ...value.row };
      let types: any = {};
      this.templateKeys = [];
      this.columns.forEach((column) => {
        this.templateKeys.push(column.field);
        if (column.type == 'selection') {
          types[column.field] = column.type;
          let temp = this.templateRow[column.field];
          this.templateRow[column.field] = {
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
    let rowData = { ...this.dialogData.row };
    this.keys.forEach((key: any) => {
      if (this.types[key] === 'selection') {
        let temp = rowData[key].value;
        rowData[key] = temp;
      }
    });
    this.dialogRef.close(rowData);
  }

  /**
   * @description This method is called when the dialog is closed custom template action.
   * @param row row to be edited.
   * @param keys keys of columns
   * @param types column types
   */
  closeTemplateDialog(row: any, keys: string[], types: string[]) {
    let rowData = { ...row };
    keys.forEach((key: any) => {
      if (types[key] === 'selection') {
        let temp = rowData[key].value;
        rowData[key] = temp;
      }
    });
    this.dialogRef.close(rowData);
  }
}
