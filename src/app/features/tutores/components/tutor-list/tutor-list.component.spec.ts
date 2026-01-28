import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TutorListComponent } from './tutor-list.component';

describe('TutorListComponent', () => {
  let component: TutorListComponent;
  let fixture: ComponentFixture<TutorListComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [TutorListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TutorListComponent);
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

    const tutorsReq = httpMock.expectOne(req => req.url.includes('/v1/tutores'));
    tutorsReq.flush({ page: 0, size: 10, total: 0, pageCount: 0, content: [] });
  });

  it('should display tutors after loading', () => {
    fixture.detectChanges();

    const tutorsReq = httpMock.expectOne(req => req.url.includes('/v1/tutores'));
    tutorsReq.flush({
      page: 0,
      size: 10,
      total: 2,
      pageCount: 1,
      content: [
        { id: 1, nome: 'Maria Silva', telefone: '(11) 99999-8888' },
        { id: 2, nome: 'Joao Santos', telefone: '(11) 88888-7777' }
      ]
    });

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Maria Silva');
    expect(compiled.textContent).toContain('Joao Santos');
  });

  it('should handle empty results', () => {
    fixture.detectChanges();

    const tutorsReq = httpMock.expectOne(req => req.url.includes('/v1/tutores'));
    tutorsReq.flush({
      page: 0,
      size: 10,
      total: 0,
      pageCount: 0,
      content: []
    });

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nenhum tutor encontrado');
  });

  it('should update search term and reload tutors', () => {
    fixture.detectChanges();

    const initialReq = httpMock.expectOne(req => req.url.includes('/v1/tutores'));
    initialReq.flush({ page: 0, size: 10, total: 0, pageCount: 0, content: [] });

    component.onSearch('Maria');

    const searchReq = httpMock.expectOne(req =>
      req.url.includes('/v1/tutores') && req.params.get('nome') === 'Maria'
    );
    expect(searchReq.request.params.get('nome')).toBe('Maria');
    searchReq.flush({ page: 0, size: 10, total: 0, pageCount: 0, content: [] });
  });

  it('should handle page change', () => {
    fixture.detectChanges();

    const initialReq = httpMock.expectOne(req => req.url.includes('/v1/tutores'));
    initialReq.flush({ page: 0, size: 10, total: 20, pageCount: 2, content: [] });

    component.onPageChange(1);

    const pageReq = httpMock.expectOne(req =>
      req.url.includes('/v1/tutores') && req.params.get('page') === '1'
    );
    expect(pageReq.request.params.get('page')).toBe('1');
    pageReq.flush({ page: 1, size: 10, total: 20, pageCount: 2, content: [] });
  });
});
