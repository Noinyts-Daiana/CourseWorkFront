import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CharacteristicService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/characteristics';
  getAllCharacteristics(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
  getCharacteristic(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  addCharacteristic(characteristic: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, characteristic);
  }

  updateCharacteristic(id: number, characteristic: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, characteristic);
  }

  deleteCharacteristic(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
