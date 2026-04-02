import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AdminLayoutComponent } from './core/components/admin-layout/admin-layout.component';
import { DashboardPageComponent } from './features/dashboard/dashboard-page.component';
import { AnimalsPageComponent } from './features/animals/animals-page.component';
import { InventoryPageComponent } from './features/inventory/inventory-page.component';
import { MedicinePageComponent } from './features/medicine/medicine-page.component';
import { JournalsPageComponent } from './features/journals/journals-page.component';
import { UsersPageComponent } from './features/users/users-page.component';
import { ProfilePageComponent } from './features/profile/profile-page.component';

export const routes: Routes = [
  // 1. СТОРІНКИ БЕЗ САЙДБАРУ
  {
    path: '',
    component: HomeComponent, // Відкривається по дефолту (без сайдбара)
  },

  // 2. СТОРІНКИ З САЙДБАРОМ (згруповані в children)
  {
    path: '',
    component: AdminLayoutComponent, // Це наша обгортка
    children: [
      // Оскільки шлях '' вже зайнятий Home, давай дамо Дашборду свою адресу
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'animals', component: AnimalsPageComponent },
      { path: 'inventory', component: InventoryPageComponent },
      { path: 'medicine', component: MedicinePageComponent },
      { path: 'journals', component: JournalsPageComponent },
      { path: 'users', component: UsersPageComponent },
      { path: 'user-profile', component: ProfilePageComponent },
      // Сюди ж потім додаш inventory, medicine і т.д.
    ],
  },

  // 3. Запасний шлях (якщо ввели якусь дурницю)
  { path: '**', redirectTo: '' },
];
