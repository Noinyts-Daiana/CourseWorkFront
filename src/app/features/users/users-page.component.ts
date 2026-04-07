import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { UserService } from '../../core/service/UserService';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, ModalComponent, FormsModule],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss',
})
export class UsersPageComponent implements OnInit {
  private userService = inject(UserService);
  searchQuery: string = '';

  Math = Math;

  isAddModalOpen = false;
  selectedUser: any = null;
  isEditModalOpen = signal(false);

  users = signal<any[]>([]);
  currentPage = signal(1);
  pageSize = signal(9);
  totalCount = signal(0);

  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);

  ngOnInit() {
    this.loadUsers();
  }

  errorMessage = signal('');
  editData = { userId: 0, fullName: '', email: '', roleId: 1 };

  regData = { fullName: '', email: '', roleId: 2, password: '' };

  onEdit() {
    if (this.selectedUser) {
      this.editData = {
        userId: this.selectedUser.userId,
        fullName: this.selectedUser.fullName,
        email: this.selectedUser.email,
        roleId: this.selectedUser.roleId,
      };

      this.selectedUser = null;
      this.isEditModalOpen.set(true);
    }
  }

  onAddUser() {
    this.errorMessage.set('');

    if (!this.regData.fullName || !this.regData.email || !this.regData.password) {
      this.errorMessage.set('Будь ласка, заповніть всі поля!');
      return;
    }

    this.regData.roleId = Number(this.regData.roleId);

    this.userService.addUser(this.regData).subscribe({
      next: () => {
        console.log('Користувача успішно створено! 🎉');
        this.isAddModalOpen = false;
        this.loadUsers();
        this.regData = { fullName: '', email: '', roleId: 2, password: '' };
      },
      error: (err) => {
        console.error('Помилка при створенні:', err);
        const msg = err.error?.message || 'Не вдалося створити користувача. Спробуйте пізніше.';
        this.errorMessage.set(msg);
      },
    });
  }

  onSaveEdit() {
    this.errorMessage.set('');

    if (this.editData.userId === 0) return;

    const dataToSend = {
      fullName: this.editData.fullName,
      email: this.editData.email,
      roleId: Number(this.editData.roleId),
    };

    this.userService.editUser(this.editData.userId, dataToSend).subscribe({
      next: () => {
        console.log('Профіль успішно оновлено! ✨');
        this.isEditModalOpen.set(false);
        this.loadUsers();
        this.editData = { userId: 0, fullName: '', email: '', roleId: 0 };
      },
      error: (err) => {
        console.error('Помилка при збереженні:', err);
        const msg = err.error?.message || 'Помилка при збереженні змін.';
        this.errorMessage.set(msg);
      },
    });
  }

  onSearch() {
    this.currentPage.set(1);
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers(this.currentPage(), this.pageSize(), this.searchQuery).subscribe({
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
}
