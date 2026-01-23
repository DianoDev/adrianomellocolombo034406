import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PetService } from '../../../../core/services/pet.service';
import { PetCompleto } from '../../../../core/models';

@Component({
  selector: 'app-pet-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Back Button -->
        <div class="mb-6">
          <a
            [routerLink]="isEditMode() ? ['/pets', petId()] : ['/pets']"
            class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg class="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {{ isEditMode() ? 'Voltar para detalhes' : 'Voltar para lista' }}
          </a>
        </div>

        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
            {{ isEditMode() ? 'Editar Pet' : 'Novo Pet' }}
          </h1>
          <p class="mt-2 text-sm text-gray-600">
            {{ isEditMode() ? 'Atualize as informações do pet' : 'Preencha os dados para cadastrar um novo pet' }}
          </p>
        </div>

        <!-- Loading State -->
        @if (loadingInitial()) {
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        }

        <!-- Error State -->
        @if (error()) {
          <div class="rounded-lg bg-red-50 p-4 mb-6">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
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

        <!-- Form -->
        @if (!loadingInitial()) {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            <!-- Current Photo (Edit Mode) -->
            @if (isEditMode() && currentPet()?.foto?.url) {
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Foto atual</label>
                <div class="relative w-32 h-32 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    [src]="currentPet()!.foto!.url"
                    [alt]="currentPet()!.nome"
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>
            }

            <!-- Nome -->
            <div class="mb-6">
              <label for="nome" class="block text-sm font-medium text-gray-700 mb-2">
                Nome <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nome"
                formControlName="nome"
                maxlength="100"
                class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 border transition-colors"
                [class.border-red-500]="form.get('nome')?.invalid && form.get('nome')?.touched"
                placeholder="Digite o nome do pet"
              />
              @if (form.get('nome')?.invalid && form.get('nome')?.touched) {
                <p class="mt-1 text-sm text-red-600">Nome é obrigatório</p>
              }
            </div>

            <!-- Raça -->
            <div class="mb-6">
              <label for="raca" class="block text-sm font-medium text-gray-700 mb-2">Raça</label>
              <input
                type="text"
                id="raca"
                formControlName="raca"
                maxlength="100"
                class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 border transition-colors"
                placeholder="Ex: Labrador, Siamês, SRD"
              />
            </div>

            <!-- Idade -->
            <div class="mb-6">
              <label for="idade" class="block text-sm font-medium text-gray-700 mb-2">Idade (anos)</label>
              <input
                type="number"
                id="idade"
                formControlName="idade"
                min="0"
                max="100"
                class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 border transition-colors"
                [class.border-red-500]="form.get('idade')?.invalid && form.get('idade')?.touched"
                placeholder="Digite a idade"
              />
              @if (form.get('idade')?.invalid && form.get('idade')?.touched) {
                <p class="mt-1 text-sm text-red-600">Idade deve ser um número entre 0 e 100</p>
              }
            </div>

            <!-- Upload de Foto -->
            <div class="mb-8">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ isEditMode() ? 'Alterar foto' : 'Foto do pet' }}
              </label>
              <div
                class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors cursor-pointer"
                (click)="fileInput.click()"
                (keydown.enter)="fileInput.click()"
                (keydown.space)="fileInput.click()"
                tabindex="0"
                role="button"
                [attr.aria-label]="selectedFile() ? 'Alterar arquivo selecionado' : 'Selecionar foto do pet'"
              >
                <div class="space-y-1 text-center">
                  @if (previewUrl()) {
                    <div class="mb-3">
                      <img
                        [src]="previewUrl()"
                        alt="Preview da foto"
                        class="mx-auto h-32 w-32 object-cover rounded-lg"
                      />
                    </div>
                    <p class="text-sm text-gray-600">{{ selectedFile()?.name }}</p>
                    <p class="text-xs text-gray-500">Clique para alterar</p>
                  } @else {
                    <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <div class="flex text-sm text-gray-600 justify-center">
                      <span class="font-medium text-indigo-600 hover:text-indigo-500">
                        Clique para selecionar
                      </span>
                    </div>
                    <p class="text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
                  }
                </div>
              </div>
              <input
                #fileInput
                type="file"
                accept="image/*"
                class="hidden"
                (change)="onFileSelected($event)"
                [attr.aria-label]="'Upload de foto do pet'"
              />
            </div>

            <!-- Form Actions -->
            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <a
                [routerLink]="isEditMode() ? ['/pets', petId()] : ['/pets']"
                class="inline-flex justify-center items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancelar
              </a>
              <button
                type="submit"
                [disabled]="form.invalid || submitting()"
                class="inline-flex justify-center items-center px-4 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                @if (submitting()) {
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                } @else {
                  {{ isEditMode() ? 'Salvar alterações' : 'Cadastrar pet' }}
                }
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `
})
export class PetFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private petService = inject(PetService);

  loadingInitial = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isEditMode = signal(false);
  petId = signal<number | null>(null);
  currentPet = signal<PetCompleto | null>(null);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    raca: ['', [Validators.maxLength(100)]],
    idade: [null, [Validators.min(0), Validators.max(100)]]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = parseInt(idParam, 10);
      if (!isNaN(id)) {
        this.isEditMode.set(true);
        this.petId.set(id);
        this.loadPet(id);
      }
    }
  }

  private loadPet(id: number): void {
    this.loadingInitial.set(true);
    this.error.set(null);

    this.petService.getPetById(id).subscribe({
      next: (pet) => {
        this.currentPet.set(pet);
        this.form.patchValue({
          nome: pet.nome,
          raca: pet.raca || '',
          idade: pet.idade
        });
        this.loadingInitial.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.error.set('Pet não encontrado.');
        } else {
          this.error.set('Erro ao carregar dados do pet. Tente novamente.');
        }
        this.loadingInitial.set(false);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      if (!file.type.startsWith('image/')) {
        this.error.set('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        this.error.set('O arquivo deve ter no máximo 10MB.');
        return;
      }

      this.selectedFile.set(file);
      this.error.set(null);

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    const petData = {
      nome: this.form.value.nome.trim(),
      raca: this.form.value.raca?.trim() || undefined,
      idade: this.form.value.idade ?? undefined
    };

    if (this.isEditMode() && this.petId()) {
      this.updatePet(this.petId()!, petData);
    } else {
      this.createPet(petData);
    }
  }

  private createPet(petData: { nome: string; raca?: string; idade?: number }): void {
    this.petService.createPet(petData).subscribe({
      next: (pet) => {
        if (this.selectedFile()) {
          this.uploadFoto(pet.id);
        } else {
          this.successMessage.set('Pet cadastrado com sucesso!');
          this.submitting.set(false);
          setTimeout(() => this.router.navigate(['/pets', pet.id]), 1500);
        }
      },
      error: () => {
        this.error.set('Erro ao cadastrar pet. Tente novamente.');
        this.submitting.set(false);
      }
    });
  }

  private updatePet(id: number, petData: { nome: string; raca?: string; idade?: number }): void {
    this.petService.updatePet(id, petData).subscribe({
      next: () => {
        if (this.selectedFile()) {
          this.uploadFoto(id);
        } else {
          this.successMessage.set('Pet atualizado com sucesso!');
          this.submitting.set(false);
          setTimeout(() => this.router.navigate(['/pets', id]), 1500);
        }
      },
      error: () => {
        this.error.set('Erro ao atualizar pet. Tente novamente.');
        this.submitting.set(false);
      }
    });
  }

  private uploadFoto(petId: number): void {
    const file = this.selectedFile();
    if (!file) {
      this.submitting.set(false);
      return;
    }

    this.petService.uploadFoto(petId, file).subscribe({
      next: () => {
        this.successMessage.set(
          this.isEditMode() ? 'Pet atualizado com sucesso!' : 'Pet cadastrado com sucesso!'
        );
        this.submitting.set(false);
        setTimeout(() => this.router.navigate(['/pets', petId]), 1500);
      },
      error: () => {
        this.successMessage.set(
          this.isEditMode()
            ? 'Pet atualizado, mas houve erro ao enviar a foto.'
            : 'Pet cadastrado, mas houve erro ao enviar a foto.'
        );
        this.submitting.set(false);
        setTimeout(() => this.router.navigate(['/pets', petId]), 2000);
      }
    });
  }
}
