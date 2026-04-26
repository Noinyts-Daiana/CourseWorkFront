import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ReportFormat = 'json' | 'csv' | 'xml';
export type ReportType = 'animals' | 'finance' | 'medical' | 'inventory' | 'full';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:5036/api/reports';

  downloadReport(
    type: ReportType,
    format: ReportFormat,
    fromDate?: string,
    toDate?: string,
  ): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);

    return this.http.get(`${this.base}/${type}`, {
      params,
      responseType: 'blob',
      withCredentials: true,
    });
  }

  triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
