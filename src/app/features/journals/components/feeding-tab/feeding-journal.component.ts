import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AnimalService } from '../../../../core/service/animal.service';
import { InventoryService } from '../../../../core/service/inventory.service';
import { UserService } from '../../../../core/service/user.service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { FeedingLogService } from '../../../../core/service/feeding-log.service';

@Component({
  selector: 'app-feeding-journal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, PaginationComponent],
  templateUrl: './feeding-journal.component.html',
  styleUrl: '../../journals-page.component.scss',
})
export class FeedingJournalComponent implements OnInit {
  private animalService = inject(AnimalService);
  private inventoryService = inject(InventoryService);
  private userService = inject(UserService);
  private feedingService = inject(FeedingLogService);

  searchTerm = signal('');
  fromDate = signal('');
  toDate = signal('');
  selectedUserFilter = signal('');

  feedingAnimalFilter = signal<string | null>(null);
  feedingPersonFilter = signal<string | null>(null);

  currentPage = signal(1);
  pageSize = signal(10);
  feedingLogs = signal<any[]>([]);

  isAddModalOpen = signal(false);
  isEditMode = signal(false);
  editingId = signal<number | null>(null);

  animalsList = signal<any[]>([]);
  foodList = signal<any[]>([]);
  employeesList = signal<any[]>([]);

  animalSearchTerm = signal('');
  isAnimalsDropdownOpen = signal(false);
  foodSearchTerm = signal('');
  isFoodDropdownOpen = signal(false);
  employeeSearchTerm = signal('');
  isEmployeesDropdownOpen = signal(false);
  maxDateTime = signal(this.getCurrentDateTimeLocal());

  newFeedingData = {
    animalId: null as number | null,
    foodTypeId: null as number | null,
    amount: null as number | null,
    fedAt: this.getCurrentDateTimeLocal(),
    fedById: null as number | null,
  };

  errorMessage = signal('');

  filteredFeedingLogs = computed(() => {
    let logs = this.feedingLogs();
    const term = this.searchTerm().toLowerCase();
    const fromVal = this.fromDate() ? new Date(this.fromDate()) : null;
    const toVal = this.toDate() ? new Date(this.toDate()) : null;
    if (fromVal) fromVal.setHours(0, 0, 0, 0);
    if (toVal) toVal.setHours(23, 59, 59, 999);

    if (this.feedingAnimalFilter()) {
      logs = logs.filter((l) => l.animal === this.feedingAnimalFilter());
    }
    if (this.feedingPersonFilter()) {
      logs = logs.filter((l) => l.person === this.feedingPersonFilter());
    }
    if (this.selectedUserFilter()) {
      const user = this.selectedUserFilter().toLowerCase();
      logs = logs.filter((log) => (log.person || '').toLowerCase().includes(user));
    }

    return logs.filter((log) => {
      let matchesDate = true;
      if (fromVal && log.rawDate < fromVal) matchesDate = false;
      if (toVal && log.rawDate > toVal) matchesDate = false;

      let matchesSearch = true;
      if (term) {
        matchesSearch =
          (log.animal?.toLowerCase() || '').includes(term) ||
          (log.food?.toLowerCase() || '').includes(term);
      }
      return matchesDate && matchesSearch;
    });
  });

