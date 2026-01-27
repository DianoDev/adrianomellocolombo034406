import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Tutor, TutorCompleto, TutorRequestDto, PagedResponse, Anexo, Pet } from '../models';
import { environment } from '../../../environments/environment';

export interface TutorFilter {
  nome?: string;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TutorService {
  private readonly API_URL = `${environment.apiUrl}/v1/tutores`;

  private tutorsSubject = new BehaviorSubject<PagedResponse<Tutor> | null>(null);
  tutors$ = this.tutorsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  getTutors(filter: TutorFilter = {}): Observable<PagedResponse<Tutor>> {
    let params = new HttpParams();

    if (filter.nome) {
      params = params.set('nome', filter.nome);
    }
    if (filter.page !== undefined) {
      params = params.set('page', filter.page.toString());
    }
    if (filter.size !== undefined) {
      params = params.set('size', filter.size.toString());
    }

    this.loadingSubject.next(true);

    return this.http.get<PagedResponse<Tutor>>(this.API_URL, { params }).pipe(
      tap({
        next: response => {
          this.tutorsSubject.next(response);
          this.loadingSubject.next(false);
        },
        error: () => {
          this.loadingSubject.next(false);
        }
      })
    );
  }

  getTutorById(id: number): Observable<TutorCompleto> {
    return this.http.get<TutorCompleto>(`${this.API_URL}/${id}`);
  }

  createTutor(tutor: TutorRequestDto): Observable<Tutor> {
    return this.http.post<Tutor>(this.API_URL, tutor);
  }

  updateTutor(id: number, tutor: TutorRequestDto): Observable<Tutor> {
    return this.http.put<Tutor>(`${this.API_URL}/${id}`, tutor);
  }

  uploadFoto(tutorId: number, foto: File): Observable<Anexo> {
    const formData = new FormData();
    formData.append('foto', foto);
    return this.http.post<Anexo>(`${this.API_URL}/${tutorId}/fotos`, formData);
  }

  vincularPet(tutorId: number, petId: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${tutorId}/pets/${petId}`, {});
  }

  desvincularPet(tutorId: number, petId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${tutorId}/pets/${petId}`);
  }

  getCurrentTutors(): PagedResponse<Tutor> | null {
    return this.tutorsSubject.getValue();
  }
}
