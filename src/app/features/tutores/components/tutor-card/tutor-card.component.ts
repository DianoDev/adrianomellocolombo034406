import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Tutor } from '../../../../core/models';

@Component({
  selector: 'app-tutor-card',
  imports: [RouterLink],
  template: `
    <div
      class="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
      [routerLink]="['/tutores', tutor.id]"
    >
      <div class="aspect-square overflow-hidden bg-gray-100">
        @if (tutor.foto?.url) {
          <img
            [src]="tutor.foto!.url"
            [alt]="tutor.nome"
            class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            (error)="onImageError($event)"
          />
        } @else {
          <div class="h-full w-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
            <svg class="h-20 w-20 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        }
      </div>
      <div class="p-4">
        <h3 class="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors truncate">
          {{ tutor.nome }}
        </h3>
        <div class="mt-2 space-y-1">
          @if (tutor.telefone) {
            <p class="text-sm text-gray-600 flex items-center">
              <svg class="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span class="truncate">{{ tutor.telefone }}</span>
            </p>
          }
          @if (tutor.endereco) {
            <p class="text-sm text-gray-600 flex items-center">
              <svg class="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="truncate">{{ tutor.endereco }}</span>
            </p>
          }
        </div>
      </div>
      <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <span class="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
          Ver detalhes
        </span>
      </div>
    </div>
  `
})
export class TutorCardComponent {
  @Input({ required: true }) tutor!: Tutor;

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
