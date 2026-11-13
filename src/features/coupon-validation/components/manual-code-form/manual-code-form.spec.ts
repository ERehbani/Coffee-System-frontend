import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManualCodeForm } from './manual-code-form';

describe('ManualCodeForm', () => {
  let fixture: ComponentFixture<ManualCodeForm>;
  let element: HTMLElement;
  let submitted: string[];

  async function render(disabled = false): Promise<void> {
    TestBed.configureTestingModule({ imports: [ManualCodeForm] });
    fixture = TestBed.createComponent(ManualCodeForm);
    fixture.componentRef.setInput('disabled', disabled);
    submitted = [];
    fixture.componentInstance.submitted.subscribe((code) => submitted.push(code));
    element = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const input = () => element.querySelector<HTMLInputElement>('#validation-code')!;
  const submitButton = () => element.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const form = () => element.querySelector('form')!;

  async function type(value: string): Promise<void> {
    input().value = value;
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('labels the input for the code', async () => {
    await render();

    expect(element.querySelector('label[for="validation-code"]')?.textContent).toContain(
      'Código del cupón',
    );
  });

  it('emits the trimmed code when the cafe submits it', async () => {
    await render();
    await type('  3f2b8c1e-9d4a  ');

    submitButton().click();

    expect(submitted).toEqual(['3f2b8c1e-9d4a']);
  });

  it('submits with the Enter key too', async () => {
    await render();
    await type('code-1');

    form().dispatchEvent(new Event('submit', { cancelable: true }));

    expect(submitted).toEqual(['code-1']);
  });

  it('keeps the button disabled until there is a code', async () => {
    await render();

    expect(submitButton().disabled).toBe(true);

    await type('   ');
    expect(submitButton().disabled).toBe(true);

    await type('code-1');
    expect(submitButton().disabled).toBe(false);
  });

  it('does not emit anything while it is disabled', async () => {
    await render();
    await type('code-1');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    await fixture.whenStable();

    form().dispatchEvent(new Event('submit', { cancelable: true }));

    expect(input().disabled).toBe(true);
    expect(submitButton().disabled).toBe(true);
    expect(submitted).toEqual([]);
  });
});
