import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MaterialModule } from '../lib/material.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableExtComponent } from '../lib/mat-table-ext.component';
import { ResizeColumnDirective } from '../lib/directives/resize-column.directive';
import { MatTableExporterModule } from 'mat-table-exporter';
import { ColumnPinningComponent } from '../lib/components/column-pinning/column-pinning.component';
import { EditingComponent } from '../lib/components/editing/editing.component';
import { FilterColumnsComponentComponent } from '../lib/components/filter-columns-component/filter-columns-component.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [

    MatTableExtComponent,
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
    MatTableExtComponent,
    ResizeColumnDirective,
    ColumnPinningComponent,
    EditingComponent,
    FilterColumnsComponentComponent,
    MatTableExporterModule,
  ],
})
export class CustomTableModule { }