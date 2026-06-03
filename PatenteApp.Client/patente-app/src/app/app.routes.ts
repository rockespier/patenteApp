import { Routes } from '@angular/router';
import { authGuard, publicGuard } from '../core/guards/auth.guard';

export const routes: Routes = [
  // Ruta por defecto redirige al login si no está logueado, el guard decide
  { 
    path: '', 
    redirectTo: 'quiz', 
    pathMatch: 'full' 
  },
  
  // Ruta de Login (Protegida por publicGuard para que no entren si ya están logueados)
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [publicGuard],
    title: 'Accedi - PatenteApp'
  },

  // Ruta del Simulacro (Protegida por authGuard)
  { 
    path: 'quiz', 
    loadComponent: () => import('./features/quiz/quiz.component').then(m => m.QuizComponent),
    canActivate: [authGuard],
    title: 'Simulazione Esame - Patente di Guida'
  },
 { 
  path: 'history', 
  loadComponent: () => import('./features/history/history/history.component').then(m => m.HistoryComponent),
  canActivate: [authGuard],
  title: 'Storico Risultati - Patente di Guida'
  },
  { 
    path: '**', 
    redirectTo: 'quiz' 
  }
];