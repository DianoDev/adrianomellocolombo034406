import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap, finalize } from 'rxjs';
import { PetService, PetFilter } from '../services/pet.service';
import { Pet, PetCompleto, PetRequestDto, PagedResponse } from '../models';

export interface PetState {
  pets: Pet[];
  selectedPet: PetCompleto | null;
  pagedResponse: PagedResponse<Pet> | null;
  loading: boolean;
  error: string | null;
  filter: PetFilter;
}

const initialState: PetState = {
  pets: [],
  selectedPet: null,
  pagedResponse: null,
  loading: false,
  error: null,
  filter: { page: 0, size: 10 }
};

@Injectable({
  providedIn: 'root'
})
export class PetFacade {
  private petService = inject(PetService);

  private stateSubject = new BehaviorSubject<PetState>(initialState);
  state$ = this.stateSubject.asObservable();

  get state(): PetState {
    return this.stateSubject.getValue();
  }

  get pets$(): Observable<Pet[]> {
    return new Observable(subscriber => {
      this.state$.subscribe(state => subscriber.next(state.pets));
    });
  }

  get selectedPet$(): Observable<PetCompleto | null> {
    return new Observable(subscriber => {
      this.state$.subscribe(state => subscriber.next(state.selectedPet));
    });
  }

  get loading$(): Observable<boolean> {
    return new Observable(subscriber => {
      this.state$.subscribe(state => subscriber.next(state.loading));
    });
  }

  get error$(): Observable<string | null> {
    return new Observable(subscriber => {
      this.state$.subscribe(state => subscriber.next(state.error));
    });
  }

  private updateState(partial: Partial<PetState>): void {
    this.stateSubject.next({ ...this.state, ...partial });
  }

  loadPets(filter?: Partial<PetFilter>): void {
    const newFilter = { ...this.state.filter, ...filter };
    this.updateState({ loading: true, error: null, filter: newFilter });

    this.petService.getPets(newFilter).pipe(
      tap(response => {
        this.updateState({
          pets: response.content,
          pagedResponse: response,
          loading: false
        });
      }),
      finalize(() => {
        if (this.state.loading) {
          this.updateState({ loading: false });
        }
      })
    ).subscribe({
      error: (err) => {
        this.updateState({
          error: 'Erro ao carregar pets. Tente novamente.',
          loading: false
        });
      }
    });
  }

  loadPetById(id: number): void {
    this.updateState({ loading: true, error: null, selectedPet: null });

    this.petService.getPetById(id).pipe(
      tap(pet => {
        this.updateState({ selectedPet: pet, loading: false });
      }),
      finalize(() => {
        if (this.state.loading) {
          this.updateState({ loading: false });
        }
      })
    ).subscribe({
      error: (err) => {
        const errorMsg = err.status === 404
          ? 'Pet nao encontrado.'
          : 'Erro ao carregar dados do pet. Tente novamente.';
        this.updateState({ error: errorMsg, loading: false });
      }
    });
  }

  createPet(pet: PetRequestDto): Observable<Pet> {
    this.updateState({ loading: true, error: null });

    return this.petService.createPet(pet).pipe(
      tap(() => {
        this.updateState({ loading: false });
        this.loadPets();
      }),
      finalize(() => {
        if (this.state.loading) {
          this.updateState({ loading: false });
        }
      })
    );
  }

  updatePet(id: number, pet: PetRequestDto): Observable<Pet> {
    this.updateState({ loading: true, error: null });

    return this.petService.updatePet(id, pet).pipe(
      tap(() => {
        this.updateState({ loading: false });
        if (this.state.selectedPet?.id === id) {
          this.loadPetById(id);
        }
      }),
      finalize(() => {
        if (this.state.loading) {
          this.updateState({ loading: false });
        }
      })
    );
  }

  uploadFoto(petId: number, foto: File): Observable<any> {
    return this.petService.uploadFoto(petId, foto).pipe(
      tap(() => {
        if (this.state.selectedPet?.id === petId) {
          this.loadPetById(petId);
        }
      })
    );
  }

  search(nome: string): void {
    this.loadPets({ nome: nome || undefined, page: 0 });
  }

  changePage(page: number): void {
    this.loadPets({ page });
  }

  clearSelectedPet(): void {
    this.updateState({ selectedPet: null });
  }

  clearError(): void {
    this.updateState({ error: null });
  }

  resetState(): void {
    this.stateSubject.next(initialState);
  }
}
