import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatTableExtService {
  public selectedRow = new BehaviorSubject<any>(null);
  public selectedRowIndex = new BehaviorSubject<any>(null);
  constructor(public http: HttpClient) { }
}
