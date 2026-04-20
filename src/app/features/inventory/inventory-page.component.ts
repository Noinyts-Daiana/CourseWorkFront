import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../core/service/inventory.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { InventoryCardComponent } from '../../shared/components/inventory-card/inventory-card.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, InventoryCardComponent, PaginationComponent],
  templateUrl: './inventory-page.component.html',
  styleUrl: './inventory-page.component.scss',
})
export class InventoryPageComponent implements OnInit {
  private inventoryService = inject(InventoryService);

  // --- СТАН ДАНИХ (додано searchTerm) ---
  inventoryItems = signal<any[]>([]);
  currentPage = signal(1);
  pageSize = signal(9);
  totalCount = signal(0);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()) || 1);
  searchTerm = signal(''); // ❗️ Сигнал для пошуку

  // --- БРЕНДИ (з попереднього кроку) ---
  brandsList = signal<string[]>([]);
  brandsCurrentPage = signal(1);
  brandsTotalPages = signal(1);
  isBrandsDropdownOpen = signal(false);
  brandSearchTerm = signal('');

  // --- СТАН МОДАЛОК ---
  isAddModalOpen = signal(false);
  isIncomeModalOpen = signal(false);
  isExpenseModalOpen = signal(false);
  selectedItem: any = null;

  newItemData = {
    name: '',
    brand: '',
    unit: 'Кг',
    stockQuantity: null as number | null,
    minThreshold: null as number | null,
  };
  adjustAmount: number | null = null;

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.inventoryService
      .getItems(this.currentPage(), this.pageSize(), this.searchTerm())
      .subscribe({
        next: (res: any) => {
          const items = (res.items || []).map((item: any) => ({
            ...item,
            isLowStock: item.stockQuantity <= item.minThreshold,
          }));
          this.inventoryItems.set(items);
          this.totalCount.set(res.totalCount || 0);
        },
      });
  }

  onMainSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.loadItems();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadItems();
  }

  openAddModal() {
    this.newItemData = { name: '', brand: '', unit: 'Кг', stockQuantity: null, minThreshold: null };
    this.brandSearchTerm.set('');
    this.loadBrands(1, '');
    this.isAddModalOpen.set(true);
  }

  saveNewItem() {
    this.inventoryService.addItem(this.newItemData).subscribe({
      next: () => {
        this.isAddModalOpen.set(false);
        this.loadItems();
      },
    });
  }

  openAdjustModal(type: 'income' | 'expense') {
    this.adjustAmount = null;
    if (type === 'income') this.isIncomeModalOpen.set(true);
    if (type === 'expense') this.isExpenseModalOpen.set(true);
  }

  submitAdjustStock(isIncome: boolean) {
    if (!this.selectedItem || !this.adjustAmount) return;
    const finalAmount = isIncome ? this.adjustAmount : -Math.abs(this.adjustAmount);
    this.inventoryService.adjustStock(this.selectedItem.id, finalAmount).subscribe({
      next: () => {
        this.isIncomeModalOpen.set(false);
        this.isExpenseModalOpen.set(false);
        this.selectedItem = null;
        this.loadItems();
      },
    });
  }

  loadBrands(page: number = 1, search: string = '') {
    this.inventoryService.getBrands(search, page, 10).subscribe({
      next: (res: any) => {
        if (page === 1) this.brandsList.set(res.items || []);
        else this.brandsList.set([...this.brandsList(), ...(res.items || [])]);
        this.brandsCurrentPage.set(res.pageNumber);
        this.brandsTotalPages.set(Math.ceil(res.totalCount / res.pageSize));
      },
    });
  }

  onBrandInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.newItemData.brand = value;
    this.brandSearchTerm.set(value);
    this.isBrandsDropdownOpen.set(true);
    this.loadBrands(1, value);
  }

  selectBrand(brand: string) {
    this.newItemData.brand = brand;
    this.isBrandsDropdownOpen.set(false);
  }

  loadMoreBrands() {
    if (this.brandsCurrentPage() < this.brandsTotalPages()) {
      this.loadBrands(this.brandsCurrentPage() + 1, this.brandSearchTerm());
    }
  }

  closeBrandsDropdown() {
    setTimeout(() => this.isBrandsDropdownOpen.set(false), 200);
  }
}
