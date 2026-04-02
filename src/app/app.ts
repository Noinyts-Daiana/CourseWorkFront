import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// Видалили імпорт SidebarComponent звідси

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // Залишили ТІЛЬКИ RouterOutlet
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('CourseWorkFront');
}
