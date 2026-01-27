import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'login', component: LoginComponent },
          { path: 'pets', component: LoginComponent }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
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

  it('should have invalid form when username is empty', () => {
    fixture.detectChanges();
    component.form.patchValue({ password: 'test123' });
    expect(component.form.invalid).toBe(true);
  });

  it('should have invalid form when password is empty', () => {
    fixture.detectChanges();
    component.form.patchValue({ username: 'admin' });
    expect(component.form.invalid).toBe(true);
  });

  it('should have valid form when both fields are filled', () => {
    fixture.detectChanges();
    component.form.patchValue({ username: 'admin', password: 'admin' });
    expect(component.form.valid).toBe(true);
  });

  it('should submit form and login successfully', () => {
    fixture.detectChanges();

    component.form.patchValue({
      username: 'admin',
      password: 'admin'
    });

    component.onSubmit();

    const loginReq = httpMock.expectOne('https://pet-manager-api.geia.vip/autenticacao/login');
    expect(loginReq.request.method).toBe('POST');
    expect(loginReq.request.body).toEqual({
      username: 'admin',
      password: 'admin'
    });

    loginReq.flush({
      access_token: 'test-token',
      refresh_token: 'test-refresh',
      expires_in: 300,
      refresh_expires_in: 3600
    });

    expect(localStorage.getItem('access_token')).toBe('test-token');
    expect(localStorage.getItem('refresh_token')).toBe('test-refresh');
  });

  it('should display error on invalid credentials', () => {
    fixture.detectChanges();

    component.form.patchValue({ username: 'admin', password: 'wrong' });
    component.onSubmit();

    const loginReq = httpMock.expectOne('https://pet-manager-api.geia.vip/autenticacao/login');
    loginReq.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(component.error()).toContain('incorretos');
  });

  it('should display error on network failure', () => {
    fixture.detectChanges();

    component.form.patchValue({ username: 'admin', password: 'admin' });
    component.onSubmit();

    const loginReq = httpMock.expectOne('https://pet-manager-api.geia.vip/autenticacao/login');
    loginReq.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(component.error()).toContain('conexao');
  });

  it('should not submit when form is invalid', () => {
    fixture.detectChanges();

    component.onSubmit();

    httpMock.expectNone('https://pet-manager-api.geia.vip/autenticacao/login');
    expect(component.form.get('username')?.touched).toBe(true);
    expect(component.form.get('password')?.touched).toBe(true);
  });

  it('should toggle password visibility', () => {
    fixture.detectChanges();

    expect(component.showPassword()).toBe(false);

    component.togglePassword();
    expect(component.showPassword()).toBe(true);

    component.togglePassword();
    expect(component.showPassword()).toBe(false);
  });

  it('should display correct header', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Pet Manager');
  });

  it('should trim username before submit', () => {
    fixture.detectChanges();

    component.form.patchValue({
      username: '  admin  ',
      password: 'admin'
    });

    component.onSubmit();

    const loginReq = httpMock.expectOne('https://pet-manager-api.geia.vip/autenticacao/login');
    expect(loginReq.request.body.username).toBe('admin');
  });
});
