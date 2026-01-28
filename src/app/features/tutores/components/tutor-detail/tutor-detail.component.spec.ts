import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { TutorDetailComponent } from './tutor-detail.component';

describe('TutorDetailComponent', () => {
  let component: TutorDetailComponent;
  let fixture: ComponentFixture<TutorDetailComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [TutorDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => key === 'id' ? '1' : null
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TutorDetailComponent);
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

  it('should load tutor on init', () => {
    fixture.detectChanges();

    const tutorReq = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/tutores/1');
    expect(tutorReq.request.method).toBe('GET');

    tutorReq.flush({
      id: 1,
      nome: 'Maria Silva',
      telefone: '(11) 99999-8888',
      endereco: 'Rua das Flores, 123',
      pets: []
    });

    expect(component.tutor()?.nome).toBe('Maria Silva');
  });

  it('should display tutor info', () => {
    fixture.detectChanges();

    const tutorReq = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/tutores/1');
    tutorReq.flush({
      id: 1,
      nome: 'Maria Silva',
      telefone: '(11) 99999-8888',
      endereco: 'Rua das Flores, 123',
      pets: []
    });

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Maria Silva');
    expect(compiled.textContent).toContain('(11) 99999-8888');
  });

  it('should display linked pets', () => {
    fixture.detectChanges();

    const tutorReq = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/tutores/1');
    tutorReq.flush({
      id: 1,
      nome: 'Maria Silva',
      pets: [
        { id: 1, nome: 'Rex', raca: 'Labrador', idade: 3 },
        { id: 2, nome: 'Mia', raca: 'Siames', idade: 2 }
      ]
    });

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Rex');
    expect(compiled.textContent).toContain('Mia');
  });

  it('should show message when no pets linked', () => {
    fixture.detectChanges();

    const tutorReq = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/tutores/1');
    tutorReq.flush({
      id: 1,
      nome: 'Maria Silva',
      pets: []
    });

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('nao possui pets');
  });

  it('should handle 404 error', () => {
    fixture.detectChanges();

    const tutorReq = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/tutores/1');
    tutorReq.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });

    expect(component.error()).toContain('nao encontrado');
  });

  it('should toggle pet selector', () => {
    fixture.detectChanges();

    const tutorReq = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/tutores/1');
    tutorReq.flush({ id: 1, nome: 'Maria Silva', pets: [] });

    expect(component.showPetSelector()).toBe(false);

    component.togglePetSelector();
    expect(component.showPetSelector()).toBe(true);

    const petsReq = httpMock.expectOne(req => req.url.includes('/v1/pets'));
    petsReq.flush({ page: 0, size: 100, total: 0, pageCount: 0, content: [] });

    component.togglePetSelector();
    expect(component.showPetSelector()).toBe(false);
  });
});
