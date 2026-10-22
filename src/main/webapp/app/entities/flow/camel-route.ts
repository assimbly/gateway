/**
 * The Camel route the runtime built for a Flow, as Camel's own XML DSL, for whoever wants to see or reuse what a Visual
 * Flow does in Camel terms.
 */

/** Option and attribute names whose values are secret, as Camel names them in endpoint URIs. */
const SECRET = '(?:password|passphrase|secret|secretKey|accessKey|apiKey|token|accessToken|clientSecret)';

/** The route with the values of secrets replaced by ******, as the runtime puts them in with their placeholders resolved. */
export function maskSecrets(xml: string): string {
  return xml
    .replace(new RegExp(`([?&;]${SECRET}=)(?:RAW\\([^)]*\\)|[^&"'<\\s]+)`, 'gi'), '$1******')
    .replace(new RegExp(`(\\b${SECRET}=")[^"]*"`, 'gi'), '$1******"');
}

/** The runtime's answer for a Flow that isn't loaded, which has no routes to show. */
export function hasRoute(answer: string | null | undefined): answer is string {
  const text = answer?.trim() ?? '';
  return text.length > 0 && text !== '0' && text.includes('<route');
}

/** A file name for the route of a Flow, such as `TestFlow-route.xml`. */
export function routeFileName(flowName: string | null | undefined): string {
  const name = (flowName ?? '').trim().replace(/[^\w.-]+/g, '-') || 'flow';
  return `${name}-route.xml`;
}
