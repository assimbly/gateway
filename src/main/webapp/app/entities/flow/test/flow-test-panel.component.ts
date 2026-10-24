import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import SendMessageEditor from 'app/shared/send/send-message-editor';
import { SendHeader } from 'app/shared/send/send-headers';
import { sendErrorText } from 'app/shared/send/send-state';
import { BodyMode } from 'app/shared/send/send-upload';

import { FlowGraph } from '../designer/flow-graph';
import { explainError } from '../flow-errors';
import { FlowService } from '../flow.service';
import { FlowTestRun, StepRun, StepRunMark, TestMessage, entryStepOf, headersOf, runResultsByStepKey, shortDuration } from './flow-test-run';

/** Why a test can't run now, and the button that helps, if any. */
interface Blocked {
  text: string;
  action?: 'start';
}

/**
 * The Test panel of the visual editor: sends one message through the running Flow, from the Step after the Source,
 * and shows what came back. The editor marks each Step on the canvas with what it did; selecting a Step shows here
 * the message it got and passed on. The Route and Script editors use it too, without a graph. In a Route Flow the
 * message goes into its first Route, and only the response comes back, as a Route has no Steps inside. In a Script
 * Flow it goes into its first Script, and the editor shows what each Script made of it.
 */
@Component({
  selector: 'jhi-flow-test-panel',
  templateUrl: './flow-test-panel.component.html',
  styleUrl: './flow-test-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FontAwesomeModule, NgTemplateOutlet, RouterLink, SendMessageEditor],
})
export class FlowTestPanelComponent {
  readonly flowId = input<number | null | undefined>();
  /** The visual Flow; a Route Flow has none and names its entry instead. */
  readonly graph = input<FlowGraph | undefined>();
  /** The Step the message goes into, when there is no graph: the first Route of a Route Flow, or the first Script of a Script Flow. */
  readonly entryStepId = input<string | undefined>();
  /** What `entryStepId` is. */
  readonly entryKind = input<'route' | 'script'>('route');
  /** The key of the Step selected on the canvas, whose messages are shown. */
  readonly selectedKey = input<string | undefined>();
  readonly running = input(false);
  readonly draftReason = input<string | null>(null);
  readonly unsaved = input(false);
  /** The last run; the editor keeps it, and drops it once the Flow changes. */
  readonly run = input<FlowTestRun | undefined>();

  readonly ran = output<FlowTestRun>();
  readonly start = output<void>();
  readonly saveAndRun = output<void>();
  readonly editStep = output<string>();
  readonly closed = output<void>();

  readonly body = signal('');
  readonly headers = signal<SendHeader[]>([]);
  readonly bodyMode = signal<BodyMode>('text');
  readonly pending = signal(false);
  readonly failure = signal<string | null>(null);
  readonly messageTab = signal<'in' | 'out'>('in');

  readonly explain = explainError;
  readonly duration = shortDuration;

  private readonly flowService = inject(FlowService);
  /** The Passed/Failed summary of the last run, or why it couldn't run. */
  private readonly result = viewChild<ElementRef<HTMLElement>>('result');
  /** Set by Run: the result it brings is scrolled into view, below the message, once it's drawn. */
  private revealResult = false;

  constructor() {
    afterRenderEffect(() => {
      const result = this.result()?.nativeElement;
      // Run again draws its result in the same place: the new run and failure are what move it into view.
      this.run();
      this.failure();
      if (result && this.revealResult && !this.pending()) {
        this.revealResult = false;
        result.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
      }
    });
  }

  /** Whether the panel tests a Route Flow: the message goes into its first Route, and there are no Steps to select. */
  readonly routes = computed(() => !this.graph() && this.entryKind() === 'route');

  /** Whether the panel tests a Script Flow: the message goes into its first Script, and the editor shows each Script's result. */
  readonly scripts = computed(() => !this.graph() && this.entryKind() === 'script');

  readonly entryStep = computed(() => {
    const graph = this.graph();
    return graph ? entryStepOf(graph) : this.entryStepId();
  });

  readonly blocked = computed<Blocked | null>(() => {
    if (!this.flowId()) {
      return { text: 'Save the Flow first.' };
    }
    if (this.draftReason() !== null) {
      return { text: `This Flow is a Draft: ${this.draftReason()}` };
    }
    if (!this.entryStep()) {
      return { text: this.graph() ? 'Link a Step after the Source and save the Flow first.' : 'Save the Flow first.' };
    }
    return this.running() ? null : { text: 'Start the Flow to test it.', action: 'start' };
  });

  readonly marks = computed(() => {
    const run = this.run();
    const graph = this.graph();
    return run && graph ? runResultsByStepKey(graph, run) : new Map<string, StepRunMark>();
  });

  readonly selectedMark = computed(() => {
    const key = this.selectedKey();
    return key ? this.marks().get(key) : undefined;
  });

  readonly passedSteps = computed(() => this.run()?.steps.filter(step => step.status === 'completed').length ?? 0);

  runTest(): void {
    const flowId = this.flowId();
    const entryStepId = this.entryStep();
    if (!flowId || !entryStepId || this.blocked() || this.pending()) {
      return;
    }
    this.pending.set(true);
    this.failure.set(null);
    this.revealResult = true;
    this.flowService.testRun(flowId, { entryStepId, body: this.body(), headers: headersOf(this.headers()) }).subscribe({
      next: run => {
        this.pending.set(false);
        this.ran.emit(run);
      },
      error: error => {
        this.pending.set(false);
        this.failure.set(sendErrorText(error));
      },
    });
  }

  /** A Step's run, when the selection is a Step that ran. */
  stepRun(mark: StepRunMark | undefined): StepRun | undefined {
    return typeof mark === 'object' ? mark : undefined;
  }

  /** The message of the open tab; a Step that failed or still ran passed nothing on. */
  shownMessage(step: StepRun): TestMessage | null {
    return this.messageTab() === 'in' ? step.in : step.out;
  }

  headerEntries(message: TestMessage | null | undefined): [string, string][] {
    return Object.entries(message?.headers ?? {});
  }
}
