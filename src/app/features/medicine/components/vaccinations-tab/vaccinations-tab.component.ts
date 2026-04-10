import { Component, inject, signal, computed, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { AnimalService } from '../../../../core/service/animal.service';
import { VaccinationsService } from '../../../../core/service/vaccinations.service';
import { VaccineRecord } from '../../models/medicine.models';

@Component({
  selector: 'app-vaccinations-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, PaginationComponent],
  templateUrl: './vaccinations-tab.component.html',
  styleUrl: '../../medicine-page.component.scss',
})
export class VaccinationsTabComponent implements OnInit {
  @Input() searchQuery: string = '';

  private animalService = inject(AnimalService);
  private vacctinationsService = inject(VaccinationsService);

  isVaccineModalOpen = signal(false);
  isEditVaccineModalOpen = signal(false);
  editingVaccineRecord: VaccineRecord | null = null;

  animals = signal<any[]>([]);
  vaccineExams = signal<any[]>([]);
  currentPage = signal(1);
  pageSize = signal(9);
  totalCount = signal(0);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);

  newVaccinationRecord = { animalId: null, vaccineName: '', dateAdministered: '', nextDueDate: '' };

  editVaccineData = {
    id: 0,
    animalId: null as number | null,
    vaccineName: '',
    dateAdministered: '',
    nextDueDate: '',
  };

  openEditVaccineModal(vaccine: VaccineRecord) {
    this.editVaccineData = {
      id: vaccine.id || 0,
      animalId: vaccine.animalId || null,
      vaccineName: vaccine.vaccineName || '',
      dateAdministered: vaccine.dateAdministered ? vaccine.dateAdministered.split('T')[0] : '',
      nextDueDate: vaccine.nextDueDate ? vaccine.nextDueDate.split('T')[0] : '',
    };

    if (this.animals().length === 0) {
      this.animalService.getAnimals().subscribe({
        next: (response: any) => this.animals.set(response.items || []),
      });
    }

    this.isEditVaccineModalOpen.set(true);
  }

  onSaveEditVaccination() {
    const dataToSend = {
      id: this.editVaccineData.id,
      animalId: this.editVaccineData.animalId,
      vaccineName: this.editVaccineData.vaccineName,
      dateAdministered: this.editVaccineData.dateAdministered,
      nextDueDate: this.editVaccineData.nextDueDate,
    };

    this.vacctinationsService.editVaccines(this.editVaccineData.id, dataToSend).subscribe({
      next: () => {
        this.isEditVaccineModalOpen.set(false);
        this.loadVaccinations(); // Оновлюємо список
      },
      error: (err) => console.error('Помилка при оновленні вакцини:', err),
    });
  }

  ngOnInit() {
    this.loadVaccinations();
  }

  loadVaccinations() {
    this.vacctinationsService
      .getVaccines(this.currentPage(), this.pageSize(), this.searchQuery)
      .subscribe({
        next: (response: any) => {
          this.vaccineExams.set(response.items || []);
          this.totalCount.set(response.totalCount || 0);
          this.currentPage.set(response.pageNumber || 1);
        },
      });
  }

  onPageChange(newPage: number) {
    this.currentPage.set(newPage);
    this.loadVaccinations();
  }

  openAddVaccineModal() {
    this.isVaccineModalOpen.set(true);
    this.animalService.getAnimals().subscribe({
      next: (response: any) => this.animals.set(response.items || []),
    });
  }

  onSaveVaccination() {
    this.vacctinationsService.addVaccines(this.newVaccinationRecord).subscribe({
      next: () => {
        this.isVaccineModalOpen.set(false);
        this.newVaccinationRecord = {
          animalId: null,
          vaccineName: '',
          dateAdministered: '',
          nextDueDate: '',
        };
        this.loadVaccinations();
      },
    });
  }

}

