import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import {UserService} from '../../core/service/UserService';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, ModalComponent, FormsModule],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss',
})
export class UsersPageComponent implements OnInit {
  private userService = inject(UserService);

  Math = Math;

  isAddModalOpen = false;
  selectedUser: any = null;

  users = signal<any[]>([]);
  currentPage = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);

  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers(this.currentPage(), this.pageSize()).subscribe({
      next: (response: any) => {
        this.users.set(response.items || response.Items || []);
        this.totalCount.set(response.totalCount || response.TotalCount || 0);
        this.currentPage.set(response.pageNumber || response.PageNumber || 1);
      },
      error: (err) => console.error('Помилка завантаження:', err),
    });
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.loadUsers();
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadUsers();
    }
  }

  changePageSize(newSize: number) {
    this.pageSize.set(newSize);
    this.currentPage.set(1);
    this.loadUsers();
  }
}
