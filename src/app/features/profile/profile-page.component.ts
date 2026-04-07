import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/service/UserService';
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
        const full = data.fullName || '';
        const date = new Date(data.createdAt);

        const formattedDate = date
          .toLocaleDateString('uk-UA', {
            month: 'long',
            year: 'numeric',
          })
          .replace('.', '');

        const parts = full.trim().split(' ');
        const fName = parts[0] || '';
        const lName = parts[1] || '';
        this.user.set({
          firstName: parts[0],
          lastName: parts[1],
          email: data.email,
          role: data.roleName,
          joinedDate: formattedDate,
        });

        this.regData = {
          firstName: fName,
          lastName: lName,
          email: data.email,
        };
      },
    });
  }

  onUpdate() {
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const fullNameData = `${this.regData.firstName} ${this.regData.lastName}`.trim();

    const dataToUpdate = {
      fullName: fullNameData,
      email: this.regData.email,
    };
    this.userService.updateProfile(dataToUpdate).subscribe({
      next: (res: any) => {
        console.log('Успіх!');
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

    const dataToSend = {
      currentPassword: this.passData.currentPassword,
      newPassword: this.passData.newPassword,
      confirmPassword: this.passData.confirmPassword,
    };

    this.userService.changePassword(dataToSend).subscribe({
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
        }
        else if (err.error?.message) {
          errorText = err.error.message;
        }

        this.errorMessage.set(`${errorText}`);
        setTimeout(() => this.errorMessage.set(null), 5000);
      },
    });
  }
}

export default ProfilePageComponent
