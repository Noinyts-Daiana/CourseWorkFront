import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() theme: 'blue' | 'pink' | 'yellow' | 'green' = 'blue'; // Синя за замовчуванням
}
