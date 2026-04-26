import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AnimalService } from '../../core/service/animal.service';
import { SpeciesService } from '../../core/service/species.service';
import { BreedService } from '../../core/service/breed.service';
import { CharacteristicService } from '../../core/service/characteristic.service';

import { ModalComponent } from '../../shared/components/modal/modal.component';
import { AnimalCardComponent } from '../../shared/components/animal-card/animal-card.component';
import { AnimalCardDetailComponent } from '../../shared/components/animal-card-detail/animal-card-detail.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import {FeedingLogService} from "../../core/service/feeding-log.service";
import {AdoptAnimalService} from "../../core/service/adopt-animal.service";
import {FoodTypeService} from "../../core/service/food-type.service";
import {UserService} from '../../core/service/user.service';

@Component({
  selector: 'app-animals-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    AnimalCardComponent,
    AnimalCardDetailComponent,
    PaginationComponent,
  ],
  templateUrl: './animals-page.component.html',
  styleUrl: './animals-page.component.scss',
})
export class AnimalsPageComponent implements OnInit {
  private animalService = inject(AnimalService);
  private speciesService = inject(SpeciesService);
  private breedService = inject(BreedService);
  private characteristicService = inject(CharacteristicService);
  private foodTypeService = inject(FoodTypeService);
  private feedingService = inject(FeedingLogService);
  private userService = inject(UserService);
  private adoptService = inject(AdoptAnimalService);

  adoptErrorMessage = signal('');

  selectedFilterIsAdopted = signal<boolean | null>(null);
  userList = signal<any[]>([]);
  isUserDropdownOpen = signal(false);
  userSearchTerm = signal('');
  userCurrentPage = signal(1);
  userTotalPages = signal(1);

