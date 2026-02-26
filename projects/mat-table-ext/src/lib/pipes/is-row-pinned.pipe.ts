import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isRowPinned',
  standalone: true,
  pure: true,
})
export class IsRowPinnedPipe implements PipeTransform {
  transform(
    row: unknown,
    pinnedTopRows: readonly unknown[],
    pinnedBottomRows: readonly unknown[],
  ): boolean {
    return pinnedTopRows.includes(row) || pinnedBottomRows.includes(row);
  }
}
