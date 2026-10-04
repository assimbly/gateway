import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { provideRouter } from '@angular/router';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';

import { FlowEditorHeaderComponent } from './flow-editor-header.component';

describe('Flow editor header', () => {
  let fixture: ComponentFixture<FlowEditorHeaderComponent>;
  let name: FormControl<string>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FlowEditorHeaderComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    fixture = TestBed.createComponent(FlowEditorHeaderComponent);
    name = new FormControl('Orders', { nonNullable: true });
    fixture.componentRef.setInput('nameControl', name);
  });

  it('disables Save & start while the Flow is a Draft', () => {
    fixture.componentRef.setInput('draftReason', 'The Source has no Component yet.');
    fixture.detectChanges();

    expect(buttonNamed('Save & start').disabled).toBe(true);
    expect(buttonNamed('Save').disabled).toBe(false);
  });

  it('allows Save & start once the Flow is complete', () => {
    fixture.detectChanges();

    expect(buttonNamed('Save & start').disabled).toBe(false);
  });

  it('renames the Flow from the breadcrumb', () => {
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[aria-label="Flow name"]');

    input.value = 'Orders to SFTP';
    input.dispatchEvent(new Event('input'));

    expect(name.value).toBe('Orders to SFTP');
  });

  function buttonNamed(label: string): HTMLButtonElement {
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    const button = buttons.find(b => b.textContent?.trim() === label);
    if (!button) {
      throw new Error(`No button named ${label}`);
    }
    return button;
  }
});
