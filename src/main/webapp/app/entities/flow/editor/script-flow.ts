import { IStep, Step, StepType } from 'app/shared/model/step.model';

import { STARTER_SOURCE } from '../templates/starter-flow';

/** A language a Script Step can be written in, with a small working example and how a script reads the message. */
export interface ScriptLanguageInfo {
  /** The Step's componentType, as the runtime knows it. */
  readonly value: string;
  readonly label: string;
  /** A first script for a new Script Step. Except for JSLT and XSLT, it also runs on a plain-text body or none. */
  readonly starter: string;
  readonly hint: string;
}

const BODY_AND_HEADERS = 'The result becomes the new message body. Read the message with body and headers.';

/** The languages the Script editor offers, by name. */
export const SCRIPT_LANGUAGES: readonly ScriptLanguageInfo[] = [
  {
    value: 'datasonnet',
    label: 'DataSonnet',
    starter: '{\n  message: "Hello world"\n}',
    hint: "The result becomes the new message body. Read the body with payload and a header with cml.header('name').",
  },
  // A plain String: a "${...}" GString would end up in the body as a GStringImpl.
  { value: 'groovy', label: 'Groovy', starter: "'Hello ' + (body ?: 'world')", hint: BODY_AND_HEADERS },
  { value: 'jactl', label: 'Jactl', starter: `"Hello \${body ?: 'world'}"`, hint: BODY_AND_HEADERS },
  { value: 'javascript', label: 'JavaScript', starter: "'Hello ' + (body || 'world')", hint: BODY_AND_HEADERS },
  {
    value: 'jslt',
    label: 'JSLT',
    starter: '{\n  "message": "Hello world"\n}',
    hint:
      'Transforms the JSON body into the result: . is the incoming JSON and .name one of its fields. Give the Source a JSON body, or put a script before it that makes one.',
  },
  { value: 'python', label: 'Python', starter: `f"Hello {body or 'world'}"`, hint: BODY_AND_HEADERS },
  {
    value: 'simple',
    label: 'Simple',
    starter: 'Hello world at ${date:now:HH:mm:ss}',
    hint: 'The result becomes the new message body. Read the message with ${body} and ${header.name}.',
  },
  {
    value: 'xslt',
    label: 'XSLT',
    starter: [
      '<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
      '  <xsl:template match="/">',
      '    <message>Hello world</message>',
      '  </xsl:template>',
      '</xsl:stylesheet>',
    ].join('\n'),
    hint:
      'Transforms the XML body with this stylesheet; its output becomes the new message body. Give the Source an XML body, or put a script before it that makes one.',
  },
];

export const DEFAULT_SCRIPT_LANGUAGE: string = 'groovy';

/** A new Script Flow's Source: the starter, with a body the starter script greets. */
export const SCRIPT_STARTER_SOURCE = { ...STARTER_SOURCE, options: 'body=world' } as const;

/** The Log Step after the scripts writes their result to the Log viewer; the runtime leaves the body out unless asked. */
export const DEFAULT_RESULT_LOG = { componentType: 'log', options: 'showBody=true' } as const;

/**
 * A new Log Step for a Script Flow's result. Like a logging Error Handler, its path follows the Flow when it is saved;
 * the runtime logs it as `org.assimbly.runtime.<FlowID>` whatever the path.
 */
export function defaultResultLogStep(): Step {
  const step = new Step();
  step.stepType = StepType.SINK;
  step.componentType = DEFAULT_RESULT_LOG.componentType;
  step.uri = '';
  step.options = DEFAULT_RESULT_LOG.options;
  return step;
}

function languageOf(language: string | null | undefined): ScriptLanguageInfo | undefined {
  const value = (language ?? '').toLowerCase();
  return SCRIPT_LANGUAGES.find(info => info.value === value);
}

/** The example a new Script Step in this language starts with; empty for an unknown language. */
export function starterScript(language: string | null | undefined): string {
  return languageOf(language)?.starter ?? '';
}

/** How a script in this language reads the message and what becomes of its result. */
export function scriptHint(language: string | null | undefined): string {
  return languageOf(language)?.hint ?? '';
}

/** Whether a script is still empty or one of the starters, so choosing another language may replace it. */
export function isStarterScript(script: string | null | undefined): boolean {
  const text = (script ?? '').trim();
  return text === '' || SCRIPT_LANGUAGES.some(info => info.starter === text);
}

/** What running a script once on a sample message gave: the new body, or the error the runtime reported. */
export interface ScriptTrial {
  readonly ok: boolean;
  /** The new body, when the script ran; null when it left none. */
  readonly body?: string | null;
  /** What went wrong, when it did not run. */
  readonly error?: string;
}

