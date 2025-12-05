# Mat-Table-Ext - New Features Guide

## 🎉 Recently Implemented Features

This guide covers all the newly implemented features in the mat-table-ext component.

---

## 1. 📅 Date Picker with Calendar

**Description:** Enhanced date input with Material Design calendar picker widget.

### Usage

```typescript
columns: MTExColumn[] = [
  {
    header: 'Birth Date',
    field: 'birthDate',
    type: 'datepicker',  // New type!
    width: '180px'
  }
];
```

### Features
- ✅ Calendar widget for date selection
- ✅ Works in inline editing, cell editing, and popup editing modes
- ✅ Uses MatDatepicker module for consistent Material Design UI
- ✅ Supports Date objects natively

### Column Types
- `'date'` - HTML5 date input (existing)
- `'datepicker'` - **NEW** Material calendar picker

---

## 2. 🖨️ Print Table

**Description:** Print table with clean formatting, excluding action columns.

### Usage

```html
<mat-table-ext
  [printButtonEnable]="true"
  [toolbarTitle]="'Sales Report'"
  ...>
</mat-table-ext>
```

### Features
- ✅ Automatic removal of action columns (edit, delete, select)
- ✅ Clean print styling with borders and alternating row colors
- ✅ Page break management for large tables
- ✅ Opens in new window for print preview

### How it Works
1. Click the print button in toolbar
2. Opens print preview in new window
3. Table is automatically formatted
4. Use browser's print dialog to print or save as PDF

---

## 3. 📄 Export to PDF

**Description:** Export table data to professionally formatted PDF files.

### Usage

```html
<mat-table-ext
  [exportButtonEnable]="true"
  [toolbarTitle]="'Employee Data'"
  ...>
</mat-table-ext>
```

### Features
- ✅ Professional grid layout with alternating row colors
- ✅ Includes table title in PDF
- ✅ Auto-formats different data types (dates, booleans, numbers)
- ✅ Only exports visible columns
- ✅ Uses jsPDF with autoTable plugin

### Export Options
From the Export menu, you can now choose:
- Export to Excel (.xlsx)
- Export to CSV (.csv)
- **Export to PDF (.pdf)** ← NEW!

### Dependencies
```json
{
  "jspdf": "^2.x.x",
  "jspdf-autotable": "^3.x.x"
}
```

---

## 4. 🏗️ Column Grouping

**Description:** Group related columns under parent headers for better organization.

### Usage

```typescript
// Define column groups
columnGroups: MTExColumnGroup[] = [
  {
    name: 'personal',
    label: 'Personal Information',
    columns: ['name', 'age', 'gender'],
    colspan: 3
  },
  {
    name: 'contact',
    label: 'Contact Details',
    columns: ['email', 'phone', 'address'],
    colspan: 3
  }
];

// Mark columns as part of groups
columns: MTExColumn[] = [
  { header: 'Name', field: 'name', type: 'string', groupName: 'personal' },
  { header: 'Age', field: 'age', type: 'number', groupName: 'personal' },
  { header: 'Gender', field: 'gender', type: 'selection', groupName: 'personal' },
  { header: 'Email', field: 'email', type: 'string', groupName: 'contact' },
  { header: 'Phone', field: 'phone', type: 'string', groupName: 'contact' },
  { header: 'Address', field: 'address', type: 'string', groupName: 'contact' }
];
```

```html
<mat-table-ext
  [columns]="columns"
  [columnGroups]="columnGroups"
  ...>
</mat-table-ext>
```

### Features
- ✅ Multi-level header rows
- ✅ Custom group labels
- ✅ Automatic colspan calculation
- ✅ Beautiful styling with blue header background
- ✅ Works with sticky headers

### Interface

```typescript
export interface MTExColumnGroup {
  name: string;           // Unique identifier
  label: string;          // Display name
  columns: string[];      // Array of column field names
  colspan?: number;       // Optional colspan (auto-calculated if omitted)
}
```

---

## 5. ❄️ Row Freezing

**Description:** Keep specific rows visible while scrolling through table data.

### Usage

```typescript
// Freeze first 2 rows
frozenRowIndices: number[] = [0, 1];
```

```html
<mat-table-ext
  [frozenRowIndices]="frozenRowIndices"
  [tableHeight]="'500px'"  <!-- Required for scrolling -->
  ...>
</mat-table-ext>
```

### Features
- ✅ Sticky positioning for frozen rows
- ✅ Visual indicators (shadow and underline)
- ✅ Supports multiple frozen rows
- ✅ Proper z-index management
- ✅ Works with pagination and filtering

### Important Notes
- Requires `tableHeight` to be set for scrolling to work
- Row indices are 0-based
- Works best with small number of frozen rows (2-5)
- Frozen rows stay at top while content scrolls

### Visual Indicators
- Box shadow below frozen rows
- Blue gradient underline
- White background to stand out

---

## 🧹 Code Improvements

### Removed Unused Code
- ❌ `columnFilterBySelection` (unused variable)
- ❌ `cellTemplate` (unused property)
- ❌ `forceTableRerender` (commented code)
- ❌ `selectedRowIndex` (unused BehaviorSubject)
- ❌ Unused variable in `addIconsToRegistry()`

### Type Safety Improvements
```typescript
// Before
rowDataTemp: any = {};
tableData: any = [];
filterValues: any = {};
cellEditing: any = {};

// After
rowDataTemp: Record<string, MTExRow> = {};
tableData: MTExRow[] = [];
filterValues: Record<string, string | number | boolean> = {};
cellEditing: Record<string, boolean> = {};
```

---

## 📊 Complete Example

