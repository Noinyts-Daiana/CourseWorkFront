import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { AnimalService } from '../../core/service/AnimalService';
import { MedicalExamService } from '../../core/service/MedicalExamService';

export interface MedicalRecord {
  id?: number;
  animalId?: number;
  animalName?: string;
  examDate?: string;
  temperature?: number;

  patientName?: string;
  date?: string;
  temp?: number;
  weight?: number;
  notes?: string;
}

export interface VaccineRecord {
  patientName: string;
  date: string;
  vaccineName: string;
  nextDate: string;
}

@Component({
  selector: 'app-medicine-page',
  standalone: true,
  imports: [CommonModule, ModalComponent, FormsModule, PaginationComponent],
  templateUrl: './medicine-page.component.html',
  styleUrl: './medicine-page.component.scss',
})
export class MedicinePageComponent implements OnInit {
  private animalService = inject(AnimalService);
  private medicalExamsService = inject(MedicalExamService);

  searchQuery: string = '';
  activeTab: 'vaccines' | 'exams' = 'exams';

  isAddModalOpen = signal(false);
  isEditExamModalOpen = signal(false);
  isVaccineModalOpen = false;
  isEditVaccineModalOpen = false;

  selectedRecord: MedicalRecord | null = null;
  editingVaccineRecord: VaccineRecord | null = null;

  animals = signal<any[]>([]);
  medicalExams = signal<any[]>([]);
  currentPage = signal(1);
  pageSize = signal(9);
  totalCount = signal(0);

  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);

  vaccineRecords: VaccineRecord[] = [
    {
      patientName: 'Барон',
      date: '12.08.2023',
      vaccineName: 'Комплексна (Nobivac)',
      nextDate: '12.08.2024',
    },
    {
      patientName: 'Сніжок',
      date: '05.09.2023',
      vaccineName: 'Сказ (Rabisin)',
      nextDate: '05.09.2024',
    },
  ];

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
        error: (err) => console.error('Помилка завантаження:', err),
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
      error: (err) => console.error('Помилка при створенні:', err),
    });
  }


  openEditExamModal(record: MedicalRecord) {
    this.editExamData = {
      id: record.id || 0,
      animalId: record.animalId || null,
      examDate: record.examDate ? record.examDate.split('T')[0] : '', // форматуємо дату для input type="date"
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
      error: (err) => console.error('Помилка при оновленні:', err),
    });
  }


  openAddVaccineModal() {
    this.isVaccineModalOpen = true;
  }

  openEditVaccineModal(vaccine: VaccineRecord) {
    this.editingVaccineRecord = vaccine;
    this.isEditVaccineModalOpen = true;
  }
}
