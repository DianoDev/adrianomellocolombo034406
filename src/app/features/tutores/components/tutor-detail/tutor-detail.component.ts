import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TutorService } from '../../../../core/services/tutor.service';
import { PetService } from '../../../../core/services/pet.service';
import { TutorCompleto, Pet } from '../../../../core/models';

@Component({
  selector: 'app-tutor-detail',
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Back Button -->
        <div class="mb-6">
          <a
            routerLink="/tutores"
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
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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

        <!-- Success Message -->
        @if (successMessage()) {
          <div class="rounded-lg bg-green-50 p-4 mb-6">
            <div class="flex">
              <svg class="h-5 w-5 text-green-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <p class="text-sm text-green-700">{{ successMessage() }}</p>
              </div>
            </div>
          </div>
        }

        <!-- Tutor Detail -->
        @if (!loading() && tutor()) {
          <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
            <!-- Tutor Header -->
            <div class="relative">
              <!-- Tutor Image -->
              <div class="aspect-video sm:aspect-[21/9] bg-gradient-to-br from-emerald-100 to-teal-100 overflow-hidden">
                @if (tutor()!.foto?.url) {
                  <img
                    [src]="tutor()!.foto!.url"
                    [alt]="tutor()!.nome"
                    class="w-full h-full object-cover"
                  />
                } @else {
                  <div class="w-full h-full flex items-center justify-center">
                    <svg class="h-32 w-32 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                }
              </div>

              <!-- Tutor Name Badge -->
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <div class="flex items-end justify-between">
                  <h1 class="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
                    {{ tutor()!.nome }}
                  </h1>
                  <a
                    [routerLink]="['/tutores', tutor()!.id, 'editar']"
                    class="inline-flex items-center px-4 py-2 bg-white/90 hover:bg-white text-gray-900 text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    <svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </a>
                </div>
              </div>
            </div>

            <!-- Tutor Info -->
            <div class="p-6 sm:p-8">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <!-- Phone -->
                @if (tutor()!.telefone) {
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg class="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-500">Telefone</p>
                      <p class="text-lg font-semibold text-gray-900">{{ tutor()!.telefone }}</p>
                    </div>
                  </div>
                }

                <!-- Email -->
                @if (tutor()!.email) {
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-500">E-mail</p>
                      <p class="text-lg font-semibold text-gray-900">{{ tutor()!.email }}</p>
                    </div>
                  </div>
                }

                <!-- Address -->
                @if (tutor()!.endereco) {
                  <div class="flex items-start space-x-3 sm:col-span-2">
                    <div class="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg class="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-500">Endereco</p>
                      <p class="text-lg font-semibold text-gray-900">{{ tutor()!.endereco }}</p>
                    </div>
                  </div>
                }
              </div>

              <!-- Pets Section -->
              <div class="mt-8 pt-8 border-t border-gray-200">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold text-gray-900">
                    Pets Vinculados
                    @if (hasPets()) {
                      <span class="ml-2 text-sm font-normal text-gray-500">({{ tutor()!.pets!.length }})</span>
                    }
                  </h2>
                  <button
                    type="button"
                    (click)="togglePetSelector()"
                    class="inline-flex items-center px-3 py-1.5 border border-emerald-300 text-sm font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                  >
                    <svg class="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Vincular Pet
                  </button>
                </div>

                <!-- Pet Selector -->
                @if (showPetSelector()) {
                  <div class="mb-6 p-4 bg-gray-50 rounded-xl">
                    <h3 class="text-sm font-medium text-gray-700 mb-3">Selecione um pet para vincular:</h3>
                    @if (loadingAvailablePets()) {
                      <div class="flex justify-center py-4">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                      </div>
                    } @else if (availablePets().length === 0) {
                      <p class="text-sm text-gray-500 py-2">Nenhum pet disponivel para vincular.</p>
                    } @else {
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        @for (pet of availablePets(); track pet.id) {
                          <button
                            type="button"
                            (click)="vincularPet(pet.id)"
                            [disabled]="vinculando()"
                            class="flex items-center p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                          >
                            @if (pet.foto?.url) {
                              <img [src]="pet.foto!.url" [alt]="pet.nome" class="w-10 h-10 rounded-full object-cover mr-3" />
                            } @else {
                              <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                <svg class="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </div>
                            }
                            <div>
                              <p class="text-sm font-medium text-gray-900">{{ pet.nome }}</p>
                              @if (pet.raca) {
                                <p class="text-xs text-gray-500">{{ pet.raca }}</p>
                              }
                            </div>
                          </button>
                        }
                      </div>
                    }
                    <div class="mt-3 flex justify-end">
                      <button
                        type="button"
                        (click)="togglePetSelector()"
                        class="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                }

                @if (hasPets()) {
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    @for (pet of tutor()!.pets; track pet.id) {
                      <div class="bg-gray-50 rounded-xl p-4 flex items-start space-x-4">
                        <!-- Pet Photo -->
                        <a [routerLink]="['/pets', pet.id]" class="flex-shrink-0">
                          @if (pet.foto?.url) {
                            <img
                              [src]="pet.foto!.url"
                              [alt]="pet.nome"
                              class="w-14 h-14 rounded-full object-cover ring-2 ring-white hover:ring-indigo-300 transition-all"
                            />
                          } @else {
                            <div class="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center ring-2 ring-white hover:ring-indigo-300 transition-all">
                              <svg class="h-7 w-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </div>
                          }
                        </a>

                        <!-- Pet Info -->
                        <div class="flex-1 min-w-0">
                          <a [routerLink]="['/pets', pet.id]" class="hover:text-indigo-600 transition-colors">
                            <p class="text-base font-semibold text-gray-900 truncate">
                              {{ pet.nome }}
                            </p>
                          </a>
                          @if (pet.raca) {
                            <p class="mt-1 text-sm text-gray-600 flex items-center">
                              <svg class="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {{ pet.raca }}
                            </p>
                          }
                          @if (pet.idade !== null && pet.idade !== undefined) {
                            <p class="mt-1 text-sm text-gray-600 flex items-center">
                              <svg class="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {{ pet.idade }} {{ pet.idade === 1 ? 'ano' : 'anos' }}
                            </p>
                          }
                        </div>

                        <!-- Remove Button -->
                        <button
                          type="button"
                          (click)="desvincularPet(pet.id)"
                          [disabled]="desvinculando()"
                          class="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Remover vinculo"
                          aria-label="Remover vinculo com {{ pet.nome }}"
                        >
                          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    }
                  </div>
                } @else if (!showPetSelector()) {
                  <div class="text-center py-6 bg-gray-50 rounded-xl">
                    <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <p class="mt-2 text-sm text-gray-500">Este tutor ainda nao possui pets vinculados</p>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class TutorDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tutorService = inject(TutorService);
  private petService = inject(PetService);

  loading = signal(true);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  tutor = signal<TutorCompleto | null>(null);
  showPetSelector = signal(false);
  availablePets = signal<Pet[]>([]);
  loadingAvailablePets = signal(false);
  vinculando = signal(false);
  desvinculando = signal(false);

  hasPets = computed(() => {
    const t = this.tutor();
    return t?.pets && t.pets.length > 0;
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : null;

    if (!id || isNaN(id)) {
      this.router.navigate(['/tutores']);
      return;
    }

    this.loadTutor(id);
  }

  private loadTutor(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.tutorService.getTutorById(id).subscribe({
      next: (tutor) => {
        this.tutor.set(tutor);
        this.loading.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.error.set('Tutor nao encontrado.');
        } else {
          this.error.set('Erro ao carregar dados do tutor. Tente novamente.');
        }
        this.loading.set(false);
      }
    });
  }

  togglePetSelector(): void {
    const currentValue = this.showPetSelector();
    this.showPetSelector.set(!currentValue);

    if (!currentValue) {
      this.loadAvailablePets();
    }
  }

  private loadAvailablePets(): void {
    this.loadingAvailablePets.set(true);

    this.petService.getPets({ size: 100 }).subscribe({
      next: (response) => {
        const linkedPetIds = new Set(this.tutor()?.pets?.map(p => p.id) ?? []);
        const available = response.content.filter(pet => !linkedPetIds.has(pet.id));
        this.availablePets.set(available);
        this.loadingAvailablePets.set(false);
      },
      error: () => {
        this.availablePets.set([]);
        this.loadingAvailablePets.set(false);
      }
    });
  }

  vincularPet(petId: number): void {
    const tutorId = this.tutor()?.id;
    if (!tutorId) return;

    this.vinculando.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    this.tutorService.vincularPet(tutorId, petId).subscribe({
      next: () => {
        this.successMessage.set('Pet vinculado com sucesso!');
        this.vinculando.set(false);
        this.showPetSelector.set(false);
        this.loadTutor(tutorId);
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: () => {
        this.error.set('Erro ao vincular pet. Tente novamente.');
        this.vinculando.set(false);
      }
    });
  }

  desvincularPet(petId: number): void {
    const tutorId = this.tutor()?.id;
    if (!tutorId) return;

    this.desvinculando.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    this.tutorService.desvincularPet(tutorId, petId).subscribe({
      next: () => {
        this.successMessage.set('Vinculo removido com sucesso!');
        this.desvinculando.set(false);
        this.loadTutor(tutorId);
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: () => {
        this.error.set('Erro ao remover vinculo. Tente novamente.');
        this.desvinculando.set(false);
      }
    });
  }
}
