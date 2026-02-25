import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { of } from 'rxjs';

import { ColumnPinningComponent } from './column-pinning.component';

describe('ColumnPinningComponent', () => {
  let component: ColumnPinningComponent;
  let fixture: ComponentFixture<ColumnPinningComponent>;

  const createColumns = () => [
    { field: 'name', header: 'Name' },
    { field: 'age', header: 'Age', pinned: 'left' as const },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnPinningComponent],
      providers: [
        {
          provide: MatIconRegistry,
          useValue: {
            getNamedSvgIcon: () =>
              of(document.createElementNS('http://www.w3.org/2000/svg', 'svg')),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnPinningComponent);
    component = fixture.componentInstance;
    component.columns = createColumns() as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should keep ngOnInit callable', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should set column pin value for matching column only', () => {
    component.setColumnPinValue(component.columns[0] as any, 'right');

    expect((component.columns[0] as any).pinned).toBe('right');
    expect((component.columns[1] as any).pinned).toBe('left');
  });

  it('should cycle pin value from left to right and emit changed columns', () => {
    const emitSpy = spyOn(component.columnsChanged, 'emit');
    (component.columns[0] as any).pinned = 'left';

    component.changeValue(component.columns[0] as any);

    expect((component.columns[0] as any).pinned).toBe('right');
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('should cycle pin value from right to none (undefined) and emit', () => {
    const emitSpy = spyOn(component.columnsChanged, 'emit');
    (component.columns[0] as any).pinned = 'right';

    component.changeValue(component.columns[0] as any);

    expect((component.columns[0] as any).pinned).toBeUndefined();
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('should set pin value to left when currently unpinned', () => {
    const emitSpy = spyOn(component.columnsChanged, 'emit');
    (component.columns[0] as any).pinned = undefined;

    component.changeValue(component.columns[0] as any);

    expect((component.columns[0] as any).pinned).toBe('left');
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });
});
