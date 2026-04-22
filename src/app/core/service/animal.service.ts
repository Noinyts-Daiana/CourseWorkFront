import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnimalService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/animals'; // Перевір свій порт

  getAnimals(pageNumber: number = 1, pageSize: number = 9, searchTerm: string = '') {
    return this.http.get(
      `${this.apiUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchTerm}`,
    );
  }

  getAnimalById(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  addAnimal(animalData: any) {
    return this.http.post(this.apiUrl, animalData);
  }

  updateAnimal(id: number, animalData: any) {
    return this.http.put(`${this.apiUrl}/${id}`, animalData);
  }

  deleteAnimal(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
