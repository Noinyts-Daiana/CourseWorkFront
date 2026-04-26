import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class FoodTypeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/food-type';

  getFoodTypes(page: number = 1, size: number = 10, search: string = '') {
    let params = new HttpParams().set('pageNumber', page).set('pageSize', size);
    if (search) params = params.set('searchTerm', search);
    return this.http.get(this.apiUrl, { params, withCredentials: true});
  }

  // Додаємо слеш перед ID!
  deleteFood(foodId: number) {
    return this.http.delete(`${this.apiUrl}/${foodId}`, { withCredentials: true });
  }

  addFood(data: any) {
    return this.http.post(this.apiUrl, data, { withCredentials: true });
  }

  updateFood(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data, { withCredentials: true });
  }
}
