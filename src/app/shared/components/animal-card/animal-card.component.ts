import { Component, Input } from '@angular/core';
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

  // Приймаємо масив усіх фотографій з бекенду
  @Input() photos: any[] = [];

  currentIndex = 0;

  // Перейти до наступного фото
  nextSlide(event: Event) {
    event.stopPropagation(); // Щоб не відкрилася модалка деталізації
    if (this.currentIndex < this.photos.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
  }

  // Перейти до попереднього фото
  prevSlide(event: Event) {
    event.stopPropagation(); // Щоб не відкрилася модалка деталізації
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.photos.length - 1;
    }
  }

  // Вибір фото через крапочки
  setSlide(event: Event, index: number) {
    event.stopPropagation();
    this.currentIndex = index;
  }
}
