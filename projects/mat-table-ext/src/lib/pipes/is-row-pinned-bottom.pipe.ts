import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isRowPinnedBottom',
  standalone: true,
  pure: true,
})
export class IsRowPinnedBottomPipe implements PipeTransform {
  transform(row: unknown, pinnedBottomRows: readonly unknown[]): boolean {
    return pinnedBottomRows.includes(row);
  }
}
