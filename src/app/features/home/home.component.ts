import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Додаємо роутер для переходу в адмінку
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  isAdoptionModalOpen = false;
  selectedPetForAdoption: any = null;

  pets = [
    {
      name: 'Рекс',
      type: 'Собака',
      breed: 'Вівчарка',
      gender: 'Хлопчик',
      weight: '25.5 кг',
      img: 'assets/rex.jpg',
    },
    {
      name: 'Мурка',
      type: 'Кіт',
      breed: 'Мейн-кун',
      gender: 'Дівчинка',
      weight: '6.2 кг',
      img: 'assets/murka.jpg',
    },
    {
      name: 'Барон',
      type: 'Собака',
      breed: 'Лабрадор',
      gender: 'Хлопчик',
      weight: '30 кг',
      img: 'assets/baron.jpg',
    },
    {
      name: 'Сніжок',
      type: 'Кіт',
      breed: 'Британська',
      gender: 'Хлопчик',
      weight: '4.5 кг',
      img: 'assets/snizhok.jpg',
    },
  ];

  isAuthModalOpen = false;
  authTab: 'login' | 'register' = 'login';

  constructor(private router: Router) {}


  openAdoptionModal(pet: any) {
    this.selectedPetForAdoption = pet;
    this.isAdoptionModalOpen = true;
  }

  openAuthModal() {
    this.isAuthModalOpen = true;
    this.authTab = 'login';
  }

  loginAsDemo() {
    this.isAuthModalOpen = false;
    this.router.navigate(['/dashboard']);
  }

  copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert('Скопійовано: ' + text);
      })
      .catch((err) => {
        console.error('Помилка копіювання', err);
      });
  }
}
