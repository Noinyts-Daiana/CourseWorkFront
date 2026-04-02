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

  // Заглушка для іконки, поки не підключиш реальні картинки
  iconPath = '';
}
