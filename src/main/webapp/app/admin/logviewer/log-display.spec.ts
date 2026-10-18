import { colorLog, logEntries } from './log-display';

const LOG = [
  '  at the end of an entry before the tail',
  '2026-10-18T21:46:05.323+02:00  INFO 1 --- [gateway] [t] o.a.i.impl.manager.FlowManager           : Started flow successfully | flowid=1853',
  '2026-10-18T21:46:07.833+02:00  INFO 1 --- [gateway] [hello] org.assimbly.runtime.1853                : Exchange[',
  '  Body: <Hello & "world">',
  ']',
  '2026-10-18T21:46:08.000+02:00 ERROR 1 --- [gateway] [t] org.assimbly.errorhandler.1853           : Failed delivery',
  '\tat org.apache.camel.Some.method(Some.java:1)',
  '2026-10-18T21:46:09.000+02:00  WARN 1 --- [gateway] [t] o.a.i.impl.manager.FlowManager           : Slow',
].join('\r\n');

describe('Log display', () => {
  it('keeps the lines without a timestamp with the entry before them', () => {
    const entries = logEntries(LOG);

    expect(entries).toHaveLength(5);
    expect(entries[0]).toBe('  at the end of an entry before the tail');
    expect(entries[2]).toBe(
      '2026-10-18T21:46:07.833+02:00  INFO 1 --- [gateway] [hello] org.assimbly.runtime.1853                : Exchange[\n  Body: <Hello & "world">\n]',
    );
  });

  it('colours a whole entry by its level and escapes it', () => {
    const html = colorLog(logEntries(LOG), '');

    expect(html).toContain('Body: &lt;Hello &amp; &quot;world&quot;&gt;');
    expect(html).toContain('<span style="color: red">2026-10-18T21:46:08.000+02:00 ERROR');
    expect(html).toContain('Failed delivery\n\tat org.apache.camel.Some.method(Some.java:1)</span>');
    expect(html).toContain('<span style="color: orange">2026-10-18T21:46:09.000+02:00  WARN');
    expect(html).not.toContain('<span style="color: red">2026-10-18T21:46:05');
  });

  it('shows the entries that contain the search text, ignoring case', () => {
    const html = colorLog(logEntries(LOG), 'hello &');

    expect(html).toBe(
      '2026-10-18T21:46:07.833+02:00  INFO 1 --- [gateway] [hello] org.assimbly.runtime.1853                : Exchange[\n  Body: &lt;Hello &amp; &quot;world&quot;&gt;\n]',
    );
  });
});
