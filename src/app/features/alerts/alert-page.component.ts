import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemAlertService, SystemAlertDto } from '../../core/service/system-alert.system';

@Component({
  selector: 'app-alerts-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './alert-page.component.html',
  styleUrl: './alert-page.component.scss',
})
export class AlertsPageComponent implements OnInit {
  private alertService = inject(SystemAlertService);

  // Всі дані з сервера (без фільтрів)
  allAlerts = signal<SystemAlertDto[]>([]);
  isLoading = signal(false);

  // Фільтри
  showDone = signal<boolean>(false);
  searchTerm = signal('');
  typeFilter = signal('');
  severityFilter = signal('');

  // Пагінація на клієнті
  currentPage = signal(1);
  pageSize = 15;

  isModalOpen = signal(false);
  newAlert = { type: 'System', severity: 'Medium', message: '' };

  // Фільтрований список (всі сторінки)
  filteredAlerts = computed(() => {
    let list = this.allAlerts();
    const term = this.searchTerm().toLowerCase();
    const type = this.typeFilter();
    const sev = this.severityFilter();
    if (term) list = list.filter((a) => a.message?.toLowerCase().includes(term));
    if (type) list = list.filter((a) => a.type?.toLowerCase() === type.toLowerCase());
    if (sev) list = list.filter((a) => a.severity?.toLowerCase() === sev.toLowerCase());
    return list;
  });

  totalCount = computed(() => this.filteredAlerts().length);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize) || 1);

  // Поточна сторінка після фільтрації
  pagedAlerts = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    return this.filteredAlerts().slice(start, start + this.pageSize);
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
      pages.push(i);
    }
    return pages;
  });

  ngOnInit() {
    this.loadAlerts();
  }

  loadAlerts() {
    this.isLoading.set(true);
    this.alertService.getAll(this.showDone(), 1, 1000).subscribe({
      next: (res) => {
        this.allAlerts.set(res.items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  setTab(done: boolean) {
    this.showDone.set(done);
    this.currentPage.set(1);
    this.loadAlerts();
  }

  changePage(page: number) {
    this.currentPage.set(page);
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  onFilterChange() {
    this.currentPage.set(1);
  }

  markDone(id: number) {
    this.alertService.markDone(id).subscribe(() => this.loadAlerts());
  }

  deleteAlert(id: number) {
    this.alertService.delete(id).subscribe(() => this.loadAlerts());
  }

  openCreateModal() {
    this.newAlert = { type: 'System', severity: 'Medium', message: '' };
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  createAlert() {
    if (!this.newAlert.message.trim()) return;
    this.alertService
      .create({ type: this.newAlert.type, message: this.newAlert.message })
      .subscribe({
        next: () => {
          this.closeModal();
          this.loadAlerts();
        },
      });
  }

  getSeverityClass(severity: string): string {
    const map: Record<string, string> = {
      danger: 'sev-critical',
      critical: 'sev-critical',
      warning: 'sev-medium',
      medium: 'sev-medium',
      high: 'sev-high',
      info: 'sev-low',
      low: 'sev-low',
    };
    return map[severity?.toLowerCase()] ?? 'sev-low';
  }

  getSeverityLabel(severity: string): string {
    const map: Record<string, string> = {
      danger: 'Критичний',
      critical: 'Критичний',
      warning: 'Попередження',
      medium: 'Середній',
      high: 'Високий',
      info: 'Інформація',
      low: 'Низький',
    };
    return map[severity?.toLowerCase()] ?? severity ?? '—';
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      inventory: 'type-stock',
      medical: 'type-vaccine',
      system: 'type-system',
      adoption: 'type-adoption',
      finance: 'type-finance',
    };
    return map[type?.toLowerCase()] ?? 'type-other';
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      inventory: 'Інвентар',
      medical: 'Медицина',
      system: 'Система',
      adoption: 'Усиновлення',
      finance: 'Фінанси',
    };
    return map[type?.toLowerCase()] ?? type ?? '—';
  }
}
