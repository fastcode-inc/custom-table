import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { MatTableExtService } from './mat-table-ext.service';

describe('MatTableExtService', () => {
  let service: MatTableExtService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(MatTableExtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize selectedRow with null', () => {
    expect(service.selectedRow.value).toBeNull();
  });

  it('should update selectedRow when next is called', () => {
    const row = { id: 10, name: 'Alice' };

    service.selectedRow.next(row);

    expect(service.selectedRow.value).toEqual(row);
  });
});
