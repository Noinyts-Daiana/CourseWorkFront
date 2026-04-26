import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  auth = inject(AuthService);

  // Хелпер для шаблону
  has(permission: string): boolean {
    return this.auth.hasPermission(permission);
  }

  hasAny(...permissions: string[]): boolean {
    return this.auth.hasAnyPermission(...permissions);
  }

  logout() {
    this.auth.logout();
  }
}
