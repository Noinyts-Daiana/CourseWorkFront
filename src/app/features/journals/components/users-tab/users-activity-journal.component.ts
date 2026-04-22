import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-users-activity-journal',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './users-activity-journal.component.html',
  styleUrl: '../../journals-page.component.scss',
})
export class UsersActivityJournalComponent implements OnInit {
  private http = inject(HttpClient);

  searchTerm = signal('');
  fromDate = signal('');
  toDate = signal('');
  selectedUserFilter = signal('');
  activityTypeFilter = signal<string | null>(null);

  currentPage = signal(1);
  pageSize = signal(10);
  usersLogs = signal<any[]>([]);

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
    if (this.selectedUserFilter()) {
      const user = this.selectedUserFilter().toLowerCase();
      logs = logs.filter((l) => (l.user || '').toLowerCase().includes(user));
    }

    return logs.filter((log) => {
      let matchesDate = true;
      if (fromVal && log.rawDate < fromVal) matchesDate = false;
      if (toVal && log.rawDate > toVal) matchesDate = false;

      let matchesSearch = true;
      if (term) {
        matchesSearch =
          (log.description?.toLowerCase() || '').includes(term) ||
          (log.user?.toLowerCase() || '').includes(term);
      }
      return matchesDate && matchesSearch;
    });
  });

  totalCount = computed(() => this.filteredUsersLogs().length);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);

  paginatedUsersLogs = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredUsersLogs().slice(start, start + this.pageSize());
  });

  ngOnInit() {
    this.loadUsersActivity();
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

  onMainSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  onDateChange() {
    this.currentPage.set(1);
  }

  setActivityFilter(value: string) {
    this.activityTypeFilter.set(value);
    this.currentPage.set(1);
  }

  filterByPerson(personName: string) {
    if (!personName) return;
    this.selectedUserFilter.set(personName);
    this.currentPage.set(1);
  }

  clearActivityFilter() {
    this.activityTypeFilter.set(null);
    this.currentPage.set(1);
  }

  clearUserFilter() {
    this.selectedUserFilter.set('');
    this.currentPage.set(1);
  }

  clearAllFilters() {
    this.activityTypeFilter.set(null);
    this.selectedUserFilter.set('');
    this.searchTerm.set('');
    this.fromDate.set('');
    this.toDate.set('');
    this.currentPage.set(1);
  }

  onPageChange(newPage: number) {
    this.currentPage.set(newPage);
  }
}
