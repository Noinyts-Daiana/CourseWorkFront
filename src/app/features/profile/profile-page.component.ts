import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent {

  user = {
    firstName: 'Іван',
    lastName: 'Іванов',
    email: 'ivan.i@sheltersys.ua',
    phone: '+380501234567',
    formattedPhone: '+380 (50) 123-45-67',
    role: 'Працівник',
    department: 'Відділ "Котики"',
    joinedDate: 'Жов 2022',
  };
}
