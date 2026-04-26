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
import { authGuard, permissionGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },

  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardPageComponent,
        canActivate: [permissionGuard('ViewDashboard')],
      },
      {
        path: 'animals',
        component: AnimalsPageComponent,
        canActivate: [permissionGuard('ViewAnimals')],
      },
      {
        path: 'medicine',
        component: MedicinePageComponent,
        canActivate: [permissionGuard('ViewMedicalExams')],
      },
      {
        path: 'inventory',
        component: InventoryPageComponent,
        canActivate: [permissionGuard('ReplenishFood')],
      },
      {
        path: 'journals',
        component: JournalsPageComponent,
        canActivate: [permissionGuard('ViewFinanceJournal')],
      },
      {
        path: 'users',
        component: UsersPageComponent,
        canActivate: [permissionGuard('EditUser')],
      },
      {
        path: 'reports',
        component: ReportsPageComponent,
        canActivate: [permissionGuard('GenerateReports')],
      },
      {
        path: 'alerts',
        component: AlertsPageComponent,
        canActivate: [permissionGuard('ViewAlerts')],
      },
      {
        path: 'user-profile',
        component: ProfilePageComponent,
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
