import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/users';
  private adoptUrl = 'http://localhost:5036/api/adopt-animal';

  getProfile() {
    return this.http.get(`${this.apiUrl}/me`, { withCredentials: true });
  }

  // БАГ 2 ВИПРАВЛЕНО: відправляємо firstName + lastName окремо (бекенд не знає fullName),
  // і обов'язково передаємо roleId щоб не скидалось на дефолт (1 = administrator)
  updateProfile(regData: any) {
    return this.http.put(
      `${this.apiUrl}/me`,
      {
        firstName: regData.firstName,
        lastName: regData.lastName,
        email: regData.email,
        roleId: regData.roleId ?? 0,
        isActive: true,
      },
      { withCredentials: true },
    );
  }

  changePassword(regData: any) {
    return this.http.put(
      `${this.apiUrl}/me/password`,
      {
        currentPassword: regData.currentPassword,
        newPassword: regData.newPassword,
        confirmPassword: regData.confirmPassword,
      },
      { withCredentials: true },
    );
  }

  // БАГ 3 ВИПРАВЛЕНО: теж відправляємо firstName + lastName окремо
  editUser(id: number, regData: any) {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      {
        firstName: regData.firstName,
        lastName: regData.lastName,
        email: regData.email,
        roleId: regData.roleId,
        isActive: regData.isActive ?? true,
      },
      { withCredentials: true },
    );
  }

  // БАГ 3 ВИПРАВЛЕНО: те саме для створення нового користувача
  addUser(regData: any) {
    return this.http.post(
      `${this.apiUrl}`,
      {
        firstName: regData.firstName,
        lastName: regData.lastName,
        email: regData.email,
        roleId: regData.roleId,
        password: regData.password,
        isActive: true,
      },
      { withCredentials: true },
    );
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  getUsersByRole(roleId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/role/${roleId}`, { withCredentials: true });
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
    if (isActive !== null) params = params.set('isActive', isActive.toString());

    return this.http.get(`${this.apiUrl}`, { params, withCredentials: true });
  }

  toggleStatus(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle-status`, {}, { withCredentials: true });
  }

  getUserAnimals(ownerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.adoptUrl}/user/${ownerId}`, { withCredentials: true });
  }

  returnAnimal(animalId: number, ownerId: number): Observable<any> {
    return this.http.post(
      `${this.adoptUrl}/return`,
      { animalId, ownerId },
      { withCredentials: true },
    );
  }

  getAvailableAnimals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adoptUrl}/available`, { withCredentials: true });
  }

  adoptAnimal(animalId: number, ownerId: number): Observable<any> {
    return this.http.post(
      `${this.adoptUrl}/adopt`,
      { animalId, ownerId },
      { withCredentials: true },
    );
  }
}
