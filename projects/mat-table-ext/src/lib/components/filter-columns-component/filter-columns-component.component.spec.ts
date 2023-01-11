import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterColumnsComponentComponent } from './filter-columns-component.component';

describe('FilterColumnsComponentComponent', () => {
  let component: FilterColumnsComponentComponent;
  let fixture: ComponentFixture<FilterColumnsComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterColumnsComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterColumnsComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
