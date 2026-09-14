/** Temporary debug-session logger (same-origin; CSP blocks 127.0.0.1 ingest). */
export function agentDebugLog(payload: Record<string, unknown>): void {
  fetch('/api/_agent-debug/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'eb2e16' },
    body: JSON.stringify({ sessionId: 'eb2e16', timestamp: Date.now(), ...payload }),
  }).catch(() => {});
}
