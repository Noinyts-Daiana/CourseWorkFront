import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { UserService } from '../../core/service/user.service';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, ModalComponent, FormsModule, PaginationComponent],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss',
})
export class UsersPageComponent implements OnInit {
  private userService = inject(UserService);

  // --- Стан списку користувачів ---
  users = signal<any[]>([]);
  currentPage = signal(1);
  pageSize = signal(9);
  totalCount = signal(0);
  searchQuery = '';
  selectedRoleFilter = signal(0);
  selectedStatusFilter = signal<boolean | null>(null); // null - всі, true - активні, false - неактивні

  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);

  // --- Стан модалок ---
  selectedUser: any = null;
  isAddModalOpen = signal(false);
  isEditModalOpen = signal(false);
  errorMessage = signal('');

  // --- Стан призначення тварин ---
  isAssignMode = signal(false);
  availableAnimals = signal<any[]>([]);
  selectedAnimalIdForAssign: number | null = null;
  animalSearchQuery = signal('');
  isDropdownVisible = signal(false);
  userAnimals = signal<any[]>([]);

  // --- Дані для форм ---
  editData = { userId: 0, fullName: '', email: '', roleId: 1 };
  regData = { fullName: '', email: '', roleId: 2, password: '' };

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService
      .getUsers(
        this.currentPage(),
        this.pageSize(),
        this.searchQuery,
        this.selectedRoleFilter(),
        this.selectedStatusFilter(),
      )
      .subscribe({
        next: (response: any) => {
          this.users.set(response.items || []);
          this.totalCount.set(response.totalCount || 0);
        },
      });
  }

  // --- Логіка фільтрації (Active Filters) ---

  onStatusFilterChange(value: string) {
    if (value === 'all') this.selectedStatusFilter.set(null);
    else this.selectedStatusFilter.set(value === 'true');
    this.currentPage.set(1);
    this.loadUsers();
  }

  onRoleFilterChange() {
    this.currentPage.set(1);
    this.loadUsers();
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage.set(1);
    this.loadUsers();
  }

  clearRoleFilter() {
    this.selectedRoleFilter.set(0);
    this.currentPage.set(1);
    this.loadUsers();
  }


  clearAllFilters() {
    this.searchQuery = '';
    this.selectedRoleFilter.set(0);
    this.selectedStatusFilter.set(null);
    this.currentPage.set(1);
    this.loadUsers();
  }

  getRoleName(id: number): string {
    const roles: { [key: number]: string } = {
      1: 'Адміністратор',
      2: 'Працівник',
      3: 'Користувач',
    };
    return roles[id] || '';
  }

  // --- Решта логіки ---

  onSelectUser(user: any) {
    this.selectedUser = user;
    this.resetAssignState();
    this.loadUserAnimals(user.userId);
  }

  resetAssignState() {
    this.isAssignMode.set(false);
    this.animalSearchQuery.set('');
    this.selectedAnimalIdForAssign = null;
    this.isDropdownVisible.set(false);
  }

  loadUserAnimals(userId: number) {
    this.userService.getUserAnimals(userId).subscribe({
      next: (animals) => this.userAnimals.set(animals),
      error: () => this.userAnimals.set([]),
    });
  }
  // Встановити фільтр статусу кліком по картці
  setStatusFilter(status: boolean) {
    this.selectedStatusFilter.set(status);
    this.currentPage.set(1);
    this.loadUsers();
  }

  // Очистити фільтр статусу (для хрестика на чіпсі)
  clearStatusFilter() {
    this.selectedStatusFilter.set(null);
    this.currentPage.set(1);
    this.loadUsers();
  }
  toggleAssignMode() {
    if (!this.isAssignMode()) {
      this.userService.getAvailableAnimals().subscribe((animals) => {
        this.availableAnimals.set(animals);
        this.isAssignMode.set(true);
        this.isDropdownVisible.set(true);
      });
    } else {
      this.resetAssignState();
    }
  }

  filteredAnimals = computed(() => {
    const query = this.animalSearchQuery().toLowerCase();
    return this.availableAnimals().filter(
      (a) =>
        a.animalName.toLowerCase().includes(query) ||
        (a.animalBreed && a.animalBreed.toLowerCase().includes(query)),
    );
  });

  onAnimalSelect(animal: any) {
    this.selectedAnimalIdForAssign = animal.animalId;
    this.animalSearchQuery.set(animal.animalName);
    this.isDropdownVisible.set(false);
  }

  onConfirmAssign() {
    if (!this.selectedAnimalIdForAssign || !this.selectedUser) return;
    this.userService
      .adoptAnimal(this.selectedAnimalIdForAssign, this.selectedUser.userId)
      .subscribe({
        next: () => {
          this.resetAssignState();
          this.loadUserAnimals(this.selectedUser.userId);
        },
      });
  }

  onReturnAnimal(animalId: number) {
    this.userService.returnAnimal(animalId, this.selectedUser.userId).subscribe({
      next: () => this.loadUserAnimals(this.selectedUser.userId),
    });
  }

  onToggleActive() {
    this.userService.toggleStatus(this.selectedUser.userId).subscribe({
      next: (res: any) => {
        this.selectedUser.isActive = res.isActive;
        this.loadUsers();
      },
    });
  }

  onEdit() {
    this.editData = { ...this.selectedUser };
    this.selectedUser = null;
    this.isEditModalOpen.set(true);
  }

  onSaveEdit() {
    this.userService.editUser(this.editData.userId, this.editData).subscribe({
      next: () => {
        this.isEditModalOpen.set(false);
        this.loadUsers();
      },
    });
  }

  onAddUser() {
    this.userService.addUser(this.regData).subscribe({
      next: () => {
        this.isAddModalOpen.set(false);
        this.loadUsers();
        this.regData = { fullName: '', email: '', roleId: 2, password: '' };
      },
      error: (err) => this.errorMessage.set(err.error?.message || 'Помилка'),
    });
  }

  onSearch() {
    this.currentPage.set(1);
    this.loadUsers();
  }

  onPageChange(newPage: number) {
    this.currentPage.set(newPage);
    this.loadUsers();
  }
}
