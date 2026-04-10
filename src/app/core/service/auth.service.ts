import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/users';

  register(regData: any) {
    const dataToSend = {
      fullName: regData.fullName,
      email: regData.email,
      password: regData.password,
      roleId: 1,
    };

    const url = 'http://localhost:5036/api/users/register';

    return this.http.post(url, dataToSend, { withCredentials: true });
  }
}
