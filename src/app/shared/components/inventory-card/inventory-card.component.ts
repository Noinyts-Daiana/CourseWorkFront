import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventory-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory-card.component.html',
  styleUrl: './inventory-card.component.scss',
})
export class InventoryCardComponent {
  @Input() title = '';
  @Input() brand = '';
  @Input() currentStock = 0;
  @Input() minStock = 0;
  @Input() unit = '';
  @Input() isLowStock = false;

  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  getPercentage() {
    if (this.currentStock <= 0) return 0;
    const max = Math.max(this.currentStock, this.minStock * 2);
    return (this.currentStock / max) * 100;
  }

  onEditClick(event: Event) {
    event.stopPropagation(); // Щоб не відкрилася модалка деталей
    this.edit.emit();
  }

  onDeleteClick(event: Event) {
    event.stopPropagation(); // Щоб не відкрилася модалка деталей
    this.delete.emit();
  }
}
