import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isRowPinnedTop',
  standalone: true,
  pure: true,
})
export class IsRowPinnedTopPipe implements PipeTransform {
  transform(row: unknown, pinnedTopRows: readonly unknown[]): boolean {
    return pinnedTopRows.includes(row);
  }
}
