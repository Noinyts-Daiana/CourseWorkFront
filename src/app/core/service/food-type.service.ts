import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class FoodTypeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/food-type';

  getFoodTypes(pageNumber: number = 1, pageSize: number = 10, searchTerm: string = '') {
    let params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get(this.apiUrl, { params });
  }
}
