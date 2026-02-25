import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isRowPinnedTop',
  standalone: true,
  pure: true,
})
export class IsRowPinnedTopPipe implements PipeTransform {
  transform(row: any, pinnedTopRows: any[]): boolean {
    return pinnedTopRows.includes(row);
  }
}
