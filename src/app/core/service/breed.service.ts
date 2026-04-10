import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BreedService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/breeds';

  getAllBreeds() {
    return this.http.get(this.apiUrl);
  }
}
