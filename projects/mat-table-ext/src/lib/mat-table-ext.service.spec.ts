import { TestBed } from '@angular/core/testing';

import { MatTableExtService } from './mat-table-ext.service';

describe('MatTableExtService', () => {
  let service: MatTableExtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatTableExtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
