import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatTableExtComponent } from './mat-table-ext.component';

describe('MatTableExtComponent', () => {
  let component: MatTableExtComponent;
  let fixture: ComponentFixture<MatTableExtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatTableExtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatTableExtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
