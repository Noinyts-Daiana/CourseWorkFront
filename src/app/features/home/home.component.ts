import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/service/auth.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { AnimalService } from '../../core/service/animal.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ModalComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private animalService = inject(AnimalService);

  isAuthModalOpen = false;
  isAdoptionModalOpen = false;
  authTab: 'login' | 'register' = 'login';
  selectedPetForAdoption: any = null;
  isLoading = false;
  animalsLoading = signal(true);

  errorMessage = signal<string | null>(null);
  regData = { email: '', password: '', phone: '', fullName: '' };
  pets = signal<any[]>([]);

  ngOnInit() {
    this.animalService.getPublicAnimals(1, 8).subscribe({
      next: (res: any) => {
        this.pets.set(res.items || []);
        this.animalsLoading.set(false);
      },
      error: () => this.animalsLoading.set(false),
    });
  }

  getGenderLabel(sex: number): string {
    return sex === 1 ? 'Хлопчик' : 'Дівчинка';
  }

  getAnimalPhoto(animal: any): string | null {
    if (animal.photos && animal.photos.length > 0) return animal.photos[0].url;
    if (animal.photoUrl) return animal.photoUrl;
    return null;
  }

  openAuthModal() {
    this.isAuthModalOpen = true;
    this.authTab = 'login';
    this.errorMessage.set(null);
  }

  openAdoptionModal(pet: any) {
    this.selectedPetForAdoption = pet;
    this.isAdoptionModalOpen = true;
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => alert('Скопійовано: ' + text));
  }

  onSubmit(form: NgForm) {
    this.errorMessage.set(null);
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    if (this.authTab === 'register') this.onRegister();
    else this.onLogin();
  }

  onLogin() {
    this.isLoading = true;
    this.authService.login(this.regData.email, this.regData.password).subscribe({
      next: (user) => {
        this.isAuthModalOpen = false;
        this.isLoading = false;
        if (user.permissions.includes('ViewDashboard')) this.router.navigate(['/dashboard']);
        else this.router.navigate(['/user-profile']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage.set(err.error?.message || 'Помилка входу. Перевірте дані.');
      },
    });
  }

  onRegister() {
    this.isLoading = true;
    this.authService
      .register({
        fullName: this.regData.fullName.trim(),
        email: this.regData.email.trim(),
        password: this.regData.password,
        roleId: 3,
      })
      .subscribe({
        next: (user) => {
          this.isAuthModalOpen = false;
          this.isLoading = false;
          if (user.permissions?.includes('ViewDashboard')) this.router.navigate(['/dashboard']);
          else this.router.navigate(['/user-profile']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage.set(err.error?.message || 'Помилка реєстрації. Перевірте дані.');
        },
      });
  }
}
