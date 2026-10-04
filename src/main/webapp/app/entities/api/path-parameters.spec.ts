import { IApiParameter } from './api.model';
import { pathParameterNames, withPathParameters } from './path-parameters';

describe('Path parameters', () => {
  it('reads the parameters of a path template in order', () => {
    expect(pathParameterNames('/customers/{customerId}/orders/{orderId}')).toEqual(['customerId', 'orderId']);
    expect(pathParameterNames('/customers')).toEqual([]);
  });

  it('follows the path template: added and required, removed with it, keeping their type and description', () => {
    const given: IApiParameter[] = [
      { name: 'id', in: 'path', type: 'integer', required: false, description: 'The customer' },
      { name: 'stale', in: 'path', type: 'string', required: true },
      { name: 'limit', in: 'query', type: 'integer', required: false },
    ];

    expect(withPathParameters('/{id}/orders/{orderId}', given)).toEqual([
      { name: 'id', in: 'path', type: 'integer', required: true, description: 'The customer' },
      { name: 'orderId', in: 'path', type: 'string', required: true, description: undefined },
      { name: 'limit', in: 'query', type: 'integer', required: false },
    ]);
  });
});
