import { MatTableDataSource } from '@angular/material/table';

import { IsRowHiddenPipe } from './is-row-hidden.pipe';

describe('IsRowHiddenPipe', () => {
  let pipe: IsRowHiddenPipe;

  beforeEach(() => {
    pipe = new IsRowHiddenPipe();
  });

  it('should return true when index exists in hiddenRowIndices', () => {
    const result = pipe.transform(2, [0, 2, 4]);
    expect(result).toBeTrue();
  });

  it('should return filter function result when index is not explicitly hidden', () => {
    const dataSource = new MatTableDataSource([{ id: 1 }, { id: 2 }]);
    const filterFn = (row: any, index: number) => row.id === 2 && index === 1;

    const result = pipe.transform(1, [], filterFn, dataSource);
    expect(result).toBeTrue();
  });

  it('should return false when index is not hidden and no filter matches', () => {
    const dataSource = new MatTableDataSource([{ id: 1 }]);
    const result = pipe.transform(0, [], () => false, dataSource);
    expect(result).toBeFalse();
  });

  it('should return false when filter exists but dataSource row is missing', () => {
    const dataSource = new MatTableDataSource([{ id: 1 }]);
    const filterFn = jasmine.createSpy('filterFn').and.returnValue(true);

    const result = pipe.transform(10, [], filterFn, dataSource);

    expect(result).toBeFalse();
    expect(filterFn).not.toHaveBeenCalled();
  });
});
