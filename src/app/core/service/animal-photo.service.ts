// animal-photo.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AnimalPhotoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/animal-photo';

  uploadPhoto(animalId: number, file: File) {
    const formData = new FormData();
    formData.append('AnimalId', animalId.toString());
    formData.append('File', file);
    // Якщо в DTO є поле Description, можна додати і його
    return this.http.post(this.apiUrl, formData);
  }

  getPhotos(animalId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/animal/${animalId}`, { withCredentials: true});
  }

  setMainPhoto(photoId: number, animalId: number) {
    return this.http.patch(`${this.apiUrl}/${photoId}/setmain/animal/${animalId}`, {
      withCredentials: true,
    });
  }

  deletePhoto(photoId: number) {
    return this.http.delete(`${this.apiUrl}/${photoId}`, { withCredentials: true });
  }
}
