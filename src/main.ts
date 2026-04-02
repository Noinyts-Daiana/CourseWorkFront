import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app'; // <-- Зверни увагу на цей імпорт! Має вести на твій app.ts

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
