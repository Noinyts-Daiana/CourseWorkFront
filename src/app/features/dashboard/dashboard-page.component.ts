import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, StatCardComponent, ModalComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent {
  // Стейт для модалки "Звіт"
  isReportModalOpen = false;

  // Дані для блоку "Швидкі дії"
  quickActions = [
    { label: 'Нова картка', icon: '🐾' },
    { label: 'Огляд', icon: '💉' },
    { label: 'Прихід корму', icon: '➕' },
    { label: 'Звіти', icon: '📈' },
  ];

  // Дані для блоку "Системні сповіщення"
  notifications = [
    {
      type: 'warning',
      message: 'Низький запас вологого корму для котів (Purina).',
      date: '2023-10-25 09:00',
      icon: '⚠️',
    },
    {
      type: 'info',
      message: 'Заплановано медогляд для Барона на завтра.',
      date: '2023-10-25 10:30',
      icon: 'ℹ️',
    },
  ];
}