  animals = signal<any[]>([]);
  currentPage = signal(1);
  pageSize = signal(8);
  totalCount = signal(0);
  searchTerm = signal('');
  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);

  isAddModalOpen = false;
  selectedAnimal: any = null;
  isEditMode = false;

  isFeedingModalOpen = signal(false);
  isAdoptModalOpen = signal(false);

  speciesList = signal<any[]>([]);
  filteredSpeciesList = signal<any[]>([]);
  isSpeciesDropdownOpen = signal(false);
  speciesSearchTerm = signal('');

  filteredBreedsList = signal<any[]>([]);
  isBreedsDropdownOpen = signal(false);
  breedSearchTerm = signal('');

  characteristicsList = signal<any[]>([]);
  charSearchTerm = signal('');

  filteredCharacteristics = computed(() => {
    const term = this.charSearchTerm().toLowerCase();
    return this.characteristicsList().filter((c) =>
      (c.name || c.Name || '').toLowerCase().includes(term),
    );
  });

  newAnimalData = this.getEmptyAnimalObject();
  editAnimalData = this.getEmptyAnimalObject();

  newAdoption = { OwnerId: null as number | null, ownerName: '' };
  foodTypeList = signal<any[]>([]);
  isFoodDropdownOpen = signal(false);
  foodSearchTerm = signal('');
  foodCurrentPage = signal(1);
  foodTotalPages = signal(1);

  newFeeding = {
    foodTypeId: null as number | null,
    foodTypeName: '',
    amount: null as number | null,
    unit: '',
  };
  feedingErrorMessage = signal('');
  openFeedingModal() {
    this.newFeeding = { foodTypeId: null, foodTypeName: '', amount: null, unit: '' };
    this.feedingErrorMessage.set('');
    this.foodSearchTerm.set('');
    this.foodCurrentPage.set(1);
    this.loadFoodTypes();
    this.isFeedingModalOpen.set(true);
  }

  openAdoptModal() {
    this.adoptErrorMessage.set('');
    this.newAdoption = { OwnerId: null, ownerName: '' };
    this.userSearchTerm.set('');
    this.userCurrentPage.set(1);
    this.loadUsers();
    this.isAdoptModalOpen.set(true);
  }

  loadUsers(isLoadMore = false) {
    this.userService
      .getUsers(this.userCurrentPage(), 10, this.userSearchTerm())
      .subscribe((res: any) => {
        if (isLoadMore) {
          this.userList.update((prev) => [...prev, ...res.items]);
        } else {
          this.userList.set(res.items);
        }
        this.userTotalPages.set(Math.ceil(res.totalCount / 10) || 1);
      });
  }

  onUserInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.userSearchTerm.set(value);
    this.isUserDropdownOpen.set(true);

    this.newAdoption.OwnerId = null;
    this.newAdoption.ownerName = value;

    this.userCurrentPage.set(1);
    this.loadUsers();
  }

  selectUser(user: any) {
    this.newAdoption.OwnerId = user.id || user.Id || user.userId || user.UserId;

    const name = user.fullName || user.FullName || user.name || user.Name || 'Невідомий користувач';
    this.newAdoption.ownerName = name;

    this.userSearchTerm.set(this.newAdoption.ownerName);
    this.isUserDropdownOpen.set(false);

    console.log('Обрано власника з ID:', this.newAdoption.OwnerId);
  }

  closeUserDropdown() {
    setTimeout(() => this.isUserDropdownOpen.set(false), 200);
  }

  loadMoreUsers() {
    if (this.userCurrentPage() < this.userTotalPages()) {
      this.userCurrentPage.update((p) => p + 1);
      this.loadUsers(true);
    }
  }
  selectFood(food: any) {
    this.newFeeding.foodTypeId = food.id || food.Id;

    const name = food.name || food.Name || 'Невідомий корм';
    const brand = food.brand || food.Brand;
    this.newFeeding.foodTypeName = brand ? `${name} (${brand})` : name;

    this.newFeeding.unit = food.unit || food.Unit || '';

    this.foodSearchTerm.set(this.newFeeding.foodTypeName);
    this.isFoodDropdownOpen.set(false);
  }
  loadFoodTypes(isLoadMore = false) {
    this.foodTypeService
      .getFoodTypes(this.foodCurrentPage(), 10, this.foodSearchTerm())
      .subscribe((res: any) => {
        if (isLoadMore) {
          this.foodTypeList.update((prev) => [...prev, ...res.items]);
        } else {
          this.foodTypeList.set(res.items);
        }
        this.foodTotalPages.set(Math.ceil(res.totalCount / 10) || 1);
      });
  }

  onFoodInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.foodSearchTerm.set(value);
    this.isFoodDropdownOpen.set(true);

    this.newFeeding.foodTypeId = null;
    this.newFeeding.foodTypeName = value;

    this.foodCurrentPage.set(1);
    this.loadFoodTypes();
  }
  clearAdoptedFilter() {
    this.selectedFilterIsAdopted.set(null);
    this.currentPage.set(1);
    this.loadAnimals();
  }

  setAdoptedFilter(status: boolean | null) {
    this.selectedFilterIsAdopted.set(status);
    this.currentPage.set(1);
    this.loadAnimals();
  }

  clearAllFilters() {
    this.selectedFilterCharIds.set([]);
    this.selectedFilterSpeciesId.set(null);
    this.selectedFilterBreedId.set(null);
    this.selectedFilterBreedName.set('');
    this.selectedFilterSex.set(null);
    this.selectedFilterIsAdopted.set(null);
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadAnimals();
  }

  closeFoodDropdown() {
    setTimeout(() => this.isFoodDropdownOpen.set(false), 200);
  }

  loadMoreFoods() {
    if (this.foodCurrentPage() < this.foodTotalPages()) {
      this.foodCurrentPage.update((p) => p + 1);
      this.loadFoodTypes(true);
    }
  }

  isConfirmOpen = signal(false);
  confirmConfig = signal({
    title: '',
    message: '',
    btnText: 'Підтвердити',
    btnClass: 'btn-primary',
    action: () => {},
  });

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

  deleteAnimal() {
    this.openConfirm(
      'Видалити профіль?',
      `Ви впевнені, що хочете видалити ${this.selectedAnimal.name}? Цю дію неможливо скасувати.`,
      'Видалити',
      'btn-danger-text',
      () => {
        this.animalService.deleteAnimal(this.selectedAnimal.id).subscribe(() => {
          this.isConfirmOpen.set(false);
          this.closeDetailModal();
          this.loadAnimals();
        });
      },
    );
  }

  confirmAdoption() {
    if (!this.newAdoption.OwnerId) return;

    this.openConfirm(
      'Підтвердити приручення',
      `Передати ${this.selectedAnimal.name} власнику ${this.newAdoption.ownerName}?`,
      'Приручити',
      'btn-adopt',
      () => this.saveAdoption(),

    );
  }

  private getEmptyAnimalObject() {
    return {
      id: 0,
      name: '',
      speciesId: null as number | null,
      speciesName: '',
      breedId: null as number | null,
      breedName: '',
      characteristicIds: [] as number[],
      newCharacteristicNames: [] as string[],
      sex: 0,
      weight: null,
      birthday: '',
      isSterilized: false,
      description: '',
    };
  }

  ngOnInit() {
    this.loadAnimals();
    this.loadSpecies();
    this.loadCharacteristics();
  }
  loadAnimals() {
    this.animalService
      .getAnimals(
        this.currentPage(),
        this.pageSize(),
        this.searchTerm(),
        this.selectedFilterCharIds(),
        this.selectedFilterSpeciesId(),
        this.selectedFilterBreedId(),
        this.selectedFilterSex(),
        this.selectedFilterIsAdopted(),
      )
      .subscribe({
        next: (res: any) => {
          const fetchedAnimals = (res.items || []).map((a: any) => {
            let photosList = a.photos || a.Photos || [];
            photosList.sort((p1: any, p2: any) => {
              const isMain1 = String(p1.isMain) === 'true' || String(p1.IsMain) === 'true';
              return isMain1 ? -1 : 1;
            });

            return {
              ...a,
              photos: photosList,
              type: a.speciesId === 2 ? 'cat' : 'dog',
              speciesName: a.speciesName || 'Невідомий вид',
              gender: a.sex === 1 ? 'Дівчинка' : 'Хлопчик',
              dob: a.birthday ? a.birthday.split('T')[0] : 'Невідомо',
              breed: a.breedName || 'Невідома порода',

              mainPhotoUrl: (() => {
                const p = photosList[0];
                let url = p
                  ? p.url ||
                    p.Url ||
                    p.fileUrl ||
                    p.FileUrl ||
                    p.photoUrl ||
                    p.PhotoUrl ||
                    (typeof p === 'string' ? p : null)
                  : null;

                if (url && !url.startsWith('http')) {
                  url = url.replace(/\\/g, '/');

                  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
                  url = `https://localhost:5036${cleanUrl}`;
                }

                return url;
              })(),

              characteristicIds: a.characteristicIds || [],
            };
          });

          this.animals.set(fetchedAnimals);

          if (this.selectedAnimal) {
            const updatedAnimal = fetchedAnimals.find((a: any) => a.id === this.selectedAnimal.id);
            if (updatedAnimal) {
              this.selectedAnimal = updatedAnimal;
            }
          }

          this.totalCount.set(res.totalCount || 0);
        },
      });
  }
  loadSpecies() {
    this.speciesService.getAllSpecies().subscribe((res: any) => {
      const list = Array.isArray(res) ? res : res.items || [];
      this.speciesList.set(list);
      this.filteredSpeciesList.set(list);
    });
  }

  saveAdoption() {
    this.adoptErrorMessage.set('');
    const payload = {
      AnimalId: this.selectedAnimal.id,
      OwnerId: this.newAdoption.OwnerId,
    };

    console.log('Відправляю payload:', payload);
    this.adoptService.adoptAnimal(payload).subscribe({
      next: () => {
        this.isConfirmOpen.set(false);
        this.isAdoptModalOpen.set(false);
        this.loadAnimals();
      },
      error: (err) => {
        this.isConfirmOpen.set(false);
        if (err.error && err.error.message) {
          this.adoptErrorMessage.set(err.error.message);
        }
      },
    });
  }

  saveFeeding() {
    this.feedingErrorMessage.set('');
    const payload = {
      animalId: this.selectedAnimal.id,
      foodTypeId: this.newFeeding.foodTypeId,
      amount: this.newFeeding.amount,
    };

    this.feedingService.feedAnimal(payload).subscribe({
      next: () => {
        this.isConfirmOpen.set(false);
        this.isFeedingModalOpen.set(false);
        this.loadAnimals();
      },
      error: (err) => {
        this.isConfirmOpen.set(false);
        this.feedingErrorMessage.set(err.error?.message || 'Помилка годування');
      },
    });
  }
  confirmDelete() {
    if (!this.selectedAnimal) return;

    this.openConfirm(
      'Видалити профіль?',
      `Ви впевнені, що хочете видалити ${this.selectedAnimal.name}? Цю дію неможливо скасувати.`,
      'Видалити',
      'btn-danger',
      () => {
        this.animalService.deleteAnimal(this.selectedAnimal.id).subscribe({
          next: () => {
            this.isConfirmOpen.set(false);
            this.closeDetailModal();
            this.loadAnimals();
          },
          error: () => {
            this.isConfirmOpen.set(false);
            alert('Не вдалося видалити. Можливо, є пов’язані записи.');
          },
        });
      },
    );
  }
  confirmFeeding() {
    if (!this.newFeeding.foodTypeId || !this.newFeeding.amount) {
      this.feedingErrorMessage.set('Будь ласка, оберіть корм та вкажіть кількість!');
      return;
    }

    this.openConfirm(
      'Підтвердити годування',
      `Ви впевнені, що хочете дати ${this.newFeeding.amount} ${this.newFeeding.unit} корму "${this.newFeeding.foodTypeName}" для ${this.selectedAnimal?.name}?`,
      'Годувати',
      'btn-feed',
      () => this.saveFeeding(),
    );
  }

  loadCharacteristics() {
    this.characteristicService.getAllCharacteristics().subscribe((res: any) => {
      this.characteristicsList.set(Array.isArray(res) ? res : res.items || []);
    });
  }

  selectedFilterCharIds = signal<number[]>([]);
  selectedFilterSpeciesId = signal<number | null>(null);
  selectedFilterBreedId = signal<number | null>(null);
  selectedFilterBreedName = signal<string>('');
  selectedFilterSex = signal<number | null>(null);

  getFilterCharName(id: number): string {
    return this.characteristicsList().find((c) => (c.id || c.Id) === id)?.name || '';
  }

  getFilterSpeciesName(id: number): string {
    return this.speciesList().find((s) => (s.id || s.Id) === id)?.name || '';
  }

  addCharFilterByName(charName: string) {
    const char = this.characteristicsList().find((c) => (c.name || c.Name) === charName);
    if (char) {
      const id = char.id || char.Id;
      if (!this.selectedFilterCharIds().includes(id)) {
        this.selectedFilterCharIds.set([...this.selectedFilterCharIds(), id]);
        this.currentPage.set(1);
        this.loadAnimals();
      }
    }
  }

  setSpeciesFilter(id: number) {
    this.selectedFilterSpeciesId.set(id);
    this.selectedFilterBreedId.set(null);
    this.selectedFilterBreedName.set('');
    this.currentPage.set(1);
    this.loadAnimals();
  }

  setBreedFilter(id: number, name: string) {
    this.selectedFilterBreedId.set(id);
    this.selectedFilterBreedName.set(name);
    this.currentPage.set(1);
    this.loadAnimals();
  }

  setSexFilter(sex: number) {
    this.selectedFilterSex.set(sex);
    this.currentPage.set(1);
    this.loadAnimals();
  }

  removeCharFilter(id: number) {
    this.selectedFilterCharIds.set(this.selectedFilterCharIds().filter((charId) => charId !== id));
    this.currentPage.set(1);
    this.loadAnimals();
  }

  clearSpeciesFilter() {
    this.selectedFilterSpeciesId.set(null);
    this.selectedFilterBreedId.set(null);
    this.selectedFilterBreedName.set('');
    this.currentPage.set(1);
    this.loadAnimals();
  }

  clearBreedFilter() {
    this.selectedFilterBreedId.set(null);
    this.selectedFilterBreedName.set('');
    this.currentPage.set(1);
    this.loadAnimals();
  }

  clearSexFilter() {
    this.selectedFilterSex.set(null);
    this.currentPage.set(1);
    this.loadAnimals();
  }

  onMainSearch(e: Event) {
    const target = e.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.currentPage.set(1);
    this.loadAnimals();
  }

  toggleCharacteristic(char: any, isAdding: boolean) {
    const charId = char.id || char.Id;
    if (!charId) return;

    const targetData = isAdding ? this.newAnimalData : this.editAnimalData;
    if (!targetData.characteristicIds) targetData.characteristicIds = [];

    const index = targetData.characteristicIds.indexOf(charId);
    if (index === -1) {
      targetData.characteristicIds = [...targetData.characteristicIds, charId];
    } else {
      targetData.characteristicIds = targetData.characteristicIds.filter((id) => id !== charId);
    }
  }

  addNewCharacteristic(name: string, isAdding: boolean) {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const existingChar = this.characteristicsList().find(
      (c) => (c.name || c.Name || '').toLowerCase() === trimmedName.toLowerCase(),
    );

    if (existingChar) {
      this.toggleCharacteristic(existingChar, isAdding);
    } else {
      const targetData = isAdding ? this.newAnimalData : this.editAnimalData;
      if (!targetData.newCharacteristicNames.includes(trimmedName)) {
        targetData.newCharacteristicNames.push(trimmedName);
      }
    }
    this.charSearchTerm.set('');
  }

  removeNewChar(name: string, isAdding: boolean) {
    const targetData = isAdding ? this.newAnimalData : this.editAnimalData;
    targetData.newCharacteristicNames = targetData.newCharacteristicNames.filter((n) => n !== name);
  }

  onSpeciesInput(e: Event, isAdding: boolean) {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    this.speciesSearchTerm.set(value);
    this.isSpeciesDropdownOpen.set(true);

    const targetData = isAdding ? this.newAnimalData : this.editAnimalData;
    targetData.speciesId = null;
    targetData.speciesName = value;
    targetData.breedId = null;
    targetData.breedName = '';
    this.breedSearchTerm.set('');

    const lowerValue = value.toLowerCase();
    this.filteredSpeciesList.set(
      this.speciesList().filter((s) => s.name.toLowerCase().includes(lowerValue)),
    );
  }
  selectSpecies(species: any, isAdding: boolean) {
    const targetData = isAdding ? this.newAnimalData : this.editAnimalData;
    targetData.speciesId = species.id || species.Id;
    targetData.speciesName = species.name || species.Name;

    this.speciesSearchTerm.set(targetData.speciesName);
    this.isSpeciesDropdownOpen.set(false);

    this.breedService.getBreedsBySpecies(targetData.speciesId!).subscribe((breeds: any) => {
      this.filteredBreedsList.set(Array.isArray(breeds) ? breeds : breeds.items || []);
    });
  }

  closeSpeciesDropdown() {
    setTimeout(() => this.isSpeciesDropdownOpen.set(false), 200);
  }

  onBreedInput(e: Event, isAdding: boolean) {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    this.breedSearchTerm.set(value);
    this.isBreedsDropdownOpen.set(true);

    const targetData = isAdding ? this.newAnimalData : this.editAnimalData;
    targetData.breedId = null;
    targetData.breedName = value;
  }

  selectBreed(breed: any, isAdding: boolean) {
    const targetData = isAdding ? this.newAnimalData : this.editAnimalData;
    targetData.breedId = breed.id || breed.Id;
    targetData.breedName = breed.name || breed.Name;

    this.breedSearchTerm.set(targetData.breedName);
    this.isBreedsDropdownOpen.set(false);
  }

  closeBreedsDropdown() {
    setTimeout(() => this.isBreedsDropdownOpen.set(false), 200);
  }

  saveNewAnimal() {
    const validIds = (this.newAnimalData.characteristicIds || [])
      .filter((id) => !isNaN(Number(id)))
      .map(Number);
    const payload = {
      ...this.newAnimalData,
      characteristicIds: validIds,
      birthday: this.newAnimalData.birthday || null,
    };

    this.animalService.addAnimal(payload).subscribe(() => {
      this.loadAnimals();
      this.loadCharacteristics();
      this.isAddModalOpen = false;
      this.resetNewAnimalData();
    });
  }

  saveChanges() {
    const validIds = (this.editAnimalData.characteristicIds || [])
      .filter((id) => !isNaN(Number(id)))
      .map(Number);
    const payload = {
      ...this.editAnimalData,
      characteristicIds: validIds,
      birthday: this.editAnimalData.birthday || null,
    };

    this.animalService.updateAnimal(this.editAnimalData.id, payload).subscribe(() => {
      this.isEditMode = false;
      this.selectedAnimal = null;
      this.loadAnimals();
      this.loadCharacteristics();
    });
  }

  startEditing() {
    const foundSpecies = this.speciesList().find(
      (s) => (s.id || s.Id) === this.selectedAnimal.speciesId,
    );

    this.editAnimalData = {
      ...this.selectedAnimal,
      birthday: this.selectedAnimal.birthday?.split('T')[0] || '',
      speciesName: foundSpecies ? foundSpecies.name || foundSpecies.Name : '',
      breedName: this.selectedAnimal.breed || '',
      characteristicIds: this.selectedAnimal.characteristicIds
        ? [...this.selectedAnimal.characteristicIds]
        : [],
      newCharacteristicNames: [],
    };

    this.speciesSearchTerm.set(this.editAnimalData.speciesName);
    this.breedSearchTerm.set(this.editAnimalData.breedName);

    if (this.editAnimalData.speciesId) {
      this.breedService
        .getBreedsBySpecies(this.editAnimalData.speciesId)
        .subscribe((breeds: any) =>
          this.filteredBreedsList.set(Array.isArray(breeds) ? breeds : breeds.items || []),
        );
    }
    this.isEditMode = true;
  }

  resetNewAnimalData() {
    this.newAnimalData = this.getEmptyAnimalObject();
    this.speciesSearchTerm.set('');
    this.breedSearchTerm.set('');
    this.charSearchTerm.set('');
    this.filteredBreedsList.set([]);
  }

  openAddModal() {
    this.resetNewAnimalData();
    this.isAddModalOpen = true;
  }

  onPageChange(p: number) {
    this.currentPage.set(p);
    this.loadAnimals();
  }

  openDetailModal(a: any) {
    this.selectedAnimal = a;
    this.isEditMode = false;
  }

  closeDetailModal() {
    this.selectedAnimal = null;
    this.isEditMode = false;
  }
}
