import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  @Output() close = new EventEmitter<void>();

  onClose(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.close.emit();
  }

  preventClose(event: Event) {
    event.stopPropagation();
  }
}
