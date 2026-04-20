import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TransactionService } from '../../core/service/transaction.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { UserService } from '../../core/service/user.service';
import { AnimalService } from '../../core/service/animal.service';
import { InventoryService } from '../../core/service/inventory.service';

@Component({
  selector: 'app-journals-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, PaginationComponent],
  templateUrl: './journals-page.component.html',
  styleUrl: './journals-page.component.scss',
})
export class JournalsPageComponent implements OnInit {
  private http = inject(HttpClient);
  private transactionService = inject(TransactionService);
  private userService = inject(UserService);
  private animalService = inject(AnimalService);
  private inventoryService = inject(InventoryService);

  activeTab = signal('finance');
  selectedTypeForAdd = signal('finance');
  isAddModalOpen = signal(false);

  searchTerm = signal('');
  fromDate = signal('');
  toDate = signal('');

  currentPage = signal(1);
  pageSize = signal(10);

  // ЛІЧИЛЬНИК ДЛЯ ФІНАНСІВ
  financeTotalCount = signal(0);

  // ЗАГАЛЬНИЙ ЛІЧИЛЬНИК
  totalCount = computed(() => {
    if (this.activeTab() === 'finance') {
      return this.financeTypeFilter() !== null ? this.filteredFinanceLogs().length : this.financeTotalCount();
    }
    if (this.activeTab() === 'feeding') return this.filteredFeedingLogs().length;
    if (this.activeTab() === 'users') return this.filteredUsersLogs().length;
    return 0;
  });

  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);

  financeLogs = signal<any[]>([]);
  categories = signal<any[]>([]);
  feedingLogs = signal<any[]>([]);
  usersLogs = signal<any[]>([]);

  // СИГНАЛИ ДЛЯ ФІЛЬТРІВ
  activityTypeFilter = signal<string | null>(null);
  activityUserFilter = signal<string | null>(null);
  financeTypeFilter = signal<boolean | null>(null); // true = надходження, false = витрати

  // ФІЛЬТР ФІНАНСІВ
  filteredFinanceLogs = computed(() => {
    let logs = this.financeLogs();
    if (this.financeTypeFilter() !== null) {
      logs = logs.filter(log => log.isIncome === this.financeTypeFilter());
    }
    return logs;
  });

  // ФІЛЬТР ГОДУВАНЬ
  filteredFeedingLogs = computed(() => {
    let logs = this.feedingLogs();
    const term = this.searchTerm().toLowerCase();

    const fromVal = this.fromDate() ? new Date(this.fromDate()) : null;
    const toVal = this.toDate() ? new Date(this.toDate()) : null;
    if (fromVal) fromVal.setHours(0, 0, 0, 0);
    if (toVal) toVal.setHours(23, 59, 59, 999);

    return logs.filter((log) => {
      let matchesDate = true;
      if (fromVal && log.rawDate < fromVal) matchesDate = false;
      if (toVal && log.rawDate > toVal) matchesDate = false;

      let matchesSearch = true;
      if (term) {
        matchesSearch =
          (log.animal?.toLowerCase() || '').includes(term) ||
          (log.food?.toLowerCase() || '').includes(term) ||
          (log.person?.toLowerCase() || '').includes(term);
      }

      return matchesDate && matchesSearch;
    });
  });

  paginatedFeedingLogs = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredFeedingLogs().slice(start, start + this.pageSize());
  });

  // ФІЛЬТР КОРИСТУВАЧІВ
  filteredUsersLogs = computed(() => {
    let logs = this.usersLogs();
    const term = this.searchTerm().toLowerCase();

    const fromVal = this.fromDate() ? new Date(this.fromDate()) : null;
    const toVal = this.toDate() ? new Date(this.toDate()) : null;
    if (fromVal) fromVal.setHours(0, 0, 0, 0);
    if (toVal) toVal.setHours(23, 59, 59, 999);

    if (this.activityTypeFilter()) {
      logs = logs.filter((l) => l.type === this.activityTypeFilter());
    }
    if (this.activityUserFilter()) {
      logs = logs.filter((l) => l.user === this.activityUserFilter());
    }

    return logs.filter((log) => {
      let matchesDate = true;
      if (fromVal && log.rawDate < fromVal) matchesDate = false;
      if (toVal && log.rawDate > toVal) matchesDate = false;

      let matchesSearch = true;
      if (term) {
        matchesSearch =
          (log.description?.toLowerCase() || '').includes(term) ||
          (log.user?.toLowerCase() || '').includes(term) ||
          (log.type?.toLowerCase() || '').includes(term);
      }

      return matchesDate && matchesSearch;
    });
  });

  paginatedUsersLogs = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredUsersLogs().slice(start, start + this.pageSize());
  });

  categorySearchTerm = signal('');
  isCategoriesDropdownOpen = signal(false);
  categoriesCurrentPage = signal(1);
  categoriesTotalPages = signal(1);

  isEditMode = signal(false);
  editingTransactionId = signal<number | null>(null);

  newTransactionData = {
    isIncome: false,
    categoryId: null as number | null,
    categoryName: '',
    amount: null as number | null,
    description: '',
  };

  newFeedingData = {
    animalId: null as number | null,
    foodTypeId: null as number | null,
    amount: null as number | null,
    fedAt: this.getCurrentDateTimeLocal(),
    fedById: null as number | null,
  };

  getCurrentDateTimeLocal(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  employeesList = signal<any[]>([]);
  employeeSearchTerm = signal('');
  isEmployeesDropdownOpen = signal(false);

  filteredEmployees = computed(() => {
    const term = this.employeeSearchTerm().toLowerCase();
    return this.employeesList().filter((emp) => {
      const name = emp.fullName || emp.full_name || emp.name || emp.email || '';
      return name.toLowerCase().includes(term);
    });
  });

  onEmployeeInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.employeeSearchTerm.set(value);
    this.newFeedingData.fedById = null;
  }

  selectEmployee(emp: any) {
    const name = emp.fullName || emp.full_name || emp.name || emp.email || `Працівник ${emp.userId}`;
    this.employeeSearchTerm.set(name);
    this.newFeedingData.fedById = emp.userId;
    this.isEmployeesDropdownOpen.set(false);
  }

  loadEmployees() {
    this.userService.getUsersByRole(2).subscribe({
      next: (res: any) => {
        const employees = res.items ? res.items : res;
        this.employeesList.set(employees || []);
      },
      error: (err) => console.error(err),
    });
  }

  closeEmployeesDropdown() {
    setTimeout(() => this.isEmployeesDropdownOpen.set(false), 200);
  }

  animalSearchTerm = signal('');
  isAnimalsDropdownOpen = signal(false);
  animalsList = signal<any[]>([]);

  onAnimalInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.animalSearchTerm.set(value);
    this.newFeedingData.animalId = null;
    this.animalService.getAnimals(1, 10, value).subscribe({
      next: (res: any) => {
        this.animalsList.set(res.items);
      },
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

  foodSearchTerm = signal('');
  isFoodDropdownOpen = signal(false);
  foodList = signal<any[]>([]);

  loadFoods(searchTerm: string = '') {
    this.inventoryService.getItems(1, 50, searchTerm).subscribe({
      next: (res: any) => {
        this.foodList.set(res.items || []);
      },
      error: (err) => console.error(err),
    });
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

  ngOnInit() {
    this.loadTransactions();
    this.loadCategories();
    this.loadFeedingLogs();
    this.loadUsersActivity();
  }

  switchTab(tabName: string) {
    this.activeTab.set(tabName);
    this.currentPage.set(1);

    if (tabName === 'finance') {
      this.loadTransactions();
    } else if (tabName === 'feeding') {
      this.loadFeedingLogs();
    } else if (tabName === 'users') {
      this.loadUsersActivity();
    }
  }

  // МЕТОДИ ФІЛЬТРАЦІЇ ФІНАНСІВ
  setFinanceFilter(isIncome: boolean) {
    this.financeTypeFilter.set(isIncome);
    this.currentPage.set(1);
  }

  clearFinanceFilter() {
    this.financeTypeFilter.set(null);
    this.currentPage.set(1);
  }

  // МЕТОДИ ФІЛЬТРАЦІЇ КОРИСТУВАЧІВ
  setActivityFilter(filterType: 'type' | 'user', value: string) {
    if (filterType === 'type') {
      this.activityTypeFilter.set(value);
    } else {
      this.activityUserFilter.set(value);
    }
    this.currentPage.set(1);
  }

  clearActivityFilter(filterType: 'type' | 'user') {
    if (filterType === 'type') {
      this.activityTypeFilter.set(null);
    } else {
      this.activityUserFilter.set(null);
    }
    this.currentPage.set(1);
  }

  clearAllActivityFilters() {
    this.activityTypeFilter.set(null);
    this.activityUserFilter.set(null);
    this.currentPage.set(1);
  }

  loadTransactions() {
    const filters = {
      searchTerm: this.searchTerm(),
      fromDate: this.fromDate(),
      toDate: this.toDate(),
    };

    this.transactionService.getJournal(this.currentPage(), this.pageSize(), filters).subscribe({
      next: (res: any) => {
        this.financeLogs.set(res.items || []);
        this.financeTotalCount.set(res.totalCount || 0);
      },
      error: (err) => console.error(err),
    });
  }

  loadCategories() {
    this.transactionService.getCategories(1, 100).subscribe({
      next: (res: any) => {
        this.categories.set(res.items || []);
      },
      error: (err) => console.error(err),
    });
  }

  loadUsersActivity() {
    this.http.get<any[]>('http://localhost:5036/api/user-activity').subscribe({
      next: (res: any) => {
        const logs = Array.isArray(res) ? res : res.items || res.$values || [];

        const formattedLogs = logs.map((log: any) => {
          const activityDate = new Date(log.date);

          let typeUa = log.type;
          if (log.type === 'AnimalArrival') typeUa = 'Нова тварина';
          if (log.type === 'AnimalAdoption') typeUa = 'Прилаштування';
          if (log.type === 'UserRegistration') typeUa = 'Новий користувач';
          if (log.type === 'UserProfileUpdate') typeUa = 'Оновлення профілю';
          if (log.type === 'AnimalUpdate') typeUa = 'Оновлення тварини';

          return {
            id: Math.random(),
            rawDate: activityDate,
            time: activityDate.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
            date: activityDate.toLocaleDateString('uk-UA'),
            type: typeUa,
            description: log.description,
            user: log.user || 'Система',
          };
        });
        this.usersLogs.set(formattedLogs);
      },
      error: (err) => console.error('Помилка завантаження активності:', err),
    });
  }

  loadFeedingLogs() {
    this.http.get<any>('http://localhost:5036/api/feeding-log/recent').subscribe({
      next: (res) => {
        const logs = Array.isArray(res) ? res : res.items || res.$values || [];

        const formattedLogs = logs.map((log: any) => {
          const fedDate = new Date(log.fedAt);
          return {
            id: log.id,
            rawDate: fedDate,
            time: fedDate.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
            date: fedDate.toLocaleDateString('uk-UA'),
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

  onMainSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm.set(term);
    this.currentPage.set(1);

    if (this.activeTab() === 'finance') {
      this.loadTransactions();
    }
  }

  onDateChange() {
    this.currentPage.set(1);

    if (this.activeTab() === 'finance') {
      this.loadTransactions();
    }
  }

  onPageChange(newPage: number) {
    this.currentPage.set(newPage);
    if (this.activeTab() === 'finance') {
      this.loadTransactions();
    }
  }

  loadMoreCategories() {
    if (this.categoriesCurrentPage() < this.categoriesTotalPages()) {
      this.categoriesCurrentPage.update((p) => p + 1);
    }
  }

  filterByPerson(personName: string) {
    if (!personName) return;
    this.searchTerm.set(personName);
    this.currentPage.set(1);
    this.loadTransactions();
  }

  onCategoryInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.categorySearchTerm.set(value);
    this.newTransactionData.categoryName = value;
    this.loadCategories();
  }

  selectCategory(cat: any) {
    this.categorySearchTerm.set(cat.name);
    this.newTransactionData.categoryName = cat.name;
    this.isCategoriesDropdownOpen.set(false);
  }

  closeCategoriesDropdown() {
    setTimeout(() => {
      this.isCategoriesDropdownOpen.set(false);
    }, 200);
  }

  openAddModal() {
    this.isEditMode.set(false);
    this.editingTransactionId.set(null);
    this.selectedTypeForAdd.set('finance');

    this.newTransactionData = {
      isIncome: false,
      categoryId: null,
      categoryName: '',
      amount: null,
      description: '',
    };
    this.categorySearchTerm.set('');

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

    this.loadEmployees();
    this.loadFoods();

    this.isAddModalOpen.set(true);
  }

  openEditModal(log: any) {
    this.isEditMode.set(true);
    this.editingTransactionId.set(log.id);
    this.selectedTypeForAdd.set('finance');

    this.newTransactionData = {
      isIncome: log.isIncome,
      categoryId: log.categoryId || null,
      categoryName: log.categoryName || '',
      amount: log.amount,
      description: log.description || '',
    };
    this.categorySearchTerm.set(log.categoryName || '');

    this.isAddModalOpen.set(true);
  }

  saveTransaction() {
    if (this.selectedTypeForAdd() === 'finance') {
      const request = this.isEditMode()
        ? this.transactionService.updateTransaction(
          this.editingTransactionId()!,
          this.newTransactionData,
        )
        : this.transactionService.createTransaction(this.newTransactionData);

      request.subscribe({
        next: () => {
          this.isAddModalOpen.set(false);
          this.isEditMode.set(false);
          this.editingTransactionId.set(null);

          this.loadTransactions();
          if (this.newTransactionData.categoryName) this.loadCategories();

          this.newTransactionData = {
            isIncome: false,
            categoryId: null,
            categoryName: '',
            amount: null,
            description: '',
          };
          this.categorySearchTerm.set('');
        },
        error: (err) => console.error(err),
      });
    } else if (this.selectedTypeForAdd() === 'feeding') {
      this.http.post('http://localhost:5036/api/feeding-log', this.newFeedingData).subscribe({
        next: () => {
          this.isAddModalOpen.set(false);

          this.animalSearchTerm.set('');
          this.foodSearchTerm.set('');
          this.newFeedingData = {
            animalId: null,
            foodTypeId: null,
            amount: null,
            fedAt: this.getCurrentDateTimeLocal(),
            fedById: null,
          };
          this.loadFeedingLogs();
        },
        error: (err) => console.error(err),
      });
    }
  }
}
