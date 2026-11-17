import { Step, StepType } from 'app/shared/model/step.model';

import { newStepFor, optionForm, parseOptions, stepForm } from './step-form';

describe('Step forms', () => {
  describe('parseOptions', () => {
    const pairs = (options: string) => parseOptions(options).map(option => [option.key, option.value]);

    it('splits key=value pairs', () => {
      expect(pairs('showBody=true&level=INFO')).toEqual([
        ['showBody', 'true'],
        ['level', 'INFO'],
      ]);
    });

    it('keeps = and & that are part of a value', () => {
      expect(pairs('query=a=1&b&timeout=5')).toEqual([
        ['query', 'a=1&b'],
        ['timeout', '5'],
      ]);
    });

    it('gives an Option without key and value for a part without =, and for no options at all', () => {
      expect(pairs('verbose')).toEqual([[null, null]]);
      expect(pairs('')).toEqual([[null, null]]);
    });
  });

  describe('newStepFor', () => {
    it('adds a Log Action to a Flow, a Route to a Route Flow', () => {
      expect([newStepFor('flow').stepType, newStepFor('flow').componentType]).toEqual([StepType.ACTION, 'log']);
      expect([newStepFor('route').stepType, newStepFor('route').componentType]).toEqual([StepType.ROUTE, '']);
    });

    it('adds a Script to a Script Flow, or the Log of its result', () => {
      expect([newStepFor('script').stepType, newStepFor('script').componentType]).toEqual([StepType.SCRIPT, 'groovy']);
      const sink = newStepFor('script', StepType.SINK);
      expect([sink.stepType, sink.componentType]).toEqual([StepType.SINK, 'log']);
    });

    it('leaves the Step empty in another editor', () => {
      expect(newStepFor('canvas').stepType).toBeUndefined();
    });
  });

  it('builds the form of a Step with one empty Option, and the name and content of its Route', () => {
    const step = Object.assign(new Step(7, StepType.ROUTE), { routeId: 3, connectionId: 2 });

    const form = stepForm(step, { id: 3, name: 'Route1', content: '<route/>' });

    expect(form.value).toEqual(
      expect.objectContaining({ id: 7, stepType: StepType.ROUTE, route: 3, routeName: 'Route1', routeContent: '<route/>', connection: 2 }),
    );
    expect(form.value.options).toEqual([{ key: null, value: null, defaultValue: '' }]);
    expect(stepForm(new Step(8, StepType.ACTION)).value.routeName).toBe('');
  });

  it('builds an Option form with a key and value', () => {
    expect(optionForm('level', 'INFO').value).toEqual({ key: 'level', value: 'INFO', defaultValue: '' });
  });
});
