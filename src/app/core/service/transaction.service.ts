import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/transactions';

  getJournal(
    page: number,
    size: number,
    filters: { searchTerm?: string; fromDate?: string; toDate?: string },
  ): Observable<any> {
    let params = new HttpParams().set('pageNumber', page).set('pageSize', size);

    if (filters.searchTerm) params = params.set('searchTerm', filters.searchTerm);
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);

    return this.http.get<any>(`${this.apiUrl}/journal`, { params });
  }

  getCategories(page: number = 1, size: number = 100): Observable<any> {
    const params = new HttpParams().set('pageNumber', page).set('pageSize', size);

    return this.http.get<any>(`${this.apiUrl}/categories`, { params });
  }

  createTransaction(dto: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, dto, { withCredentials: true });
  }
  updateTransaction(id: number, dto: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, dto);
  }
  deleteTransaction(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
