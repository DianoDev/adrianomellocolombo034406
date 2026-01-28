import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PetFacade } from './pet.facade';

describe('PetFacade', () => {
  let facade: PetFacade;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        PetFacade
      ]
    });

    facade = TestBed.inject(PetFacade);
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
    expect(facade.state.pets).toEqual([]);
    expect(facade.state.selectedPet).toBeNull();
    expect(facade.state.loading).toBe(false);
    expect(facade.state.error).toBeNull();
  });

  it('should load pets', () => {
    facade.loadPets();

    expect(facade.state.loading).toBe(true);

    const req = httpMock.expectOne(r => r.url.includes('/v1/pets'));
    req.flush({
      page: 0,
      size: 10,
      total: 2,
      pageCount: 1,
      content: [
        { id: 1, nome: 'Rex', raca: 'Labrador', idade: 3 },
        { id: 2, nome: 'Mia', raca: 'Siames', idade: 2 }
      ]
    });

    expect(facade.state.loading).toBe(false);
    expect(facade.state.pets.length).toBe(2);
    expect(facade.state.pets[0].nome).toBe('Rex');
  });

  it('should load pet by id', () => {
    facade.loadPetById(1);

    expect(facade.state.loading).toBe(true);

    const req = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/pets/1');
    req.flush({ id: 1, nome: 'Rex', raca: 'Labrador', idade: 3 });

    expect(facade.state.loading).toBe(false);
    expect(facade.state.selectedPet?.nome).toBe('Rex');
  });

  it('should handle error when loading pets', () => {
    facade.loadPets();

    const req = httpMock.expectOne(r => r.url.includes('/v1/pets'));
    req.flush({}, { status: 500, statusText: 'Server Error' });

    expect(facade.state.loading).toBe(false);
    expect(facade.state.error).toBeTruthy();
  });

  it('should handle 404 when loading pet by id', () => {
    facade.loadPetById(999);

    const req = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/pets/999');
    req.flush({}, { status: 404, statusText: 'Not Found' });

    expect(facade.state.error).toContain('nao encontrado');
  });

  it('should search pets', () => {
    facade.search('Rex');

    const req = httpMock.expectOne(r =>
      r.url.includes('/v1/pets') && r.params.get('nome') === 'Rex'
    );
    req.flush({ page: 0, size: 10, total: 0, pageCount: 0, content: [] });

    expect(facade.state.filter.nome).toBe('Rex');
  });

  it('should change page', () => {
    facade.changePage(2);

    const req = httpMock.expectOne(r =>
      r.url.includes('/v1/pets') && r.params.get('page') === '2'
    );
    req.flush({ page: 2, size: 10, total: 30, pageCount: 3, content: [] });

    expect(facade.state.filter.page).toBe(2);
  });

  it('should clear selected pet', () => {
    facade.loadPetById(1);
    const req = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/pets/1');
    req.flush({ id: 1, nome: 'Rex' });

    expect(facade.state.selectedPet).toBeTruthy();

    facade.clearSelectedPet();
    expect(facade.state.selectedPet).toBeNull();
  });

  it('should clear error', () => {
    facade.loadPets();
    const req = httpMock.expectOne(r => r.url.includes('/v1/pets'));
    req.flush({}, { status: 500, statusText: 'Error' });

    expect(facade.state.error).toBeTruthy();

    facade.clearError();
    expect(facade.state.error).toBeNull();
  });

  it('should reset state', () => {
    facade.loadPets();
    const req = httpMock.expectOne(r => r.url.includes('/v1/pets'));
    req.flush({ page: 0, size: 10, total: 1, pageCount: 1, content: [{ id: 1, nome: 'Rex' }] });

    expect(facade.state.pets.length).toBe(1);

    facade.resetState();

    expect(facade.state.pets).toEqual([]);
    expect(facade.state.loading).toBe(false);
  });
});
