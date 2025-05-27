import { provideRouter } from '@angular/router';
import { routes } from './app.routes'; // ✅ Esto sí existe
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
  ],
};
