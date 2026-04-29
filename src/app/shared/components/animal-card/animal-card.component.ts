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

  // URL-и що не завантажились (щоб показати placeholder замість broken image)
  _brokenUrls = new Set<string>();

  // Лише фото з реальним шляхом: відфільтровуємо заглушки типу "photos/300/1.jpg"
  get validPhotos(): any[] {
    if (!this.photos?.length) return [];
    return this.photos.filter((p) => {
      const url = p.fileUrl || p.url || p.photoUrl || '';
      return url.startsWith('/images/') || url.startsWith('http');
    });
  }

  // Чи є хоча б одне фото яке не зламане
  get hasVisiblePhotos(): boolean {
    return this.validPhotos.some((p) => {
      const url = p.fileUrl || p.url || p.photoUrl || '';
      const full = url.startsWith('http')
        ? url
        : `http://localhost:5036${url.startsWith('/') ? '' : '/'}${url}`;
      return !this._brokenUrls.has(full);
    });
  }

  // Безпечне отримання URL поточного фото
  get currentPhotoUrl(): string {
    const valid = this.validPhotos;
    if (!valid.length) return '';
    const safeIndex = Math.min(this.currentIndex, valid.length - 1);
    const p = valid[safeIndex];
    const url = p.fileUrl || p.url || p.photoUrl;
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5036${url.startsWith('/') ? '' : '/'}${url}`;
  }

  // Якщо img не завантажився — запам'ятовуємо і перемальовуємо
  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    this._brokenUrls.add(img.src);
    img.style.display = 'none';
  }

  nextSlide(event: Event) {
    event.stopPropagation();
    const len = this.validPhotos.length;
    this.currentIndex = this.currentIndex < len - 1 ? this.currentIndex + 1 : 0;
  }

  prevSlide(event: Event) {
    event.stopPropagation();
    const len = this.validPhotos.length;
    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : len - 1;
  }

  setSlide(event: Event, index: number) {
    event.stopPropagation();
    this.currentIndex = index;
  }
}
