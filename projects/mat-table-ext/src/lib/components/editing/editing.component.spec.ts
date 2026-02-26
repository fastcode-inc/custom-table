import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableExtService } from '../../services/mat-table-ext.service';
import { TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  EditingComponent,
  EditingDialogData,
  EditingTemplateContext,
} from './editing.component';

describe('EditingComponent', () => {
  let component: EditingComponent;
  let fixture: ComponentFixture<EditingComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<EditingComponent>>;

  function configure(dialogData: EditingDialogData<Record<string, unknown>>): void {
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
    } as EditingDialogData<Record<string, unknown>>;

    component.setData(data);

    expect(component.keys).toEqual(['id', 'role']);
    expect(component.types['id']).toBe('number');
    expect(component.types['role']).toBe('selection');
    const roleSelection = (data.row as Record<string, unknown>)['role'] as {
      value: unknown;
      options?: string[];
    };
    expect(roleSelection.value).toBe('Admin');
    expect(roleSelection.options).toEqual(['Admin', 'User']);
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

    const templateRef = {} as TemplateRef<EditingTemplateContext<Record<string, unknown>>>;
    component.columns = [
      { field: 'status', type: 'selection', options: ['open', 'closed'] },
      { field: 'name', type: 'string' },
    ];
    component.setTemplateRef({ ...component.dialogData, templateRef });

    expect(component.templateRef).toBe(templateRef);
    expect(component.templateKeys).toEqual(['status', 'name']);
    expect(component.templateTypes['status']).toBe('selection');
    const statusValue =
      (component.templateRow as Record<string, unknown>)['status'] as unknown;
    const normalizedStatus =
      statusValue && typeof statusValue === 'object' && 'value' in statusValue
        ? (statusValue as { value: unknown }).value
        : statusValue;
    const flattenedStatus =
      normalizedStatus &&
      typeof normalizedStatus === 'object' &&
      'value' in normalizedStatus
        ? (normalizedStatus as { value: unknown }).value
        : normalizedStatus;
    expect(flattenedStatus).toBe('open');
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
    component.types = { status: 'selection', title: 'string' };

    component.closeDialog();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({ status: 'closed', title: 'Task' });
  });

  it('closeTemplateDialog should unwrap selection fields before closing', () => {
    configure({ row: {}, columns: [] });

    component.closeTemplateDialog(
      {
        priority: { value: 'High', options: ['Low', 'High'] },
        note: 'Ready',
      },
      ['priority', 'note'],
      { priority: 'selection', note: 'string' },
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
    const statusSelection = (component.dialogData.row as Record<string, unknown>)['status'] as {
      value: unknown;
    };
    expect(statusSelection.value).toBe('closed');
  });

  it('selection helpers should safely handle non-selection field values', () => {
    configure({
      row: { plain: 'text' },
      columns: [],
    });

    expect(component.getSelectionValue('plain')).toBeUndefined();
    expect(component.getSelectionOptions('plain')).toEqual([]);

    component.setSelectionValue('plain', 'new');

    expect((component.dialogData.row as Record<string, unknown>)['plain']).toBe('text');
  });
});
