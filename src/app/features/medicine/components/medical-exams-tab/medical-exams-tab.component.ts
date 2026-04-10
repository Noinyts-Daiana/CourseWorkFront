import { Component, inject, signal, computed, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { AnimalService } from '../../../../core/service/animal.service';
import { MedicalExamsService } from '../../../../core/service/medical-exams.service';
import { MedicalRecord } from '../../models/medicine.models';

@Component({
  selector: 'app-medical-exams-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, PaginationComponent],
  templateUrl: './medical-exams-tab.component.html',
  styleUrl: '../../medicine-page.component.scss',
})
export class MedicalExamsTabComponent implements OnInit {
  @Input() searchQuery: string = '';

  private animalService = inject(AnimalService);
  private medicalExamsService = inject(MedicalExamsService);

  isAddModalOpen = signal(false);
  isEditExamModalOpen = signal(false);
  selectedRecord: MedicalRecord | null = null;

  animals = signal<any[]>([]);
  medicalExams = signal<any[]>([]);
  currentPage = signal(1);
  pageSize = signal(9);
  totalCount = signal(0);

  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);

  newExamRecord = {
    animalId: null as number | null,
    examDate: '',
    temperature: null as number | null,
    weight: null as number | null,
    notes: '',
  };
  editExamData = {
    id: 0,
    animalId: null as number | null,
    examDate: '',
    temperature: null as number | null,
    weight: null as number | null,
    notes: '',
  };

  ngOnInit() {
    this.loadMedicalExams();
  }

  loadMedicalExams() {
    this.medicalExamsService
      .getMedicalExams(this.currentPage(), this.pageSize(), this.searchQuery)
      .subscribe({
        next: (response: any) => {
          this.medicalExams.set(response.items || []);
          this.totalCount.set(response.totalCount || 0);
          this.currentPage.set(response.pageNumber || 1);
        },
      });
  }

  onPageChange(newPage: number) {
    this.currentPage.set(newPage);
    this.loadMedicalExams();
  }

  openAddExamModal() {
    this.isAddModalOpen.set(true);
    this.animalService.getAnimals().subscribe({
      next: (response: any) => this.animals.set(response.items || []),
    });
  }

  onAddRecord() {
    this.medicalExamsService.addMedicalExams(this.newExamRecord).subscribe({
      next: () => {
        this.isAddModalOpen.set(false);
        this.newExamRecord = {
          animalId: null,
          examDate: '',
          temperature: null,
          weight: null,
          notes: '',
        };
        this.loadMedicalExams();
      },
    });
  }

  openEditExamModal(record: MedicalRecord) {
    this.editExamData = {
      id: record.id || 0,
      animalId: record.animalId || null,
      examDate: record.examDate ? record.examDate.split('T')[0] : '',
      temperature: record.temperature || record.temp || null,
      weight: record.weight || null,
      notes: record.notes || '',
    };

    if (this.animals().length === 0) {
      this.animalService.getAnimals().subscribe({
        next: (response: any) => this.animals.set(response.items || []),
      });
    }
    this.isEditExamModalOpen.set(true);
  }

  onSaveEditExams() {
    const dataToSend = {
      animalId: this.editExamData.animalId,
      examDate: this.editExamData.examDate,
      temperature: this.editExamData.temperature,
      weight: this.editExamData.weight,
      notes: this.editExamData.notes,
    };

    this.medicalExamsService.editMedicalExams(this.editExamData.id, dataToSend).subscribe({
      next: () => {
        this.isEditExamModalOpen.set(false);
        this.loadMedicalExams();
      },
    });
  }
}
