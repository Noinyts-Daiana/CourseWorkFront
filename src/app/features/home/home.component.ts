import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/service/AuthService';
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

  errorMessage = signal<string | null>(null);

  regData = {
    email: '',
    password: '',
    phone: '',
    fullName: '',
  };

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
    navigator.clipboard.writeText(text).then(() => {
      alert('Скопійовано: ' + text);
    });
  }


  onSubmit() {
    this.errorMessage.set(null);

    if (this.authTab === 'register') {
      this.onRegister();
    } else {
      this.onLogin();
    }
  }

  onRegister() {
    const dataToSend = {
      fullName: this.regData.fullName,
      email: this.regData.email,
      password: this.regData.password,
      roleId: 1, // Роль за замовчуванням
    };

    this.authService.register(dataToSend).subscribe({
      next: (res) => {
        console.log('Реєстрація успішна!', res);
        this.isAuthModalOpen = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const serverMessage = err.error?.message || 'Помилка реєстрації. Перевірте дані.';

        this.errorMessage.set(serverMessage);

        console.error('Помилка з сервера:', err);
      },
    });
  }

  onLogin() {
    console.log('Логіка входу буде тут');
  }
}
