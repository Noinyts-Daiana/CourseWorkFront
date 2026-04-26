import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

export interface AuthUser {
  userId: number;
  fullName: string;
  email: string;
  roleId: number;
  roleName: string;
  permissions: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly apiUrl = 'http://localhost:5036/api/users';

  // Реактивний стан
  currentUser = signal<AuthUser | null>(null);
  permissions = signal<string[]>([]);
  isLoggedIn = signal<boolean>(false);

  login(email: string, password: string) {
    return this.http
      .post<AuthUser>(`${this.apiUrl}/login`, { email, password }, { withCredentials: true })
      .pipe(tap((user) => this.setSession(user)));
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      complete: () => {
        this.clearSession();
        this.router.navigate(['/']);
      },
      error: () => {
        this.clearSession();
        this.router.navigate(['/']);
      },
    });
  }

  register(data: { fullName: string; email: string; password: string; roleId: number }) {
    return this.http
      .post<AuthUser>('http://localhost:5036/api/users/register', data, { withCredentials: true })
      .pipe(tap((user) => this.setSession(user)));
  }

  restoreSession() {
    return this.http.get<AuthUser>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
      tap({
        next: (user) => this.setSession(user),
        error: () => this.clearSession(),
      }),
    );
  }

  hasPermission(name: string): boolean {
    return this.permissions().includes(name);
  }

  hasAnyPermission(...names: string[]): boolean {
    return names.some((n) => this.hasPermission(n));
  }

  private setSession(user: AuthUser) {
    this.currentUser.set(user);
    this.permissions.set(user.permissions ?? []);
    this.isLoggedIn.set(true);
  }

  private clearSession() {
    this.currentUser.set(null);
    this.permissions.set([]);
    this.isLoggedIn.set(false);
  }
}
