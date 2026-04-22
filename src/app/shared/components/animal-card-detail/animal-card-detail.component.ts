import { Component, Input, OnInit, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicalExamsService } from '../../../core/service/medical-exams.service';
import { VaccinationsService } from '../../../core/service/vaccinations.service';
import { AnimalPhotoService } from '../../../core/service/animal-photo.service';

@Component({
  selector: 'app-animal-card-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animal-card-detail.component.html',
  styleUrl: './animal-card-detail.component.scss',
})
export class AnimalCardDetailComponent implements OnInit {
  @Input() id!: number;
  @Input() name!: string;
  @Input() breed!: string;
  @Input() animalType!: string;
  @Input() gender!: string;
  @Input() weight!: number;
  @Input() dob!: string;
  @Input() isSterilized!: boolean;
  @Input() mainPhotoUrl: string | null = null; // Приходить від списку тварин

  @Output() closeModal = new EventEmitter<void>();
  @Output() animalUpdated = new EventEmitter<void>();

  activeTab: 'general' | 'medical' | 'photos' = 'general';

  vaccines = signal<any[]>([]);
  medicalHistory = signal<any[]>([]);
  animalPhotos = signal<any[]>([]);

  private medicalExamsService = inject(MedicalExamsService);
  private vaccinationsService = inject(VaccinationsService);
  private photoService = inject(AnimalPhotoService);

  // Вантажимо все відразу при відкритті!
  ngOnInit() {
    if (this.id) this.loadAnimalPhotos();
    if (this.name) {
      this.loadVaccines();
      this.loadMedicalHistory();
    }
  }

  loadAnimalPhotos() {
    this.photoService.getPhotos(this.id).subscribe({
      next: (photos) => {
        this.animalPhotos.set(photos);
        // Якщо фото ще не було в mainPhotoUrl, оновлюємо
        const main = photos.find((p) => p.isMain) || photos[0];
        if (main) this.mainPhotoUrl = main.fileUrl;
      },
    });
  }

  loadVaccines() {
    this.vaccinationsService.getVaccines(1, 100, this.name).subscribe({
      next: (res: any) => this.vaccines.set(res.items || []),
    });
  }

  loadMedicalHistory() {
    this.medicalExamsService.getMedicalExams(1, 100, this.name).subscribe({
      next: (res: any) => this.medicalHistory.set(res.items || []),
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && this.id) {
      this.photoService.uploadPhoto(this.id, file).subscribe({
        next: () => this.loadAnimalPhotos(),
      });
    }
  }

  setMainPhoto(photoId: number) {
    this.photoService.setMainPhoto(photoId, this.id).subscribe({
      next: () => {
        this.loadAnimalPhotos();
        this.animalUpdated.emit(); // Повідомляємо батька
      },
    });
  }

  deletePhoto(photoId: number) {
    if (confirm('Видалити це фото?')) {
      this.photoService.deletePhoto(photoId).subscribe({
        next: () => this.animalPhotos.update((p) => p.filter((x) => x.id !== photoId)),
      });
    }
  }

  onMainPhotoSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && this.id) {
      this.photoService.uploadPhoto(this.id, file).subscribe({
        next: (res: any) => this.setMainPhoto(res.id),
      });
    }
  }
}
