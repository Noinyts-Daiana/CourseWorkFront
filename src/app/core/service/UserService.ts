import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';


export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface User {
  userId: number;
  fullName: string;
  email: string;
  roleName: string;
  isActive: boolean;
  password?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/users';

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

  getUsers(page: number, size: number, searchTerm: string = '') {
    return this.http.get(
      `${this.apiUrl}/?pageNumber=${page}&pageSize=${size}&searchTerm=${searchTerm}`,
    );
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
}
