# Quick Start - New Features

## 🚀 5-Minute Setup Guide

### 1. DatePicker with Calendar 📅

```typescript
// In your component
columns = [
  { header: 'Birth Date', field: 'birthDate', type: 'datepicker', width: '180px' }
];

// In your data
data = [
  { birthDate: new Date('1990-05-15') }
];
```

---

### 2. Print Table 🖨️

```html
<mat-table-ext
  [printButtonEnable]="true"
  [toolbarTitle]="'My Report'">
</mat-table-ext>
```

Click toolbar → Print button

---

### 3. Export to PDF 📄

```html
<mat-table-ext
  [exportButtonEnable]="true"
  [toolbarTitle]="'Data Export'">
</mat-table-ext>
```

Click toolbar → Export → Export to PDF

---

### 4. Column Grouping 🏗️

```typescript
// Define groups
columnGroups = [
  { name: 'info', label: 'Information', columns: ['name', 'age'] },
  { name: 'contact', label: 'Contact', columns: ['email', 'phone'] }
];

// Assign columns to groups
columns = [
  { header: 'Name', field: 'name', type: 'string', groupName: 'info' },
  { header: 'Age', field: 'age', type: 'number', groupName: 'info' },
  { header: 'Email', field: 'email', type: 'string', groupName: 'contact' },
  { header: 'Phone', field: 'phone', type: 'string', groupName: 'contact' }
];
```

```html
<mat-table-ext [columnGroups]="columnGroups">
</mat-table-ext>
```

---

### 5. Row Freezing ❄️

```typescript
// Freeze first 2 rows
frozenRowIndices = [0, 1];
```

```html
<mat-table-ext
  [frozenRowIndices]="frozenRowIndices"
  [tableHeight]="'500px'">  <!-- Required! -->
</mat-table-ext>
```

---

## 🎯 Complete Working Example

```typescript
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MTExColumn, MTExColumnGroup } from 'mat-table-ext';

@Component({
  selector: 'app-example',
  template: `
    <mat-table-ext
      [dataSource]="dataSource"
      [columns]="columns"
      [columnGroups]="columnGroups"
      [frozenRowIndices]="[0]"
      [printButtonEnable]="true"
      [exportButtonEnable]="true"
      [showToolbar]="true"
      [toolbarTitle]="'Employee List'"
      [tableHeight]="'400px'">
    </mat-table-ext>
  `
})
export class ExampleComponent {
  dataSource = new MatTableDataSource([
    { id: 1, name: 'John', email: 'john@test.com', birthDate: new Date('1990-01-01') },
    { id: 2, name: 'Jane', email: 'jane@test.com', birthDate: new Date('1992-03-15') }
  ]);

  columns: MTExColumn[] = [
    { header: 'ID', field: 'id', type: 'number', width: '80px', groupName: 'basic' },
    { header: 'Name', field: 'name', type: 'string', width: '150px', groupName: 'basic' },
    { header: 'Email', field: 'email', type: 'string', width: '200px', groupName: 'contact' },
    { header: 'Birth Date', field: 'birthDate', type: 'datepicker', width: '180px', groupName: 'personal' }
  ];

  columnGroups: MTExColumnGroup[] = [
    { name: 'basic', label: 'Basic Info', columns: ['id', 'name'] },
    { name: 'contact', label: 'Contact', columns: ['email'] },
    { name: 'personal', label: 'Personal', columns: ['birthDate'] }
  ];
}
```

---

## ✅ Checklist

Before using new features:

- [ ] Dependencies installed? Run: `npm install jspdf jspdf-autotable`
- [ ] MatDatepickerModule imported in your module?
- [ ] Column types set correctly? (`'datepicker'` not `'date'`)
- [ ] tableHeight set for row freezing?
- [ ] Column groups configured with matching names?

---

## 🎨 Example App Demo

Try the example app:

```bash
cd d:\officework\custom-table
npm start
```

Then toggle features:
1. ✅ **Print Button** - Test printing
2. ✅ **Export Button** - Try PDF export
3. ✅ **Column Grouping** - See grouped headers
4. ✅ **Row Freezing** - Scroll to see frozen rows
5. ✅ Edit cells with **datepicker type** - Calendar widget appears

---

## 📚 More Info

See [NEW_FEATURES_GUIDE.md](./NEW_FEATURES_GUIDE.md) for detailed documentation.
