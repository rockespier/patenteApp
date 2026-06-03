import { Injectable, inject, signal } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  // Signal global que contiene el usuario actual (null si no está logueado)
  currentUser = signal<User | null>(null);

  constructor() {
    // Escuchar cambios de estado de Firebase reactivamente
    authState(this.auth).subscribe(user => {
      this.currentUser.set(user);
    });
  }

  async login(email: string, pass: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, pass);
      this.router.navigate(['/quiz']);
    } catch (error) {
      console.error('Error al iniciar sesión', error);
      throw error;
    }
  }

  async register(email: string, pass: string): Promise<void> {
    try {
      await createUserWithEmailAndPassword(this.auth, email, pass);
      this.router.navigate(['/quiz']);
    } catch (error) {
      console.error('Error al registrarse', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }
}