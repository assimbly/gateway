import { StepType } from 'app/shared/model/step.model';

import {
  SCRIPT_LANGUAGES,
  SCRIPT_STARTER_SOURCE,
  defaultResultLogStep,
  isStarterScript,
  nextSchedulerName,
  scriptFlowSummary,
  scriptHint,
  scriptTrialError,
  scriptTrialRequest,
  scriptTrialResult,
  starterScript,
} from './script-flow';

describe('Script Flow', () => {
  it('offers the languages by name, in alphabetical order', () => {
    expect(SCRIPT_LANGUAGES.map(language => language.label)).toEqual([
      'DataSonnet',
      'Groovy',
      'Jactl',
      'JavaScript',
      'JSLT',
      'Python',
      'Simple',
      'XSLT',
    ]);
  });

  it('starts every language with an example and a hint', () => {
    SCRIPT_LANGUAGES.forEach(language => {
      expect(starterScript(language.value)).not.toBe('');
      expect(scriptHint(language.value)).not.toBe('');
    });
  });

  it('has no starter for an unknown language', () => {
    expect(starterScript('cobol')).toBe('');
    expect(starterScript(undefined)).toBe('');
  });

  it('lets another language replace an empty script or a starter', () => {
    expect(isStarterScript('')).toBe(true);
    expect(isStarterScript(null)).toBe(true);
    expect(isStarterScript(starterScript('python'))).toBe(true);
  });

  it('keeps a script the user wrote', () => {
    expect(isStarterScript('println body')).toBe(false);
  });

  it('logs the result with its body, to a path that follows the Flow', () => {
    expect(defaultResultLogStep()).toMatchObject({
      stepType: StepType.SINK,
      componentType: 'log',
      uri: '',
      options: 'showBody=true',
    });
  });

  describe('nextSchedulerName', () => {
    const scheduler = (uri: string) => ({ stepType: StepType.SOURCE, componentType: 'scheduler', uri });

    it('starts at scheduler1', () => {
      expect(nextSchedulerName([])).toBe('scheduler1');
      expect(nextSchedulerName(undefined)).toBe('scheduler1');
    });

    it('skips the names other schedulers use', () => {
      expect(nextSchedulerName([scheduler('scheduler1'), scheduler('Scheduler2')])).toBe('scheduler3');
    });

    it('fills a gap', () => {
      expect(nextSchedulerName([scheduler('scheduler1'), scheduler('scheduler3')])).toBe('scheduler2');
    });

    it('ignores Steps that are no scheduler Source', () => {
      expect(
        nextSchedulerName([
          { stepType: StepType.SOURCE, componentType: 'timer', uri: 'scheduler1' },
          { stepType: StepType.ACTION, componentType: 'scheduler', uri: 'scheduler1' },
        ]),
      ).toBe('scheduler1');
    });
  });

  describe('scriptFlowSummary', () => {
    const scheduler = (options: string) => ({ stepType: StepType.SOURCE, componentType: 'scheduler', uri: 'scheduler1', options });
    const script = { stepType: StepType.SCRIPT, componentType: 'groovy', uri: "'Hello'" };
    const log = (stepType: StepType) => ({ stepType, componentType: 'log', uri: '', options: 'showBody=true' });

    it('says how often the scheduler fires, where the result goes and what happens to errors', () => {
      expect(scriptFlowSummary([scheduler('delay=60000'), script, log(StepType.SINK), log(StepType.ERROR)])).toEqual({
        source: { index: 0, text: 'scheduler1, every minute' },
        result: { index: 2, text: 'Log viewer' },
        errors: { index: 3, text: 'logged' },
      });
    });

    it('reads the delay among other options', () => {
      expect(scriptFlowSummary([scheduler('initialDelay=0&delay=5000')]).source?.text).toBe('scheduler1, every 5 seconds');
      expect(scriptFlowSummary([scheduler('delay=7200000')]).source?.text).toBe('scheduler1, every 2 hours');
      expect(scriptFlowSummary([scheduler('delay=1500')]).source?.text).toBe('scheduler1, every 1500 ms');
    });

    it('says a once Source fires once, whatever its delay', () => {
      const once = { stepType: StepType.SOURCE, ...SCRIPT_STARTER_SOURCE };
      expect(scriptFlowSummary([once]).source?.text).toBe('hello, once when started');
      expect(scriptFlowSummary([{ ...once, options: 'body=world&delay=60000' }]).source?.text).toBe('hello, once when started');
    });

    it('names only the scheduler without a delay', () => {
      expect(scriptFlowSummary([scheduler('')]).source?.text).toBe('scheduler1');
      expect(scriptFlowSummary([scheduler('delay=soon')]).source?.text).toBe('scheduler1');
    });

    it('has no result without a Sink', () => {
      expect(scriptFlowSummary([scheduler('delay=60000'), script]).result).toBeUndefined();
    });

    it('names the component of a Sink or Error handler that does not log', () => {
      const summary = scriptFlowSummary([
        script,
        { stepType: StepType.SINK, componentType: 'file', uri: 'out' },
        { stepType: StepType.ERROR, componentType: '' },
      ]);
      expect(summary.result).toEqual({ index: 1, text: 'file' });
      expect(summary.errors).toEqual({ index: 2, text: 'not chosen' });
    });
  });

  describe('trying a script', () => {
    it('sends no body for an empty sample, as a scheduler does', () => {
      expect(scriptTrialRequest('groovy', "'Hello'", '')).toEqual({
        exchange: { headers: {}, properties: {}, body: null },
        script: { language: 'groovy', script: "'Hello'" },
      });
    });

    it('sends the sample body as it is typed', () => {
      expect(scriptTrialRequest('jslt', '.name', ' {"name":"World"} ')).toMatchObject({ exchange: { body: ' {"name":"World"} ' } });
    });

    it('shows the new body of a script that ran', () => {
      expect(scriptTrialResult('{"exchange":{"body":"Hello world"},"result":"Hello world","code":1}')).toEqual({
        ok: true,
        body: 'Hello world',
      });
      expect(scriptTrialResult('{"exchange":{},"result":null,"code":1}')).toEqual({ ok: true, body: null });
    });

    it('does not take an unreadable answer for a result', () => {
      expect(scriptTrialResult('')).toEqual({ ok: false, error: 'The runtime gave no result.' });
      expect(scriptTrialResult('<html>')).toEqual({ ok: false, error: 'The runtime gave no result.' });
    });

    it("shows a broken script's error from the runtime", () => {
      expect(scriptTrialError({ status: 400, error: '{"message":"ReferenceError: foo is not defined"}' })).toEqual({
        ok: false,
        error: 'ReferenceError: foo is not defined',
      });
      expect(scriptTrialError({ status: 400, error: 'Unsupported scripting language' })).toEqual({
        ok: false,
        error: 'Unsupported scripting language',
      });
      expect(scriptTrialError({ status: 400, error: '' })).toEqual({ ok: false, error: 'The script failed without a message.' });
    });

    it('tells a runtime that cannot be reached from a broken script', () => {
      expect(scriptTrialError({ status: 0 })).toEqual({ ok: false, error: "The runtime can't be reached." });
      expect(scriptTrialError({ status: 401 })).toEqual({ ok: false, error: 'Sign in again to try the script.' });
      expect(scriptTrialError({ status: 500, statusText: 'Server Error' })).toEqual({
        ok: false,
        error: "The runtime couldn't run the script (500 Server Error).",
      });
    });
  });
});
