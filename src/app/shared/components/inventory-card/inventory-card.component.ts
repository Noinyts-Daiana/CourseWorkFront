import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventory-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory-card.component.html',
  styleUrl: './inventory-card.component.scss',
})
export class InventoryCardComponent {
  @Input() title: string = '';
  @Input() brand: string = '';
  @Input() currentStock: number = 0;
  @Input() minStock: number = 0;
  @Input() unit: string = '';
  @Input() isLowStock: boolean = false;

  getPercentage(): number {
    if (this.minStock === 0) return 100;
    const percent = (this.currentStock / (this.minStock * 2)) * 100;
    return Math.min(percent, 100);
  }
}
