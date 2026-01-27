import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TutorService, TutorFilter } from '../../../../core/services/tutor.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Tutor, PagedResponse } from '../../../../core/models';
import { TutorCardComponent } from '../tutor-card/tutor-card.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { SearchBoxComponent } from '../../../../shared/components/search-box/search-box.component';

@Component({
  selector: 'app-tutor-list',
  imports: [CommonModule, RouterLink, TutorCardComponent, PaginationComponent, SearchBoxComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Navigation Tabs -->
        <div class="mb-6 border-b border-gray-200">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <a
              routerLink="/pets"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
            >
              Pets
            </a>
            <a
              routerLink="/tutores"
              class="border-emerald-500 text-emerald-600 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
              aria-current="page"
            >
              Tutores
            </a>
          </nav>
        </div>

        <!-- Header -->
        <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Tutores</h1>
            <p class="mt-2 text-gray-600">Gerencie os tutores cadastrados</p>
          </div>
          <a
            routerLink="/tutores/novo"
            class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            <svg class="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Novo Tutor
          </a>
        </div>

        <!-- Search -->
        <div class="mb-6 max-w-md">
          <app-search-box (search)="onSearch($event)" />
        </div>

        <!-- Loading State -->
        @if (loading()) {
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        }

        <!-- Error State -->
        @if (error()) {
          <div class="rounded-lg bg-red-50 p-4 mb-6">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ error() }}</p>
              </div>
            </div>
          </div>
        }

        <!-- Tutor Grid -->
        @if (!loading() && tutors().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @for (tutor of tutors(); track tutor.id) {
              <app-tutor-card [tutor]="tutor" />
            }
          </div>

          <!-- Pagination -->
          @if (pagedData()) {
            <app-pagination
              [page]="pagedData()!.page"
              [pageCount]="pagedData()!.pageCount"
              [totalItems]="pagedData()!.total"
              (pageChange)="onPageChange($event)"
            />
          }
        }

        <!-- Empty State -->
        @if (!loading() && !error() && tutors().length === 0) {
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 class="mt-2 text-sm font-semibold text-gray-900">Nenhum tutor encontrado</h3>
            <p class="mt-1 text-sm text-gray-500">
              @if (searchTerm()) {
                Tente buscar por outro nome.
              } @else {
                Comece cadastrando um novo tutor.
              }
            </p>
          </div>
        }
      </div>
    </div>
  `
})
export class TutorListComponent implements OnInit {
  private tutorService = inject(TutorService);
  private authService = inject(AuthService);

  loading = signal(false);
  error = signal<string | null>(null);
  pagedData = signal<PagedResponse<Tutor> | null>(null);
  searchTerm = signal('');

  tutors = computed(() => this.pagedData()?.content ?? []);

  private currentFilter: TutorFilter = {
    page: 0,
    size: 10
  };

  ngOnInit(): void {
    this.authenticate();
  }

  private authenticate(): void {
    if (!this.authService.getToken()) {
      this.loading.set(true);
      this.authService.login({ username: 'admin', password: 'admin' }).subscribe({
        next: () => this.loadTutors(),
        error: () => {
          this.error.set('Falha na autenticacao. Tente novamente.');
          this.loading.set(false);
        }
      });
    } else {
      this.loadTutors();
    }
  }

  private loadTutors(): void {
    this.loading.set(true);
    this.error.set(null);

    this.tutorService.getTutors(this.currentFilter).subscribe({
      next: (response) => {
        this.pagedData.set(response);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar tutores. Tente novamente.');
        this.loading.set(false);
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentFilter = {
      ...this.currentFilter,
      nome: term || undefined,
      page: 0
    };
    this.loadTutors();
  }

  onPageChange(page: number): void {
    this.currentFilter = {
      ...this.currentFilter,
      page
    };
    this.loadTutors();
  }
}
