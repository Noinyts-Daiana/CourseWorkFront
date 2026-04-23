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

  animals = signal<any[]>([]);
  currentPage = signal(1);
  pageSize = signal(8);
  totalCount = signal(0);
  searchTerm = signal('');
  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);

  isAddModalOpen = false;
  selectedAnimal: any = null;
  isEditMode = false;

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
      )
      .subscribe({
        next: (res: any) => {
          this.animals.set(
            (res.items || []).map((a: any) => ({
              ...a,
              type: a.speciesId === 2 ? 'cat' : 'dog',

              speciesName: a.speciesName || 'Невідомий вид',

              gender: a.sex === 1 ? 'Дівчинка' : 'Хлопчик',
              dob: a.birthday ? a.birthday.split('T')[0] : 'Невідомо',
              breed: a.breedName || 'Невідома порода',
              mainPhotoUrl: (() => {
                const p = a.photos?.find((x: any) => x.isMain) || a.photos?.[0];
                let url = p
                  ? p.url || p.fileUrl || p.photoUrl || (typeof p === 'string' ? p : null)
                  : null;
                if (url && !url.startsWith('http')) {
                  url = `https://localhost:5036${url.startsWith('/') ? '' : '/'}${url}`;
                }
                return url;
              })(),
              characteristicIds: a.characteristicIds || [],
            })),
          );
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

  clearAllFilters() {
    this.selectedFilterCharIds.set([]);
    this.selectedFilterSpeciesId.set(null);
    this.selectedFilterBreedId.set(null);
    this.selectedFilterBreedName.set('');
    this.selectedFilterSex.set(null);
    this.searchTerm.set('');
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
