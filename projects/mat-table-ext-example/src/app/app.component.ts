import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CustomTableService } from './service/custom-table.service';
import { MTExColumn, MTExColumnGroup } from '../../../mat-table-ext/src/lib/models/tableExtModels';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableExtModule } from '../../../mat-table-ext/src/lib/mat-table-ext.module';
import { TitleCasePipe } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
export var EXAMPLE_DATA: any[] = [
  {
    position: 1,
    name: 'Boron',
    weight: 10.811,
    symbol: 'B',
    gender: 'male',
    mobile: '13198765432',
    tele: '567891234',
    city: 'Berlin',
    address: 'Bernauer Str.111,13355',
    date: '1423456765768',
    birthDate: new Date('1990-05-15').getDate(),
    website: 'www.matero.com',
    company: 'matero',
    email: 'Boron@gmail.com',
    status: false,
    cost: 4,
 },
  {
    position: 2,
    name: 'Helium',
    weight: 8.0026,
    symbol: 'He',
    gender: 'female',
    mobile: '13034676675',
    tele: '80675432',
    city: 'Shanghai',
    address: '88 Songshan Road',
    date: '1423456765768',
    birthDate: new Date('1985-08-22').getDate(),
    website: 'www.matero.com',
    company: 'matero',
    email: 'Helium@gmail.com',
    status: true,
    cost: 5,
 },
  {
    position: 3,
    name: 'Nitrogen',
    weight: 14.0067,
    symbol: 'N',
    gender: 'male',
    mobile: '15811112222',
    tele: '345678912',
    city: 'Sydney',
    address: 'Circular Quay, Sydney NSW 2000',
    date: '1423456765768',
    birthDate: new Date('1992-12-10').getDate(),
    website: 'www.matero.com',
    company: 'matero',
    email: 'Nitrogen@gmail.com',
    status: true,
    cost: 2,

  },
  {
    position: 4,
    name: 'Oxygen',
    weight: 15.9994,
    symbol: 'O',
    gender: 'female',
    mobile: '18899887766',
    tele: '123456789',
    city: 'London',
    address: 'Baker Street 221B',
    date: '1423456765768',
    birthDate: new Date('1988-03-25').getDate(),
    website: 'www.example.com',
    company: 'example',
    email: 'Oxygen@gmail.com',
    status: false,
    cost: 3,

  },
  {
    position: 4,
    name: 'Oxygen',
    weight: 15.9994,
    symbol: 'O',
    gender: 'female',
    mobile: '18899887766',
    tele: '123456789',
    city: 'London',
    address: 'Baker Street 221B',
    date: '1423456765768',
    birthDate: new Date('1988-03-25').getDate(),
    website: 'www.example.com',
    company: 'example',
    email: 'Oxygen@gmail.com',
    status: false,
    cost: 3,

  },
  {
    position: 4,
    name: 'Oxygen',
    weight: 15.9994,
    symbol: 'O',
    gender: 'female',
    mobile: '18899887766',
    tele: '123456789',
    city: 'London',
    address: 'Baker Street 221B',
    date: '1423456765768',
    birthDate: new Date('1988-03-25').getDate(),
    website: 'www.example.com',
    company: 'example',
    email: 'Oxygen@gmail.com',
    status: false,
    cost: 3,

  },
  {
    position: 4,
    name: 'Oxygen',
    weight: 15.9994,
    symbol: 'O',
    gender: 'female',
    mobile: '18899887766',
    tele: '123456789',
    city: 'London',
    address: 'Baker Street 221B',
    date: '1423456765768',
    birthDate: new Date('1988-03-25').getDate(),
    website: 'www.example.com',
    company: 'example',
    email: 'Oxygen@gmail.com',
    status: false,
    cost: 3,

  },
  {
    position: 4,
    name: 'Oxygen',
    weight: 15.9994,
    symbol: 'O',
    gender: 'female',
    mobile: '18899887766',
    tele: '123456789',
    city: 'London',
    address: 'Baker Street 221B',
    date: '1423456765768',
    birthDate: new Date('1988-03-25').getDate(),
    website: 'www.example.com',
    company: 'example',
    email: 'Oxygen@gmail.com',
    status: false,
    cost: 3,

  },
];
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTableExtModule,
    TitleCasePipe,
    MatDatepickerModule
  ]
})
export class AppComponent implements OnInit {
  title = 'mat-table-ext-example';
  isLoading: boolean = false;
  public dataSource: any = new MatTableDataSource(EXAMPLE_DATA);
  stickyColumn: any = false;
  columnResizable: any = false;
  stickyFooter: any = false;
  stickyHeader: any = false;
  inlineRowEditing: any = false;
  popupRowEditing: any = false;
  inCellEditing: any = false;
  cellPopupEditing: any = false;
  deleteRow: any = false;
  stripedRows: any = false;
  rowSelection: any = true;
  multiRowSelection: any = false;
  simpleFilter: any = false;
  selectionFilter: any = false;
  toolbarToggle: any = true;
  toolbarHeight: string = '';
  showFirstLastButtons: any = false;
  columnPinnable: any = true;
  columnHidable: any = false;
  exportButtonEnable: any = true;
  printButtonEnable: any = false;
  enableColumnGrouping: any = false;
  enableRowHiding: any = false;
  enableRowPinning: any = false;
  pdfOrientation: 'portrait' | 'landscape' = 'landscape';
  @ViewChild('cellTemplate1') cellTemplate1!: TemplateRef<any>;
  @ViewChild('cellTemplate2') cellTemplate2!: TemplateRef<any>;
  @ViewChild('headerTemplate2') headerTemplate2!: TemplateRef<any>;

  
  public columns: MTExColumn[] = []
  
