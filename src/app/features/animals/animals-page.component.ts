import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnimalService } from '../../core/service/animal.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { AnimalCardComponent } from '../../shared/components/animal-card/animal-card.component';
import { AnimalCardDetailComponent } from '../../shared/components/animal-card-detail/animal-card-detail.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SpeciesService } from '../../core/service/species.service';
import { BreedService } from '../../core/service/breed.service';

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
  isSpeciesDropdownOpen = signal(false);
  speciesSearchTerm = signal('');
  speciesCurrentPage = signal(1);
  speciesTotalPages = signal(1);

  filteredBreedsList = signal<any[]>([]);
  filteredSpeciesList = signal<any[]>([]);
  isBreedsDropdownOpen = signal(false);
  breedSearchTerm = signal('');
  breedsCurrentPage = signal(1);
  breedsTotalPages = signal(1);

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
  }

  loadAnimals() {
    this.animalService
      .getAnimals(this.currentPage(), this.pageSize(), this.searchTerm())
      .subscribe({
        next: (res: any) => {
          this.animals.set(
            (res.items || []).map((a: any) => ({
              ...a,
              type: a.speciesId === 2 ? 'cat' : 'dog',
              gender: a.sex === 1 ? 'Дівчинка' : 'Хлопчик',
              dob: a.birthday ? a.birthday.split('T')[0] : 'Невідомо',
              breed: a.breedName || 'Невідома порода',
              mainPhotoUrl:
                a.photos?.find((p: any) => p.isMain)?.fileUrl || a.photos?.[0]?.fileUrl || null,
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

  onSpeciesInput(e: Event, isAdding: boolean) {
    const value = (e.target as HTMLInputElement).value;
    this.speciesSearchTerm.set(value);
    this.isSpeciesDropdownOpen.set(true);

    const targetData = isAdding ? this.newAnimalData : this.editAnimalData;

    targetData.speciesId = null;
    targetData.speciesName = value;

    targetData.breedId = null;
    targetData.breedName = '';
    this.breedSearchTerm.set('');
    this.filteredBreedsList.set([]);

    const lowerValue = value.toLowerCase();
    const filtered = this.speciesList().filter((s) => s.name.toLowerCase().includes(lowerValue));
    this.filteredSpeciesList.set(filtered);
  }

  selectSpecies(species: any, isAdding: boolean) {
    const targetData = isAdding ? this.newAnimalData : this.editAnimalData;
    targetData.speciesId = species.id;
    targetData.speciesName = species.name;

    this.speciesSearchTerm.set(species.name);
    this.isSpeciesDropdownOpen.set(false);

    targetData.breedId = null;
    targetData.breedName = '';
    this.breedSearchTerm.set('');

    this.breedService.getBreedsBySpecies(species.id).subscribe((breeds: any) => {
      this.filteredBreedsList.set(Array.isArray(breeds) ? breeds : breeds.items || []);
    });
  }

  closeSpeciesDropdown() {
    setTimeout(() => this.isSpeciesDropdownOpen.set(false), 200);
  }

  loadMoreSpecies() {
    if (this.speciesCurrentPage() < this.speciesTotalPages()) {
      this.speciesCurrentPage.update((p) => p + 1);
    }
  }

  onBreedInput(e: Event, isAdding: boolean) {
    const value = (e.target as HTMLInputElement).value;
    this.breedSearchTerm.set(value);
    this.isBreedsDropdownOpen.set(true);

    const targetData = isAdding ? this.newAnimalData : this.editAnimalData;
    targetData.breedId = null;
    targetData.breedName = value;

  }

  selectBreed(breed: any, isAdding: boolean) {
    const targetData = isAdding ? this.newAnimalData : this.editAnimalData;
    targetData.breedId = breed.id;
    targetData.breedName = breed.name;

    this.breedSearchTerm.set(breed.name);
    this.isBreedsDropdownOpen.set(false);
  }

  closeBreedsDropdown() {
    setTimeout(() => this.isBreedsDropdownOpen.set(false), 200);
  }

  loadMoreBreeds() {
    if (this.breedsCurrentPage() < this.breedsTotalPages()) {
      this.breedsCurrentPage.update((p) => p + 1);
    }
  }

  saveNewAnimal() {
    const payload = {
      ...this.newAnimalData,
      birthday: this.newAnimalData.birthday || null,
    };

    this.animalService.addAnimal(payload).subscribe(() => {
      this.loadAnimals();
      this.isAddModalOpen = false;
      this.resetNewAnimalData();
    });
  }

  startEditing() {
    const foundSpecies = this.speciesList().find(s => s.id === this.selectedAnimal.speciesId);
    const currentSpeciesName = foundSpecies ? foundSpecies.name : '';

    this.editAnimalData = {
      ...this.selectedAnimal,
      birthday: this.selectedAnimal.birthday?.split('T')[0] || '',
      speciesName: currentSpeciesName,
      breedName: this.selectedAnimal.breed || '',
    };

    this.speciesSearchTerm.set(this.editAnimalData.speciesName);
    this.breedSearchTerm.set(this.editAnimalData.breedName);

    if (this.editAnimalData.speciesId) {
      this.breedService
          .getBreedsBySpecies(this.editAnimalData.speciesId)
          .subscribe((breeds: any) => this.filteredBreedsList.set(Array.isArray(breeds) ? breeds : breeds.items || []));
    }

    this.isEditMode = true;
  }

  saveChanges() {
    const payload = {
      ...this.editAnimalData,
      birthday: this.editAnimalData.birthday || null,
    };

    this.animalService.updateAnimal(this.editAnimalData.id, payload).subscribe(() => {
      this.isEditMode = false;
      this.selectedAnimal = null;
      this.loadAnimals();
    });
  }

  resetNewAnimalData() {
    this.newAnimalData = this.getEmptyAnimalObject();
    this.speciesSearchTerm.set('');
    this.breedSearchTerm.set('');
    this.filteredBreedsList.set([]);
  }

  openAddModal() {
    this.resetNewAnimalData();
    this.isAddModalOpen = true;
  }

  onMainSearch(e: Event) {
    this.searchTerm.set((e.target as HTMLInputElement).value);
    this.currentPage.set(1);
    this.loadAnimals();
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
