import { detectBodyMode, detectResponseMode, parseUploadedText } from './send-upload';

describe('send-upload', () => {
  describe('parseUploadedText', () => {
    it('reads a single Assimbly message with its headers', () => {
      const text = JSON.stringify({ messages: { message: [{ body: 'hello', headers: { a: '1' } }] } });

      const [message, ...rest] = parseUploadedText(text);

      expect(rest).toEqual([]);
      expect(message.body).toBe('hello');
      expect(message.headers.map(h => [h.key, h.value])).toEqual([['a', '1']]);
    });

    it('merges legacy jmsHeaders into the headers, also for multiple messages', () => {
      const text = JSON.stringify({
        messages: {
          message: [
            { body: 'one', headers: { a: '1' }, jmsHeaders: { JMSType: 'order' } },
            { body: 'two', jmsHeaders: { JMSCorrelationID: 'abc' } },
          ],
        },
      });

      const messages = parseUploadedText(text);

      expect(messages).toHaveLength(2);
      expect(messages[0].headers.map(h => [h.key, h.value])).toEqual([
        ['a', '1'],
        ['JMSType', 'order'],
      ]);
      expect(messages[1].headers.map(h => [h.key, h.value])).toEqual([['JMSCorrelationID', 'abc']]);
    });

    it('accepts a message file that holds one message object instead of a list', () => {
      const messages = parseUploadedText(JSON.stringify({ messages: { message: { body: 'solo' } } }));

      expect(messages).toHaveLength(1);
      expect(messages[0].body).toBe('solo');
    });

    it('uses other JSON as the body of one message', () => {
      const text = '{"order":1}';

      expect(parseUploadedText(text)).toEqual([{ body: text, headers: [] }]);
    });

    it('uses plain text as the body of one message', () => {
      expect(parseUploadedText('just text')).toEqual([{ body: 'just text', headers: [] }]);
    });
  });

  describe('detectBodyMode', () => {
    it('recognizes JSON, XML and text', () => {
      expect(detectBodyMode('{"a":1}')).toBe('json');
      expect(detectBodyMode('<a><b/></a>')).toBe('xml');
      expect(detectBodyMode('hello world')).toBe('text');
      expect(detectBodyMode('<broken')).toBe('text');
      expect(detectBodyMode('')).toBe('text');
    });
  });

  describe('detectResponseMode', () => {
    it('looks at the first character', () => {
      expect(detectResponseMode('  [1]')).toBe('json');
      expect(detectResponseMode('{}')).toBe('json');
      expect(detectResponseMode('<a/>')).toBe('xml');
      expect(detectResponseMode('ok')).toBe('text');
      expect(detectResponseMode(undefined)).toBe('text');
    });
  });
});
