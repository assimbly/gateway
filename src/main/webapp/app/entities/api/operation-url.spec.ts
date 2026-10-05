import { operationUrl } from './operation-url';

describe('operationUrl', () => {
  it('puts the runtime path on the listener', () => {
    expect(operationUrl('https://localhost:9001', '/customers/{id}')).toBe('https://localhost:9001/customers/{id}');
  });

  it('does not double the slash between them', () => {
    expect(operationUrl('https://localhost:9001/', '/_acme/customers')).toBe('https://localhost:9001/_acme/customers');
    expect(operationUrl('https://localhost:9001', 'customers')).toBe('https://localhost:9001/customers');
  });
});
