import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/food-type';

  getItems(pageNumber: number = 1, pageSize: number = 9, searchTerm: string = '') {
    return this.http.get(
      `${this.apiUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchTerm}`,
    );
  }

  addItem(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  updateItem(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  adjustStock(id: number, amount: number) {
    return this.http.patch(`${this.apiUrl}/${id}/adjust-stock`, { amount: amount });
  }
  getBrands(searchTerm: string = '', pageNumber: number = 1, pageSize: number = 10) {
    return this.http.get(
      `${this.apiUrl}/brands?searchTerm=${searchTerm}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
  }
}
