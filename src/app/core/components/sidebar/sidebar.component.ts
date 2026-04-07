import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../service/AuthService';
import {UserService } from '../../service/UserService';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  private userService = inject(UserService);

  currentUser = signal<any>(null);
  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (user) => {
        // Записуємо дані в сигнал
        this.currentUser.set(user);
        console.log('Дані профілю завантажено!', user);
      },
      error: (err) => console.error('Не вдалося завантажити профіль', err),
    });
  }
}
