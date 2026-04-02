import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimalCardComponent } from '../../shared/components/animal-card/animal-card.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-animals-page',
  standalone: true,
  imports: [CommonModule, AnimalCardComponent, ModalComponent],
  templateUrl: './animals-page.component.html',
  styleUrl: './animals-page.component.scss',
})
export class AnimalsPageComponent {
  isAddModalOpen = false;

  selectedAnimal: any = null;

  isEditMode = false;

  animals = [
    {
      name: 'Рекс',
      breed: 'Вівчарка',
      gender: 'Хлопчик',
      weight: 25.5,
      dob: '15.05.2020',
      isSterilized: true,
      type: 'dog',
    },
    {
      name: 'Мурка',
      breed: 'Мейн-кун',
      gender: 'Дівчинка',
      weight: 6.2,
      dob: '10.08.2021',
      isSterilized: true,
      type: 'cat',
    },
    {
      name: 'Барон',
      breed: 'Лабрадор',
      gender: 'Хлопчик',
      weight: 30,
      dob: '20.11.2019',
      isSterilized: false,
      type: 'dog',
    },
  ];

  closeDetailModal() {
    this.selectedAnimal = null;
    this.isEditMode = false;
  }

  saveChanges() {
    this.isEditMode = false;
  }
}
