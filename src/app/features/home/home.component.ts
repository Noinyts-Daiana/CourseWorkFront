import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// 1. ДОДАЙ ЦЕЙ ІМПОРТ (перевір, чи правильний шлях до папки з модалкою)
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  // 2. ДОДАЙ ModalComponent СЮДИ:
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

  openAdoptionModal(pet: any) {
    this.selectedPetForAdoption = pet;
    this.isAdoptionModalOpen = true;
  }
}
