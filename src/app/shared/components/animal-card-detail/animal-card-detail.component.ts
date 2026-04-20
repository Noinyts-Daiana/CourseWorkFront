import { Component, Input, OnInit, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicalExamsService } from '../../../core/service/medical-exams.service';
import { VaccinationsService } from '../../../core/service/vaccinations.service';

@Component({
  selector: 'app-animal-card-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animal-card-detail.component.html',
  styleUrl: './animal-card-detail.component.scss',
})
export class AnimalCardDetailComponent implements OnInit {
  @Input() name!: string;
  @Input() breed!: string;
  @Input() animalType!: string;
  @Input() gender!: string;
  @Input() weight!: number;
  @Input() dob!: string;
  @Input() isSterilized!: boolean;

  @Output() closeModal = new EventEmitter<void>();

  activeTab: 'general' | 'medical' = 'general';

  vaccines = signal<any[]>([]);
  medicalHistory = signal<any[]>([]);

  private medicalExamsService = inject(MedicalExamsService);
  private vaccinationsService = inject(VaccinationsService);


  ngOnInit() {
    this.vaccinationsService.getVaccines(1, 100, this.name).subscribe({
      next: (res: any) => this.vaccines.set(res.items || []),
    });

    this.medicalExamsService.getMedicalExams(1, 100, this.name).subscribe({
      next: (res: any) => this.medicalHistory.set(res.items || []),
    });
  }
}
