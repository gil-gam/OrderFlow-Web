import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiBaseUrl}/api/Auth`;

  private readonly tokenSignal = signal<string | null>(this.loadToken());
  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);
  readonly token = this.tokenSignal.asReadonly();

  private loadToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  private persistToken(token: string): void {
    localStorage.setItem(environment.tokenKey, token);
    this.tokenSignal.set(token);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((res) => this.persistToken(res.token)),
      catchError((err) => {
        console.error('[AuthService] Login failed', err);
        return throwError(() => err);
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap((res) => this.persistToken(res.token)),
      catchError((err) => {
        console.error('[AuthService] Register failed', err);
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(environment.tokenKey);
    this.tokenSignal.set(null);
    this.router.navigate(['/auth/login']);
  }
}
