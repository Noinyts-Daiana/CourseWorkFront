import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class VaccinationsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/vacctinations';

  addVaccines(regData: any) {
    const dataToSend = {
      vaccineName: regData.vaccineName,
      dateAdministered: regData.dateAdministered,
      nextDueDate: regData.nextDueDate,
      animalId: regData.animalId,
    };

    return this.http.post(`${this.apiUrl}`, dataToSend, { withCredentials: true });
  }

  getVaccines(pageNumber: number, pageSize: number, searchTerm: string) {
    return this.http.get(
      `${this.apiUrl}/?pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchTerm}`,
      { withCredentials: true },
    );
  }

  editVaccines(id: number, regData: any) {
    const dataToSend = {
      vaccineName: regData.vaccineName,
      dateAdministered: regData.dateAdministered,
      nextDueDate: regData.nextDueDate,
      animalId: regData.animalId,
    };
    return this.http.put(`${this.apiUrl}/${id}`, dataToSend, { withCredentials: true });
  }

  deleteVaccines(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
