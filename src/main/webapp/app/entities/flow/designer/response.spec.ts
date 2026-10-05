import { responseOptions, responseSettings } from './response';

describe('Response settings', () => {
  it('reads the status, the body with its language, and the headers', () => {
    expect(responseSettings({ uri: '${body}', options: 'status=201&language=simple&header.X-Trace=a%26b%3Dc' })).toEqual({
      status: '201',
      body: '${body}',
      language: 'simple',
      headers: [{ name: 'X-Trace', value: 'a&b=c' }],
    });
  });

  it('answers 200 and keeps the current body when nothing is set', () => {
    expect(responseSettings({ uri: undefined, options: undefined })).toEqual({ status: '200', body: undefined, language: undefined, headers: [] });
  });

  it('writes the settings back as the Step keeps them: the body in its uri, the rest in its options', () => {
    const settings = { status: '404', body: '{"error":"not found"}', language: 'constant', headers: [{ name: 'X-A', value: 'a b' }, { name: '', value: 'x' }] };

    expect(responseOptions(settings)).toEqual({ uri: '{"error":"not found"}', options: 'status=404&language=constant&header.X-A=a%20b' });
    expect(responseSettings(responseOptions(settings))).toEqual({ ...settings, headers: [{ name: 'X-A', value: 'a b' }] });
  });

  it('leaves the language out when the body is kept', () => {
    expect(responseOptions({ status: '204', body: '', language: 'simple', headers: [] })).toEqual({ uri: undefined, options: 'status=204' });
  });
});
