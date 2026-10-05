import { exampleFromSchema, schemaFromExample, schemaFromExampleText } from './schema-from-example';

describe('Schema from an example', () => {
  it('describes an object with a type per property, every present key required', () => {
    expect(schemaFromExample({ id: 7, price: 9.5, name: 'Ann', active: true, note: null })).toEqual({
      type: 'object',
      required: ['id', 'price', 'name', 'active', 'note'],
      properties: {
        id: { type: 'integer' },
        price: { type: 'number' },
        name: { type: 'string' },
        active: { type: 'boolean' },
        note: { nullable: true },
      },
    });
  });

  it('describes an array by its first element', () => {
    expect(schemaFromExample([{ id: 1 }, { other: 'ignored' }])).toEqual({
      type: 'array',
      items: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } },
    });
    expect(schemaFromExample([])).toEqual({ type: 'array', items: {} });
  });

  it('nests objects and arrays', () => {
    expect(schemaFromExample({ tags: ['a'], owner: { email: 'x@y' } })).toEqual({
      type: 'object',
      required: ['tags', 'owner'],
      properties: {
        tags: { type: 'array', items: { type: 'string' } },
        owner: { type: 'object', required: ['email'], properties: { email: { type: 'string' } } },
      },
    });
  });

  it('says when the example is not JSON', () => {
    expect(schemaFromExampleText('{"a": 1}')).toEqual({ schema: JSON.stringify({ type: 'object', required: ['a'], properties: { a: { type: 'integer' } } }, null, 2) });
    expect(schemaFromExampleText('{a: 1')).toEqual({ error: expect.stringContaining("isn't valid JSON") });
  });

  it('makes an example body from a schema, preferring the example it has', () => {
    const schema = {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', example: 'Ann' },
        tags: { type: 'array', items: { type: 'string', enum: ['vip'] } },
        note: { type: ['string', 'null'] },
      },
    };

    expect(exampleFromSchema(schema)).toEqual({ id: 0, name: 'Ann', tags: ['vip'], note: 'string' });
    expect(exampleFromSchema({ type: 'object', example: { a: 1 } })).toEqual({ a: 1 });
    expect(exampleFromSchema(undefined)).toBeNull();
  });
});
