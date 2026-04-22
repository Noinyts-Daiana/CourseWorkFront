import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';



@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/users';
  private adoptUrl = 'http://localhost:5036/api/AdoptAnimal';

  getProfile() {
    return this.http.get(`${this.apiUrl}/me`, { withCredentials: true });
  }

  updateProfile(regData: any) {
    const dataToSend = {
      fullName: regData.fullName,
      email: regData.email,
    };

    return this.http.put(`${this.apiUrl}/me`, dataToSend, { withCredentials: true });
  }

  changePassword(regData: any) {
    const dataToSend = {
      currentPassword: regData.currentPassword,
      newPassword: regData.newPassword,
      confirmPassword: regData.confirmPassword,
    };

    return this.http.put(`${this.apiUrl}/me/password`, dataToSend, { withCredentials: true });
  }

  editUser(id: number, regData: any) {
    const dataToSend = {
      fullName: regData.fullName,
      email: regData.email,
      roleId: regData.roleId,
    };
    return this.http.put(`${this.apiUrl}/${id}`, dataToSend, { withCredentials: true });
  }

  addUser(regData: any) {
    const dataToSend = {
      fullName: regData.fullName,
      email: regData.email,
      roleId: regData.roleId,
      password: regData.password,
    };

    return this.http.post(`${this.apiUrl}`, dataToSend, { withCredentials: true });
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getUsersByRole(roleId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/role/${roleId}`);
  }

  getUsers(
    page: number,
    size: number,
    searchTerm: string = '',
    roleId: number = 0,
    isActive: boolean | null = null,
  ) {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', size.toString());

    if (searchTerm) params = params.set('searchTerm', searchTerm);
    if (roleId > 0) params = params.set('roleId', roleId.toString());

    // Додаємо статус, якщо він вибраний
    if (isActive !== null) {
      params = params.set('isActive', isActive.toString());
    }

    return this.http.get(`${this.apiUrl}`, { params });
  }

  toggleStatus(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle-status`, {}, { withCredentials: true });
  }

  getUserAnimals(ownerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.adoptUrl}/user/${ownerId}`);
  }

  returnAnimal(animalId: number, ownerId: number): Observable<any> {
    return this.http.post(`${this.adoptUrl}/return`, { animalId, ownerId });
  }
  getAvailableAnimals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adoptUrl}/available`);
  }

  adoptAnimal(animalId: number, ownerId: number): Observable<any> {
    return this.http.post(`${this.adoptUrl}/adopt`, { animalId, ownerId });
  }
}
