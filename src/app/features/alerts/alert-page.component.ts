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


  alerts = signal<SystemAlertDto[]>([]);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(15);
  isLoading = signal(false);

  showDone = signal<boolean>(false);
  searchTerm = signal('');
  typeFilter = signal('');
  severityFilter = signal('');

  isModalOpen = signal(false);
  newAlert = { type: 'System', severity: 'Medium', message: '' };

  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
      pages.push(i);
    }
    return pages;
  });

  filteredAlerts = computed(() => {
    let list = this.alerts();
    const term = this.searchTerm().toLowerCase();
    const type = this.typeFilter();
    const sev = this.severityFilter();
    if (term) list = list.filter((a) => a.message?.toLowerCase().includes(term));
    if (type) list = list.filter((a) => a.type === type);
    if (sev) list = list.filter((a) => (a as any).severity === sev);
    return list;
  });

  ngOnInit() {
    this.loadAlerts();
  }

  loadAlerts() {
    this.isLoading.set(true);
    this.alertService.getAll(this.showDone(), this.currentPage(), this.pageSize()).subscribe({
      next: (res) => {
        this.alerts.set(res.items);
        this.totalCount.set(res.total);
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
    this.loadAlerts();
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
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
      Critical: 'sev-critical',
      High: 'sev-high',
      Medium: 'sev-medium',
      Low: 'sev-low',
    };
    return map[severity] ?? 'sev-low';
  }

  getSeverityLabel(severity: string): string {
    const map: Record<string, string> = {
      Critical: 'Критичний',
      High: 'Високий',
      Medium: 'Середній',
      Low: 'Низький',
    };
    return map[severity] ?? severity ?? '—';
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      LowStock: 'type-stock',
      OverdueVaccination: 'type-vaccine',
      Finance: 'type-finance',
      System: 'type-system',
      Other: 'type-other',
    };
    return map[type] ?? 'type-other';
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      LowStock: 'Низький запас',
      OverdueVaccination: 'Щеплення',
      Finance: 'Фінанси',
      System: 'Система',
      Other: 'Інше',
    };
    return map[type] ?? type ?? '—';
  }
}
