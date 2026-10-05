import { isRouteStep, missingRouteFields, routeToSave } from './route-step';

describe('Route Step', () => {
  it('is a Route, or the Error handler of a Route Flow', () => {
    expect(isRouteStep('ROUTE', 'route')).toBe(true);
    expect(isRouteStep('ERROR', 'route')).toBe(true);
    expect(isRouteStep('ERROR', 'flow')).toBe(false);
    expect(isRouteStep('SOURCE', 'flow')).toBe(false);
  });

  it('needs a name and a Route', () => {
    expect(missingRouteFields('ROUTE', { name: ' ', content: '' })).toEqual({ name: true, content: true });
    expect(missingRouteFields('ROUTE', { name: 'Orders', content: '<route/>' })).toEqual({ name: false, content: false });
  });

  it('leaves the Error handler optional until it has a name or a Route', () => {
    expect(missingRouteFields('ERROR', { name: '', content: '' })).toEqual({ name: false, content: false });
    expect(missingRouteFields('ERROR', { name: '', content: '<route/>' })).toEqual({ name: true, content: false });
  });

  it('saves a new Route with the name as typed', () => {
    expect(routeToSave({ name: ' Orders ', content: '<route/>' }, undefined)).toEqual({ id: undefined, name: 'Orders', type: 'xml', content: '<route/>' });
  });

  it('saves the Route again only when its name or content changed', () => {
    const saved = { id: 4, name: 'Orders', type: 'xml', content: '<route/>' };

    expect(routeToSave({ name: 'Orders', content: '<route/>' }, saved)).toBeNull();
    expect(routeToSave({ name: 'Orders', content: '<route id="a"/>' }, saved)).toEqual({ ...saved, content: '<route id="a"/>' });
  });

  it('saves nothing for a Step without a name or a Route', () => {
    expect(routeToSave({ name: '', content: ' ' }, undefined)).toBeNull();
  });
});
