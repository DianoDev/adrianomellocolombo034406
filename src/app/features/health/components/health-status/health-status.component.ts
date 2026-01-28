import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { HealthService, HealthStatus } from '../../../../core/services/health.service';

@Component({
  selector: 'app-health-status',
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Back Button -->
        <div class="mb-6">
          <a
            routerLink="/pets"
            class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg class="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </a>
        </div>

        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Health Check</h1>
          <p class="mt-2 text-sm text-gray-600">Status dos servicos da aplicacao</p>
        </div>

        <!-- Overall Status Card -->
        <div class="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div
                class="w-16 h-16 rounded-full flex items-center justify-center"
                [class.bg-green-100]="health()?.status === 'UP'"
                [class.bg-yellow-100]="health()?.status === 'DEGRADED'"
                [class.bg-red-100]="health()?.status === 'DOWN'"
                [class.bg-gray-100]="health()?.status === 'UNKNOWN'"
              >
                @if (health()?.status === 'UP') {
                  <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                } @else if (health()?.status === 'DEGRADED') {
                  <svg class="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                } @else if (health()?.status === 'DOWN') {
                  <svg class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                } @else {
                  <svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              </div>
              <div>
                <h2 class="text-xl font-semibold text-gray-900">
                  Status Geral: {{ getStatusLabel(health()?.status) }}
                </h2>
                <p class="text-sm text-gray-500">
                  Ultima verificacao: {{ health()?.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}
                </p>
                @if (health()?.responseTime) {
                  <p class="text-sm text-gray-500">
                    Tempo de resposta: {{ health()?.responseTime }}ms
                  </p>
                }
              </div>
            </div>
            <button
              type="button"
              (click)="refresh()"
              [disabled]="isChecking()"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              @if (isChecking()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verificando...
              } @else {
                <svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Atualizar
              }
            </button>
          </div>
        </div>

        <!-- Liveness & Readiness -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div class="bg-white rounded-xl shadow-sm p-4">
            <div class="flex items-center space-x-3">
              <div
                class="w-3 h-3 rounded-full"
                [class.bg-green-500]="isLive()"
                [class.bg-red-500]="!isLive()"
              ></div>
              <div>
                <p class="text-sm font-medium text-gray-900">Liveness</p>
                <p class="text-xs text-gray-500">{{ isLive() ? 'Aplicacao ativa' : 'Aplicacao inativa' }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <div class="flex items-center space-x-3">
              <div
                class="w-3 h-3 rounded-full"
                [class.bg-green-500]="isReady()"
                [class.bg-yellow-500]="!isReady() && isLive()"
                [class.bg-red-500]="!isReady() && !isLive()"
              ></div>
              <div>
                <p class="text-sm font-medium text-gray-900">Readiness</p>
                <p class="text-xs text-gray-500">{{ isReady() ? 'Pronta para requisicoes' : 'Nao disponivel' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Component Health Details -->
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Detalhes dos Servicos</h3>
          </div>
          <div class="divide-y divide-gray-200">
            <!-- API Health -->
            <div class="px-6 py-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 rounded-lg flex items-center justify-center"
                    [class.bg-green-100]="health()?.checks?.api?.status === 'UP'"
                    [class.bg-red-100]="health()?.checks?.api?.status === 'DOWN'"
                    [class.bg-gray-100]="health()?.checks?.api?.status === 'UNKNOWN'"
                  >
                    <svg class="h-5 w-5"
                      [class.text-green-600]="health()?.checks?.api?.status === 'UP'"
                      [class.text-red-600]="health()?.checks?.api?.status === 'DOWN'"
                      [class.text-gray-400]="health()?.checks?.api?.status === 'UNKNOWN'"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">API Backend</p>
                    <p class="text-xs text-gray-500">{{ health()?.checks?.api?.message || 'Aguardando verificacao' }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [class.bg-green-100]="health()?.checks?.api?.status === 'UP'"
                    [class.text-green-800]="health()?.checks?.api?.status === 'UP'"
                    [class.bg-red-100]="health()?.checks?.api?.status === 'DOWN'"
                    [class.text-red-800]="health()?.checks?.api?.status === 'DOWN'"
                    [class.bg-gray-100]="health()?.checks?.api?.status === 'UNKNOWN'"
                    [class.text-gray-800]="health()?.checks?.api?.status === 'UNKNOWN'"
                  >
                    {{ health()?.checks?.api?.status || 'UNKNOWN' }}
                  </span>
                  @if (health()?.checks?.api?.responseTime) {
                    <p class="text-xs text-gray-400 mt-1">{{ health()?.checks?.api?.responseTime }}ms</p>
                  }
                </div>
              </div>
            </div>

            <!-- Auth Health -->
            <div class="px-6 py-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 rounded-lg flex items-center justify-center"
                    [class.bg-green-100]="health()?.checks?.auth?.status === 'UP'"
                    [class.bg-red-100]="health()?.checks?.auth?.status === 'DOWN'"
                    [class.bg-gray-100]="health()?.checks?.auth?.status === 'UNKNOWN'"
                  >
                    <svg class="h-5 w-5"
                      [class.text-green-600]="health()?.checks?.auth?.status === 'UP'"
                      [class.text-red-600]="health()?.checks?.auth?.status === 'DOWN'"
                      [class.text-gray-400]="health()?.checks?.auth?.status === 'UNKNOWN'"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">Autenticacao</p>
                    <p class="text-xs text-gray-500">{{ health()?.checks?.auth?.message || 'Aguardando verificacao' }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [class.bg-green-100]="health()?.checks?.auth?.status === 'UP'"
                    [class.text-green-800]="health()?.checks?.auth?.status === 'UP'"
                    [class.bg-red-100]="health()?.checks?.auth?.status === 'DOWN'"
                    [class.text-red-800]="health()?.checks?.auth?.status === 'DOWN'"
                    [class.bg-gray-100]="health()?.checks?.auth?.status === 'UNKNOWN'"
                    [class.text-gray-800]="health()?.checks?.auth?.status === 'UNKNOWN'"
                  >
                    {{ health()?.checks?.auth?.status || 'UNKNOWN' }}
                  </span>
                  @if (health()?.checks?.auth?.responseTime) {
                    <p class="text-xs text-gray-400 mt-1">{{ health()?.checks?.auth?.responseTime }}ms</p>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Info -->
        <div class="mt-6 p-4 bg-blue-50 rounded-lg">
          <div class="flex">
            <svg class="h-5 w-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="ml-3">
              <p class="text-sm text-blue-700">
                Esta pagina verifica a disponibilidade dos servicos backend. Use para diagnosticar problemas de conectividade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HealthStatusComponent implements OnInit, OnDestroy {
  private healthService = inject(HealthService);
  private subscription?: Subscription;

  health = signal<HealthStatus | null>(null);
  isChecking = signal(false);

  ngOnInit(): void {
    this.subscription = this.healthService.health$.subscribe(h => this.health.set(h));
    this.healthService.isChecking$.subscribe(c => this.isChecking.set(c));
    this.refresh();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  refresh(): void {
    this.healthService.checkHealth().subscribe();
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'UP': return 'Operacional';
      case 'DOWN': return 'Indisponivel';
      case 'DEGRADED': return 'Degradado';
      default: return 'Desconhecido';
    }
  }

  isLive(): boolean {
    return this.health()?.status !== 'DOWN';
  }

  isReady(): boolean {
    return this.health()?.status === 'UP';
  }
}
