import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, timer, catchError, map, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface HealthStatus {
  status: 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';
  timestamp: Date;
  checks: {
    api: ComponentHealth;
    auth: ComponentHealth;
  };
  responseTime?: number;
}

export interface ComponentHealth {
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  message?: string;
  responseTime?: number;
}

const initialHealth: HealthStatus = {
  status: 'UNKNOWN',
  timestamp: new Date(),
  checks: {
    api: { status: 'UNKNOWN' },
    auth: { status: 'UNKNOWN' }
  }
};

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  private readonly API_URL = environment.apiUrl;
  private http = inject(HttpClient);

  private healthSubject = new BehaviorSubject<HealthStatus>(initialHealth);
  health$ = this.healthSubject.asObservable();

  private isCheckingSubject = new BehaviorSubject<boolean>(false);
  isChecking$ = this.isCheckingSubject.asObservable();

  get currentHealth(): HealthStatus {
    return this.healthSubject.getValue();
  }

  checkHealth(): Observable<HealthStatus> {
    this.isCheckingSubject.next(true);
    const startTime = Date.now();

    return this.checkApiHealth().pipe(
      switchMap(apiHealth => {
        return this.checkAuthHealth().pipe(
          map(authHealth => {
            const responseTime = Date.now() - startTime;
            const health: HealthStatus = {
              status: this.calculateOverallStatus(apiHealth, authHealth),
              timestamp: new Date(),
              checks: {
                api: apiHealth,
                auth: authHealth
              },
              responseTime
            };

            this.healthSubject.next(health);
            this.isCheckingSubject.next(false);
            return health;
          })
        );
      }),
      catchError(() => {
        const health: HealthStatus = {
          status: 'DOWN',
          timestamp: new Date(),
          checks: {
            api: { status: 'DOWN', message: 'Falha na conexao' },
            auth: { status: 'UNKNOWN' }
          },
          responseTime: Date.now() - startTime
        };
        this.healthSubject.next(health);
        this.isCheckingSubject.next(false);
        return of(health);
      })
    );
  }

  private checkApiHealth(): Observable<ComponentHealth> {
    const startTime = Date.now();

    return this.http.get(`${this.API_URL}/v1/pets?size=1`).pipe(
      map(() => ({
        status: 'UP' as const,
        message: 'API respondendo normalmente',
        responseTime: Date.now() - startTime
      })),
      catchError(error => {
        if (error.status === 401) {
          return of({
            status: 'UP' as const,
            message: 'API disponivel (requer autenticacao)',
            responseTime: Date.now() - startTime
          });
        }
        return of({
          status: 'DOWN' as const,
          message: `Erro: ${error.status || 'Conexao falhou'}`,
          responseTime: Date.now() - startTime
        });
      })
    );
  }

  private checkAuthHealth(): Observable<ComponentHealth> {
    const startTime = Date.now();

    return this.http.post(`${this.API_URL}/autenticacao/login`, {
      username: 'health-check',
      password: 'invalid'
    }).pipe(
      map(() => ({
        status: 'UP' as const,
        message: 'Servico de autenticacao disponivel',
        responseTime: Date.now() - startTime
      })),
      catchError(error => {
        if (error.status === 401 || error.status === 403) {
          return of({
            status: 'UP' as const,
            message: 'Servico de autenticacao disponivel',
            responseTime: Date.now() - startTime
          });
        }
        return of({
          status: 'DOWN' as const,
          message: `Erro: ${error.status || 'Conexao falhou'}`,
          responseTime: Date.now() - startTime
        });
      })
    );
  }

  private calculateOverallStatus(api: ComponentHealth, auth: ComponentHealth): 'UP' | 'DOWN' | 'DEGRADED' {
    if (api.status === 'DOWN' && auth.status === 'DOWN') {
      return 'DOWN';
    }
    if (api.status === 'DOWN' || auth.status === 'DOWN') {
      return 'DEGRADED';
    }
    return 'UP';
  }

  startPeriodicCheck(intervalMs: number = 30000): Observable<HealthStatus> {
    return timer(0, intervalMs).pipe(
      switchMap(() => this.checkHealth())
    );
  }

  isLive(): Observable<boolean> {
    return this.health$.pipe(
      map(health => health.status !== 'DOWN')
    );
  }

  isReady(): Observable<boolean> {
    return this.health$.pipe(
      map(health => health.status === 'UP')
    );
  }
}
