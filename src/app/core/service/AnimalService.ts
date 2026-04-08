import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class AnimalService {
  private http = inject(HttpClient);
  private apiUrl ='http://localhost:5036/api/animals';

  getAnimals(){
    return this.http.get(this.apiUrl);
  }
}
