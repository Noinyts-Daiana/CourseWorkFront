import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthService } from './core/service/auth.service';
import { firstValueFrom } from 'rxjs';

// При старті застосунку намагаємося відновити сесію з куки
function initAuth(authService: AuthService) {
  return () => firstValueFrom(authService.restoreSession()).catch(() => null);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: AuthService) => initAuth(auth),
      deps: [AuthService],
      multi: true,
    },
  ],
};
