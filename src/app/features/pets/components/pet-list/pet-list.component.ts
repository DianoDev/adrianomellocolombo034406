import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PetService, PetFilter } from '../../../../core/services/pet.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Pet, PagedResponse } from '../../../../core/models';
import { PetCardComponent } from '../pet-card/pet-card.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { SearchBoxComponent } from '../../../../shared/components/search-box/search-box.component';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  imports: [CommonModule, PetCardComponent, PaginationComponent, SearchBoxComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Pets</h1>
          <p class="mt-2 text-gray-600">Encontre seu novo companheiro</p>
        </div>

        <!-- Search -->
        <div class="mb-6 max-w-md">
          <app-search-box (search)="onSearch($event)" />
        </div>

        <!-- Loading State -->
        @if (loading()) {
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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

        <!-- Pet Grid -->
        @if (!loading() && pets().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @for (pet of pets(); track pet.id) {
              <app-pet-card [pet]="pet" />
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
        @if (!loading() && !error() && pets().length === 0) {
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 class="mt-2 text-sm font-semibold text-gray-900">Nenhum pet encontrado</h3>
            <p class="mt-1 text-sm text-gray-500">
              @if (searchTerm()) {
                Tente buscar por outro nome.
              } @else {
                Não há pets cadastrados no momento.
              }
            </p>
          </div>
        }
      </div>
    </div>
  `
})
export class PetListComponent implements OnInit {
  private petService = inject(PetService);
  private authService = inject(AuthService);

  loading = signal(false);
  error = signal<string | null>(null);
  pagedData = signal<PagedResponse<Pet> | null>(null);
  searchTerm = signal('');

  pets = computed(() => this.pagedData()?.content ?? []);

  private currentFilter: PetFilter = {
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
        next: () => this.loadPets(),
        error: (err) => {
          this.error.set('Falha na autenticação. Tente novamente.');
          this.loading.set(false);
        }
      });
    } else {
      this.loadPets();
    }
  }

  private loadPets(): void {
    this.loading.set(true);
    this.error.set(null);

    this.petService.getPets(this.currentFilter).subscribe({
      next: (response) => {
        this.pagedData.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar pets. Tente novamente.');
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
    this.loadPets();
  }

  onPageChange(page: number): void {
    this.currentFilter = {
      ...this.currentFilter,
      page
    };
    this.loadPets();
  }
}
