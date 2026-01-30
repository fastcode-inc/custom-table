# Row-Level Pinning Guide

## Overview
Row pinning now supports **individual row-level positioning**, allowing you to pin rows at both **top** and **bottom** simultaneously in the same table.

## Key Features

### 1. Row-Level Pinning Positions
- Pin individual rows to either **top** or **bottom**
- Mix top and bottom pinned rows in the same table
- Backward compatible with simple number arrays

### 2. Height Preservation
- Pinned rows maintain their original height
- No unexpected height increases when pinning
- Smooth visual transitions

### 3. PDF Export Styling
- Header and group header styles applied when **no custom template** is present
- Custom templates preserve their own styling in PDF exports
- Consistent blue header theme for standard exports

## Usage

### Basic Setup with Mixed Pinning

```typescript
import { RowPinning } from 'mat-table-ext';

// Define rows with mixed top/bottom pinning
public frozenRowIndices: (number | RowPinning)[] = [
  { index: 0, position: 'top' },    // Pin first row at top
  { index: 1, position: 'top' },    // Pin second row at top
  { index: 8, position: 'bottom' }, // Pin row 8 at bottom
  { index: 9, position: 'bottom' }  // Pin row 9 at bottom
];
```

### Backward Compatibility

```typescript
// Still works! Numbers default to 'top' position
public frozenRowIndices: number[] = [0, 1, 2];
```

### Template Binding

```html
<mat-table-ext
  [frozenRowIndices]="enableRowFreezing ? frozenRowIndices : []"
  [enableRowFreezing]="true"
  ...>
</mat-table-ext>
```

### Programmatic Toggling

```typescript
// Toggle a row with specific position
toggleRowFreeze(index: number, position: 'top' | 'bottom' = 'top'): void {
  // Automatically handled by component
}
```

## RowPinning Interface

```typescript
export interface RowPinning {
  index: number;           // Row index to pin
  position: 'top' | 'bottom';  // Where to pin the row
}
```

## Visual Styling

### Top Pinned Rows
- Sticky positioning from top
- Bottom shadow and gradient indicator
- Stacks below sticky header (if enabled)

### Bottom Pinned Rows
- Sticky positioning from bottom  
- Top shadow and gradient indicator
- Stacks above sticky footer (if enabled)

### Height Calculation
- Dynamic height calculation based on actual DOM elements
- Accounts for sticky headers and footers
- Prevents overlap between pinned rows

## PDF Export Behavior

### With Custom Header Template
```typescript
[headerTemplateRef]="myCustomTemplate"
```
- PDF exports **preserve** your custom template styling
- No automatic blue header colors applied

### Without Custom Header Template
```typescript
[headerTemplateRef]="null"  // or undefined
```
- PDF applies professional blue header styling
- Group headers get lighter blue background
- Consistent Material Design theme

## Migration from Global Position

### Before (deprecated)
```typescript
[rowPinningPosition]="'top'"  // Global setting
[frozenRowIndices]="[0, 1]"
```

### After (row-level)
```typescript
[frozenRowIndices]="[
  { index: 0, position: 'top' },
  { index: 1, position: 'bottom' }
]"
```

## Example: Complete Implementation

```typescript
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { RowPinning } from 'mat-table-ext';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html'
})
export class DataTableComponent {
  dataSource = new MatTableDataSource(DATA);
  
  // Mix of top and bottom pinned rows
  frozenRowIndices: (number | RowPinning)[] = [
    { index: 0, position: 'top' },     // Header row at top
    { index: 1, position: 'top' },     // Summary row at top
    { index: 98, position: 'bottom' }, // Totals at bottom
    { index: 99, position: 'bottom' }  // Footer at bottom
  ];
  
  enableRowFreezing = true;
}
```

```html
<mat-table-ext
  [dataSource]="dataSource"
  [frozenRowIndices]="frozenRowIndices"
  [enableRowFreezing]="enableRowFreezing"
  [stickyHeader]="true"
  [stickyFooter]="true">
</mat-table-ext>
```

## Best Practices

1. **Performance**: Limit number of pinned rows for optimal performance
2. **UX**: Use top pinning for headers/summaries, bottom for totals/footers
3. **Testing**: Test with various table heights and scroll scenarios
4. **Styling**: Ensure custom themes work with pinned row gradients

## Notes

- Pinned rows maintain z-index of 10 for proper layering
- Background color automatically matches Material theme
- Gradient indicators use primary theme color
- Height calculations update on window resize (if implemented)
