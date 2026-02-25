import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isRowPinnedBottom',
  standalone: true,
  pure: true,
})
export class IsRowPinnedBottomPipe implements PipeTransform {
  transform(row: any, pinnedBottomRows: any[]): boolean {
    return pinnedBottomRows.includes(row);
  }
}
