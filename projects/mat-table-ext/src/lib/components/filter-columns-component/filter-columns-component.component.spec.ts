import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MTExColumn } from '../../models/tableExtModels';

import { FilterColumnsComponentComponent } from './filter-columns-component.component';

describe('FilterColumnsComponentComponent', () => {
  let component: FilterColumnsComponentComponent;
  let fixture: ComponentFixture<FilterColumnsComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterColumnsComponentComponent],
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterColumnsComponentComponent);
    component = fixture.componentInstance;
    component.obj = {
      field: 'name',
      header: 'Name',
      type: 'string',
    } as MTExColumn;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe controls in ngOnInit and route values through checkValue', () => {
    const checkSpy = spyOn(component, 'checkValue').and.callThrough();

    component.stringCtrl.setValue('abc');
    component.dateCtrl.setValue(new Date());
    component.textareaCtrl.setValue('note');
    component.numberCtrl.setValue(12);
    component.booleanCtrl.setValue(true);
    component.selectionCtrl.setValue('opt');

    expect(checkSpy).toHaveBeenCalledTimes(6);
  });

  it('checkValue should emit direct value when provided (including empty string)', () => {
    const emitSpy = spyOn(component, 'emitOutput');

    component.checkValue('hello');
    component.checkValue('');

    expect(emitSpy).toHaveBeenCalledWith('hello');
    expect(emitSpy).toHaveBeenCalledWith('');
  });

  it('checkValue should emit empty string when null provided', () => {
    const emitSpy = spyOn(component, 'emitOutput');

    component.checkValue(null);

    expect(emitSpy).toHaveBeenCalledWith('');
  });

  it('emitOutput should map undefined to null and emit by field name', () => {
    const outputSpy = spyOn(component.filterOutput, 'emit');

    component.emitOutput(undefined);

    expect(outputSpy).toHaveBeenCalledWith({ name: null });
  });

  it('emitOutput should emit value object for active field', () => {
    const outputSpy = spyOn(component.filterOutput, 'emit');

    component.emitOutput(100);

    expect(outputSpy).toHaveBeenCalledWith({ name: 100 });
  });
});
