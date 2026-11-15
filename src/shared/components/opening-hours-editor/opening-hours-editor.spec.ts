import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpeningHours } from '../../utils/opening-hours';
import { OpeningHoursEditor } from './opening-hours-editor';

describe('OpeningHoursEditor', () => {
  let fixture: ComponentFixture<OpeningHoursEditor>;
  let editor: OpeningHoursEditor;

  function render(hours: OpeningHours[], showErrors = false): void {
    fixture = TestBed.createComponent(OpeningHoursEditor);
    editor = fixture.componentInstance;
    fixture.componentRef.setInput('hours', hours);
    fixture.componentRef.setInput('showErrors', showErrors);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [OpeningHoursEditor] }).compileComponents();
  });

  it('shows the seven days and marks the closed ones', () => {
    render([{ day: 'MONDAY', opensAt: '08:00', closesAt: '20:00' }]);
    const text = fixture.nativeElement.textContent;

    expect(fixture.nativeElement.querySelectorAll('[data-day]').length).toBe(7);
    expect(text).toContain('Lunes');
    expect(text).toContain('Domingo');
    expect(fixture.nativeElement.querySelectorAll('input[type="time"]').length).toBe(2);
  });

  it('opens a day with the default hours and keeps the days sorted', () => {
    render([{ day: 'FRIDAY', opensAt: '09:00', closesAt: '18:00' }]);

    editor.toggleDay('MONDAY', true);

    expect(editor.hours()).toEqual([
      { day: 'MONDAY', opensAt: '08:00', closesAt: '20:00' },
      { day: 'FRIDAY', opensAt: '09:00', closesAt: '18:00' },
    ]);
  });

  it('closes a day and changes the hours of another', () => {
    render([
      { day: 'MONDAY', opensAt: '08:00', closesAt: '20:00' },
      { day: 'TUESDAY', opensAt: '08:00', closesAt: '20:00' },
    ]);

    editor.toggleDay('MONDAY', false);
    editor.changeTime('TUESDAY', 'closesAt', '22:00');

    expect(editor.hours()).toEqual([{ day: 'TUESDAY', opensAt: '08:00', closesAt: '22:00' }]);
  });

  it('copies the hours of a day to the other open days', () => {
    render([
      { day: 'MONDAY', opensAt: '07:30', closesAt: '19:00' },
      { day: 'SATURDAY', opensAt: '10:00', closesAt: '14:00' },
    ]);

    editor.copyToAll('MONDAY');

    expect(editor.hours().every((h) => h.opensAt === '07:30' && h.closesAt === '19:00')).toBe(true);
  });

  it('warns about a day that closes before it opens and about having no days', () => {
    render([{ day: 'MONDAY', opensAt: '20:00', closesAt: '08:00' }], true);
    expect(fixture.nativeElement.textContent).toContain('El cierre tiene que ser después de la apertura.');

    render([], true);
    expect(fixture.nativeElement.textContent).toContain('Marcá al menos un día');
  });
});
