import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AdminLayoutComponent } from './core/components/admin-layout/admin-layout.component';
import { DashboardPageComponent } from './features/dashboard/dashboard-page.component';
import { AnimalsPageComponent } from './features/animals/animals-page.component';
import { InventoryPageComponent } from './features/inventory/inventory-page.component';
import { MedicinePageComponent } from './features/medicine/medicine-page.component';
import { JournalsPageComponent } from './features/journals/journals-page.component';
import { UsersPageComponent } from './features/users/users-page.component';
import ProfilePageComponent from './features/profile/profile-page.component';
import { ReportsPageComponent } from './features/report/report-page.component';
import { AlertsPageComponent } from './features/alerts/alert-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },

  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'animals', component: AnimalsPageComponent },
      { path: 'inventory', component: InventoryPageComponent },
      { path: 'medicine', component: MedicinePageComponent },
      { path: 'journals', component: JournalsPageComponent },
      { path: 'users', component: UsersPageComponent },
      { path: 'reports', component: ReportsPageComponent },
      { path: 'alerts', component: AlertsPageComponent },
      { path: 'user-profile', component: ProfilePageComponent },
    ],
  },

  { path: '**', redirectTo: '' },
];
