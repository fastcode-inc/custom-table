import { Pipe, PipeTransform } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Pipe({
  name: 'isRowHidden',
  standalone: true,
  pure: true,
})
export class IsRowHiddenPipe implements PipeTransform {
  transform(
    index: number,
    hiddenRowIndices: number[],
    rowHidingFilterFn?: ((row: any, index: number) => boolean) | null,
    dataSource?: MatTableDataSource<any> | null
  ): boolean {
    if (hiddenRowIndices.includes(index)) {
      return true;
    }
    if (rowHidingFilterFn && dataSource?.data?.[index]) {
      return rowHidingFilterFn(dataSource.data[index], index);
    }
    return false;
  }
}
