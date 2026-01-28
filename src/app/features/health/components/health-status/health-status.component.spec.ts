import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { HealthStatusComponent } from './health-status.component';

describe('HealthStatusComponent', () => {
  let component: HealthStatusComponent;
  let fixture: ComponentFixture<HealthStatusComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthStatusComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HealthStatusComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check health on init', () => {
    fixture.detectChanges();

    const apiReq = httpMock.expectOne(req => req.url.includes('/v1/pets'));
    apiReq.flush({ content: [] });

    const authReq = httpMock.expectOne(req => req.url.includes('/autenticacao/login'));
    authReq.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(component.health()).toBeTruthy();
  });

  it('should display UP status when services are healthy', () => {
    fixture.detectChanges();

    const apiReq = httpMock.expectOne(req => req.url.includes('/v1/pets'));
    apiReq.flush({ content: [] });

    const authReq = httpMock.expectOne(req => req.url.includes('/autenticacao/login'));
    authReq.flush({}, { status: 401, statusText: 'Unauthorized' });

    fixture.detectChanges();

    expect(component.health()?.status).toBe('UP');
    expect(component.isLive()).toBe(true);
    expect(component.isReady()).toBe(true);
  });

  it('should display DOWN status when API fails', () => {
    fixture.detectChanges();

    const apiReq = httpMock.expectOne(req => req.url.includes('/v1/pets'));
    apiReq.flush({}, { status: 500, statusText: 'Server Error' });

    const authReq = httpMock.expectOne(req => req.url.includes('/autenticacao/login'));
    authReq.flush({}, { status: 500, statusText: 'Server Error' });

    fixture.detectChanges();

    expect(component.health()?.status).toBe('DOWN');
    expect(component.isLive()).toBe(false);
    expect(component.isReady()).toBe(false);
  });

  it('should return correct status labels', () => {
    expect(component.getStatusLabel('UP')).toBe('Operacional');
    expect(component.getStatusLabel('DOWN')).toBe('Indisponivel');
    expect(component.getStatusLabel('DEGRADED')).toBe('Degradado');
    expect(component.getStatusLabel('UNKNOWN')).toBe('Desconhecido');
    expect(component.getStatusLabel(undefined)).toBe('Desconhecido');
  });

  it('should refresh health on button click', () => {
    fixture.detectChanges();

    // Initial health check
    let apiReq = httpMock.expectOne(req => req.url.includes('/v1/pets'));
    apiReq.flush({ content: [] });
    let authReq = httpMock.expectOne(req => req.url.includes('/autenticacao/login'));
    authReq.flush({}, { status: 401, statusText: 'Unauthorized' });

    // Trigger refresh
    component.refresh();

    apiReq = httpMock.expectOne(req => req.url.includes('/v1/pets'));
    apiReq.flush({ content: [] });
    authReq = httpMock.expectOne(req => req.url.includes('/autenticacao/login'));
    authReq.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(component.health()?.status).toBe('UP');
  });
});
