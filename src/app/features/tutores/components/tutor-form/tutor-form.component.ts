import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TutorService } from '../../../../core/services/tutor.service';
import { TutorCompleto } from '../../../../core/models';

@Component({
  selector: 'app-tutor-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Back Button -->
        <div class="mb-6">
          <a
            [routerLink]="isEditMode() ? ['/tutores', tutorId()] : ['/tutores']"
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
            {{ isEditMode() ? 'Editar Tutor' : 'Novo Tutor' }}
          </h1>
          <p class="mt-2 text-sm text-gray-600">
            {{ isEditMode() ? 'Atualize as informacoes do tutor' : 'Preencha os dados para cadastrar um novo tutor' }}
          </p>
        </div>

        <!-- Loading State -->
        @if (loadingInitial()) {
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
            @if (isEditMode() && currentTutor()?.foto?.url) {
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Foto atual</label>
                <div class="relative w-32 h-32 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    [src]="currentTutor()!.foto!.url"
                    [alt]="currentTutor()!.nome"
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>
            }

            <!-- Nome -->
            <div class="mb-6">
              <label for="nome" class="block text-sm font-medium text-gray-700 mb-2">
                Nome completo <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nome"
                formControlName="nome"
                maxlength="200"
                class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-4 py-3 border transition-colors"
                [class.border-red-500]="form.get('nome')?.invalid && form.get('nome')?.touched"
                placeholder="Digite o nome completo do tutor"
              />
              @if (form.get('nome')?.invalid && form.get('nome')?.touched) {
                <p class="mt-1 text-sm text-red-600">Nome e obrigatorio</p>
              }
            </div>

            <!-- Telefone -->
            <div class="mb-6">
              <label for="telefone" class="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <input
                type="tel"
                id="telefone"
                formControlName="telefone"
                maxlength="20"
                class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-4 py-3 border transition-colors"
                placeholder="(00) 00000-0000"
                (input)="onTelefoneInput($event)"
              />
            </div>

            <!-- Endereco -->
            <div class="mb-6">
              <label for="endereco" class="block text-sm font-medium text-gray-700 mb-2">Endereco</label>
              <textarea
                id="endereco"
                formControlName="endereco"
                rows="3"
                maxlength="500"
                class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-4 py-3 border transition-colors resize-none"
                placeholder="Digite o endereco completo"
              ></textarea>
            </div>

            <!-- Upload de Foto -->
            <div class="mb-8">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ isEditMode() ? 'Alterar foto' : 'Foto do tutor' }}
              </label>
              <div
                class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-emerald-400 transition-colors cursor-pointer"
                (click)="fileInput.click()"
                (keydown.enter)="fileInput.click()"
                (keydown.space)="fileInput.click()"
                tabindex="0"
                role="button"
                [attr.aria-label]="selectedFile() ? 'Alterar arquivo selecionado' : 'Selecionar foto do tutor'"
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
                      <span class="font-medium text-emerald-600 hover:text-emerald-500">
                        Clique para selecionar
                      </span>
                    </div>
                    <p class="text-xs text-gray-500">PNG, JPG, GIF ate 10MB</p>
                  }
                </div>
              </div>
              <input
                #fileInput
                type="file"
                accept="image/*"
                class="hidden"
                (change)="onFileSelected($event)"
                [attr.aria-label]="'Upload de foto do tutor'"
              />
            </div>

            <!-- Form Actions -->
            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <a
                [routerLink]="isEditMode() ? ['/tutores', tutorId()] : ['/tutores']"
                class="inline-flex justify-center items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                Cancelar
              </a>
              <button
                type="submit"
                [disabled]="form.invalid || submitting()"
                class="inline-flex justify-center items-center px-4 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                @if (submitting()) {
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                } @else {
                  {{ isEditMode() ? 'Salvar alteracoes' : 'Cadastrar tutor' }}
                }
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `
})
export class TutorFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tutorService = inject(TutorService);

  loadingInitial = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isEditMode = signal(false);
  tutorId = signal<number | null>(null);
  currentTutor = signal<TutorCompleto | null>(null);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(200)]],
    telefone: ['', [Validators.maxLength(20)]],
    endereco: ['', [Validators.maxLength(500)]]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = parseInt(idParam, 10);
      if (!isNaN(id)) {
        this.isEditMode.set(true);
        this.tutorId.set(id);
        this.loadTutor(id);
      }
    }
  }

  private loadTutor(id: number): void {
    this.loadingInitial.set(true);
    this.error.set(null);

    this.tutorService.getTutorById(id).subscribe({
      next: (tutor) => {
        this.currentTutor.set(tutor);
        this.form.patchValue({
          nome: tutor.nome,
          telefone: tutor.telefone || '',
          endereco: tutor.endereco || ''
        });
        this.loadingInitial.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.error.set('Tutor nao encontrado.');
        } else {
          this.error.set('Erro ao carregar dados do tutor. Tente novamente.');
        }
        this.loadingInitial.set(false);
      }
    });
  }

  onTelefoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    if (value.length > 0) {
      if (value.length <= 2) {
        value = `(${value}`;
      } else if (value.length <= 7) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      } else {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
      }
    }

    this.form.get('telefone')?.setValue(value, { emitEvent: false });
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
        this.error.set('O arquivo deve ter no maximo 10MB.');
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

    const tutorData = {
      nome: this.form.value.nome.trim(),
      telefone: this.form.value.telefone?.trim() || undefined,
      endereco: this.form.value.endereco?.trim() || undefined
    };

    if (this.isEditMode() && this.tutorId()) {
      this.updateTutor(this.tutorId()!, tutorData);
    } else {
      this.createTutor(tutorData);
    }
  }

  private createTutor(tutorData: { nome: string; telefone?: string; endereco?: string }): void {
    this.tutorService.createTutor(tutorData).subscribe({
      next: (tutor) => {
        if (this.selectedFile()) {
          this.uploadFoto(tutor.id);
        } else {
          this.successMessage.set('Tutor cadastrado com sucesso!');
          this.submitting.set(false);
          setTimeout(() => this.router.navigate(['/tutores', tutor.id]), 1500);
        }
      },
      error: () => {
        this.error.set('Erro ao cadastrar tutor. Tente novamente.');
        this.submitting.set(false);
      }
    });
  }

  private updateTutor(id: number, tutorData: { nome: string; telefone?: string; endereco?: string }): void {
    this.tutorService.updateTutor(id, tutorData).subscribe({
      next: () => {
        if (this.selectedFile()) {
          this.uploadFoto(id);
        } else {
          this.successMessage.set('Tutor atualizado com sucesso!');
          this.submitting.set(false);
          setTimeout(() => this.router.navigate(['/tutores', id]), 1500);
        }
      },
      error: () => {
        this.error.set('Erro ao atualizar tutor. Tente novamente.');
        this.submitting.set(false);
      }
    });
  }

  private uploadFoto(tutorId: number): void {
    const file = this.selectedFile();
    if (!file) {
      this.submitting.set(false);
      return;
    }

    this.tutorService.uploadFoto(tutorId, file).subscribe({
      next: () => {
        this.successMessage.set(
          this.isEditMode() ? 'Tutor atualizado com sucesso!' : 'Tutor cadastrado com sucesso!'
        );
        this.submitting.set(false);
        setTimeout(() => this.router.navigate(['/tutores', tutorId]), 1500);
      },
      error: () => {
        this.successMessage.set(
          this.isEditMode()
            ? 'Tutor atualizado, mas houve erro ao enviar a foto.'
            : 'Tutor cadastrado, mas houve erro ao enviar a foto.'
        );
        this.submitting.set(false);
        setTimeout(() => this.router.navigate(['/tutores', tutorId]), 2000);
      }
    });
  }
}
