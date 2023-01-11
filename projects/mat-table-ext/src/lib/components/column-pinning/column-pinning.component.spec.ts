import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnPinningComponent } from './column-pinning.component';

describe('ColumnPinningComponent', () => {
  let component: ColumnPinningComponent;
  let fixture: ComponentFixture<ColumnPinningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColumnPinningComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnPinningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