/** The runtime's request to run a script once. An empty sample body sends none. */
export function scriptTrialRequest(language: string, script: string, sampleBody: string): unknown {
  return {
    exchange: { headers: {}, properties: {}, body: sampleBody === '' ? null : sampleBody },
    script: { language, script },
  };
}

/** The runtime answers a script that ran with its exchange and the new body as `result`. */
export function scriptTrialResult(response: string | null): ScriptTrial {
  const answer = parseJson(response) as { result?: string | null } | null;
  return answer && typeof answer === 'object'
    ? { ok: true, body: answer.result ?? null }
    : { ok: false, error: 'The runtime gave no result.' };
}

/** The runtime answers a broken script with 400 and `{ message }`; anything else is about reaching it. */
export function scriptTrialError(error: { status: number; statusText?: string; error?: unknown }): ScriptTrial {
  if (error.status === 400) {
    const answer = parseJson(typeof error.error === 'string' ? error.error : null) as { message?: string } | null;
    const message = answer?.message ?? (typeof error.error === 'string' ? error.error : '');
    return { ok: false, error: message.trim() || 'The script failed without a message.' };
  }
  if (error.status === 0) {
    return { ok: false, error: "The runtime can't be reached." };
  }
  if (error.status === 401 || error.status === 403) {
    return { ok: false, error: 'Sign in again to try the script.' };
  }
  return { ok: false, error: `The runtime couldn't run the script (${error.status}${error.statusText ? ' ' + error.statusText : ''}).` };
}

function parseJson(text: string | null): unknown {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/** The first of scheduler1, scheduler2, … that no scheduler Source among the Steps is named. */
export function nextSchedulerName(steps: readonly IStep[] | null | undefined): string {
  const taken = new Set(
    (steps ?? [])
      .filter(step => step.stepType === StepType.SOURCE && step.componentType?.toLowerCase() === 'scheduler')
      .map(step => (step.uri ?? '').trim().toLowerCase()),
  );
  let n = 1;
  while (taken.has(`scheduler${n}`)) {
    n++;
  }
  return `scheduler${n}`;
}

/** What a Script Flow's editor shows: only its Script Steps, or every Step. */
export type ScriptFlowView = 'script' | 'flow';

export const DEFAULT_SCRIPT_FLOW_VIEW: ScriptFlowView = 'script';

/** A Step that the Script view leaves out, in a word, and where it is among the Steps. */
export interface ScriptFlowSummaryItem {
  readonly index: number;
  readonly text: string;
}

/** What starts a Script Flow, where its result goes and what happens to a failing message; a Flow without a Sink has no result. */
export interface ScriptFlowSummary {
  readonly source?: ScriptFlowSummaryItem;
  readonly result?: ScriptFlowSummaryItem;
  readonly errors?: ScriptFlowSummaryItem;
}

/** Summarises the Steps of a Script Flow, as the user has them in the editor (`options` as `key=value&key=value`). */
export function scriptFlowSummary(steps: readonly IStep[]): ScriptFlowSummary {
  const item = (type: StepType, text: (step: IStep) => string): ScriptFlowSummaryItem | undefined => {
    const index = steps.findIndex(step => step.stepType === type);
    return index >= 0 ? { index, text: text(steps[index]) } : undefined;
  };
  return {
    source: item(StepType.SOURCE, sourceText),
    result: item(StepType.SINK, step => (isLog(step) ? 'Log viewer' : componentOf(step))),
    errors: item(StepType.ERROR, step => (isLog(step) ? 'logged' : componentOf(step))),
  };
}

function sourceText(step: IStep): string {
  const name = (step.uri ?? '').trim() || componentOf(step);
  if (step.componentType?.toLowerCase() === 'once') {
    return `${name}, once when started`;
  }
  const delay = Number(optionValue(step.options, 'delay'));
  if (step.componentType?.toLowerCase() !== 'scheduler' || !Number.isFinite(delay) || delay <= 0) {
    return name;
  }
  return `${name}, every ${everyText(delay)}`;
}

/** A scheduler's delay in milliseconds, as a person says it. */
function everyText(delay: number): string {
  if (delay % 3_600_000 === 0) {
    return delay === 3_600_000 ? 'hour' : `${delay / 3_600_000} hours`;
  }
  if (delay % 60_000 === 0) {
    return delay === 60_000 ? 'minute' : `${delay / 60_000} minutes`;
  }
  if (delay % 1000 === 0) {
    return delay === 1000 ? 'second' : `${delay / 1000} seconds`;
  }
  return `${delay} ms`;
}

function optionValue(options: string | null | undefined, key: string): string | undefined {
  return (options ?? '')
    .split('&')
    .map(pair => pair.split('='))
    .find(([name]) => name === key)?.[1];
}

function isLog(step: IStep): boolean {
  return step.componentType?.toLowerCase() === 'log';
}

function componentOf(step: IStep): string {
  return step.componentType || 'not chosen';
}
