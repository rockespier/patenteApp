import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamService } from '../../../core/services/exam.service';
import { Question, QuizResult, QuizSubmission, UserAnswer } from '../../../core/models/exam.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'quiz.component.html',
  styleUrls: ['quiz.component.css']
})
export class QuizComponent implements OnInit {
  // Inyección de dependencias moderna
  private readonly examService = inject(ExamService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  // --- SIGNALS (Estado de la aplicación) ---
  questions = signal<Question[]>([]);
  currentIndex = signal<number>(0);
  
  // Guardamos las respuestas en un Map para búsquedas O(1)
  answers = signal<Map<string, boolean>>(new Map());
  
  timeLeft = signal<number>(1200); // 20 minutos (1200 segundos)
  isSubmitting = signal<boolean>(false);
  sessionId = signal<string>(crypto.randomUUID()); // ID único de la sesión

  // --- COMPUTED SIGNALS (Estado derivado) ---
  currentQuestion = computed(() => {
    const qs = this.questions();
    return qs.length > 0 ? qs[this.currentIndex()] : null;
  });

  currentAnswer = computed(() => {
    const q = this.currentQuestion();
    if (!q) return null;
    const ans = this.answers().get(q.id);
    return ans !== undefined ? ans : null;
  });

  formattedTime = computed(() => {
    const time = this.timeLeft();
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

      // Agrega este Signal junto a los demás en tu clase QuizComponent:
examResult = signal<QuizResult | null>(null);

  // --- MÉTODOS DEL CICLO DE VIDA ---
  ngOnInit(): void {
    this.loadQuestions();
  }

  // --- LÓGICA DE NEGOCIO ---
  private loadQuestions(): void {
    this.examService.getSimulation().subscribe({
      next: (data) => {
        this.questions.set(data);
        this.startTimer();
      },
      error: (err) => console.error('Error al cargar preguntas', err)
    });
  }

  private startTimer(): void {
    const intervalId = setInterval(() => {
      this.timeLeft.update(time => {
        if (time <= 1) {
          clearInterval(intervalId);
          this.submitExam(); // Autoguardado al acabar el tiempo
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    // Limpieza de memoria automática cuando el componente se destruye
    this.destroyRef.onDestroy(() => clearInterval(intervalId));
  }

  selectAnswer(value: boolean): void {
    const q = this.currentQuestion();
    if (!q) return;

    // Actualizamos el Map de respuestas inmutablemente
    this.answers.update(map => {
      const newMap = new Map(map);
      newMap.set(q.id, value);
      return newMap;
    });

    // Auto-avanzar a la siguiente pregunta si no estamos en la última
    if (this.currentIndex() < this.questions().length - 1) {
      setTimeout(() => this.currentIndex.update(i => i + 1), 300); // Pequeño delay por UX
    }
  }

  goToQuestion(index: number): void {
    this.currentIndex.set(index);
  }

  hasAnswered(questionId: string): boolean {
    return this.answers().has(questionId);
  }

goToHistory(): void {
  this.router.navigate(['/history']);
}

// Reemplaza el método submitExam con este:
submitExam(): void {
  if (this.isSubmitting()) return;
  this.isSubmitting.set(true);

  const submissionAnswers: UserAnswer[] = [];
  this.answers().forEach((answer, questionId) => {
    submissionAnswers.push({ questionId, answer });
  });

  const submission: QuizSubmission = {
    sessionId: this.sessionId(),
    answers: submissionAnswers
  };

  this.examService.submitExam(submission).subscribe({
    next: (result) => {
      // En lugar del alert, guardamos el resultado en el Signal
      // Esto disparará automáticamente el cambio de vista en el HTML
      this.examResult.set(result); 
      this.isSubmitting.set(false);
    },
    error: (err) => {
      console.error('Errore durante l\'invio dell\'esame', err);
      this.isSubmitting.set(false);
      alert('Hubo un error de conexión. Inténtalo de nuevo.');
    }
  });
}


// Nuevo método para reiniciar la simulación limpiando el estado
restartQuiz(): void {
  this.examResult.set(null);       // Oculta la vista de resultados
  this.answers.set(new Map());     // Limpia las respuestas
  this.currentIndex.set(0);        // Vuelve a la pregunta 1
  this.timeLeft.set(1200);         // Reinicia el reloj (20 min)
  this.sessionId.set(crypto.randomUUID()); // Nueva sesión
  this.questions.set([]);          // Limpia las preguntas anteriores
  this.loadQuestions();            // Llama a la API por 30 preguntas nuevas
}
}