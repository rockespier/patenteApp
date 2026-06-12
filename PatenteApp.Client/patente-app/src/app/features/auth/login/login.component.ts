import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  // --- SIGNALS DE ESTADO ---
  isLoginMode = signal<boolean>(true); // true = Login, false = Registro
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // --- FORMULARIO REACTIVO ---
  authForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  toggleMode(): void {
    this.isLoginMode.update(v => !v);
    this.errorMessage.set(null); // Limpiamos errores al cambiar de modo
    this.authForm.reset();
  }

  async onSubmit(): Promise<void> {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.authForm.value;

    try {
      if (this.isLoginMode()) {
        await this.authService.login(email!, password!);
      } else {
        await this.authService.register(email!, password!);
      }
      // El AuthService ya se encarga de redirigir a /quiz si hay éxito
    } catch (error: any) {
      this.handleFirebaseError(error.code);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Traducción de errores técnicos a mensajes de UX amigables
  private handleFirebaseError(errorCode: string): void {
    switch (errorCode) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        this.errorMessage.set('Email o password errati.');
        break;
      case 'auth/email-already-in-use':
        this.errorMessage.set('Questo indirizzo email è già registrato.');
        break;
      case 'auth/network-request-failed':
        this.errorMessage.set('Errore di rete. Controlla la tua connessione.');
        break;
      default:
        this.errorMessage.set('Si è verificato un errore inaspettato. Riprova.');
    }
  }

  // Getters para el HTML
  get emailControl() { return this.authForm.get('email'); }
  get passwordControl() { return this.authForm.get('password'); }

  async loginWithGoogle(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.loginWithGoogle();
    } catch (error: any) {
      // Manejo de error común: el usuario cierra la ventana flotante antes de firmar
      if (error.code === 'auth/popup-closed-by-user') {
        this.errorMessage.set('Accesso annullato dall\'utente.');
      } else {
        this.errorMessage.set('Impossibile accedere con Google. Riprova.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
  
}