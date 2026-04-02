import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss',
})
export class UsersPageComponent {
  isAddModalOpen = false;
  selectedUser: any = null;

  users = [
    {
      name: 'Олена Петрівна',
      email: 'olena@shelter.com',
      role: 'Адміністратор',
      status: 'Активний',
      lastLogin: '24.10.2023, 10:15:00',
    },
    {
      name: 'Іван Іванов',
      email: 'ivan@shelter.com',
      role: 'Працівник',
      status: 'Активний',
      lastLogin: '23.10.2023, 18:30:00',
    },
    {
      name: 'Марія Сидоренко',
      email: 'maria@shelter.com',
      role: 'Працівник',
      status: 'Неактивний',
      lastLogin: '20.10.2023, 19:45:00',
    },
  ];
}
