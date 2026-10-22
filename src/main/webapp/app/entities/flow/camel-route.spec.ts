import { hasRoute, maskSecrets, routeFileName } from './camel-route';

describe('Camel route of a Flow', () => {
  it('hides the values of secrets in endpoint URIs and attributes', () => {
    const xml =
      '<to uri="sftp://host/in?username=me&amp;password=s3cret&amp;binary=true"/>' +
      '<to uri="https://api/x?apiKey=RAW(a&amp;b)"/>' +
      '<bean password="hunter2"/>';

    expect(maskSecrets(xml)).toBe(
      '<to uri="sftp://host/in?username=me&amp;password=******&amp;binary=true"/>' +
        '<to uri="https://api/x?apiKey=******"/>' +
        '<bean password="******"/>',
    );
  });

  it('leaves a route without secrets as it is', () => {
    const xml = '<from uri="file://C:/messages/in"/><to uri="file://C:/messages/out"/>';

    expect(maskSecrets(xml)).toBe(xml);
  });

  it("knows the runtime's answer for a Flow that isn't loaded", () => {
    expect(hasRoute('0')).toBe(false);
    expect(hasRoute('')).toBe(false);
    expect(hasRoute(null)).toBe(false);
    expect(hasRoute('<routes xmlns="http://camel.apache.org/schema/spring"><route id="1-2"/></routes>')).toBe(true);
  });

  it('names the file after the Flow', () => {
    expect(routeFileName('TestFlow')).toBe('TestFlow-route.xml');
    expect(routeFileName('My Flow / v2')).toBe('My-Flow-v2-route.xml');
    expect(routeFileName('')).toBe('flow-route.xml');
  });
});