  totalCount = computed(() => this.filteredFeedingLogs().length);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);

  paginatedFeedingLogs = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredFeedingLogs().slice(start, start + this.pageSize());
  });

  filteredEmployees = computed(() => {
    const term = this.employeeSearchTerm().toLowerCase();
    return this.employeesList().filter((emp) => {
      const name = emp.fullName || emp.full_name || emp.name || emp.email || '';
      return name.toLowerCase().includes(term);
    });
  });

  ngOnInit() {
    this.loadEmployees();
    this.loadFoods();
    this.loadFeedingLogs();
  }

  getCurrentDateTimeLocal(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  formatDateForInput(date: Date): string {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

  loadFeedingLogs() {
    this.feedingService.getRecentLogs().subscribe({
      next: (res) => {
        const logs = Array.isArray(res) ? res : res.items || res.$values || [];
        const formattedLogs = logs.map((log: any) => {
          const fedDate = new Date(log.fedAt);
          return {
            id: log.id,
            rawDate: fedDate,
            time: fedDate.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
            date: fedDate.toLocaleDateString('uk-UA'),
            animalId: log.animalId,
            foodTypeId: log.foodTypeId,
            fedById: log.fedById,
            rawAmount: log.amount,
            animal: log.animalName || log.animal?.name || `Тварина #${log.animalId}`,
            food: log.foodName || log.foodType?.name || 'Корм',
            amount: `${log.amount} ${log.unit || 'г'}`,
            person: log.fedByName || log.fedBy?.fullName || `Працівник #${log.fedById}`,
          };
        });
        this.feedingLogs.set(formattedLogs);
      },
      error: (err) => console.error(err),
    });
  }

  loadEmployees() {
    this.userService.getUsersByRole(2).subscribe({
      next: (res: any) => {
        this.employeesList.set(res.items ? res.items : res || []);
      },
    });
  }

  loadFoods(searchTerm: string = '') {
    this.inventoryService.getItems(1, 50, searchTerm).subscribe({
      next: (res: any) => {
        this.foodList.set(res.items || []);
      },
    });
  }

  onMainSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  onUserFilterSelect(event: Event) {
    this.selectedUserFilter.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
  }

  onDateChange() {
    this.currentPage.set(1);
  }

  isUserInList(name: string): boolean {
    return this.employeesList().some((emp) => (emp.fullName || emp.email) === name);
  }

  setFeedingFilter(type: 'animal' | 'person', value: string) {
    if (type === 'animal') this.feedingAnimalFilter.set(value);
    if (type === 'person') this.feedingPersonFilter.set(value);
    this.currentPage.set(1);
  }

  clearFeedingFilter(type: 'animal' | 'person') {
    if (type === 'animal') this.feedingAnimalFilter.set(null);
    if (type === 'person') this.feedingPersonFilter.set(null);
    this.currentPage.set(1);
  }

  clearUserFilter() {
    this.selectedUserFilter.set('');
    this.currentPage.set(1);
  }

  clearAllFilters() {
    this.feedingAnimalFilter.set(null);
    this.feedingPersonFilter.set(null);
    this.selectedUserFilter.set('');
    this.searchTerm.set('');
    this.fromDate.set('');
    this.toDate.set('');
    this.currentPage.set(1);
  }

  onPageChange(newPage: number) {
    this.currentPage.set(newPage);
  }

  // --- Форма та Модалка ---
  onAnimalInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.animalSearchTerm.set(value);
    this.newFeedingData.animalId = null;
    this.animalService.getAnimals(1, 10, value).subscribe({
      next: (res: any) => this.animalsList.set(res.items),
    });
  }

  selectAnimal(animal: any) {
    this.animalSearchTerm.set(animal.name);
    this.newFeedingData.animalId = animal.id;
    this.isAnimalsDropdownOpen.set(false);
  }

  closeAnimalsDropdown() {
    setTimeout(() => this.isAnimalsDropdownOpen.set(false), 200);
  }

  onFoodInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.foodSearchTerm.set(value);
    this.newFeedingData.foodTypeId = null;
    this.loadFoods(value);
  }

  selectFood(food: any) {
    this.foodSearchTerm.set(food.name);
    this.newFeedingData.foodTypeId = food.id;
    this.isFoodDropdownOpen.set(false);
  }

  closeFoodDropdown() {
    setTimeout(() => this.isFoodDropdownOpen.set(false), 200);
  }

  onEmployeeInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.employeeSearchTerm.set(value);
    this.newFeedingData.fedById = null;
  }

  selectEmployee(emp: any) {
    const name =
      emp.fullName || emp.full_name || emp.name || emp.email || `Працівник ${emp.userId}`;
    this.employeeSearchTerm.set(name);
    this.newFeedingData.fedById = emp.userId;
    this.isEmployeesDropdownOpen.set(false);
  }

  closeEmployeesDropdown() {
    setTimeout(() => this.isEmployeesDropdownOpen.set(false), 200);
  }

  openAddModal() {
    this.maxDateTime.set(this.getCurrentDateTimeLocal());
    this.isEditMode.set(false);
    this.editingId.set(null);
    this.newFeedingData = {
      animalId: null,
      foodTypeId: null,
      amount: null,
      fedAt: this.getCurrentDateTimeLocal(),
      fedById: null,
    };
    this.animalSearchTerm.set('');
    this.foodSearchTerm.set('');
    this.employeeSearchTerm.set('');
    this.errorMessage.set('');
    this.isAddModalOpen.set(true);
  }

  openEditModal(log: any) {
    this.isEditMode.set(true);
    this.editingId.set(log.id);
    this.newFeedingData = {
      animalId: log.animalId,
      foodTypeId: log.foodTypeId,
      amount: log.rawAmount,
      fedAt: this.formatDateForInput(log.rawDate),
      fedById: log.fedById,
    };
    this.animalSearchTerm.set(log.animal);
    this.foodSearchTerm.set(log.food);
    this.employeeSearchTerm.set(log.person);
    this.errorMessage.set('');
    this.isAddModalOpen.set(true);
  }

  saveTransaction() {
    if (!this.newFeedingData.animalId) {
      this.errorMessage.set('Будь ласка, оберіть тварину зі списку.');
      return;
    }
    if (!this.newFeedingData.foodTypeId) {
      this.errorMessage.set('Будь ласка, оберіть корм зі списку.');
      return;
    }
    if (!this.newFeedingData.amount || this.newFeedingData.amount <= 0) {
      this.errorMessage.set('Будь ласка, введіть коректну кількість корму.');
      return;
    }
    if (!this.newFeedingData.fedById) {
      this.errorMessage.set('Будь ласка, оберіть відповідального працівника.');
      return;
    }

    this.errorMessage.set('');

    const request = this.isEditMode()
      ? this.feedingService.update(this.editingId()!, this.newFeedingData)
      : this.feedingService.create(this.newFeedingData);

    request.subscribe({
      next: () => {
        this.isAddModalOpen.set(false);
        this.loadFeedingLogs();
      },
      error: (err) => {
        console.error('Повна помилка:', err);
        const backendMessage = err.error?.message || 'Сталася невідома помилка при збереженні.';

        this.errorMessage.set(backendMessage);
      },
    });
  }
}
