import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService, ReportType, ReportFormat } from '../../core/service/report.service';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-page.component.html',
  styleUrl: './report-page.component.scss',
})
export class ReportsPageComponent {
  private reportService = inject(ReportService);

  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  financeFrom = signal('');
  financeTo = signal('');

  private readonly fileNames: Record<ReportType, string> = {
    animals: 'animals_report',
    finance: 'finance_report',
    medical: 'medical_report',
    inventory: 'inventory_report',
    full: 'shelter_full_export',
  };

  private readonly extensions: Record<ReportFormat, string> = {
    csv: '.csv',
    xml: '.xml',
    json: '.json',
  };

  download(type: ReportType, format: ReportFormat): void {
    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const fromDate = type === 'finance' ? this.financeFrom() : undefined;
    const toDate = type === 'finance' ? this.financeTo() : undefined;

    this.reportService.downloadReport(type, format, fromDate, toDate).subscribe({
      next: (blob) => {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const filename = `${this.fileNames[type]}_${date}${this.extensions[format]}`;
        this.reportService.triggerDownload(blob, filename);
        this.isLoading.set(false);
        this.successMessage.set(`Файл "${filename}" успішно завантажено.`);
        setTimeout(() => this.successMessage.set(''), 4000);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
        this.errorMessage.set('Помилка при формуванні звіту. Спробуйте ще раз.');
        setTimeout(() => this.errorMessage.set(''), 5000);
      },
    });
  }
}
