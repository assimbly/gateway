/** Reads a file as text. */
export function readText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/** Text as HTML, for an alert: alerts are shown as HTML, so a name or a warning that mentions `<route>` would vanish. */
export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** The name of a file without its extension: `export_orders.xml` is `export_orders`. */
export function baseName(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return (dot > 0 ? fileName.slice(0, dot) : fileName).trim();
}

/** The languages the Script editor offers. */
export const SCRIPT_LANGUAGES = ['groovy', 'javascript', 'simple', 'jslt', 'xslt'] as const;

export type ScriptLanguage = (typeof SCRIPT_LANGUAGES)[number];

const LANGUAGE_BY_EXTENSION: Readonly<Record<string, ScriptLanguage>> = {
  groovy: 'groovy',
  gvy: 'groovy',
  js: 'javascript',
  mjs: 'javascript',
  jslt: 'jslt',
  xsl: 'xslt',
  xslt: 'xslt',
};

/** The script language a file name suggests, from its extension; undefined when it doesn't suggest one. */
export function languageOfFile(fileName: string): ScriptLanguage | undefined {
  const dot = fileName.lastIndexOf('.');
  return dot < 0 ? undefined : LANGUAGE_BY_EXTENSION[fileName.slice(dot + 1).toLowerCase()];
}

/** Whether a text is meant as JSON (an object or an array), as opposed to XML. */
export function isJson(text: string): boolean {
  return /^\s*[{[]/.test(text);
}

/** The single Flow in a Flow export (XML or JSON), or why the file isn't one. */
export function flowInExport(text: string): { id: string; name: string } | string {
  return isJson(text) ? flowInJsonExport(text) : flowInXmlExport(text);
}

/** The Flows of a JSON export: the `flow` of every `flows`, one object or an array of them, as the XML is converted. */
function flowInJsonExport(json: string): { id: string; name: string } | string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return "isn't valid JSON. Choose a file made with a Flow's Export.";
  }

  const flows: unknown[] = [];
  collectFlows(parsed, flows);
  if (flows.length > 1) {
    return `contains ${flows.length} Flows. Import it as a Gateway backup instead.`;
  }
  const flow = flows.length === 1 ? (flows[0] as Record<string, unknown>) : undefined;
  const id = scalarText(flow?.['id']);
  const name = scalarText(flow?.['name']);
  if (!id || !name) {
    return "doesn't contain a Flow. Choose a file made with a Flow's Export.";
  }
  return { id, name };
}

function collectFlows(node: unknown, flows: unknown[]): void {
  if (Array.isArray(node)) {
    node.forEach(item => collectFlows(item, flows));
  } else if (node !== null && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'flows' && value !== null && typeof value === 'object' && 'flow' in value) {
        flows.push(...[(value as { flow: unknown }).flow].flat().filter(flow => flow !== null && typeof flow === 'object'));
      } else {
        collectFlows(value, flows);
      }
    }
  }
}

function scalarText(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function flowInXmlExport(xml: string): { id: string; name: string } | string {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length > 0) {
    return "isn't an XML or JSON file. Choose a file made with a Flow's Export.";
  }
  const flows = Array.from(doc.getElementsByTagName('flow')).filter(flow => flow.parentElement?.localName === 'flows');
  if (flows.length > 1) {
    return `contains ${flows.length} Flows. Import it as a Gateway backup instead.`;
  }
  const id = flows.length === 1 ? childText(flows[0], 'id') : '';
  const name = flows.length === 1 ? childText(flows[0], 'name') : '';
  if (!id || !name) {
    return "doesn't contain a Flow. Choose a file made with a Flow's Export.";
  }
  return { id, name };
}

/** Why a text isn't well-formed XML, or undefined when it is. */
export function xmlProblem(text: string): string | undefined {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  return doc.getElementsByTagName('parsererror').length > 0 ? "isn't valid XML." : undefined;
}

function childText(element: Element, name: string): string {
  return (
    Array.from(element.children)
      .find(child => child.localName === name)
      ?.textContent?.trim() ?? ''
  );
}
