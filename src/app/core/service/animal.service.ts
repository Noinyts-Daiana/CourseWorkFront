import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnimalService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/animals'; // Перевір свій порт

  getAnimals(
    pageNumber: number = 1,
    pageSize: number = 8,
    searchTerm: string = '',
    charIds: number[] = [],
    speciesId: number | null = null,
    breedId: number | null = null,
    sex: number | null = null,
    isAdopted: boolean | null = null,
  ) {
    let params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    if (charIds && charIds.length > 0) {
      charIds.forEach((id) => {
        params = params.append('charIds', id.toString());
      });
    }

    if (speciesId !== null) params = params.set('speciesId', speciesId.toString());
    if (breedId !== null) params = params.set('breedId', breedId.toString());
    if (sex !== null) params = params.set('sex', sex.toString());
    if (isAdopted !== null) params = params.set('isAdopted', isAdopted);

    return this.http.get(`${this.apiUrl}`, { params, withCredentials: true });
  }

  getAnimalById(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  addAnimal(animalData: any) {
    return this.http.post(this.apiUrl, animalData, { withCredentials: true });
  }

  updateAnimal(id: number, animalData: any) {
    return this.http.put(`${this.apiUrl}/${id}`, animalData, { withCredentials: true });
  }

  deleteAnimal(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
  getAvailableAnimals() {
    return this.http.get(this.apiUrl, { withCredentials: true });
  }

  getPublicAnimals(pageNumber: number = 1, pageSize: number = 8) {
    const params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);
    return this.http.get(`${this.apiUrl}/public`, { params });
  }
}
