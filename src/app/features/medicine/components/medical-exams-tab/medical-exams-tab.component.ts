import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { AnimalService } from '../../../../core/service/animal.service';
import { MedicalExamsService } from '../../../../core/service/medical-exams.service';
import { MedicalRecord } from '../../models/medicine.models';

import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-medical-exams-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, PaginationComponent, ConfirmModalComponent],
  templateUrl: './medical-exams-tab.component.html',
  styleUrl: '../../medicine-page.component.scss',
})
export class MedicalExamsTabComponent implements OnInit, OnChanges {
  @Input() searchQuery: string = '';

  private animalService = inject(AnimalService);
  private medicalExamsService = inject(MedicalExamsService);

  // --- СИГНАЛИ ДЛЯ МОДАЛОК ---
  isAddModalOpen = signal(false);
  isEditExamModalOpen = signal(false);
  selectedRecord: MedicalRecord | null = null;

  // --- СИГНАЛИ ДЛЯ МОДАЛКИ ПІДТВЕРДЖЕННЯ ВИДАЛЕННЯ ---
  isConfirmOpen = signal(false);
  confirmConfig = signal({
    title: '',
    message: '',
    btnText: 'Підтвердити',
    btnClass: 'btn-danger',
    action: () => {},
  });

  // --- СИГНАЛИ ДЛЯ ТАБЛИЦІ ТА ПАГІНАЦІЇ ---
  medicalExams = signal<any[]>([]);
  currentPage = signal(1);
  pageSize = signal(9);
  totalCount = signal(0);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);

  // --- СИГНАЛИ ДЛЯ ВИПАДАЙКИ ТВАРИН ---
  animalSearchTerm = signal('');
  isAnimalsDropdownOpen = signal(false);
  animalsList = signal<any[]>([]);

  // --- ДАНІ ФОРМ ---
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

  // Оновлюємо дані, коли змінюється рядок пошуку від батьківського компонента
  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchQuery'] && !changes['searchQuery'].isFirstChange()) {
      this.currentPage.set(1);
      this.loadMedicalExams();
    }
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

  // --- ЛОГІКА ПОШУКОВОЇ ВИПАДАЙКИ ТВАРИН ---
  onAnimalInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.animalSearchTerm.set(value);

    if (this.isAddModalOpen()) this.newExamRecord.animalId = null;
    if (this.isEditExamModalOpen()) this.editExamData.animalId = null;

    // isAdopted = false
    this.animalService.getAnimals(1, 10, value, [], null, null, null, false).subscribe({
      next: (res: any) => this.animalsList.set(res.items || []),
    });
  }

  selectAnimal(animal: any) {
    this.animalSearchTerm.set(animal.name);
    if (this.isAddModalOpen()) this.newExamRecord.animalId = animal.id;
    if (this.isEditExamModalOpen()) this.editExamData.animalId = animal.id;
    this.isAnimalsDropdownOpen.set(false);
  }

  closeAnimalsDropdown() {
    setTimeout(() => this.isAnimalsDropdownOpen.set(false), 200);
  }

  // --- ЛОГІКА ВІДКРИТТЯ МОДАЛОК ---
  openAddExamModal() {
    this.isAddModalOpen.set(true);
    this.animalSearchTerm.set('');
    this.newExamRecord.animalId = null;
    this.animalService.getAnimals(1, 10, '', [], null, null, null, false).subscribe({
      next: (res: any) => this.animalsList.set(res.items || []),
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

    this.animalSearchTerm.set(record.animalName || record.patientName || '');
    this.animalService.getAnimals(1, 10, '', [], null, null, null, false).subscribe({
      next: (res: any) => this.animalsList.set(res.items || []),
    });

    this.isEditExamModalOpen.set(true);
  }

  // --- УНІВЕРСАЛЬНИЙ МЕТОД ПІДТВЕРДЖЕННЯ ---
  openConfirm(
    title: string,
    message: string,
    btnText: string,
    btnClass: string,
    action: () => void,
  ) {
    this.confirmConfig.set({ title, message, btnText, btnClass, action });
    this.isConfirmOpen.set(true);
  }

  // --- CRUD ОПЕРАЦІЇ ---
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

  deleteRecord(id: number) {
    this.openConfirm(
      'Видалити огляд?',
      'Ви впевнені, що хочете видалити цей запис про огляд? Цю дію неможливо скасувати.',
      'Видалити',
      'btn-danger',
      () => {
        // Тут вкажи метод сервісу (наприклад deleteMedicalExams або deleteMedicalExam залежно від того, як ти його назвала)
        this.medicalExamsService.deleteMedicalExams(id).subscribe({
          next: () => {
            this.isConfirmOpen.set(false);
            this.loadMedicalExams();
          },
          error: (err) => {
            this.isConfirmOpen.set(false);
            console.error('Помилка при видаленні:', err);
          },
        });
      },
    );
  }
}
