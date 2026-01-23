import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PetDetailComponent } from './pet-detail.component';

describe('PetDetailComponent', () => {
  let component: PetDetailComponent;
  let fixture: ComponentFixture<PetDetailComponent>;
  let httpMock: HttpTestingController;

  const mockPetWithTutor = {
    id: 1,
    nome: 'Rex',
    raca: 'Labrador',
    idade: 3,
    foto: { id: 1, nome: 'rex.jpg', contentType: 'image/jpeg', url: 'http://example.com/rex.jpg' },
    tutores: [
      {
        id: 1,
        nome: 'João Silva',
        telefone: '(65) 99999-0000',
        email: 'joao@email.com',
        endereco: 'Rua das Flores, 123'
      }
    ]
  };

  const mockPetWithoutTutor = {
    id: 2,
    nome: 'Mia',
    raca: 'Siamês',
    idade: 2,
    tutores: []
  };

  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('access_token', 'test-token');
    localStorage.setItem('token_expiry', (Date.now() + 300000).toString());

    await TestBed.configureTestingModule({
      imports: [PetDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => '1'
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PetDetailComponent);
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

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.animate-spin')).toBeTruthy();

    const req = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/pets/1');
    req.flush(mockPetWithTutor);
  });

  it('should display pet details with tutor', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/pets/1');
    req.flush(mockPetWithTutor);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Rex');
    expect(compiled.textContent).toContain('Labrador');
    expect(compiled.textContent).toContain('3 anos');
    expect(compiled.textContent).toContain('João Silva');
    expect(compiled.textContent).toContain('(65) 99999-0000');
    expect(compiled.textContent).toContain('joao@email.com');
  });

  it('should display message when pet has no tutor', async () => {
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PetDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => '2'
              }
            }
          }
        }
      ]
    }).compileComponents();

    const newFixture = TestBed.createComponent(PetDetailComponent);
    const newHttpMock = TestBed.inject(HttpTestingController);

    newFixture.detectChanges();

    const req = newHttpMock.expectOne('https://pet-manager-api.geia.vip/v1/pets/2');
    req.flush(mockPetWithoutTutor);

    newFixture.detectChanges();

    const compiled = newFixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Mia');
    expect(compiled.textContent).toContain('ainda não possui tutor');

    newHttpMock.verify();
  });

  it('should display error on 404', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/pets/1');
    req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Pet não encontrado');
  });

  it('should have back link to pets list', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/pets/1');
    req.flush(mockPetWithTutor);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const backLink = compiled.querySelector('a[href="/pets"]');
    expect(backLink).toBeTruthy();
    expect(backLink?.textContent).toContain('Voltar');
  });
});
