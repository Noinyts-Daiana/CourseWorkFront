import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SystemAlertDto {
  id: number;
  type: string;
  message: string;
  isDone: boolean;
}

export interface AlertsPage {
  items: SystemAlertDto[];
  total: number;
  pageNumber: number;
  pageSize: number;
}

export interface CreateAlertDto {
  type: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class SystemAlertService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:5036/api/alerts';

  getAll(isDone = false, pageNumber = 1, pageSize = 20): Observable<AlertsPage> {
    const params = new HttpParams()
      .set('isDone', String(isDone))
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));

    return this.http.get<AlertsPage>(this.base, { params, withCredentials: true });
  }

  create(dto: CreateAlertDto): Observable<SystemAlertDto> {
    return this.http.post<SystemAlertDto>(this.base, dto, { withCredentials: true });
  }

  markDone(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/done`, {}, { withCredentials: true });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`, { withCredentials: true });
  }
}
