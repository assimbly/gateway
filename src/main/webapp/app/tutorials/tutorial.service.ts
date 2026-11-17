import { HttpClient, HttpContext } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';

import { Subscription, filter, forkJoin, map, of, switchMap, take, timer } from 'rxjs';

import { HANDLES_OWN_ERRORS } from 'app/core/interceptor/error-handler.interceptor';
import { AlertService } from 'app/core/util/alert.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { ImportService } from 'app/entities/import/import.service';

import { TutorialChecks } from './tutorial-checks';
import { TUTORIALS_URL, parseTutorial } from './tutorial-parser';
import { Tutorial, TutorialStep, TutorialSummary } from './tutorial.model';

/** The panel says itself when a tutorial can't be loaded. */
const QUIET = new HttpContext().set(HANDLES_OWN_ERRORS, true);

/** How often the check of the open step asks the Gateway, in milliseconds. */
export const CHECK_INTERVAL = 3000;

/** A page of the Gateway wiki, where the written tutorials are published. */
const WIKI_PAGE = /^https:\/\/github\.com\/assimbly\/gateway\/wiki\/([^/?#]+)/;

interface Progress {
  step: number;
  done: number[];
  finished?: boolean;
}

interface StoredProgress {
  active?: string;
  tutorials: Record<string, Progress>;
}

/** The tutorial the user follows in the panel, the step they're on, and which steps they've done. */
@Service()
export class TutorialService {
  static readonly STORAGE_KEY = 'jhi-tutorial-progress';

  private readonly http = inject(HttpClient);
  private readonly checks = inject(TutorialChecks);
  private readonly importService = inject(ImportService);
  private readonly eventManager = inject(EventManager);
  private readonly alertService = inject(AlertService);

  readonly summaries = signal<TutorialSummary[]>([]);
  readonly tutorial = signal<Tutorial | undefined>(undefined);
  readonly stepIndex = signal(0);
  readonly done = signal<ReadonlySet<number>>(new Set());
  /** Whether the check of the open step is waiting for the user. */
  readonly checking = signal(false);
  /** The Flows the tutorial starts from that this Gateway doesn't have. */
  readonly missingFixtures = signal<string[]>([]);
  readonly addingFixture = signal<string | undefined>(undefined);
  readonly error = signal<string | undefined>(undefined);

  readonly step = computed<TutorialStep | undefined>(() => this.tutorial()?.steps[this.stepIndex()]);
  readonly stepDone = computed(() => this.done().has(this.stepIndex()));
  readonly isLast = computed(() => this.stepIndex() === (this.tutorial()?.steps.length ?? 0) - 1);

  private progress: StoredProgress = this.readProgress();
  private watching?: Subscription;

  /** Loads the list of tutorials and reopens the one the user was following. */
  load(): void {
    this.error.set(undefined);
    this.http.get<TutorialSummary[]>(`${TUTORIALS_URL}index.json`, { context: QUIET }).subscribe({
      next: summaries => {
        this.summaries.set(summaries);
        const active = this.progress.active;
        if (active && summaries.some(summary => summary.id === active)) {
          this.start(active);
        }
      },
      error: () => this.error.set("The tutorials couldn't be loaded."),
    });
  }

  start(id: string): void {
    this.error.set(undefined);
    this.http.get(`${TUTORIALS_URL}${id}/README.md`, { responseType: 'text', context: QUIET }).subscribe({
      next: markdown => {
        const tutorial = parseTutorial(markdown);
        const progress = this.progress.tutorials[id];
        this.tutorial.set(tutorial);
        this.done.set(new Set(progress?.finished ? [] : (progress?.done ?? [])));
        this.stepIndex.set(progress && !progress.finished ? Math.min(progress.step, tutorial.steps.length - 1) : 0);
        this.progress.active = id;
        this.save();
        this.findMissingFixtures(tutorial);
        this.watchStep();
      },
      error: () => this.error.set(`The tutorial ${id} couldn't be loaded.`),
    });
  }

  /** Back to the list of tutorials; the progress of this one is kept. */
  leave(): void {
    this.stopWatching();
    this.tutorial.set(undefined);
    this.missingFixtures.set([]);
    this.progress.active = undefined;
    this.save();
  }

  go(index: number): void {
    const tutorial = this.tutorial();
    if (!tutorial || index < 0 || index >= tutorial.steps.length) {
      return;
    }
    this.stepIndex.set(index);
    this.save();
    this.watchStep();
  }

  /** The next step; a step without a check counts as done once the user moves on from it. */
  next(): void {
    if (!this.step()?.check) {
      this.markDone(this.stepIndex());
    }
    if (this.isLast()) {
      this.finish();
    } else {
      this.go(this.stepIndex() + 1);
    }
  }

  previous(): void {
    this.go(this.stepIndex() - 1);
  }

  restart(): void {
    this.done.set(new Set());
    this.go(0);
  }

  /**
   * The written tutorials link to each other's wiki pages. A link to a tutorial the panel has opens it here instead,
   * after finishing this one when the link is on its last step, such as "Next, build your own Flow in Tutorial 1".
   * Returns whether the link was a tutorial's.
   */
  follow(href: string): boolean {
    const page = WIKI_PAGE.exec(href)?.[1];
    const linked = page ? this.summaries().find(summary => summary.wiki === page) : undefined;
    if (!linked) {
      return false;
    }
    if (this.tutorial() && this.isLast()) {
      this.next();
    }
    this.start(linked.id);
    return true;
  }

  /** Imports a Flow the tutorial starts from, from the DIL file next to it. */
  addFixture(name: string): void {
    const tutorial = this.tutorial();
    const file = tutorial?.fixtures[name];
    if (!tutorial || !file) {
      return;
    }
    this.addingFixture.set(name);
    this.http
      .get(`${TUTORIALS_URL}${tutorial.id}/${file}`, { responseType: 'text', context: QUIET })
      .pipe(switchMap(dil => this.importService.importFlow(dil, 'replace')))
      .subscribe({
        next: result => {
          this.addingFixture.set(undefined);
          this.missingFixtures.update(names => names.filter(missing => missing !== name));
          this.alertService.addAlert({ type: 'success', message: `Added the Flow ${result.name}` });
          this.eventManager.broadcast(new EventWithContent('flowListModification', 'imported'));
          this.watchStep();
        },
        error: () => {
          this.addingFixture.set(undefined);
          this.error.set(`${name} couldn't be added. Import ${file} on Flows → Manage instead.`);
        },
      });
  }

  isFinished(id: string): boolean {
    return this.progress.tutorials[id]?.finished === true;
  }

  isStarted(id: string): boolean {
    const progress = this.progress.tutorials[id];
    return !!progress && !progress.finished && (progress.step > 0 || progress.done.length > 0);
  }

  /** Stops asking the Gateway, for when the panel closes. */
  stopWatching(): void {
    this.watching?.unsubscribe();
    this.watching = undefined;
    this.checking.set(false);
  }

  private finish(): void {
    const id = this.tutorial()?.id;
    if (id) {
      this.progress.tutorials[id] = { step: 0, done: [], finished: true };
    }
    this.leave();
  }

  /** Asks the Gateway every few seconds whether the user did what the open step asks, until they did. */
  private watchStep(): void {
    this.stopWatching();
    const index = this.stepIndex();
    const check = this.step()?.check;
    if (!check || this.done().has(index)) {
      return;
    }
    this.checking.set(true);
    this.watching = this.checks
      .baseline(check)
      .pipe(
        switchMap(baseline =>
          timer(0, CHECK_INTERVAL).pipe(
            switchMap(() => this.checks.passes(check, baseline)),
            filter(Boolean),
            take(1),
          ),
        ),
      )
      .subscribe(() => {
        this.checking.set(false);
        this.markDone(index);
      });
  }

  private markDone(index: number): void {
    this.done.update(done => new Set(done).add(index));
    this.save();
  }

  private findMissingFixtures(tutorial: Tutorial): void {
    const names = Object.keys(tutorial.fixtures);
    const present = names.length ? forkJoin(names.map(name => this.checks.passes(`flowExists:${name}`))) : of([]);
    present.pipe(map(found => names.filter((_, i) => !found[i]))).subscribe(missing => this.missingFixtures.set(missing));
  }

  private save(): void {
    const id = this.tutorial()?.id;
    if (id) {
      this.progress.tutorials[id] = { step: this.stepIndex(), done: [...this.done()] };
    }
    try {
      localStorage.setItem(TutorialService.STORAGE_KEY, JSON.stringify(this.progress));
    } catch {
      // storage can be blocked; progress then lasts until the page reloads
    }
  }

  private readProgress(): StoredProgress {
    try {
      const stored = JSON.parse(localStorage.getItem(TutorialService.STORAGE_KEY) ?? 'null') as StoredProgress | null;
      return stored?.tutorials ? stored : { tutorials: {} };
    } catch {
      return { tutorials: {} };
    }
  }
}
