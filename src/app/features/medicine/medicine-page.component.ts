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
  isVaccineModalOpen = false;
  selectedRecord: any = null;

  activeTab: 'vaccines' | 'exams' = 'exams';

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

  vaccineRecords = [
    {
      patientName: 'Барон',
      date: '12.08.2023',
      vaccineName: 'Комплексна (Nobivac)',
      nextDate: '12.08.2024',
    },
    {
      patientName: 'Сніжок',
      date: '05.09.2023',
      vaccineName: 'Сказ (Rabisin)',
      nextDate: '05.09.2024',
    },
  ];
}
