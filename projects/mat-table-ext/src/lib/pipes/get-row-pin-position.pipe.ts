import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getRowPinPosition',
  standalone: true,
  pure: true,
})
export class GetRowPinPositionPipe implements PipeTransform {
  transform(
    row: any,
    pinnedTopRows: any[],
    pinnedBottomRows: any[]
  ): 'top' | 'bottom' | null {
    if (pinnedTopRows.includes(row)) return 'top';
    if (pinnedBottomRows.includes(row)) return 'bottom';
    return null;
  }
}
