import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isRowPinned',
  standalone: true,
  pure: true,
})
export class IsRowPinnedPipe implements PipeTransform {
  transform(row: any, pinnedTopRows: any[], pinnedBottomRows: any[]): boolean {
    return pinnedTopRows.includes(row) || pinnedBottomRows.includes(row);
  }
}
