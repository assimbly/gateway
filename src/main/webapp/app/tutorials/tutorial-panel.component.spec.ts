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

  function open(stepHtml: string, variables: Record<string, string> | null = { messages: 'C:/Users/me/messages' }): void {
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
    const service = {
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
      load: jest.fn(),
      stopWatching: jest.fn(),
      isFinished: () => false,
      isStarted: () => false,
    };
    TestBed.configureTestingModule({
      imports: [TutorialPanelComponent],
      providers: [
        { provide: TutorialService, useValue: service },
        { provide: TutorialPanelState, useValue: { close: jest.fn() } },
        { provide: VariableKeysService, useValue: { values: () => of(variables) } },
      ],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    fixture = TestBed.createComponent(TutorialPanelComponent);
    fixture.detectChanges();
  }

  it('says where the messages folder is on a step about it', () => {
    open('<p>Open the newest file in <code>@{messages}/out</code>.</p>');

    const folder: HTMLElement = fixture.nativeElement.querySelector('.tutorial-panel__folder');
    expect(folder.textContent).toContain('C:/Users/me/messages');
    expect(folder.querySelector('[data-tour-copy]')?.textContent).toBe('C:/Users/me/messages');
  });

  it('leaves the messages folder out of a step that is not about it', () => {
    open('<p>Click <strong>Start</strong>.</p>');

    expect(fixture.nativeElement.querySelector('.tutorial-panel__folder')).toBeNull();
  });

  it('leaves the messages folder out when the Gateway has no such Variable', () => {
    open('<p>Open the <code>out</code> folder of your messages folder.</p>', {});

    expect(fixture.nativeElement.querySelector('.tutorial-panel__folder')).toBeNull();
  });
});
