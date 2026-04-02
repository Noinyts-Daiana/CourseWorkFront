import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-journals-page',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './journals-page.component.html',
  styleUrl: './journals-page.component.scss',
})
export class JournalsPageComponent {
  isAddModalOpen = false;

  // Змінна для перемикання вкладок
  activeTab: 'feeding' | 'finance' | 'users' = 'feeding';
  selectedTypeForAdd: 'feeding' | 'finance' | 'users' = 'feeding';

  // Дані для Журналу годувань
  feedingLogs = [
    {
      time: '08:00',
      date: '25.10.2023',
      animal: 'Рекс',
      food: 'Сухий корм для собак',
      amount: '0.5 од.',
      person: 'Іван Іванов',
    },
    {
      time: '08:15',
      date: '25.10.2023',
      animal: 'Мурка',
      food: 'Вологий корм для котів',
      amount: '1 од.',
      person: 'Олена Петрівна',
    },
  ];

  // Дані для Фінансових транзакцій
  financeLogs = [
    {
      date: '25.10.2023',
      type: 'Витрата',
      category: 'Медикаменти',
      amount: '- 1500 грн',
      person: 'Адміністратор',
    },
    {
      date: '24.10.2023',
      type: 'Надходження',
      category: 'Благодійний внесок',
      amount: '+ 5000 грн',
      person: 'Система',
    },
  ];
}
