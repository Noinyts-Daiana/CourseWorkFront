import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Vaccine {
  name: string;
  date: string;
  nextDate: string;
}

export interface MedicalRecord {
  type: 'Огляд' | 'Лікування' | 'Операція' | 'Вакцинація';
  date: string;
  description: string;
  doctor: string;
}

@Component({
  selector: 'app-animal-card-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animal-card-detail.component.html',
  styleUrls: ['./animal-card-detail.component.scss'],
})
export class AnimalCardDetailComponent {
  // Вхідні дані (Signals)
  name = input.required<string>();
  breed = input<string>('Невідома порода');
  gender = input<'Хлопчик' | 'Дівчинка'>('Хлопчик');
  weight = input<number>(0);
  dob = input<string>('');
  isSterilized = input<boolean>(false);
  animalType = input<'dog' | 'cat'>('dog');

  // Вихідна подія для закриття модалки
  closeModal = output<void>();

  // Стан вкладок
  activeTab: 'general' | 'medical' = 'general';

  // Демо-дані для медичної історії
  vaccines: Vaccine[] = [
    { name: 'Сказ', date: '2023-05-15', nextDate: '2024-05-15' },
    { name: 'Комплексна', date: '2023-04-10', nextDate: '2024-04-10' },
  ];

  medicalHistory: MedicalRecord[] = [
    {
      type: 'Огляд',
      date: '2023-10-01',
      description: 'Здоровий, активний. Вага в нормі.',
      doctor: 'Іван Іванов',
    },
    {
      type: 'Лікування',
      date: '2022-12-15',
      description: 'Розтягнення лапи. Призначено спокій та мазь.',
      doctor: 'Анна Петрівна',
    },
  ];
}
