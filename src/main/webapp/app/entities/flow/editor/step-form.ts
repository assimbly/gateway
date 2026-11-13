import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { IRoute } from 'app/shared/model/route.model';
import { IStep, Step, StepType } from 'app/shared/model/step.model';

import { DEFAULT_RESULT_LOG, DEFAULT_SCRIPT_LANGUAGE } from './script-flow';

/** An Option of a Step: one key=value of its options. */
export class Option {
  constructor(
    public key?: string,
    public value?: string,
  ) {}
}

/** The form of one Option; the default value is only shown, never saved. */
export function optionForm(key: string | null = null, value: string | null = null): FormGroup {
  return new FormGroup({
    key: new FormControl(key),
    value: new FormControl(value),
    defaultValue: new FormControl(''),
  });
}

/** The form of a Step, with one empty Option row; a Route Step also edits the name and content of its Route. */
export function stepForm(step: IStep, route?: IRoute): FormGroup {
  return new FormGroup({
    id: new FormControl(step.id),
    componentType: new FormControl(step.componentType),
    stepType: new FormControl(step.stepType),
    uri: new FormControl(step.uri),
    options: new FormArray([optionForm()]),
    message: new FormControl(step.messageId),
    route: new FormControl(step.routeId),
    routeName: new FormControl(route?.name ?? ''),
    routeContent: new FormControl(route?.content ?? ''),
    connection: new FormControl(step.connectionId),
    links: new FormControl(step.links),
  });
}

/** The Step that Add puts in this editor: a Log Action in a Flow, a Script (or the result's Sink) in a Script Flow, a Route in a Route Flow. */
export function newStepFor(editor: string, stepType?: StepType): Step {
  const step = new Step();
  if (editor === 'flow') {
    step.stepType = StepType.ACTION;
    step.componentType = 'log';
  } else if (editor === 'script' && stepType === StepType.SINK) {
    step.stepType = StepType.SINK;
    step.componentType = DEFAULT_RESULT_LOG.componentType;
  } else if (editor === 'script') {
    step.stepType = StepType.SCRIPT;
    step.componentType = DEFAULT_SCRIPT_LANGUAGE;
  } else if (editor === 'route') {
    step.stepType = StepType.ROUTE;
    step.componentType = '';
  }
  return step;
}

/**
 * The Options in a Step's options string (`key=value&key=value`). A value may hold `&` and `=`: only an `&` followed by
 * a key and `=` starts the next Option. A part without `=` gives an Option without key and value.
 */
export function parseOptions(options: string): Option[] {
  const parts = options.includes('&') ? options.split(/&(?=[^=&]+=)/) : [options];
  return parts.map(part => {
    if (!part.includes('=')) {
      return new Option(null!, null!);
    }
    const [key, ...value] = part.split('=');
    return new Option(key, value.join('='));
  });
}
