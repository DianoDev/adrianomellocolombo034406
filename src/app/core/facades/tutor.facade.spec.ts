import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TutorFacade } from './tutor.facade';

describe('TutorFacade', () => {
  let facade: TutorFacade;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        TutorFacade
      ]
    });

    facade = TestBed.inject(TutorFacade);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    facade.resetState();
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should have initial state', () => {
    expect(facade.state.tutors).toEqual([]);
    expect(facade.state.selectedTutor).toBeNull();
    expect(facade.state.loading).toBe(false);
    expect(facade.state.error).toBeNull();
  });

  it('should load tutors', () => {
    facade.loadTutors();

    expect(facade.state.loading).toBe(true);

    const req = httpMock.expectOne(r => r.url.includes('/v1/tutores'));
    req.flush({
      page: 0,
      size: 10,
      total: 2,
      pageCount: 1,
      content: [
        { id: 1, nome: 'Maria Silva', telefone: '(11) 99999-8888' },
        { id: 2, nome: 'Joao Santos', telefone: '(11) 88888-7777' }
      ]
    });

    expect(facade.state.loading).toBe(false);
    expect(facade.state.tutors.length).toBe(2);
    expect(facade.state.tutors[0].nome).toBe('Maria Silva');
  });

  it('should load tutor by id', () => {
    facade.loadTutorById(1);

    expect(facade.state.loading).toBe(true);

    const req = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/tutores/1');
    req.flush({
      id: 1,
      nome: 'Maria Silva',
      telefone: '(11) 99999-8888',
      pets: []
    });

    expect(facade.state.loading).toBe(false);
    expect(facade.state.selectedTutor?.nome).toBe('Maria Silva');
  });

  it('should handle error when loading tutors', () => {
    facade.loadTutors();

    const req = httpMock.expectOne(r => r.url.includes('/v1/tutores'));
    req.flush({}, { status: 500, statusText: 'Server Error' });

    expect(facade.state.loading).toBe(false);
    expect(facade.state.error).toBeTruthy();
  });

  it('should handle 404 when loading tutor by id', () => {
    facade.loadTutorById(999);

    const req = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/tutores/999');
    req.flush({}, { status: 404, statusText: 'Not Found' });

    expect(facade.state.error).toContain('nao encontrado');
  });

  it('should search tutors', () => {
    facade.search('Maria');

    const req = httpMock.expectOne(r =>
      r.url.includes('/v1/tutores') && r.params.get('nome') === 'Maria'
    );
    req.flush({ page: 0, size: 10, total: 0, pageCount: 0, content: [] });

    expect(facade.state.filter.nome).toBe('Maria');
  });

  it('should change page', () => {
    facade.changePage(2);

    const req = httpMock.expectOne(r =>
      r.url.includes('/v1/tutores') && r.params.get('page') === '2'
    );
    req.flush({ page: 2, size: 10, total: 30, pageCount: 3, content: [] });

    expect(facade.state.filter.page).toBe(2);
  });

  it('should vincular pet', () => {
    facade.loadTutorById(1);
    let req = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/tutores/1');
    req.flush({ id: 1, nome: 'Maria Silva', pets: [] });

    facade.vincularPet(1, 5);

    req = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/tutores/1/pets/5');
    expect(req.request.method).toBe('POST');
    req.flush({});

    // Reload tutor
    req = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/tutores/1');
    req.flush({ id: 1, nome: 'Maria Silva', pets: [{ id: 5, nome: 'Rex' }] });

    expect(facade.state.successMessage).toContain('vinculado');
  });

  it('should desvincular pet', () => {
    facade.loadTutorById(1);
    let req = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/tutores/1');
    req.flush({ id: 1, nome: 'Maria Silva', pets: [{ id: 5, nome: 'Rex' }] });

    facade.desvincularPet(1, 5);

    req = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/tutores/1/pets/5');
    expect(req.request.method).toBe('DELETE');
    req.flush({});

    // Reload tutor
    req = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/tutores/1');
    req.flush({ id: 1, nome: 'Maria Silva', pets: [] });

    expect(facade.state.successMessage).toContain('removido');
  });

  it('should clear selected tutor', () => {
    facade.loadTutorById(1);
    const req = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/tutores/1');
    req.flush({ id: 1, nome: 'Maria Silva' });

    expect(facade.state.selectedTutor).toBeTruthy();

    facade.clearSelectedTutor();
    expect(facade.state.selectedTutor).toBeNull();
  });

  it('should reset state', () => {
    facade.loadTutors();
    const req = httpMock.expectOne(r => r.url.includes('/v1/tutores'));
    req.flush({ page: 0, size: 10, total: 1, pageCount: 1, content: [{ id: 1, nome: 'Maria' }] });

    expect(facade.state.tutors.length).toBe(1);

    facade.resetState();

    expect(facade.state.tutors).toEqual([]);
    expect(facade.state.loading).toBe(false);
  });
});
