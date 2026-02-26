import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableExtService } from '../../services/mat-table-ext.service';
import { TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { EditingComponent } from './editing.component';

describe('EditingComponent', () => {
  let component: EditingComponent;
  let fixture: ComponentFixture<EditingComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<EditingComponent>>;

  function configure(dialogData: any): void {
    TestBed.resetTestingModule();
    dialogRefSpy = jasmine.createSpyObj<MatDialogRef<EditingComponent>>('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [EditingComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData,
        },
        {
          provide: MatDialogRef,
          useValue: dialogRefSpy,
        },
        {
          provide: MatTableExtService,
          useValue: {
            selectedRow: new BehaviorSubject(null),
          },
        },
      ],
    });

    fixture = TestBed.createComponent(EditingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
  });

  it('should create', () => {
    configure({
      row: { id: 1, status: 'open' },
      columns: [
        { field: 'id', type: 'number' },
        { field: 'status', type: 'selection', options: ['open', 'closed'] },
      ],
    });

    expect(component).toBeTruthy();
  });

  it('ngOnInit should process cell-level editing input', () => {
    configure({
      row: { name: 'Alex' },
      columns: [{ field: 'name', type: 'string' }],
      isCellEdit: true,
      column: { field: 'name', type: 'selection', options: ['Alex', 'Sam'] },
    });

    expect(component.isCellEdit).toBeTrue();
    expect(component.cellField).toBe('name');
    expect(component.cellValue).toBe('Alex');
    expect(component.types['name']).toBe('selection');
  });

  it('setData should map keys/types and transform selection values', () => {
    configure({
      row: { id: 10, role: 'Admin' },
      columns: [],
    });

    const setTemplateRefSpy = spyOn(component, 'setTemplateRef').and.callThrough();
    const data = {
      row: { id: 10, role: 'Admin' },
      columns: [
        { field: 'id', type: 'number' },
        { field: 'role', type: 'selection', options: ['Admin', 'User'] },
      ],
    } as any;

    component.setData(data);

    expect(component.keys).toEqual(['id', 'role']);
    expect(component.types['id']).toBe('number');
    expect(component.types['role']).toBe('selection');
    expect((data.row as any).role.value).toBe('Admin');
    expect((data.row as any).role.options).toEqual(['Admin', 'User']);
    expect(setTemplateRefSpy).toHaveBeenCalled();
  });

  it('setTemplateRef should create template-specific row/type metadata', () => {
    configure({
      row: { status: 'open', name: 'Jill' },
      columns: [
        { field: 'status', type: 'selection', options: ['open', 'closed'] },
        { field: 'name', type: 'string' },
      ],
    });

    const templateRef = {} as TemplateRef<any>;
    component.columns = [
      { field: 'status', type: 'selection', options: ['open', 'closed'] },
      { field: 'name', type: 'string' },
    ] as any;
    component.setTemplateRef({ ...(component.dialogData as any), templateRef } as any);

    expect(component.templateRef).toBe(templateRef);
    expect(component.templateKeys).toEqual(['status', 'name']);
    expect(component.templateTypes['status']).toBe('selection');
    const statusValue = (component.templateRow as any).status?.value;
    const normalizedStatus =
      statusValue && typeof statusValue === 'object' && 'value' in statusValue
        ? (statusValue as any).value
        : statusValue;
    expect(normalizedStatus).toBe('open');
  });

  it('closeDialog should close with cell payload for cell edit mode', () => {
    configure({
      row: { name: 'Alex' },
      columns: [{ field: 'name', type: 'string' }],
      isCellEdit: true,
      column: { field: 'name', type: 'string' },
    });

    component.cellField = 'name';
    component.cellValue = 'Sam';
    component.closeDialog();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({ field: 'name', value: 'Sam' });
  });

  it('closeDialog should unwrap selection objects and close full row in row edit mode', () => {
    configure({
      row: {
        status: { value: 'closed', options: ['open', 'closed'] },
        title: 'Task',
      },
      columns: [],
    });

    component.isCellEdit = false;
    component.keys = ['status', 'title'];
    component.types = { status: 'selection', title: 'string' } as any;

    component.closeDialog();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({ status: 'closed', title: 'Task' });
  });

  it('closeTemplateDialog should unwrap selection fields before closing', () => {
    configure({ row: {}, columns: [] });

    component.closeTemplateDialog(
      {
        priority: { value: 'High', options: ['Low', 'High'] } as any,
        note: 'Ready',
      },
      ['priority', 'note'],
      { priority: 'selection', note: 'string' } as any,
    );

    expect(dialogRefSpy.close).toHaveBeenCalledWith({ priority: 'High', note: 'Ready' });
  });

  it('selection helpers should read and update selection object state', () => {
    configure({
      row: {
        status: { value: 'open', options: ['open', 'closed'] },
      },
      columns: [],
    });

    expect(component.getSelectionValue('status')).toBe('open');
    expect(component.getSelectionOptions('status')).toEqual(['open', 'closed']);

    component.setSelectionValue('status', 'closed');

    expect(component.getSelectionValue('status')).toBe('closed');
    expect((component.dialogData.row as any).status.value).toBe('closed');
  });

  it('selection helpers should safely handle non-selection field values', () => {
    configure({
      row: { plain: 'text' },
      columns: [],
    });

    expect(component.getSelectionValue('plain')).toBeUndefined();
    expect(component.getSelectionOptions('plain')).toEqual([]);

    component.setSelectionValue('plain', 'new');

    expect((component.dialogData.row as any).plain).toBe('text');
  });
});
