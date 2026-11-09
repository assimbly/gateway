import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

import { Components } from 'app/shared/camel/component-type';
import SendMessageEditor from 'app/shared/send/send-message-editor';
import { SendHeader } from 'app/shared/send/send-headers';
import { sendErrorText } from 'app/shared/send/send-state';
import { BodyMode } from 'app/shared/send/send-upload';

import { FlowGraph, shownName, stepLabel, stepPath } from '../designer/flow-graph';
import { explainError } from '../flow-errors';
import { FlowService } from '../flow.service';
import { FlowTestRun, StepRun, StepRunMark, entryStepOf, headersOf, runResultsByStepKey, shortDuration } from './flow-test-run';
import { TestMessageComponent } from './test-message.component';

/** Why a test can't run now, and the button that helps, if any. */
interface Blocked {
  text: string;
  action?: 'start';
}

/** What the panel shows: the message in and out of the whole Flow, or of the Step selected on the canvas. */
export type TestLevel = 'flow' | 'step';

/**
 * The Test panel of the visual editor: sends one message through the running Flow, from the Step after the Source,
 * and shows what came back. Flow shows the In (the message to send) and Out (what came back) of the whole Flow; Step
 * shows the In and Out of the Step selected on the canvas, in the same layout. Selecting a Step switches to Step.
 * The Route and Script editors use it too, without a graph and so without Step. In a Route Flow the message goes into
 * its first Route, as a Route has no Steps inside. In a Script Flow it goes into its first Script, and the editor shows
 * what each Script made of it.
 */
@Component({
  selector: 'jhi-flow-test-panel',
  templateUrl: './flow-test-panel.component.html',
  styleUrl: './flow-test-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FontAwesomeModule, NgbTooltip, NgTemplateOutlet, RouterLink, SendMessageEditor, TestMessageComponent],
})
export class FlowTestPanelComponent {
  readonly flowId = input<number | null | undefined>();
  readonly flowName = input<string | null | undefined>();
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
  /** Whether the Tester is full page, hiding the canvas the Steps are selected on. */
  readonly canvasHidden = input(false);

  readonly ran = output<FlowTestRun>();
  readonly start = output<void>();
  readonly saveAndRun = output<void>();
  readonly editStep = output<string>();
  /** Visual flow, full page: show the canvas beside the Tester, so a Step can be selected. */
  readonly showCanvas = output<void>();

  readonly body = signal('');
  readonly headers = signal<SendHeader[]>([]);
  readonly bodyMode = signal<BodyMode>('text');
  readonly pending = signal(false);
  readonly failure = signal<string | null>(null);
  /** Flow or Step: a Step selected on the canvas switches to Step, a click on the empty canvas back to Flow. */
  readonly level = linkedSignal<TestLevel>(() => (this.selectedKey() ? 'step' : 'flow'));

  readonly explain = explainError;
  readonly duration = shortDuration;

  private readonly flowService = inject(FlowService);
  /** Each component's title from the catalogue, such as 'File' for `file`, as the canvas names the Steps. */
  private readonly titles = new Map<string, string>(inject(Components).types.map(type => [type.name, type.title ?? type.name]));
  /** The Passed/Failed summary of the last run, or why it couldn't run. */
  private readonly result = viewChild<ElementRef<HTMLElement>>('result');
  /** Set by Run: the result it brings is scrolled into view, below the message, once it's drawn. */
  private revealResult = false;

  constructor() {
    afterRenderEffect(() => {
      const result = this.result()?.nativeElement;
      // Test again draws its result in the same place: the new run and failure are what move it into view.
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

  /** What a test does, behind the info icon of the Flow. */
  readonly flowInfo = computed(() => {
    const into = this.routes() ? 'into the first Route, past its from endpoint' : this.scripts() ? 'into the first Script, past the Source' : 'from the Step after the Source';
    const what = this.routes() ? 'The Routes' : 'The Steps';
    return `Runs one message through the running Flow, ${into}. ${what} do what they always do: they write files, call APIs and put messages on queues.`;
  });

  readonly inInfo = computed(() => {
    const where = this.routes() ? 'the first Route' : this.scripts() ? 'the first Script' : 'the Step after the Source';
    return `What goes into the Flow: the message that goes into ${where}. Type its body and, if needed, its headers, then click Run.`;
  });

  readonly outInfo = 'What goes out of the Flow: the message as it is at the end of the run.';

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

  /** What is shown: only Flow without a canvas to select Steps on. */
  readonly shownLevel = computed<TestLevel>(() => (this.graph() ? this.level() : 'flow'));

  /** The selected Step, named as on the canvas: what it is, and the name the user gave it or else what it works on, such as a folder. */
  readonly selectedStep = computed(() => {
    const graph = this.graph();
    const key = this.selectedKey();
    const step = graph && key ? graph.steps.find(s => s.key === key) : undefined;
    return graph && step ? { label: stepLabel(graph, step, this.titles), name: shownName(step) ?? (stepPath(graph, step) || undefined) } : undefined;
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

  stepStatus(step: StepRun): string {
    return step.status === 'completed' ? 'Completed' : step.status === 'failed' ? 'Failed' : 'Still running';
  }

  /** Why a Step has no Out. */
  noOut(step: StepRun): string {
    if (step.status === 'failed') {
      return 'This Step failed, so it passed nothing on.';
    }
    return step.status === 'running' ? 'This Step was still running when the test ended.' : 'This Step passed nothing on.';
  }
}
