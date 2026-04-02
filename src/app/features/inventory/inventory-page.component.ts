import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryCardComponent } from '../../shared/components/inventory-card/inventory-card.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [CommonModule, InventoryCardComponent, ModalComponent],
  templateUrl: './inventory-page.component.html',
  styleUrl: './inventory-page.component.scss',
})
export class InventoryPageComponent {
  isAddModalOpen = false; // Має бути false!
  selectedItem: any = null; // Має бути null!

  inventoryItems = [
    {
      title: 'Сухий корм для собак',
      brand: 'Royal Canin',
      currentStock: 45,
      minStock: 20,
      unit: 'кг',
      isLowStock: false,
    },
    {
      title: 'Вологий корм для котів',
      brand: 'Purina',
      currentStock: 15,
      minStock: 30,
      unit: 'шт',
      isLowStock: true,
    },
    {
      title: 'Вакцина комплексна',
      brand: 'Nobivac',
      currentStock: 8,
      minStock: 10,
      unit: 'доза',
      isLowStock: true,
    },
  ];
}
