import { Component, ViewChild } from '@angular/core';
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
  searchQuery: string = '';
  activeTab: 'vaccines' | 'exams' = 'exams';

  @ViewChild(MedicalExamsTabComponent) examsTab!: MedicalExamsTabComponent;
  @ViewChild(VaccinationsTabComponent) vaccinesTab!: VaccinationsTabComponent;

  onSearch() {
    if (this.activeTab === 'exams' && this.examsTab) {
      this.examsTab.loadMedicalExams();
    } else if (this.activeTab === 'vaccines' && this.vaccinesTab) {
      this.vaccinesTab.loadVaccinations();
    }
  }

  openAddVaccine() {
    this.activeTab = 'vaccines';
    setTimeout(() => this.vaccinesTab?.openAddVaccineModal(), 0);
  }

  openAddExam() {
    this.activeTab = 'exams';
    setTimeout(() => this.examsTab?.openAddExamModal(), 0);
  }
}
