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

  speciesList = signal<any[]>([]);
  animals = signal<any[]>([]);
  currentPage = signal(1);
  pageSize = signal(9);
  totalCount = signal(0);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);
  searchTerm = signal('');

  isAddModalOpen = false;
  selectedAnimal: any = null;
  isEditMode = false;

  filteredBreedsList = signal<string[]>([]);
  breedsCurrentPage = signal(1);
  breedsTotalPages = signal(1);
  isBreedsDropdownOpen = signal(false);
  breedSearchTerm = signal('');

  newAnimalData = {
    name: '',
    speciesId: null as number | null,
    breed: '',
    sex: 0,
    weight: null as number | null,
    birthday: '',
    isSterilized: false,
    description: '',
  };

  editAnimalData = {
    id: 0,
    name: '',
    speciesId: null as number | null,
    breed: '',
    sex: 0,
    weight: null as number | null,
    birthday: '',
    isSterilized: false,
    description: '',
  };

  ngOnInit() {
    this.speciesService.getAllSpecies().subscribe({
      next: (species: any) => {
        this.speciesList.set(species);
        this.loadAnimals();
      },
      error: (err) => console.error('Помилка завантаження видів', err),
    });
  }

  loadAnimals() {
    this.animalService
      .getAnimals(this.currentPage(), this.pageSize(), this.searchTerm())
      .subscribe({
        next: (response: any) => {
          const mappedAnimals = (response.items || []).map((a: any) => {
            return {
              ...a,
              type: a.speciesId === 2 ? 'cat' : 'dog',
              gender: a.sex === 1 ? 'Дівчинка' : 'Хлопчик',
              dob: a.birthday ? a.birthday.split('T')[0] : 'Невідомо',
              // Беремо породу безпосередньо як рядок
              breed: a.breed || 'Невідома порода',
            };
          });

          this.animals.set(mappedAnimals);
          this.totalCount.set(response.totalCount || 0);
        },
        error: (err) => console.error('Помилка завантаження тварин', err),
      });
  }

  onPageChange(newPage: number) {
    this.currentPage.set(newPage);
    this.loadAnimals();
  }

  onMainSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.loadAnimals();
  }

  openAddModal() {
    this.newAnimalData = {
      name: '',
      speciesId: null,
      breed: '',
      sex: 0,
      weight: null,
      birthday: '',
      isSterilized: false,
      description: '',
    };
    this.breedSearchTerm.set('');
    this.loadBreeds(1, '');
    this.isAddModalOpen = true;
  }

  saveNewAnimal() {
    this.animalService.addAnimal(this.newAnimalData).subscribe({
      next: () => {
        this.isAddModalOpen = false;
        this.loadAnimals();
      },
    });
  }

  openDetailModal(animal: any) {
    this.selectedAnimal = animal;
    this.isEditMode = false;
  }

  closeDetailModal() {
    this.selectedAnimal = null;
    this.isEditMode = false;
  }

  startEditing() {
    this.editAnimalData = {
      id: this.selectedAnimal.id,
      name: this.selectedAnimal.name,
      speciesId: this.selectedAnimal.speciesId,
      breed: this.selectedAnimal.breed,
      sex: this.selectedAnimal.sex,
      weight: this.selectedAnimal.weight,
      birthday: this.selectedAnimal.birthday
        ? this.selectedAnimal.birthday.split('T')[0]
        : this.selectedAnimal.dob !== 'Невідомо'
          ? this.selectedAnimal.dob
          : '',
      isSterilized: this.selectedAnimal.isSterilized,
      description: this.selectedAnimal.description || '',
    };
    this.breedSearchTerm.set(this.selectedAnimal.breed);
    this.isEditMode = true;
  }

  saveChanges() {
    this.animalService.updateAnimal(this.editAnimalData.id, this.editAnimalData).subscribe({
      next: () => {
        this.isEditMode = false;
        this.selectedAnimal = null;
        this.loadAnimals();
      },
    });
  }


  loadBreeds(page: number = 1, search: string = '') {
    this.breedService.getUniqueBreeds(search, page, 10).subscribe({
      next: (res: any) => {
        if (page === 1) {
          this.filteredBreedsList.set(res.items || []);
        } else {
          this.filteredBreedsList.set([...this.filteredBreedsList(), ...(res.items || [])]);
        }
        this.breedsCurrentPage.set(res.pageNumber);
        this.breedsTotalPages.set(Math.ceil(res.totalCount / res.pageSize));
      },
    });
  }

  onBreedInput(event: Event, isAdding: boolean) {
    const value = (event.target as HTMLInputElement).value;
    if (isAdding) {
      this.newAnimalData.breed = value;
    } else {
      this.editAnimalData.breed = value;
    }
    this.breedSearchTerm.set(value);
    this.isBreedsDropdownOpen.set(true);
    this.loadBreeds(1, value);
  }

  selectBreed(breedName: string, isAdding: boolean) {
    if (isAdding) {
      this.newAnimalData.breed = breedName;
    } else {
      this.editAnimalData.breed = breedName;
    }
    this.breedSearchTerm.set(breedName);
    this.isBreedsDropdownOpen.set(false);
  }

  loadMoreBreeds() {
    if (this.breedsCurrentPage() < this.breedsTotalPages()) {
      this.loadBreeds(this.breedsCurrentPage() + 1, this.breedSearchTerm());
    }
  }

  closeBreedsDropdown() {
    setTimeout(() => this.isBreedsDropdownOpen.set(false), 200);
  }
}
