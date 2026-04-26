import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  DashboardService,
  DashboardStats,
  SystemAlert,
  AlertsResponse,
} from '../../core/service/dashboard.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  // СТАН ДОДАТКА (Signals)
  stats = signal<DashboardStats | null>(null);
  alerts = signal<AlertsResponse | null>(null);
  isLoading = signal(true);
  statsError = signal(false);

  // АВТОМАТИЧНІ ОБЧИСЛЕННЯ (Оновлюються миттєво при зміні alerts)
  allAlerts = computed(() => {
    const a = this.alerts();
    if (!a) return [];
    return [...a.auto, ...a.manual].sort(
      (x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime(),
    );
  });

  criticalCount = computed(
    () => this.allAlerts().filter((a) => a.severity === 'danger' && !a.isDone).length,
  );

  warningCount = computed(
    () => this.allAlerts().filter((a) => a.severity === 'warning' && !a.isDone).length,
  );

  greeting = this.getGreeting();

  ngOnInit() {
    // 1. Завантажуємо загальну статистику
    this.loadAll();

    // 2. Даємо команду сервісу завантажити алерти
    this.dashboardService.loadInitialAlerts();

    // 3. ПІДПИСКА НА SIGNALR: Будь-які зміни з бекенду автоматично оновлять наш Сигнал
    this.dashboardService.alerts$.subscribe((response) => {
      this.alerts.set(response);
    });
  }

  loadAll() {
    this.isLoading.set(true);
    this.statsError.set(false);

    // Тепер тут залишається ТІЛЬКИ завантаження статистики
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.statsError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  markDone(alert: SystemAlert) {
    if (!alert.id) return;

    // Оскільки ми додали tap() у сервісі, він сам оновить alerts$,
    // а alerts$ автоматично оновить наш компонент. Магія!
    this.dashboardService.markAlertDone(alert.id).subscribe();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  }

  private getGreeting(): string {
    const h = new Date().getHours();
    if (h < 6) return 'Доброї ночі';
    if (h < 12) return 'Доброго ранку';
    if (h < 18) return 'Доброго дня';
    return 'Доброго вечора';
  }

  getAlertIcon(type: string): string {
    const icons: Record<string, string> = {
      feeding: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 5v5l3 3',
      vaccination: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      inventory: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      system: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      medical:
        'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
      default: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    };
    return icons[type] || icons['default'];
  }
}
