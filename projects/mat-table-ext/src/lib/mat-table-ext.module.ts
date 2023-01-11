import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MaterialModule } from '../modules/material.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CustomTableComponent } from '../custom-table/custom-table.component';
import { ResizeColumnDirective } from '../directives/resize-column.directive';
import { MatTableExporterModule } from 'mat-table-exporter';
import { ColumnPinningComponent } from '../components/column-pinning/column-pinning.component';
import { EditingComponent } from '../components/editing/editing.component';
import { FilterColumnsComponentComponent } from '../components/filter-columns-component/filter-columns-component.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [

    CustomTableComponent,
    ResizeColumnDirective,
    ColumnPinningComponent,
    EditingComponent,
    FilterColumnsComponentComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule.forChild(),
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    MaterialModule,
    HttpClientModule,
    MatFormFieldModule,
    MatTableExporterModule,
  ],
  exports: [
    CustomTableComponent,
    ResizeColumnDirective,
    ColumnPinningComponent,
    EditingComponent,
    FilterColumnsComponentComponent,
    MatTableExporterModule,
  ],
})
export class CustomTableModule { }