import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class MedicalExamsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/medical-exams';

  addMedicalExams(regData: any) {
    const dataToSend = {
      examDate: regData.examDate,
      temperature: regData.temperature,
      weight: regData.weight,
      notes: regData.notes,
      animalId: regData.animalId,
    };

    return this.http.post(`${this.apiUrl}`, dataToSend, { withCredentials: true });
  }

  getMedicalExams(pageNumber: number, pageSize: number, searchTerm: string) {
    return this.http.get(
      `${this.apiUrl}/?pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchTerm}`,
      { withCredentials: true },
    );
  }

  editMedicalExams(id: number, regData: any) {
    const dataToSend = {
      examDate: regData.examDate,
      temperature: regData.temperature,
      weight: regData.weight,
      notes: regData.notes,
      animalId: regData.animalId,
    };

    return this.http.put(`${this.apiUrl}/${id}`, dataToSend, { withCredentials: true });
  }

  deleteMedicalExams(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
