import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SpeciesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/species';

  getAllSpecies() {
    return this.http.get(this.apiUrl);
  }
}
