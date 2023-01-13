import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, map, Observable, of } from 'rxjs';
import data from '../../assets/data.json';
const companyData = data as any[];
@Injectable({
  providedIn: 'root',
})
export class CustomTableService {
  public selectedRow = new BehaviorSubject<any>(null);
  public selectedRowIndex = new BehaviorSubject<any>(null);
  constructor() {}
  getResults(offset: number, limit: number): Observable<any> {
    return of(companyData.slice(offset, offset + limit)).pipe(
      delay(new Date(Date.now() + 250)),
      map((d) => ({ data: d }))
    );
  }
}
