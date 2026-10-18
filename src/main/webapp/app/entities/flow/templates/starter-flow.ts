import { FlowTemplate } from './flow-templates';

/**
 * What every new Flow starts from: a once Source that sends one message when the Flow starts, so a new Flow runs as
 * created, does something visible with real data, and never keeps firing. Restarting the Flow sends it again.
 */
export const STARTER_SOURCE = { componentType: 'once', uri: 'hello', options: 'body=Hello world' } as const;

/** A new Visual Flow: the starter Source, logged with its body. Not an Example Flow, so it has no card. */
export const STARTER_FLOW: FlowTemplate = {
  id: 'starter',
  title: '',
  description: 'Logs Hello world once when the Flow starts.',
  steps: [
    { key: 'starter-source', kind: 'SOURCE', ...STARTER_SOURCE },
    { key: 'starter-sink', kind: 'SINK', componentType: 'log', uri: 'hello', options: 'showBody=true' },
  ],
  links: [{ from: 'starter-source', to: 'starter-sink', transport: 'sync' }],
};

/** A new Camel route, the same starter in XML. One option only: the export escapes `&` in route content itself. */
export const STARTER_ROUTE = [
  '<route>',
  `  <from uri="${STARTER_SOURCE.componentType}:${STARTER_SOURCE.uri}?${STARTER_SOURCE.options}"/>`,
  '  <log message="${body}"/>',
  '</route>',
].join('\n');
