import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';
import { VariableKeysService } from 'app/entities/environment-variables/variable-keys.service';

import { TutorialPanelComponent } from './tutorial-panel.component';
import { TutorialPanelState } from './tutorial-panel.state';
import { TutorialService } from './tutorial.service';
import { Tutorial } from './tutorial.model';

describe('Tutorial panel', () => {
  let fixture: ComponentFixture<TutorialPanelComponent>;
  const stepIndex = signal(1);
  let service: { previous: jest.Mock; next: jest.Mock };
  let panel: { close: jest.Mock };

  function open(stepHtml: string, variables: Record<string, string> | null = { messages: 'C:/Users/me/messages' }): void {
    stepIndex.set(1);
    const tutorial: Tutorial = {
      id: 'tutorial2',
      title: 'Tutorial 2',
      minutes: 10,
      fixtures: {},
      steps: [
        { title: 'Tutorial 2', html: '<p>Intro</p>' },
        { title: 'Read the reply', html: stepHtml },
      ],
    };
    const tutorials = {
      summaries: signal([]),
      tutorial: signal(tutorial),
      stepIndex,
      step: computed(() => tutorial.steps[stepIndex()]),
      stepDone: signal(false),
      checking: signal(false),
      missingFixtures: signal([]),
      addingFixture: signal(undefined),
      error: signal(undefined),
      isLast: signal(true),
      previous: jest.fn(() => stepIndex.update(index => index - 1)),
      next: jest.fn(() => stepIndex.update(index => index + 1)),
      load: jest.fn(),
      stopWatching: jest.fn(),
      isFinished: () => false,
      isStarted: () => false,
    };
    service = tutorials;
    TestBed.configureTestingModule({
      imports: [TutorialPanelComponent],
      providers: [
        { provide: TutorialService, useValue: tutorials },
        { provide: TutorialPanelState, useValue: (panel = { close: jest.fn() }) },
        { provide: VariableKeysService, useValue: { values: () => of(variables) } },
      ],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    fixture = TestBed.createComponent(TutorialPanelComponent);
    fixture.detectChanges();
  }

  /** Presses a key on the element, as a keyboard does: the event bubbles up to the panel. */
  function press(element: Element, key: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    element.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  }

  function element<T extends HTMLElement = HTMLElement>(selector: string): T {
    return fixture.nativeElement.querySelector(selector);
  }

  beforeEach(() => {
    // jsdom has no clipboard; copying the selection is what the panel tries first
    document.execCommand = jest.fn(() => true);
  });

  it('says where the messages folder is on a step about it', () => {
    open('<p>Open the newest file in <code>@{messages}/out</code>.</p>');

    const folder = element('.tutorial-panel__folder');
    expect(folder.textContent).toContain('C:/Users/me/messages');
    expect(folder.querySelector('button')?.textContent).toBe('C:/Users/me/messages');
  });

  it('copies the messages folder with its button', () => {
    open('<p>Open the newest file in <code>@{messages}/out</code>.</p>');

    element('.tutorial-panel__folder button').click();

    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(window.getSelection()?.toString()).toBe('C:/Users/me/messages');
    expect(element('.tutorial-panel__folder code.tutorial-copy').classList).toContain('is-copied');
  });

  it('leaves the messages folder out of a step that is not about it', () => {
    open('<p>Click <strong>Start</strong>.</p>');

    expect(fixture.nativeElement.querySelector('.tutorial-panel__folder')).toBeNull();
  });

  it('leaves the messages folder out when the Gateway has no such Variable', () => {
    open('<p>Open the <code>out</code> folder of your messages folder.</p>', {});

    expect(fixture.nativeElement.querySelector('.tutorial-panel__folder')).toBeNull();
  });

  it('copies a code block without the line break it ends with', () => {
    open(
      '<div class="tutorial-code"><button type="button" class="tutorial-code__copy" data-tour-copy>Copy</button>' +
        '<pre><code class="language-xml">&lt;route&gt;\n    &lt;to uri="sjms:NamesOut"/&gt;\n&lt;/route&gt;\n</code></pre></div>',
    );

    element('.tutorial-code__copy').click();

    expect(window.getSelection()?.toString()).toBe('<route>\n    <to uri="sjms:NamesOut"/>\n</route>');
  });

  it('copies a value with Enter or Space, as with a click', () => {
    open('<p>Set it to <code class="tutorial-copy" data-tour-copy tabindex="0" role="button">www.dneonline.com</code>.</p>');
    const value = element('.tutorial-panel__body [data-tour-copy]');

    expect(press(value, 'Enter').defaultPrevented).toBe(true);
    expect(window.getSelection()?.toString()).toBe('www.dneonline.com');
    expect(value.classList).toContain('is-copied');

    window.getSelection()?.removeAllRanges();
    expect(press(value, ' ').defaultPrevented).toBe(true);
    expect(window.getSelection()?.toString()).toBe('www.dneonline.com');
    expect(press(value, 'a').defaultPrevented).toBe(false);
  });

  it('goes back and on with the arrow keys while focus is in the panel', () => {
    open('<p>Click <strong>Start</strong>.</p>');

    press(element('.tutorial-panel__body'), 'ArrowLeft');
    expect(service.previous).toHaveBeenCalledTimes(1);
    expect(stepIndex()).toBe(0);

    press(element('.tutorial-panel__body'), 'ArrowRight');
    expect(service.next).toHaveBeenCalledTimes(1);
    expect(stepIndex()).toBe(1);
  });

  it('has no step before the overview to go back to', () => {
    open('<p>Click <strong>Start</strong>.</p>');
    stepIndex.set(0);
    fixture.detectChanges();

    press(element('.tutorial-panel__body'), 'ArrowLeft');

    expect(service.previous).not.toHaveBeenCalled();
  });

  it('gives focus to the step title when the focused element goes with the step', async () => {
    open('<p>Set it to <code data-tour-copy tabindex="0">www.dneonline.com</code>.</p>');
    element('.tutorial-panel__body [data-tour-copy]').focus();

    press(element('.tutorial-panel__body [data-tour-copy]'), 'ArrowLeft');
    await fixture.whenStable();

    expect(document.activeElement).toBe(element('.tutorial-panel__step-title'));
  });

  it('leaves keys typed into a field or code editor to it', () => {
    open('<p><input type="text"></p><div class="cm-editor"><div class="cm-content" contenteditable="true">x</div></div>');

    expect(press(element('.tutorial-panel__body input'), 'ArrowRight').defaultPrevented).toBe(false);
    press(element('.tutorial-panel__body .cm-content'), 'ArrowLeft');
    press(element('.tutorial-panel__body input'), 'Escape');

    expect(service.next).not.toHaveBeenCalled();
    expect(service.previous).not.toHaveBeenCalled();
    expect(panel.close).not.toHaveBeenCalled();
  });

  it('leaves arrow keys with a modifier, such as Alt+Left for the browser, alone', () => {
    open('<p>Click <strong>Start</strong>.</p>');

    element('.tutorial-panel__body').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true }));

    expect(service.previous).not.toHaveBeenCalled();
  });

  it('closes with Escape', () => {
    open('<p>Click <strong>Start</strong>.</p>');

    press(element('.tutorial-panel__nav button'), 'Escape');

    expect(panel.close).toHaveBeenCalled();
  });
});