  // Column grouping configuration
  public columnGroups: MTExColumnGroup[] = [
    {
      name: 'basic',
      label: 'Basic Information',
      columns: ['position', 'name', 'symbol'],
      colspan: 3
    },
    {
      name: 'measurements',
      label: 'Measurements',
      columns: ['weight', 'cost'],
      colspan: 2
    },
    {
      name: 'personal',
      label: 'Personal Details',
      columns: ['gender', 'birthDate', 'status'],
      colspan: 3
    },
    {
      name: 'contact',
      label: 'Contact Information',
      columns: ['email', 'mobile', 'city'],
      colspan: 3
    }
  ];
  
  // Hidden rows - hide last 2 rows (indices 2 and 3)
  public hiddenRowIndices: number[] = [2, 3];
  
  // Row hiding filter function - hide rows where weight > 15
  public rowHidingFilterFn = (row: any, index: number) => {
    return this.useHidingFilter && row.weight && row.weight > 15;
  };
  
  public useHidingFilter: boolean = false;
  
  // Row pinning filter function - pin first row at top, last row at bottom
  public rowPinningFn = (row: any, index: number): 'top' | 'bottom' | null => {
    if (!this.enableRowPinning) return null;
    if (index === 0) return 'top';
    if (index === this.dataSource.data.length - 1) return 'bottom';
    return null;
  };
  
  //   { header: 'Position', field: 'position', width: '200px',type:'string', headerTemplate:this.headerTemplate2 },
  //   { header: 'Name', field: 'name', width: '200px', pinned: 'left', type: 'string' },
  //   { header: 'Weight', field: 'weight', width: '200px', pinned: 'left', type: 'string' },
  //   { header: 'Symbol', field: 'symbol', width: '200px', type: 'string' },
  //   { header: 'Gender', field: 'gender', width: '200px', type: 'selection',options:['male','female'] }
  // ];
  multiSelectRow: any = true;
  topSearchFilter: any = false;
  tableHeight: string = '400px';
  tableWidth: string = '';
  tableClassName: string = '';
  isExpandEnable: any = false;
  dragEnable: any = false;
  sorting: any = false;
  infiniteScroll: any = false;
  scrollbarH: any = false;
  paginationEnable: any = true;
  headerTemplateRefCtrl: any = false;
  cellTemplateRefCtrl: any = false;
  toolbarTemplateRefCtrl: any = false;
  popupTemplateRefCtrl: any = false;
  inlineTemplateRefCtrl: any = false;
  cellEditingTemplateRefCtrl: any = false;
  cellPopupTemplateRefCtrl: any = false;
  constructor(public service: CustomTableService) {
    // this.loadPage(10);
  }
  ngOnInit(): void {
    this.columns = [
      { header: 'Position', field: 'position', width: '100px', type: 'number', groupName: 'basic' },
      { header: 'Name', field: 'name', width: '150px', type: 'string', groupName: 'basic' },
      { header: 'Symbol', field: 'symbol', width: '100px', type: 'string', groupName: 'basic' },
      { header: 'Weight', field: 'weight', width: '120px', type: 'number', groupName: 'measurements' },
      { header: 'Cost', field: 'cost', width: '100px', type: 'number', groupName: 'measurements' },
      { header: 'Gender', field: 'gender', width: '120px', type: 'selection', options: ['male', 'female'], groupName: 'personal' },
      { header: 'Birth Date', field: 'birthDate', width: '180px', type: 'date', groupName: 'personal' },
      { header: 'Status', field: 'status', width: '100px', type: 'boolean', groupName: 'personal' },
      { header: 'Description', field: 'description', width: '250px', type: 'textarea', groupName: 'personal' },
      { header: 'Email', field: 'email', width: '200px', type: 'string', groupName: 'contact' },
      { header: 'Mobile', field: 'mobile', width: '150px', type: 'string', groupName: 'contact' },
      { header: 'City', field: 'city', width: '150px', type: 'string', groupName: 'contact' },
    ];
  }
  
  showhidecolumn(op: string) {
    switch (op) {
      case 'inlineRowEditing': {
        this.inlineRowEditing = !this.inlineRowEditing;
        break;
      }
      case 'popupRowEditing': {
        this.popupRowEditing = !this.popupRowEditing;
        break;
      }
      case 'enableDelete': {
        this.deleteRow = !this.deleteRow;
        break;
      }
      case 'select': {
        this.multiRowSelection = !this.multiRowSelection;
        break;
      }
    }
  }

  showData(event: any, property: string) {
    if (property == 'Delete change')
    {
     EXAMPLE_DATA.splice(event.fromIndex, 1);
    this.dataSource = new MatTableDataSource(EXAMPLE_DATA);

    }
    console.log(property, event);
  }

  onScroll(event: any) {
    let pageLimit: number = 10;
    let scrollHeight = event.target.scrollHeight;
    let scrollTop = event.target.scrollTop;
    let clientHeight = event.target.clientHeight;
    let scrollPosition = scrollHeight - (scrollTop + clientHeight);
    console.log('scrollPosition', scrollPosition);
    if (scrollPosition <= 5 && this.infiniteScroll) {
      this.loadPage(pageLimit);
    }
  }

  loadPage(limit: number) {
    this.isLoading = true;
    let offset = this.dataSource ? this.dataSource.data.length : 0;
    this.service.getResults(offset, limit).subscribe((results: any) => {
      if (this.dataSource) {
        const rows = [...this.dataSource.data, ...results.data];
        this.dataSource = new MatTableDataSource(rows);
      } else {
        const rows = [...results.data];
        this.dataSource = new MatTableDataSource(rows);
      }
      this.isLoading = false;
    });
  }

  onSelectionChange(event: any) {
    console.log('Selection Change: ', event);
  }
}
