import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PetService } from '../../../../core/services/pet.service';
import { PetCompleto, Tutor } from '../../../../core/models';

@Component({
  selector: 'app-pet-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
            Voltar para lista
          </a>
        </div>

        <!-- Loading State -->
        @if (loading()) {
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        }

        <!-- Error State -->
        @if (error()) {
          <div class="rounded-lg bg-red-50 p-4">
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

        <!-- Pet Detail -->
        @if (!loading() && pet()) {
          <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
            <!-- Pet Header -->
            <div class="relative">
              <!-- Pet Image -->
              <div class="aspect-video sm:aspect-[21/9] bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
                @if (pet()!.foto?.url) {
                  <img
                    [src]="pet()!.foto!.url"
                    [alt]="pet()!.nome"
                    class="w-full h-full object-cover"
                  />
                } @else {
                  <div class="w-full h-full flex items-center justify-center">
                    <svg class="h-32 w-32 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                }
              </div>

              <!-- Pet Name Badge -->
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <h1 class="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
                  {{ pet()!.nome }}
                </h1>
              </div>
            </div>

            <!-- Pet Info -->
            <div class="p-6 sm:p-8">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <!-- Species/Breed -->
                @if (pet()!.raca) {
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <svg class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-500">Raça</p>
                      <p class="text-lg font-semibold text-gray-900">{{ pet()!.raca }}</p>
                    </div>
                  </div>
                }

                <!-- Age -->
                @if (pet()!.idade !== null && pet()!.idade !== undefined) {
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg class="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-500">Idade</p>
                      <p class="text-lg font-semibold text-gray-900">
                        {{ pet()!.idade }} {{ pet()!.idade === 1 ? 'ano' : 'anos' }}
                      </p>
                    </div>
                  </div>
                }
              </div>

              <!-- Tutors Section -->
              @if (hasTutors()) {
                <div class="mt-8 pt-8 border-t border-gray-200">
                  <h2 class="text-xl font-semibold text-gray-900 mb-4">
                    {{ pet()!.tutores!.length === 1 ? 'Tutor' : 'Tutores' }}
                  </h2>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    @for (tutor of pet()!.tutores; track tutor.id) {
                      <div class="bg-gray-50 rounded-xl p-4 flex items-start space-x-4">
                        <!-- Tutor Photo -->
                        <div class="flex-shrink-0">
                          @if (tutor.foto?.url) {
                            <img
                              [src]="tutor.foto!.url"
                              [alt]="tutor.nome"
                              class="w-14 h-14 rounded-full object-cover ring-2 ring-white"
                            />
                          } @else {
                            <div class="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center ring-2 ring-white">
                              <svg class="h-7 w-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          }
                        </div>

                        <!-- Tutor Info -->
                        <div class="flex-1 min-w-0">
                          <p class="text-base font-semibold text-gray-900 truncate">
                            {{ tutor.nome }}
                          </p>
                          @if (tutor.telefone) {
                            <p class="mt-1 text-sm text-gray-600 flex items-center">
                              <svg class="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {{ tutor.telefone }}
                            </p>
                          }
                          @if (tutor.email) {
                            <p class="mt-1 text-sm text-gray-600 flex items-center">
                              <svg class="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span class="truncate">{{ tutor.email }}</span>
                            </p>
                          }
                          @if (tutor.endereco) {
                            <p class="mt-1 text-sm text-gray-600 flex items-start">
                              <svg class="h-4 w-4 mr-1.5 mt-0.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{{ tutor.endereco }}</span>
                            </p>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- No Tutor Message -->
              @if (!hasTutors()) {
                <div class="mt-8 pt-8 border-t border-gray-200">
                  <div class="text-center py-6 bg-gray-50 rounded-xl">
                    <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p class="mt-2 text-sm text-gray-500">Este pet ainda não possui tutor vinculado</p>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class PetDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private petService = inject(PetService);

  loading = signal(true);
  error = signal<string | null>(null);
  pet = signal<PetCompleto | null>(null);

  hasTutors = computed(() => {
    const p = this.pet();
    return p?.tutores && p.tutores.length > 0;
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : null;

    if (!id || isNaN(id)) {
      this.router.navigate(['/pets']);
      return;
    }

    this.loadPet(id);
  }

  private loadPet(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.petService.getPetById(id).subscribe({
      next: (pet) => {
        this.pet.set(pet);
        this.loading.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.error.set('Pet não encontrado.');
        } else {
          this.error.set('Erro ao carregar dados do pet. Tente novamente.');
        }
        this.loading.set(false);
      }
    });
  }
}
