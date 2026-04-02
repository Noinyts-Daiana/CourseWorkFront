import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-medicine-page',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './medicine-page.component.html',
  styleUrl: './medicine-page.component.scss',
})
export class MedicinePageComponent {
  isAddModalOpen = false;
  selectedRecord: any = null;

  // Мокові дані для записів (як на твоєму скріншоті)
  medicalRecords = [
    {
      patientName: 'Рекс',
      date: '01.10.2023',
      temp: 38.5,
      weight: 25.5,
      notes: 'Здоровий, активний.',
    },
    {
      patientName: 'Мурка',
      date: '15.09.2023',
      temp: 38.2,
      weight: 6,
      notes: 'Легка алергія, призначено дієту.',
    },
  ];
}
