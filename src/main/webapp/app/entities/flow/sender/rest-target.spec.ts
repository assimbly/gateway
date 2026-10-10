import { restHostOf, restTargetOf } from './rest-target';

describe('restTargetOf', () => {
  it('puts the method and path of an Operation Source in the path, as rest:method:path', () => {
    expect(restTargetOf(null, 'method=get&path=/invoice&exchangePattern=InOut')).toEqual({ uri: 'get:invoice', options: '' });
  });

  it('keeps the other Options and adds the optional uriTemplate', () => {
    expect(restTargetOf('', 'method=POST&path=/api/v1/invoice&uriTemplate={id}&consumes=application/json')).toEqual({
      uri: 'post:api/v1/invoice:{id}',
      options: 'consumes=application/json',
    });
  });

  it('leaves a rest Source that has a path of its own as it is', () => {
    expect(restTargetOf('get:invoice', 'method=get&path=/invoice')).toBeUndefined();
  });

  it('leaves a rest Source without a method or path as it is', () => {
    expect(restTargetOf(null, 'path=/invoice')).toBeUndefined();
    expect(restTargetOf(null, 'method=get')).toBeUndefined();
    expect(restTargetOf(null, null)).toBeUndefined();
  });
});

describe('restHostOf', () => {
  it('is the URL of the REST listener', () => {
    expect(restHostOf('http://localhost:8081/')).toBe('http://localhost:8081');
    expect(restHostOf('')).toBeUndefined();
    expect(restHostOf(undefined)).toBeUndefined();
  });
});
