import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../../core/service/transaction.service';
import { UserService } from '../../../../core/service/user.service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';


@Component({
  selector: 'app-finance-journal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, PaginationComponent, ConfirmModalComponent],
  templateUrl: './finance-journal.component.html',
  styleUrl: '../../journals-page.component.scss',
})
export class FinanceJournalComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private userService = inject(UserService);

  searchTerm = signal('');
  fromDate = signal('');
  toDate = signal('');
  selectedUserFilter = signal('');
  financeTypeFilter = signal<boolean | null>(null);

  currentPage = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);

  financeLogs = signal<any[]>([]);
  categories = signal<any[]>([]);
  employeesList = signal<any[]>([]);

  isAddModalOpen = signal(false);
  isEditMode = signal(false);
  editingId = signal<number | null>(null);

  categorySearchTerm = signal('');
  isCategoriesDropdownOpen = signal(false);
  categoriesCurrentPage = signal(1);
  categoriesTotalPages = signal(1);

  newTransactionData = {
    isIncome: false,
    categoryId: null as number | null,
    categoryName: '',
    amount: null as number | null,
    description: '',
  };

  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);

  // --- СИГНАЛИ ДЛЯ МОДАЛКИ ПІДТВЕРДЖЕННЯ ВИДАЛЕННЯ ---
  isConfirmOpen = signal(false);
  confirmConfig = signal({
    title: '',
    message: '',
    btnText: 'Видалити',
    btnClass: 'btn-danger',
    action: () => {},
  });

  // Універсальний метод виклику модалки підтвердження
  openConfirm(title: string, message: string, btnText: string, btnClass: string, action: () => void) {
    this.confirmConfig.set({ title, message, btnText, btnClass, action });
    this.isConfirmOpen.set(true);
  }

  deleteTransaction(id: number) {
    this.openConfirm(
      'Видалити транзакцію?',
      'Ви впевнені, що хочете назавжди видалити цей фінансовий запис? Цю дію неможливо скасувати.',
      'Видалити',
      'btn-danger',
      () => {
        this.transactionService.deleteTransaction(id).subscribe({
          next: () => {
            this.isConfirmOpen.set(false);
            this.loadTransactions();
          },
          error: (err) => {
            console.error('Помилка при видаленні:', err);
            this.isConfirmOpen.set(false);
          }
        });
      }
    );
  }
  ngOnInit() {
    this.loadEmployees();
    this.loadTransactions();
    this.loadCategories();
  }

  loadTransactions() {
    const filters = {
      searchTerm: this.selectedUserFilter() || this.searchTerm(),
      fromDate: this.fromDate(),
      toDate: this.toDate(),
    };

    this.transactionService.getJournal(this.currentPage(), this.pageSize(), filters).subscribe({
      next: (res: any) => {
        this.financeLogs.set(res.items || []);
        this.totalCount.set(res.totalCount || 0);
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

  loadCategories() {
    this.transactionService.getCategories(1, 100).subscribe({
      next: (res: any) => {
        this.categories.set(res.items || []);
      },
    });
  }

  filteredFinanceLogs = computed(() => {
    let logs = this.financeLogs();
    if (this.financeTypeFilter() !== null) {
      logs = logs.filter((log) => log.isIncome === this.financeTypeFilter());
    }

    const fromVal = this.fromDate() ? new Date(this.fromDate()) : null;
    const toVal = this.toDate() ? new Date(this.toDate()) : null;

    if (fromVal) fromVal.setHours(0, 0, 0, 0);
    if (toVal) toVal.setHours(23, 59, 59, 999);

    return logs.filter((log) => {
      const logDate = new Date(log.transactionDate);

      let matchesDate = true;
      if (fromVal && logDate < fromVal) matchesDate = false;
      if (toVal && logDate > toVal) matchesDate = false;

      return matchesDate;
    });
  });
  onCategoryInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.categorySearchTerm.set(value);
    this.newTransactionData.categoryName = value;
    this.newTransactionData.categoryId = null;

    this.loadCategories();
  }

  selectCategory(cat: any) {
    this.categorySearchTerm.set(cat.name);
    this.newTransactionData.categoryName = cat.name;

    // ДОДАНО: Записуємо ID вибраної категорії з випадаючого списку
    this.newTransactionData.categoryId = cat.id;

    this.isCategoriesDropdownOpen.set(false);
  }

  onMainSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.selectedUserFilter.set('');
    this.currentPage.set(1);
    this.loadTransactions();
  }

  onUserFilterSelect(event: Event) {
    this.selectedUserFilter.set((event.target as HTMLSelectElement).value);
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadTransactions();
  }

  isUserInList(name: string): boolean {
    return this.employeesList().some((emp) => (emp.fullName || emp.email) === name);
  }

  filterByPerson(personName: string) {
    if (!personName) return;
    this.selectedUserFilter.set(personName);
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadTransactions();
  }

  clearUserFilter() {
    this.selectedUserFilter.set('');
    this.currentPage.set(1);
    this.loadTransactions();
  }

  onDateChange() {
    this.currentPage.set(1);
    this.loadTransactions();
  }

  setFinanceFilter(isIncome: boolean) {
    this.financeTypeFilter.set(isIncome);
    this.currentPage.set(1);
  }

  clearFinanceFilter() {
    this.financeTypeFilter.set(null);
    this.currentPage.set(1);
  }

  clearAllFilters() {
    this.financeTypeFilter.set(null);
    this.selectedUserFilter.set('');
    this.searchTerm.set('');
    this.fromDate.set('');
    this.toDate.set('');
    this.currentPage.set(1);
    this.loadTransactions();
  }

  onPageChange(newPage: number) {
    this.currentPage.set(newPage);
    this.loadTransactions();
  }

  // --- Модалка та Збереження ---
  openAddModal() {
    this.isEditMode.set(false);
    this.editingId.set(null);
    this.newTransactionData = {
      isIncome: false,
      categoryId: null,
      categoryName: '',
      amount: null,
      description: '',
    };
    this.categorySearchTerm.set('');
    this.isAddModalOpen.set(true);
  }

  openEditModal(log: any) {
    this.isEditMode.set(true);
    this.editingId.set(log.id);
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
    const request = this.isEditMode()
      ? this.transactionService.updateTransaction(this.editingId()!, this.newTransactionData)
      : this.transactionService.createTransaction(this.newTransactionData);

    request.subscribe({
      next: () => {
        this.isAddModalOpen.set(false);
        this.loadTransactions();
        if (this.newTransactionData.categoryName) this.loadCategories();
      },
      error: (err) => console.error(err),
    });
  }

  closeCategoriesDropdown() {
    setTimeout(() => this.isCategoriesDropdownOpen.set(false), 200);
  }

  loadMoreCategories() {
    if (this.categoriesCurrentPage() < this.categoriesTotalPages()) {
      this.categoriesCurrentPage.update((p) => p + 1);
    }
  }
}
