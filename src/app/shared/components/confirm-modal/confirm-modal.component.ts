import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component'; // Зміни шлях на свій!

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './confirm-modal.component.html',
})
export class ConfirmModalComponent {
  @Input() title: string = 'Підтвердження';
  @Input() message: string = 'Ви впевнені, що хочете виконати цю дію?';
  @Input() btnText: string = 'Підтвердити';
  @Input() btnClass: string = 'btn-danger';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
