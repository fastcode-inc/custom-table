import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MTExColumn } from '../../models/tableExtModels';
import { MatTableExtService } from '../../mat-table-ext.service';

@Component({
  selector: 'app-editing',
  templateUrl: './editing.component.html',
  styleUrls: ['./editing.component.scss'],
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

  closeTemplateDialogMap = (row: any, keys: string[], types: string[]) => {
    this.closeTemplateDialog(row, keys, types);
  };

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
