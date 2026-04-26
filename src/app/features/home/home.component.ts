import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/service/auth.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ModalComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isAuthModalOpen = false;
  isAdoptionModalOpen = false;
  authTab: 'login' | 'register' = 'login';
  selectedPetForAdoption: any = null;
  isLoading = false;

  errorMessage = signal<string | null>(null);

  loginData = { email: '', password: '' };

  regData = { email: '', password: '', phone: '', fullName: '' };

  pets = [
    { name: 'Рекс', type: 'Собака', breed: 'Вівчарка', gender: 'Хлопчик', weight: '25.5 кг' },
    { name: 'Мурка', type: 'Кіт', breed: 'Мейн-кун', gender: 'Дівчинка', weight: '6.2 кг' },
    { name: 'Барон', type: 'Собака', breed: 'Лабрадор', gender: 'Хлопчик', weight: '30 кг' },
    { name: 'Сніжок', type: 'Кіт', breed: 'Британська', gender: 'Хлопчик', weight: '4.5 кг' },
  ];

  openAuthModal() {
    this.isAuthModalOpen = true;
    this.authTab = 'login';
    this.errorMessage.set(null);
  }

  openAdoptionModal(pet: any) {
    this.selectedPetForAdoption = pet;
    this.isAdoptionModalOpen = true;
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => alert('Скопійовано: ' + text));
  }

  onSubmit(form: NgForm) {
    this.errorMessage.set(null);
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    console.log('On submit');

    if (this.authTab === 'register') {
      this.onRegister();
      console.log('On register');
    } else {
      this.onLogin();
    }
  }

  onLogin() {
    this.isLoading = true;
    // ⚡️ ЗМІНА: беремо дані з regData, бо інпути в HTML прив'язані саме до неї
    this.authService.login(this.regData.email, this.regData.password).subscribe({
      next: (user) => {
        this.isAuthModalOpen = false;
        this.isLoading = false;

        // Твій існуючий код редіректу...
        if (user.permissions.includes('ViewDashboard')) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/user-profile']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Помилка входу. Перевірте дані.';
        this.errorMessage.set(msg);
      },
    });
  }

  onRegister() {
    console.log('On register');
    this.isLoading = true;
    this.authService
      .register({
        fullName: this.regData.fullName.trim(),
        email: this.regData.email.trim(),
        password: this.regData.password,
        roleId: 3,
      })
      .subscribe({
        next: () => {
          this.isAuthModalOpen = false;
          this.isLoading = false;
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading = false;
          const msg = err.error?.message || 'Помилка реєстрації. Перевірте дані.';
          this.errorMessage.set(msg);
        },
      });
  }
}
