import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Pet } from '../../../../core/models';

@Component({
  selector: 'app-pet-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div
      class="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
      [routerLink]="['/pets', pet.id]"
    >
      <div class="aspect-square overflow-hidden bg-gray-100">
        @if (pet.foto?.url) {
          <img
            [src]="pet.foto!.url"
            [alt]="pet.nome"
            class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            (error)="onImageError($event)"
          />
        } @else {
          <div class="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
            <svg class="h-20 w-20 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.75 6.75a2.25 2.25 0 113.75 1.68V12m0 0a2.25 2.25 0 103.75 1.68V18M9 12h6" />
            </svg>
          </div>
        }
      </div>
      <div class="p-4">
        <h3 class="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
          {{ pet.nome }}
        </h3>
        <div class="mt-2 space-y-1">
          @if (pet.raca) {
            <p class="text-sm text-gray-600 flex items-center">
              <svg class="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span class="truncate">{{ pet.raca }}</span>
            </p>
          }
          @if (pet.idade !== null && pet.idade !== undefined) {
            <p class="text-sm text-gray-600 flex items-center">
              <svg class="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ pet.idade }} {{ pet.idade === 1 ? 'ano' : 'anos' }}
            </p>
          }
        </div>
      </div>
      <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <span class="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
          Ver detalhes
        </span>
      </div>
    </div>
  `
})
export class PetCardComponent {
  @Input({ required: true }) pet!: Pet;

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
