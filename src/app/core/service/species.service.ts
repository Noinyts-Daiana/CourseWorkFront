import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpeciesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/species';

  getSpeciesPaged(page: number, size: number, search?: string): Observable<any> {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', size.toString());

    if (search) params = params.set('searchTerm', search);

    return this.http.get<any>(`${this.apiUrl}/paged`, { params,withCredentials: true});
  }

  getAllSpecies(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { withCredentials: true});
  }
  addSpecie(specieData: { name: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, specieData, { withCredentials: true });
  }
}
