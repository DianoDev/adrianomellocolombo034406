import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TutorCardComponent } from './tutor-card.component';

describe('TutorCardComponent', () => {
  let component: TutorCardComponent;
  let fixture: ComponentFixture<TutorCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorCardComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(TutorCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.tutor = { id: 1, nome: 'Maria Silva' };
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display tutor name', () => {
    component.tutor = { id: 1, nome: 'Maria Silva' };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Maria Silva');
  });

  it('should display tutor phone when available', () => {
    component.tutor = { id: 1, nome: 'Maria Silva', telefone: '(11) 99999-8888' };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('(11) 99999-8888');
  });

  it('should display tutor address when available', () => {
    component.tutor = { id: 1, nome: 'Maria Silva', endereco: 'Rua das Flores, 123' };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Rua das Flores, 123');
  });

  it('should show placeholder when no photo', () => {
    component.tutor = { id: 1, nome: 'Maria Silva' };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const placeholder = compiled.querySelector('.bg-gradient-to-br');
    expect(placeholder).toBeTruthy();
  });

  it('should hide image on error', () => {
    component.tutor = {
      id: 1,
      nome: 'Maria Silva',
      foto: { id: 1, nome: 'foto.jpg', contentType: 'image/jpeg', url: 'http://invalid-url' }
    };
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    if (img) {
      img.dispatchEvent(new Event('error'));
      fixture.detectChanges();
      expect(img.style.display).toBe('none');
    }
  });
});
