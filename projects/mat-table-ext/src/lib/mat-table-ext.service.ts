import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatTableExtService<T = Record<string, unknown>> {
  public selectedRow = new BehaviorSubject<T | null>(null);
  
  constructor(public http: HttpClient) { }
}
