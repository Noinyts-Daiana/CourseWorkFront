import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/food-type';

  getItems(page: number, size: number, search: string, isLowStock: boolean | null = null) {
    let params = new HttpParams()
        .set('pageNumber', page.toString())
        .set('pageSize', size.toString());

    if (search) {
      params = params.set('searchTerm', search);
    }

    if (isLowStock !== null) {
      params = params.set('isLowStock', isLowStock.toString());
    }

    return this.http.get<any>(this.apiUrl, { params, withCredentials: true });
  }

  addItem(data: any) {
    return this.http.post(this.apiUrl, data, { withCredentials: true });
  }

  updateItem(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data, { withCredentials: true });
  }

  adjustStock(id: number, amount: number) {
    return this.http.patch(`${this.apiUrl}/${id}/adjust-stock`, { amount: amount}, {withCredentials: true });
  }
  getBrands(searchTerm: string = '', pageNumber: number = 1, pageSize: number = 10) {
    return this.http.get(
      `${this.apiUrl}/brands?searchTerm=${searchTerm}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { withCredentials: true },
    );
  }
}