```typescript
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MTExColumn, MTExColumnGroup } from 'mat-table-ext';

@Component({
  selector: 'app-data-table',
  template: `
    <mat-table-ext
      [dataSource]="dataSource"
      [columns]="columns"
      [columnGroups]="columnGroups"
      [frozenRowIndices]="[0, 1]"
      [printButtonEnable]="true"
      [exportButtonEnable]="true"
      [showToolbar]="true"
      [toolbarTitle]="'Employee Database'"
      [tableHeight]="'600px'"
      [stickyHeader]="true"
      [sorting]="true"
      [columnFilter]="true"
      [columnPinnable]="true">
    </mat-table-ext>
  `
})
export class DataTableComponent {
  dataSource = new MatTableDataSource([
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      birthDate: new Date('1990-05-15'),
      email: 'john@example.com',
      phone: '555-0100',
      department: 'Engineering',
      salary: 85000,
      active: true
    },
    // ... more data
  ]);

  columns: MTExColumn[] = [
    { header: 'ID', field: 'id', type: 'number', width: '80px', groupName: 'basic' },
    { header: 'First Name', field: 'firstName', type: 'string', width: '150px', groupName: 'basic' },
    { header: 'Last Name', field: 'lastName', type: 'string', width: '150px', groupName: 'basic' },
    { header: 'Birth Date', field: 'birthDate', type: 'datepicker', width: '180px', groupName: 'personal' },
    { header: 'Email', field: 'email', type: 'string', width: '200px', groupName: 'contact' },
    { header: 'Phone', field: 'phone', type: 'string', width: '150px', groupName: 'contact' },
    { header: 'Department', field: 'department', type: 'string', width: '150px', groupName: 'work' },
    { header: 'Salary', field: 'salary', type: 'number', width: '120px', groupName: 'work' },
    { header: 'Active', field: 'active', type: 'boolean', width: '100px', groupName: 'work' }
  ];

  columnGroups: MTExColumnGroup[] = [
    { name: 'basic', label: 'Basic Info', columns: ['id', 'firstName', 'lastName'] },
    { name: 'personal', label: 'Personal Details', columns: ['birthDate'] },
    { name: 'contact', label: 'Contact Information', columns: ['email', 'phone'] },
    { name: 'work', label: 'Employment Details', columns: ['department', 'salary', 'active'] }
  ];
}
```

---

## 🎨 Styling

### Column Group Headers
```scss
.group-header-cell {
  text-align: center;
  font-weight: bold;
  background-color: #e3f2fd;
  color: #1565c0;
  border-bottom: 2px solid #1976d2;
}
```

### Frozen Rows
```scss
.frozen-row {
  position: sticky;
  z-index: 10;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

---

## 🔧 Migration Guide

### From Old Date Input to Datepicker

**Before:**
```typescript
{ header: 'Date', field: 'date', type: 'date', width: '150px' }
```

**After:**
```typescript
{ header: 'Date', field: 'date', type: 'datepicker', width: '180px' }
```

### Adding Print Functionality

**Before:**
```html
<mat-table-ext [showToolbar]="true">
```

**After:**
```html
<mat-table-ext 
  [showToolbar]="true"
  [printButtonEnable]="true">
```

---

## 📦 What's Already Available

The mat-table-ext component already includes:

- ✅ Checkbox cell templates
- ✅ Dropdown/Selection cell templates
- ✅ Textbox cell templates
- ✅ Date input (HTML5)
- ✅ Hide/Unhide rows functionality
- ✅ Row selection (single/multi)
- ✅ Inline, cell, and popup editing
- ✅ Column pinning (left/right)
- ✅ Column resizing
- ✅ Column visibility toggle
- ✅ Drag & drop columns
- ✅ Sorting & Filtering
- ✅ Pagination
- ✅ Row expansion
- ✅ Export to Excel/CSV

---

## 🚀 Performance Tips

1. **Column Grouping:** Keep groups simple with 2-4 groups max for best readability
2. **Row Freezing:** Freeze only essential rows (1-3) to maintain performance
3. **PDF Export:** For large tables (1000+ rows), consider pagination or filtering before export
4. **Print:** Large tables will automatically page break - test print preview first

---

## 🐛 Troubleshooting

### Datepicker Not Showing
- Ensure `MatDatepickerModule` and `MatNativeDateModule` are imported
- Check that column type is set to `'datepicker'` not `'date'`

### PDF Export Not Working
- Verify jspdf packages are installed: `npm install jspdf jspdf-autotable`
- Check browser console for errors

### Column Groups Not Appearing
- Ensure `columnGroups` array is not empty
- Verify column `groupName` matches group `name`
- Check that columns referenced in `columns` array exist

### Frozen Rows Not Sticky
- Set `tableHeight` property (required for scroll)
- Verify `frozenRowIndices` contains valid row indices
- Check that table has enough rows to scroll

---

## 📝 API Reference

### New Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `printButtonEnable` | boolean | false | Show print button in toolbar |
| `columnGroups` | MTExColumnGroup[] | [] | Column grouping configuration |
| `frozenRowIndices` | number[] | [] | Array of row indices to freeze |

### New Column Type

| Type | Description | Example |
|------|-------------|---------|
| `'datepicker'` | Material calendar picker | `{ type: 'datepicker' }` |

### New Interfaces

```typescript
interface MTExColumnGroup {
  name: string;
  label: string;
  columns: string[];
  colspan?: number;
}
```

---

## 📞 Support

For issues or questions:
1. Check the examples in `mat-table-ext-example` project
2. Review this guide
3. Check component documentation
4. Create an issue on GitHub

---

**Version:** 2.0.0  
**Last Updated:** December 4, 2025
