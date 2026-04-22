import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceJournalComponent } from './components/finance-tab/finance-journal.component';
import { FeedingJournalComponent } from './components/feeding-tab/feeding-journal.component';
import { UsersActivityJournalComponent } from './components/users-tab/users-activity-journal.component';

@Component({
  selector: 'app-journals-page',
  standalone: true,
  imports: [
    CommonModule,
    FinanceJournalComponent,
    FeedingJournalComponent,
    UsersActivityJournalComponent,
  ],
  templateUrl: './journals-page.component.html',
  styleUrl: './journals-page.component.scss',
})
export class JournalsPageComponent {
  activeTab = signal<'finance' | 'feeding' | 'users'>('finance');

  switchTab(tab: 'finance' | 'feeding' | 'users') {
    this.activeTab.set(tab);
  }
}
