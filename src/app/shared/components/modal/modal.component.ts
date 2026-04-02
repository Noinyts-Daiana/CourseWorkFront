import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss' // або css
})
export class ModalComponent {
  @Output() close = new EventEmitter<void>();

  // Метод, який точно і безпомилково відправляє подію закриття
  onClose(event?: Event) {
    // Якщо клік прийшов від події, зупиняємо його розповсюдження
    if (event) {
      event.stopPropagation();
    }
    this.close.emit();
  }

  // Метод, щоб блокувати кліки всередині самої модалки (щоб вона не закривалася сама по собі)
  preventClose(event: Event) {
    event.stopPropagation();
  }
}
