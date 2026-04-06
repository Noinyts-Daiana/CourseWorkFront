import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5036/api/users';

  register(regData: any) {
    // Ми створюємо НОВИЙ об'єкт, куди беремо тільки те, що реально треба бекенду.
    // Поле userId ми сюди просто НЕ ВКЛЮЧАЄМО.
    const dataToSend = {
      fullName: regData.fullName,
      email: regData.email,
      password: regData.password,
      roleId: 1, // або те значення, яке тобі треба за замовчуванням
    };

    const url = 'http://localhost:5036/api/users/register';

    // Шлемо саме dataToSend, а не весь об'єкт regData
    return this.http.post(url, dataToSend, { withCredentials: true });
  }
}
