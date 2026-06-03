import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { isDevMode } from '@angular/core';
import { environment } from '../enviroments/environment';

// Importaciones de Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { authInterceptor } from '../core/interceptors/auth.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    // Agregamos withInterceptors([authInterceptor])
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),    
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
    //, provideFirebaseApp(() => initializeApp({ projectId: "patenteapp-415a9", appId: "1:517159636575:web:11fa6b751fce4b518c15ea", storageBucket: "patenteapp-415a9.firebasestorage.app", apiKey: "AIzaSyB3BJsrald7eirOM3CDzf_Y44GzVZye0ZU", authDomain: "patenteapp-415a9.firebaseapp.com", messagingSenderId: "517159636575", measurementId: "G-98WVE07VST"})), provideAuth(() => getAuth())
    // Inicialización de Firebase
    , provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth())
  ]
};