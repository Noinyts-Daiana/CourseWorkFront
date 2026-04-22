import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BreedService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/breeds';

  getAllBreeds() {
    return this.http.get(this.apiUrl);
  }
  getUniqueBreeds(searchTerm: string = '', pageNumber: number = 1, pageSize: number = 10) {
    return this.http.get(
      `${this.apiUrl}/unique-names?searchTerm=${searchTerm}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
  }
  getBreedsBySpecies(speciesId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/by-species/${speciesId}`);
  }
}
