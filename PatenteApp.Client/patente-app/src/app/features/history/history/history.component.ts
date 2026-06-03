import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviroments/environment';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

export interface HistoryItem { dateTaken: Date; errorsCount: number; passed: boolean; }

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  private http = inject(HttpClient);
  history = signal<HistoryItem[]>([]);
  private router = inject(Router);

  ngOnInit() {
    this.http.get<HistoryItem[]>(`${environment.apiUrl}/quiz/history`)
      .subscribe(data => this.history.set(data));
  }

  goBack(): void {
    this.router.navigate(['/quiz']);
  }
}