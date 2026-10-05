/** The full URL an Operation is served on: the runtime's REST listener and the Operation's runtime path. */
export function operationUrl(listenerUrl: string, runtimePath: string): string {
  return listenerUrl.replace(/\/+$/, '') + (runtimePath.startsWith('/') ? runtimePath : `/${runtimePath}`);
}
