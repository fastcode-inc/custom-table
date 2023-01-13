import { TestBed } from '@angular/core/testing';

import { CustomTableService } from './custom-table.service';

describe('CustomTableService', () => {
  let service: CustomTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
