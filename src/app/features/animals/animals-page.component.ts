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
import { forkJoin } from 'rxjs';

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
  breedsList = signal<any[]>([]);
  animals = signal<any[]>([]);
  currentPage = signal(1);
  pageSize = signal(9);
  totalCount = signal(0);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);

  isAddModalOpen = false;
  selectedAnimal: any = null;
  isEditMode = false;

  newAnimalData = {
    name: '',
    speciesId: 1,
    breedId: 1,
    sex: 0,
    weight: null as number | null,
    birthday: '',
    isSterilized: false,
    description: '',
  };

  editAnimalData = {
    id: 0,
    name: '',
    speciesId: 1,
    breedId: 1,
    sex: 0,
    weight: null as number | null,
    birthDate: '',
    isSterilized: false,
    description: '',
  };

  ngOnInit() {
    forkJoin({
      species: this.speciesService.getAllSpecies(),
      breeds: this.breedService.getAllBreeds(),
    }).subscribe({
      next: (data: any) => {
        this.speciesList.set(data.species);
        this.breedsList.set(data.breeds);
        this.loadAnimals();
      },
      error: (err) => console.error('Помилка завантаження довідників', err),
    });
  }

  loadAnimals() {
    this.animalService.getAnimals(this.currentPage(), this.pageSize(), '').subscribe({
      next: (response: any) => {
        const mappedAnimals = (response.items || []).map((a: any) => {
          console.log(`Тваринка: ${a.name} | breedId:`, a.breedId);
          console.log('Перша порода зі списку:', this.breedsList()[0]);

          const breedObj = this.breedsList().find((b) => b.id == a.breedId);
          const breedName = breedObj ? breedObj.name : 'Невідома порода';

          return {
            ...a,
            type: a.speciesId === 2 ? 'cat' : 'dog',
            gender: a.sex === 1 ? 'Дівчинка' : 'Хлопчик',
            dob: a.birthday ? a.birthday.split('T')[0] : 'Невідомо',
            breed: breedName,
          };
        });

        this.animals.set(mappedAnimals);
        this.totalCount.set(response.totalCount || 0);
        this.currentPage.set(response.pageNumber || 1);
      },
      error: (err) => console.error('Помилка завантаження тварин', err),
    });
  }

  onPageChange(newPage: number) {
    this.currentPage.set(newPage);
    this.loadAnimals();
  }

  saveNewAnimal() {
    this.animalService.addAnimal(this.newAnimalData).subscribe({
      next: () => {
        this.isAddModalOpen = false;
        this.loadAnimals();
        this.newAnimalData = {
          name: '',
          speciesId: 1,
          breedId: 1,
          sex: 0,
          weight: null,
          birthday: '',
          isSterilized: false,
          description: '',
        };
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
      breedId: this.selectedAnimal.breedId || 1,
      sex: this.selectedAnimal.sex,
      weight: this.selectedAnimal.weight,
      birthDate: this.selectedAnimal.birthDate ? this.selectedAnimal.birthDate.split('T')[0] : '',
      isSterilized: this.selectedAnimal.isSterilized,
      description: this.selectedAnimal.description || '',
    };
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
}
