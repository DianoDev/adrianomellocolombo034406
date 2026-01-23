import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { PetFormComponent } from './pet-form.component';

describe('PetFormComponent', () => {
  let component: PetFormComponent;
  let fixture: ComponentFixture<PetFormComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [PetFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'pets', component: PetFormComponent },
          { path: 'pets/novo', component: PetFormComponent },
          { path: 'pets/:id', component: PetFormComponent },
          { path: 'pets/:id/editar', component: PetFormComponent }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PetFormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start in create mode when no id param', () => {
    fixture.detectChanges();
    expect(component.isEditMode()).toBe(false);
  });

  it('should have invalid form when nome is empty', () => {
    fixture.detectChanges();
    expect(component.form.invalid).toBe(true);
  });

  it('should have valid form when nome is filled', () => {
    fixture.detectChanges();
    component.form.patchValue({ nome: 'Rex' });
    expect(component.form.valid).toBe(true);
  });

  it('should validate idade range', () => {
    fixture.detectChanges();
    component.form.patchValue({ nome: 'Rex', idade: -1 });
    expect(component.form.get('idade')?.invalid).toBe(true);

    component.form.patchValue({ idade: 101 });
    expect(component.form.get('idade')?.invalid).toBe(true);

    component.form.patchValue({ idade: 5 });
    expect(component.form.get('idade')?.valid).toBe(true);
  });

  it('should submit form and create pet', () => {
    fixture.detectChanges();

    component.form.patchValue({
      nome: 'Rex',
      raca: 'Labrador',
      idade: 3
    });

    component.onSubmit();

    const createReq = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/pets');
    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.body).toEqual({
      nome: 'Rex',
      raca: 'Labrador',
      idade: 3
    });

    createReq.flush({ id: 1, nome: 'Rex', raca: 'Labrador', idade: 3 });

    expect(component.successMessage()).toContain('cadastrado');
  });

  it('should display error on submit failure', () => {
    fixture.detectChanges();

    component.form.patchValue({ nome: 'Rex' });
    component.onSubmit();

    const createReq = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/pets');
    createReq.error(new ErrorEvent('Network error'));

    expect(component.error()).toContain('Erro ao cadastrar');
  });

  it('should not submit when form is invalid', () => {
    fixture.detectChanges();

    component.onSubmit();

    httpMock.expectNone('https://pet-manager-api.geia.vip/v1/pets');
    expect(component.form.get('nome')?.touched).toBe(true);
  });

  it('should validate file type on selection', () => {
    fixture.detectChanges();

    const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [mockFile] } } as unknown as Event;

    component.onFileSelected(event);

    expect(component.error()).toContain('imagem');
    expect(component.selectedFile()).toBeNull();
  });

  it('should accept image files', () => {
    fixture.detectChanges();

    const mockFile = new File([''], 'photo.jpg', { type: 'image/jpeg' });
    Object.defineProperty(mockFile, 'size', { value: 1024 });

    const event = { target: { files: [mockFile] } } as unknown as Event;

    component.onFileSelected(event);

    expect(component.error()).toBeNull();
    expect(component.selectedFile()).toBe(mockFile);
  });

  it('should reject files larger than 10MB', () => {
    fixture.detectChanges();

    const mockFile = new File([''], 'photo.jpg', { type: 'image/jpeg' });
    Object.defineProperty(mockFile, 'size', { value: 11 * 1024 * 1024 });

    const event = { target: { files: [mockFile] } } as unknown as Event;

    component.onFileSelected(event);

    expect(component.error()).toContain('10MB');
    expect(component.selectedFile()).toBeNull();
  });

  it('should display header for create mode', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Novo Pet');
  });
});
