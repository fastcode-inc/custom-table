import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CustomTableService } from './service/custom-table.service';
import { MTExColumn } from '../../../mat-table-ext/src/lib/models/tableExtModels';
export const EXAMPLE_DATA: any[] = [
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
    website: 'www.matero.com',
    company: 'matero',
    email: 'Nitrogen@gmail.com',
    status: true,
    cost: 2,
  },
];
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
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
  deleteRow: any = false;
  stripedRows: any = false;
  rowSelection: any = false;
  multiRowSelection: any = false;
  simpleFilter: any = true;
  selectionFilter: any = false;
  toolbarToggle: any = true;
  toolbarHeight: string = '';
  showFirstLastButtons: any = false;
  columnPinnable: any = false;
  columnHidable: any = false;
  exportButtonEnable: any = true;
  @ViewChild('cellTemplate1') cellTemplate1!: TemplateRef<any>;
  @ViewChild('cellTemplate2') cellTemplate2!: TemplateRef<any>;

  public columns: MTExColumn[] = [
    { header: 'Position', field: 'position', width: '200px',type:'string' },
    { header: 'Name', field: 'name', width: '200px', pinned: 'left', type: 'string' },
    { header: 'Weight', field: 'weight', width: '200px', pinned: 'left', type: 'string' },
    { header: 'Symbol', field: 'symbol', width: '200px', type: 'string' },
    { header: 'Gender', field: 'gender', width: '200px', type: 'selection',options:['male','female'] }
  ];
  multiSelectRow: any = true;
  topSearchFilter: any = false;
  tableHeight: string = '';
  tableWidth: string = '';
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
  constructor(public service: CustomTableService) {
    // this.loadPage(10);
  }

  ngOnInit(): void {}

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
