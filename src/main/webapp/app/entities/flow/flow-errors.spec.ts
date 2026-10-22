import { explainError } from './flow-errors';

describe('Flow errors in plain words', () => {
  it('explains two Flows reading from the same endpoint', () => {
    const explanation = explainError(
      'Failed to start route because of Multiple consumers for the same endpoint is not allowed: file://C:/messages/in',
    );

    expect(explanation?.meaning).toBe('Another running Flow already reads from this endpoint, and only one Flow at a time can.');
    expect(explanation?.fix).toContain('Stop the other Flow');
  });

  it('explains a file that could not be written', () => {
    expect(explainError('GenericFileOperationFailedException: Cannot store file: C:\\messages\\out2\\test.txt')?.meaning).toBe(
      "The Gateway can't write the file there.",
    );
  });

  it('explains a server that did not answer, and one whose certificate is not trusted', () => {
    expect(explainError('Connect to http://www.dneonline.com:80 [www.dneonline.com/1.2.3.4] failed: Connection timed out')?.meaning).toBe(
      'Nothing answered at this address.',
    );
    expect(explainError('SSLHandshakeException: PKIX path building failed: unable to find valid certification path')?.fix).toContain(
      'Administration → Certificates',
    );
  });

  it('says what an HTTP status means', () => {
    expect(explainError('HttpOperationFailedException: HTTP operation failed invoking https://x/y with statusCode: 404')).toEqual({
      meaning: 'The server answered with HTTP status 404.',
      fix: 'The address has no such page or resource: check the path.',
    });
    expect(explainError('HTTP operation failed invoking https://x with statusCode: 503')?.fix).toContain('try again later');
  });

  it('names the missing placeholder and the unknown Component', () => {
    expect(explainError('Property with key [messages] not found in properties from text: {{messages}}/in')?.meaning).toBe(
      'The Flow refers to messages, which has no value.',
    );
    expect(explainError('Failed to resolve endpoint: foo://bar due to: No component found with scheme: foo')?.meaning).toBe(
      'This Gateway has no foo Component.',
    );
  });

  it('leaves an error it does not know alone', () => {
    expect(explainError('Something unusual happened')).toBeNull();
    expect(explainError(undefined)).toBeNull();
  });
});
