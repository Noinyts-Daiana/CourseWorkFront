import { Component, ViewChild, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicalExamsTabComponent } from './components/medical-exams-tab/medical-exams-tab.component';
import { VaccinationsTabComponent } from './components/vaccinations-tab/vaccinations-tab.component';

@Component({
  selector: 'app-medicine-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MedicalExamsTabComponent, VaccinationsTabComponent],
  templateUrl: './medicine-page.component.html',
  styleUrl: './medicine-page.component.scss',
})
export class MedicinePageComponent {
  searchTerm = signal('');
  activeTab = signal<'vaccines' | 'exams'>('exams');

  @ViewChild(MedicalExamsTabComponent) examsTab!: MedicalExamsTabComponent;
  @ViewChild(VaccinationsTabComponent) vaccinesTab!: VaccinationsTabComponent;

  onMainSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm.set(term);
    this.onSearch();
  }

  onSearch() {
    if (this.activeTab() === 'exams' && this.examsTab) {
      this.examsTab.loadMedicalExams();
    } else if (this.activeTab() === 'vaccines' && this.vaccinesTab) {
      this.vaccinesTab.loadVaccinations();
    }
  }

  setTab(tab: 'vaccines' | 'exams') {
    this.activeTab.set(tab);
    setTimeout(() => this.onSearch(), 0);
  }

  openAddVaccine() {
    this.setTab('vaccines');
    setTimeout(() => this.vaccinesTab?.openAddVaccineModal(), 0);
  }

  openAddExam() {
    this.setTab('exams');
    setTimeout(() => this.examsTab?.openAddExamModal(), 0);
  }
}
