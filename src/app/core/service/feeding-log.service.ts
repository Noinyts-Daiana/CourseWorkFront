import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FeedingLogService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/feeding-log';

  getRecentLogs(): Observable<any> {
    return (this.http.get(`${this.apiUrl}/recent`, { withCredentials: true }));
  }

  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, { withCredentials: true });
  }
  feedAnimal(dto: any) {
    return this.http.post(this.apiUrl, dto, { withCredentials: true });
  }

  getAnimalLogs(animalId: number) {
    return this.http.get(`${this.apiUrl}/animal/${animalId}`, { withCredentials: true });
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, { withCredentials: true });
  }
  deleteFeedingLog(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
