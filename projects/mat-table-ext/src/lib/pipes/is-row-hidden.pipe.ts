import { Pipe, PipeTransform } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Pipe({
  name: 'isRowHidden',
  standalone: true,
  pure: true,
})
export class IsRowHiddenPipe implements PipeTransform {
  transform<T>(
    index: number,
    hiddenRowIndices: readonly number[],
    rowHidingFilterFn?: ((row: T, index: number) => boolean) | null,
    dataSource?: MatTableDataSource<T> | null
  ): boolean {
    if (hiddenRowIndices.includes(index)) {
      return true;
    }
    if (rowHidingFilterFn && dataSource?.data?.[index] !== undefined) {
      return rowHidingFilterFn(dataSource.data[index], index);
    }
    return false;
  }
}
