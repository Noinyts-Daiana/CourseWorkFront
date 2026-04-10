export interface MedicalRecord {
  id?: number;
  animalId?: number;
  animalName?: string;
  examDate?: string;
  temperature?: number;
  patientName?: string;
  date?: string;
  temp?: number;
  weight?: number;
  notes?: string;
}

export interface VaccineRecord {
  id?: number;
  dateAdministered: string;
  vaccineName: string;
  nextDueDate: string;
  animalId?: number;
  animalName?: string;
  patientName?: string;
  date?: string;
}
