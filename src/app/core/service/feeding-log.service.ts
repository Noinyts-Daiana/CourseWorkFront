import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FeedingLogService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/feeding-log';

  getRecentLogs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/recent`);
  }

  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
