import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MTExColumn } from '../../models/tableExtModels';

import { TableCellEditorComponent } from './table-cell-editor.component';

describe('TableCellEditorComponent', () => {
  let component: TableCellEditorComponent;
  let fixture: ComponentFixture<TableCellEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableCellEditorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableCellEditorComponent);
    component = fixture.componentInstance;

    component.column = { field: 'name', type: 'string' } as MTExColumn;
    component.row = { name: 'Alice' };
    component.index = 2;
    component.rowDataTemp = {
      e2: { name: 'Edited Alice' },
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return row edit data for current index', () => {
    expect(component.editData).toEqual({ name: 'Edited Alice' });
  });

  it('should build stable cell editing key from row index and field', () => {
    expect(component.cellEditingKey).toBe('2_name');
  });
});
