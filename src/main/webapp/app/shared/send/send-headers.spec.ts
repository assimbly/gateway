import { emptyHeader, headersToJson, headersToTemplateJson, recordToHeaders, sameHeaders, templateHeadersToRows } from './send-headers';

describe('send-headers', () => {
  const rows = [
    { key: 'a', value: '1' },
    { key: '  ', value: 'ignored' },
    { key: 'b', value: 'two', type: 'property' },
  ];

  it('serializes the filled in rows to plain JSON', () => {
    expect(headersToJson(rows)).toEqual({ a: '1', b: 'two' });
  });

  it('serializes to the same shape as a stored template: key -> type(value)', () => {
    expect(headersToTemplateJson(rows)).toEqual({ a: 'header(1)', b: 'property(two)' });
  });

  it('converts objects and templates to rows', () => {
    expect(recordToHeaders({ a: 1, b: null }).map(h => [h.key, h.value])).toEqual([
      ['a', '1'],
      ['b', ''],
    ]);
    expect(templateHeadersToRows([{ key: 'k', value: 'v', type: 'property', language: 'simple' }])).toEqual([
      { key: 'k', value: 'v', type: 'property', language: 'simple' },
    ]);
  });

  it('knows when rows differ from a template, ignoring empty rows', () => {
    const template = templateHeadersToRows([{ key: 'k', value: 'v' }]);

    expect(sameHeaders(template, [...template, emptyHeader()])).toBe(true);
    expect(sameHeaders(template, [{ ...template[0], value: 'changed' }])).toBe(false);
    expect(sameHeaders(template, [{ ...template[0], type: 'property' }])).toBe(false);
    expect(sameHeaders(template, [])).toBe(false);
  });
});
