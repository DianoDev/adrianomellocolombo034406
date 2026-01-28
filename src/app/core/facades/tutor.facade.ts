import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap, finalize } from 'rxjs';
import { TutorService, TutorFilter } from '../services/tutor.service';
import { Tutor, TutorCompleto, TutorRequestDto, PagedResponse } from '../models';

export interface TutorState {
  tutors: Tutor[];
  selectedTutor: TutorCompleto | null;
  pagedResponse: PagedResponse<Tutor> | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  filter: TutorFilter;
}

const initialState: TutorState = {
  tutors: [],
  selectedTutor: null,
  pagedResponse: null,
  loading: false,
  error: null,
  successMessage: null,
  filter: { page: 0, size: 10 }
};

@Injectable({
  providedIn: 'root'
})
export class TutorFacade {
  private tutorService = inject(TutorService);

  private stateSubject = new BehaviorSubject<TutorState>(initialState);
  state$ = this.stateSubject.asObservable();

  get state(): TutorState {
    return this.stateSubject.getValue();
  }

  get tutors$(): Observable<Tutor[]> {
    return new Observable(subscriber => {
      this.state$.subscribe(state => subscriber.next(state.tutors));
    });
  }

  get selectedTutor$(): Observable<TutorCompleto | null> {
    return new Observable(subscriber => {
      this.state$.subscribe(state => subscriber.next(state.selectedTutor));
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

  get successMessage$(): Observable<string | null> {
    return new Observable(subscriber => {
      this.state$.subscribe(state => subscriber.next(state.successMessage));
    });
  }

  private updateState(partial: Partial<TutorState>): void {
    this.stateSubject.next({ ...this.state, ...partial });
  }

  loadTutors(filter?: Partial<TutorFilter>): void {
    const newFilter = { ...this.state.filter, ...filter };
    this.updateState({ loading: true, error: null, filter: newFilter });

    this.tutorService.getTutors(newFilter).pipe(
      tap(response => {
        this.updateState({
          tutors: response.content,
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
      error: () => {
        this.updateState({
          error: 'Erro ao carregar tutores. Tente novamente.',
          loading: false
        });
      }
    });
  }

  loadTutorById(id: number): void {
    this.updateState({ loading: true, error: null, selectedTutor: null });

    this.tutorService.getTutorById(id).pipe(
      tap(tutor => {
        this.updateState({ selectedTutor: tutor, loading: false });
      }),
      finalize(() => {
        if (this.state.loading) {
          this.updateState({ loading: false });
        }
      })
    ).subscribe({
      error: (err) => {
        const errorMsg = err.status === 404
          ? 'Tutor nao encontrado.'
          : 'Erro ao carregar dados do tutor. Tente novamente.';
        this.updateState({ error: errorMsg, loading: false });
      }
    });
  }

  createTutor(tutor: TutorRequestDto): Observable<Tutor> {
    this.updateState({ loading: true, error: null });

    return this.tutorService.createTutor(tutor).pipe(
      tap(() => {
        this.updateState({ loading: false });
        this.loadTutors();
      }),
      finalize(() => {
        if (this.state.loading) {
          this.updateState({ loading: false });
        }
      })
    );
  }

  updateTutor(id: number, tutor: TutorRequestDto): Observable<Tutor> {
    this.updateState({ loading: true, error: null });

    return this.tutorService.updateTutor(id, tutor).pipe(
      tap(() => {
        this.updateState({ loading: false });
        if (this.state.selectedTutor?.id === id) {
          this.loadTutorById(id);
        }
      }),
      finalize(() => {
        if (this.state.loading) {
          this.updateState({ loading: false });
        }
      })
    );
  }

  uploadFoto(tutorId: number, foto: File): Observable<any> {
    return this.tutorService.uploadFoto(tutorId, foto).pipe(
      tap(() => {
        if (this.state.selectedTutor?.id === tutorId) {
          this.loadTutorById(tutorId);
        }
      })
    );
  }

  vincularPet(tutorId: number, petId: number): void {
    this.updateState({ loading: true, error: null, successMessage: null });

    this.tutorService.vincularPet(tutorId, petId).subscribe({
      next: () => {
        this.updateState({
          loading: false,
          successMessage: 'Pet vinculado com sucesso!'
        });
        this.loadTutorById(tutorId);
        setTimeout(() => this.clearSuccessMessage(), 3000);
      },
      error: () => {
        this.updateState({
          error: 'Erro ao vincular pet. Tente novamente.',
          loading: false
        });
      }
    });
  }

  desvincularPet(tutorId: number, petId: number): void {
    this.updateState({ loading: true, error: null, successMessage: null });

    this.tutorService.desvincularPet(tutorId, petId).subscribe({
      next: () => {
        this.updateState({
          loading: false,
          successMessage: 'Vinculo removido com sucesso!'
        });
        this.loadTutorById(tutorId);
        setTimeout(() => this.clearSuccessMessage(), 3000);
      },
      error: () => {
        this.updateState({
          error: 'Erro ao remover vinculo. Tente novamente.',
          loading: false
        });
      }
    });
  }

  search(nome: string): void {
    this.loadTutors({ nome: nome || undefined, page: 0 });
  }

  changePage(page: number): void {
    this.loadTutors({ page });
  }

  clearSelectedTutor(): void {
    this.updateState({ selectedTutor: null });
  }

  clearError(): void {
    this.updateState({ error: null });
  }

  clearSuccessMessage(): void {
    this.updateState({ successMessage: null });
  }

  resetState(): void {
    this.stateSubject.next(initialState);
  }
}
