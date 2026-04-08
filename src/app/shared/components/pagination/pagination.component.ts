import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent {
  @Input({ required: true }) currentPage!: number;
  @Input({ required: true }) pageSize!: number;
  @Input({ required: true }) totalCount!: number;
  @Input({ required: true }) totalPages!: number;
  @Input() itemName: string = 'записів';

  @Output() pageChange = new EventEmitter<number>();

  get startItem(): number {
    if (this.totalCount === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    const end = this.currentPage * this.pageSize;
    return end > this.totalCount ? this.totalCount : end;
  }

  onPrev() {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  onNext() {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }
}
