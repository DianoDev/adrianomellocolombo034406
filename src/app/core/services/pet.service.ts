import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Pet, PetCompleto, PetRequestDto, PagedResponse, Anexo } from '../models';
import { environment } from '../../../environments/environment';

export interface PetFilter {
  nome?: string;
  raca?: string;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private readonly API_URL = `${environment.apiUrl}/v1/pets`;

  private petsSubject = new BehaviorSubject<PagedResponse<Pet> | null>(null);
  pets$ = this.petsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  getPets(filter: PetFilter = {}): Observable<PagedResponse<Pet>> {
    let params = new HttpParams();

    if (filter.nome) {
      params = params.set('nome', filter.nome);
    }
    if (filter.raca) {
      params = params.set('raca', filter.raca);
    }
    if (filter.page !== undefined) {
      params = params.set('page', filter.page.toString());
    }
    if (filter.size !== undefined) {
      params = params.set('size', filter.size.toString());
    }

    this.loadingSubject.next(true);

    return this.http.get<PagedResponse<Pet>>(this.API_URL, { params }).pipe(
      tap({
        next: response => {
          this.petsSubject.next(response);
          this.loadingSubject.next(false);
        },
        error: () => {
          this.loadingSubject.next(false);
        }
      })
    );
  }

  getPetById(id: number): Observable<PetCompleto> {
    return this.http.get<PetCompleto>(`${this.API_URL}/${id}`);
  }

  createPet(pet: PetRequestDto): Observable<Pet> {
    return this.http.post<Pet>(this.API_URL, pet);
  }

  updatePet(id: number, pet: PetRequestDto): Observable<Pet> {
    return this.http.put<Pet>(`${this.API_URL}/${id}`, pet);
  }

  uploadFoto(petId: number, foto: File): Observable<Anexo> {
    const formData = new FormData();
    formData.append('foto', foto);
    return this.http.post<Anexo>(`${this.API_URL}/${petId}/fotos`, formData);
  }

  getCurrentPets(): PagedResponse<Pet> | null {
    return this.petsSubject.getValue();
  }
}
