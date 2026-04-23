import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animal-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animal-card.component.html',
  styleUrl: './animal-card.component.scss',
})
export class AnimalCardComponent {
  @Input() name: string = '';
  @Input() breed: string = '';
  @Input() gender: string = '';
  @Input() weight: number = 0;
  @Input() dob: string = '';
  @Input() isSterilized: boolean = false;
  @Input() animalType: string = 'dog';
  @Input() speciesName: string = '';
  @Input() photos: any[] = [];
  @Input() characteristics: string[] = [];

  // Емітери для фільтрації
  @Output() charClick = new EventEmitter<string>();
  @Output() breedClick = new EventEmitter<void>();
  @Output() speciesClick = new EventEmitter<void>();
  @Output() sexClick = new EventEmitter<void>();

  currentIndex = 0;

  // Безпечне отримання URL (щоб картинки не билися)
  get currentPhotoUrl(): string {
    if (!this.photos || this.photos.length === 0) return '';
    const p = this.photos[this.currentIndex];
    const url = p.fileUrl || p.url || p.photoUrl;
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5036${url.startsWith('/') ? '' : '/'}${url}`;
  }

  nextSlide(event: Event) {
    event.stopPropagation();
    if (this.currentIndex < this.photos.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
  }

  prevSlide(event: Event) {
    event.stopPropagation();
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.photos.length - 1;
    }
  }

  setSlide(event: Event, index: number) {
    event.stopPropagation();
    this.currentIndex = index;
  }
}
