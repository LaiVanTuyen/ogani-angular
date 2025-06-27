import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { isPlatformBrowser } from '@angular/common';

interface User {
  id: number;
  username: string;
  email: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiBaseUrl = environment.apiBaseUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Check if user is stored in localStorage (only in browser)
    if (this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          this.currentUserSubject.next(JSON.parse(storedUser));
        } catch (e) {
          // Handle potential JSON parse error
          localStorage.removeItem('currentUser');
        }
      }
    }
  }

  login(email: string, password: string): Observable<User> {
    // For demo purposes, simulating a successful login
    // In a real app, replace with actual API call
    if (email === 'demo@example.com' && password === 'password') {
      const user: User = {
        id: 1,
        username: 'Demo User',
        email: email,
        token: 'fake-jwt-token'
      };

      // Store user in localStorage (only in browser)
      if (this.isBrowser) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }

      this.currentUserSubject.next(user);
      return of(user);
    }

    return throwError(() => new Error('Invalid credentials'));

    // Uncomment this for real implementation:
    // return this.http.post<User>(`${this.apiBaseUrl}/auth/login`, { email, password })
    //   .pipe(
    //     tap(user => {
    //       if (this.isBrowser) {
    //         localStorage.setItem('currentUser', JSON.stringify(user));
    //       }
    //       this.currentUserSubject.next(user);
    //     }),
    //     catchError(error => {
    //       return throwError(() => new Error('Invalid credentials'));
    //     })
    //   );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
