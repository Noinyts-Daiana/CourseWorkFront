import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/service/user.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
class ProfilePageComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  regData = {
    email: '',
    firstName: '',
    lastName: '',
  };

  passData = {
    currentPassword: '',
    confirmPassword: '',
    newPassword: '',
  };

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  user = signal<any>(null);

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (data: any) => {
        const raw = data.createdAt || '';
        const date = new Date(raw.endsWith('Z') ? raw : raw + 'Z');

        const formattedDate = date
          .toLocaleDateString('uk-UA', {
            month: 'long',
            year: 'numeric',
          })
          .replace('.', '');

        // БАГ 2 ВИПРАВЛЕНО: бекенд тепер повертає firstName і lastName окремо.
        // Але якщо з якоїсь причини прийшов лише fullName — розбиваємо як fallback.
        const firstName = data.firstName || (data.fullName || '').trim().split(' ')[0] || '';
        const lastName = data.lastName || (data.fullName || '').trim().split(' ')[1] || '';

        this.user.set({
          firstName,
          lastName,
          email: data.email,
          role: data.roleName,
          roleId: data.roleId, // зберігаємо roleId щоб не скидало роль при оновленні
          joinedDate: formattedDate,
        });

        this.regData = {
          firstName,
          lastName,
          email: data.email,
        };
      },
    });
  }

  onUpdate() {
    this.successMessage.set(null);
    this.errorMessage.set(null);

    // БАГ 2 ВИПРАВЛЕНО: передаємо firstName/lastName і roleId поточного користувача
    this.userService
      .updateProfile({
        firstName: this.regData.firstName,
        lastName: this.regData.lastName,
        email: this.regData.email,
        roleId: this.user()?.roleId,
      })
      .subscribe({
        next: () => {
          this.successMessage.set('Профіль успішно оновлено!');
          setTimeout(() => this.successMessage.set(null), 3000);
          this.loadProfile();
        },
        error: (err) => {
          let errorText = 'Сталася помилка при оновленні профілю';

          if (err.status === 400 && err.error && err.error.errors) {
            const validationErrors = Object.values(err.error.errors) as string[][];
            if (validationErrors.length > 0 && validationErrors[0].length > 0) {
              errorText = validationErrors[0][0];
            }
          } else if (err.error?.message) {
            errorText = err.error.message;
          }

          this.errorMessage.set(` ${errorText}`);
          setTimeout(() => this.errorMessage.set(null), 5000);
        },
      });
  }

  onChangePassword() {
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.userService
      .changePassword({
        currentPassword: this.passData.currentPassword,
        newPassword: this.passData.newPassword,
        confirmPassword: this.passData.confirmPassword,
      })
      .subscribe({
        next: () => {
          this.passData = { currentPassword: '', newPassword: '', confirmPassword: '' };
          this.successMessage.set('Пароль успішно змінено!');
          setTimeout(() => this.successMessage.set(null), 3000);
        },
        error: (err) => {
          let errorText = 'Сталася помилка при зміні пароля';

          if (err.status === 400 && err.error && err.error.errors) {
            const validationErrors = Object.values(err.error.errors) as string[][];
            if (validationErrors.length > 0 && validationErrors[0].length > 0) {
              errorText = validationErrors[0][0];
            }
          } else if (err.error?.message) {
            errorText = err.error.message;
          }

          this.errorMessage.set(`${errorText}`);
          setTimeout(() => this.errorMessage.set(null), 5000);
        },
      });
  }
}

export default ProfilePageComponent;
