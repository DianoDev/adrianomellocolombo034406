import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PetListComponent } from './pet-list.component';

describe('PetListComponent', () => {
  let component: PetListComponent;
  let fixture: ComponentFixture<PetListComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [PetListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PetListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display loading state initially', () => {
    fixture.detectChanges();

    const authReq = httpMock.expectOne('https://pet-manager-api.geia.vip/autenticacao/login');
    expect(authReq.request.method).toBe('POST');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.animate-spin')).toBeTruthy();

    authReq.flush({
      access_token: 'test-token',
      refresh_token: 'test-refresh',
      expires_in: 300,
      refresh_expires_in: 3600
    });

    const petsReq = httpMock.expectOne(req => req.url.includes('/v1/pets'));
    petsReq.flush({ page: 0, size: 10, total: 0, pageCount: 0, content: [] });
  });

  it('should display pets after loading', () => {
    fixture.detectChanges();

    const authReq = httpMock.expectOne('https://pet-manager-api.geia.vip/autenticacao/login');
    authReq.flush({
      access_token: 'test-token',
      refresh_token: 'test-refresh',
      expires_in: 300,
      refresh_expires_in: 3600
    });

    const petsReq = httpMock.expectOne(req => req.url.includes('/v1/pets'));
    petsReq.flush({
      page: 0,
      size: 10,
      total: 2,
      pageCount: 1,
      content: [
        { id: 1, nome: 'Rex', raca: 'Labrador', idade: 3 },
        { id: 2, nome: 'Mia', raca: 'Siames', idade: 2 }
      ]
    });

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Rex');
    expect(compiled.textContent).toContain('Mia');
  });

  it('should handle empty results', () => {
    fixture.detectChanges();

    const authReq = httpMock.expectOne('https://pet-manager-api.geia.vip/autenticacao/login');
    authReq.flush({
      access_token: 'test-token',
      refresh_token: 'test-refresh',
      expires_in: 300,
      refresh_expires_in: 3600
    });

    const petsReq = httpMock.expectOne(req => req.url.includes('/v1/pets'));
    petsReq.flush({
      page: 0,
      size: 10,
      total: 0,
      pageCount: 0,
      content: []
    });

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nenhum pet encontrado');
  });

  it('should update search term and reload pets', () => {
    fixture.detectChanges();

    const authReq = httpMock.expectOne('https://pet-manager-api.geia.vip/autenticacao/login');
    authReq.flush({
      access_token: 'test-token',
      refresh_token: 'test-refresh',
      expires_in: 300,
      refresh_expires_in: 3600
    });

    const initialReq = httpMock.expectOne(req => req.url.includes('/v1/pets'));
    initialReq.flush({ page: 0, size: 10, total: 0, pageCount: 0, content: [] });

    component.onSearch('Rex');

    const searchReq = httpMock.expectOne(req =>
      req.url.includes('/v1/pets') && req.params.get('nome') === 'Rex'
    );
    expect(searchReq.request.params.get('nome')).toBe('Rex');
    searchReq.flush({ page: 0, size: 10, total: 0, pageCount: 0, content: [] });
  });
});
