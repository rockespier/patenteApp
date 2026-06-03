// src/app/core/services/exam.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/environment';
import { Question, QuizResult, QuizSubmission } from '../models/exam.models';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  // Inyección de dependencias moderna en Angular
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Obtiene 30 preguntas aleatorias del backend
   */
  getSimulation(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.baseUrl}/questions/simulate`);
  }

  /**
   * Envía las respuestas al backend para su evaluación
   */
  submitExam(submission: QuizSubmission): Observable<QuizResult> {
    return this.http.post<QuizResult>(`${this.baseUrl}/quiz/submit`, submission);
  }
}