import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AdoptAnimalService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/adopt-animal';

  adoptAnimal(dto: any) {
    return this.http.post(`${this.apiUrl}/adopt`, dto, { withCredentials: true });
  }

  selfAdopt(dto: { animalId: number }) {
    return this.http.post(`${this.apiUrl}/request`, dto, { withCredentials: true });
  }

  returnAnimal(dto: any) {
    return this.http.post(`${this.apiUrl}/return`, dto, { withCredentials: true });
  }
}
