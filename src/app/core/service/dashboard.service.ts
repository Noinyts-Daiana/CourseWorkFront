import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import * as signalR from '@microsoft/signalr';

export interface DashboardStats {
  animals: { total: number; inShelter: number; adopted: number };
  finance: { balance: number; incomeThisMonth: number; expensesThisMonth: number };
  medical: { upcomingVaccinations: number; overdueVaccinations: number };
  inventory: { lowStockCount: number };
}

export interface SystemAlert {
  id: number | null;
  type: string;
  severity: 'info' | 'warning' | 'danger';
  message: string;
  relatedEntityId: number | null;
  createdAt: string;
  isDone: boolean;
  isAuto: boolean;
}

export interface AlertsResponse {
  auto: SystemAlert[];
  manual: SystemAlert[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  // Твої URL (перевір, щоб порт співпадав з твоїм бекендом)
  private readonly base = 'http://localhost:5036/api/dashboard';
  private readonly hubUrl = 'http://localhost:5036/alerthub';

  // ⚡️ РЕАКТИВНИЙ СТАН: Тут зберігаються всі алерти в реальному часі
  private alertsSubject = new BehaviorSubject<AlertsResponse>({ auto: [], manual: [], total: 0 });

  // Цей Observable слухатиме твій компонент (через subscribe або async pipe)
  public alerts$ = this.alertsSubject.asObservable();

  private hubConnection: signalR.HubConnection | undefined;

  constructor() {
    this.startSignalRConnection();
  }

  // 1. Початкове завантаження алертів (викликай це в ngOnInit компонента)
  loadInitialAlerts(): void {
    this.http.get<AlertsResponse>(`${this.base}/alerts`, { withCredentials: true }).subscribe({
      next: (data) => this.alertsSubject.next(data),
      error: (err) => console.error('Помилка завантаження алертів:', err),
    });
  }

  // 2. Отримання статистики (залишається як було)
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.base}/stats`, { withCredentials: true });
  }

  // 3. Закриття алерта (з миттєвим оновленням UI)
  markAlertDone(id: number): Observable<void> {
    return this.http
      .patch<void>(`${this.base}/alerts/${id}/done`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          // Оптимістичне оновлення: видаляємо алерт з екрану, не чекаючи перезавантаження
          const current = this.alertsSubject.value;
          this.alertsSubject.next({
            auto: current.auto.filter((a) => a.id !== id),
            manual: current.manual.filter((a) => a.id !== id),
            total: current.total - 1,
          });
        }),
      );
  }

  // ==========================================
  // ⚡️ SIGNALR ЛОГІКА (Магія реального часу)
  // ==========================================
  private startSignalRConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect() // Автоматично перепідключається, якщо впаде інтернет
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('🟢 SignalR Підключено до Дашборду!'))
      .catch((err) => console.error('🔴 Помилка підключення SignalR:', err));

    // Слухаємо бекенд: щойно прилетить подія "ReceiveNewAlert"
    this.hubConnection.on('ReceiveNewAlert', (newAlert: SystemAlert) => {
      console.log('🔔 Прилетів новий алерт!', newAlert);

      const current = this.alertsSubject.value;

      // Додаємо новий алерт на самий верх списку
      if (newAlert.isAuto) {
        this.alertsSubject.next({
          ...current,
          auto: [newAlert, ...current.auto],
          total: current.total + 1,
        });
      } else {
        this.alertsSubject.next({
          ...current,
          manual: [newAlert, ...current.manual],
          total: current.total + 1,
        });
      }
    });
  }
}
