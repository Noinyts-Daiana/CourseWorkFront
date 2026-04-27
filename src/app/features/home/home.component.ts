import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/service/auth.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { AnimalService } from '../../core/service/animal.service';
import { AdoptAnimalService } from '../../core/service/adopt-animal.service';

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
  private adoptService = inject(AdoptAnimalService);

  // Auth
  isAuthModalOpen = false;
  authTab: 'login' | 'register' = 'login';
  isLoading = false;
  errorMessage = signal<string | null>(null);
  regData = { email: '', password: '', phone: '', fullName: '' };

  // Animals / pagination
  animalsLoading = signal(true);
  pets = signal<any[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  totalCount = signal(0);
  readonly pageSize = 6;

  // Adoption modal
  isAdoptionModalOpen = false;
  selectedPetForAdoption: any = null;
  adoptionState = signal<'idle' | 'loading' | 'success' | 'error' | 'auth-required'>('idle');
  adoptionError = signal<string | null>(null);

  isLoggedIn = computed(() => this.authService.isLoggedIn());
  hasAdoptPermission = computed(() =>
    this.authService.permissions().includes('CreateAdoptionRequest'),
  );

  ngOnInit() {
    this.loadPage(1);
  }

  loadPage(page: number) {
    this.animalsLoading.set(true);
    this.animalService.getPublicAnimals(page, this.pageSize).subscribe({
      next: (res: any) => {
        this.pets.set(res.items || []);
        this.currentPage.set(res.pageNumber ?? page);
        this.totalPages.set(res.totalPages ?? 1);
        this.totalCount.set(res.totalCount ?? 0);
        this.animalsLoading.set(false);
      },
      error: () => this.animalsLoading.set(false),
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.loadPage(page);
    document.getElementById('pets')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  getPages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1);
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++)
        pages.push(i);
      if (current < total - 2) pages.push(-1);
      pages.push(total);
    }
    return pages;
  }

  getGenderLabel(sex: number): string {
    return sex === 1 ? 'Хлопчик' : 'Дівчинка';
  }

  getAnimalPhoto(animal: any): string | null {
    if (animal.photos && animal.photos.length > 0) return animal.photos[0].url;
    if (animal.photoUrl) return animal.photoUrl;
    return null;
  }

  openAdoptionModal(pet: any) {
    this.selectedPetForAdoption = pet;
    this.isAdoptionModalOpen = true;
    this.adoptionState.set('idle');
    this.adoptionError.set(null);
  }


  openAuthModal() {
    this.isAuthModalOpen = true;
    this.authTab = 'login';
    this.errorMessage.set(null);
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
