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
import { VaccinationsService } from '../../../../core/service/vaccinations.service';
import { VaccineRecord } from '../../models/medicine.models';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-vaccinations-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, PaginationComponent, ConfirmModalComponent],
  templateUrl: './vaccinations-tab.component.html',
  styleUrl: '../../medicine-page.component.scss',
})
export class VaccinationsTabComponent implements OnInit, OnChanges {
  @Input() searchQuery: string = '';

  private animalService = inject(AnimalService);
  private vacctinationsService = inject(VaccinationsService);

  // --- СИГНАЛИ ДЛЯ МОДАЛОК ---
  isVaccineModalOpen = signal(false);
  isEditVaccineModalOpen = signal(false);
  editingVaccineRecord: VaccineRecord | null = null;

  // --- СИГНАЛИ ДЛЯ МОДАЛКИ ПІДТВЕРДЖЕННЯ ВИДАЛЕННЯ ---
  isConfirmOpen = signal(false);
  confirmConfig = signal({
    title: '',
    message: '',
    btnText: 'Видалити',
    btnClass: 'btn-danger',
    action: () => {},
  });

  // --- СИГНАЛИ ДЛЯ ТАБЛИЦІ ТА ПАГІНАЦІЇ ---
  animals = signal<any[]>([]);
  vaccineExams = signal<any[]>([]);
  currentPage = signal(1);
  pageSize = signal(9);
  totalCount = signal(0);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);

  // --- СИГНАЛИ ДЛЯ ВИПАДАЙКИ ТВАРИН ---
  animalSearchTerm = signal('');
  isAnimalsDropdownOpen = signal(false);
  animalsList = signal<any[]>([]);

  // --- СИГНАЛИ ДЛЯ ВИПАДАЙКИ ВАКЦИН ---
  vaccineSearchTerm = signal('');
  isVaccineDropdownOpen = signal(false);

  // --- ДАНІ ФОРМ ---
  newVaccinationRecord = {
    animalId: null as number | null,
    vaccineName: '',
    dateAdministered: '',
    nextDueDate: '',
  };

  editVaccineData = {
    id: 0,
    animalId: null as number | null,
    vaccineName: '',
    dateAdministered: '',
    nextDueDate: '',
  };

  ngOnInit() {
    this.loadVaccinations();
  }

  // Відслідковуємо зміни у рядку пошуку від батьківського компонента
  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchQuery'] && !changes['searchQuery'].isFirstChange()) {
      this.currentPage.set(1); // Скидаємо на першу сторінку
      this.loadVaccinations(); // Робимо новий запит
    }
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

  // --- ЛОГІКА ПОШУКОВОЇ ВИПАДАЙКИ ТВАРИН ---
  onAnimalInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.animalSearchTerm.set(value);

    if (this.isVaccineModalOpen()) this.newVaccinationRecord.animalId = null;
    if (this.isEditVaccineModalOpen()) this.editVaccineData.animalId = null;

    this.animalService.getAnimals(1, 10, value, [], null, null, null, false).subscribe({
      next: (res: any) => this.animalsList.set(res.items || []),
    });
  }

  selectAnimal(animal: any) {
    this.animalSearchTerm.set(animal.name);
    if (this.isVaccineModalOpen()) this.newVaccinationRecord.animalId = animal.id;
    if (this.isEditVaccineModalOpen()) this.editVaccineData.animalId = animal.id;
    this.isAnimalsDropdownOpen.set(false);
  }

  closeAnimalsDropdown() {
    setTimeout(() => this.isAnimalsDropdownOpen.set(false), 200);
  }

  // --- ЛОГІКА ПОШУКОВОЇ ВИПАДАЙКИ ВАКЦИН ---
  filteredVaccines = computed(() => {
    const term = this.vaccineSearchTerm().toLowerCase();

    // Дістаємо всі вакцини з таблиці, відкидаємо пусті і залишаємо тільки унікальні назви
    const existingVaccines = this.vaccineExams()
      .map((v) => v.vaccineName)
      .filter((v) => v);

    const allUnique = Array.from(new Set(existingVaccines));

    // Якщо нічого не введено - показуємо всі унікальні з бази. Інакше - фільтруємо.
    if (!term) return allUnique;
    return allUnique.filter((v) => v.toLowerCase().includes(term));
  });

  onVaccineInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.vaccineSearchTerm.set(value);

    if (this.isVaccineModalOpen()) this.newVaccinationRecord.vaccineName = value;
    if (this.isEditVaccineModalOpen()) this.editVaccineData.vaccineName = value;
  }

  selectVaccine(vaccineName: string) {
    this.vaccineSearchTerm.set(vaccineName);
    if (this.isVaccineModalOpen()) this.newVaccinationRecord.vaccineName = vaccineName;
    if (this.isEditVaccineModalOpen()) this.editVaccineData.vaccineName = vaccineName;
    this.isVaccineDropdownOpen.set(false);
  }

  closeVaccineDropdown() {
    setTimeout(() => this.isVaccineDropdownOpen.set(false), 200);
  }

  // --- ЛОГІКА ВІДКРИТТЯ МОДАЛОК ---
  openAddVaccineModal() {
    this.isVaccineModalOpen.set(true);
    this.animalSearchTerm.set('');
    this.newVaccinationRecord.animalId = null;
    this.vaccineSearchTerm.set('');

    this.animalService.getAnimals(1, 10, '', [], null, null, null, false).subscribe({
      next: (res: any) => this.animalsList.set(res.items || []),
    });
  }

  openEditVaccineModal(vaccine: VaccineRecord) {
    this.editVaccineData = {
      id: vaccine.id || 0,
      animalId: vaccine.animalId || null,
      vaccineName: vaccine.vaccineName || '',
      dateAdministered: vaccine.dateAdministered ? vaccine.dateAdministered.split('T')[0] : '',
      nextDueDate: vaccine.nextDueDate ? vaccine.nextDueDate.split('T')[0] : '',
    };

    this.animalSearchTerm.set(vaccine.animalName || vaccine.patientName || '');
    this.vaccineSearchTerm.set(vaccine.vaccineName || '');

    this.animalService.getAnimals(1, 10, '', [], null, null, null, false).subscribe({
      next: (res: any) => this.animalsList.set(res.items || []),
    });

    this.isEditVaccineModalOpen.set(true);
  }

  // Метод для відкриття вікна підтвердження видалення
  confirmDelete(id: number, name: string) {
    this.confirmConfig.set({
      title: 'Видалити вакцинацію?',
      message: `Ви впевнені, що хочете видалити запис про щеплення для ${name}?`,
      btnText: 'Видалити',
      btnClass: 'btn-danger',
      action: () => {
        this.vacctinationsService.deleteVaccines(id).subscribe({
          next: () => {
            this.isConfirmOpen.set(false);
            this.loadVaccinations();
          },
          error: (err) => {
            console.error('Помилка при видаленні:', err);
            this.isConfirmOpen.set(false);
          },
        });
      },
    });
    this.isConfirmOpen.set(true);
  }

  // --- CRUD ОПЕРАЦІЇ ---
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
        this.loadVaccinations();
      },
      error: (err) => console.error('Помилка при оновленні вакцини:', err),
    });
  }
}
