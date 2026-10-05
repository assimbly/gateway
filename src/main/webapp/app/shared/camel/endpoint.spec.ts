import { OptionSchema, groupOptions, missingPathParts, pathRule, requiredOptions, valueFieldOf } from './endpoint';

const sftp: Record<string, Omit<OptionSchema, 'name'>> = {
  host: { kind: 'path', displayName: 'Host', group: 'common', type: 'string', required: true, description: 'Hostname of the FTP server' },
  port: { kind: 'path', displayName: 'Port', group: 'common', type: 'integer', required: false },
  directoryName: { kind: 'path', displayName: 'Directory Name', group: 'common', type: 'string', required: false },
  binary: { kind: 'parameter', displayName: 'Binary', group: 'common', type: 'boolean', defaultValue: false },
  delay: { kind: 'parameter', displayName: 'Delay', group: 'scheduler', label: 'consumer,scheduler', type: 'integer' },
  fileExist: {
    kind: 'parameter',
    displayName: 'File Exist',
    group: 'producer',
    label: 'producer',
    type: 'enum',
    enum: ['Override', 'Append'],
  },
  autoCreate: { kind: 'parameter', displayName: 'Auto Create', group: 'advanced', label: 'advanced', type: 'boolean' },
  bridgeErrorHandler: {
    kind: 'parameter',
    displayName: 'Bridge Error Handler',
    group: 'consumer (advanced)',
    label: 'consumer,advanced',
    type: 'boolean',
  },
  password: { kind: 'parameter', displayName: 'Password', group: 'security', label: 'security', type: 'string', secret: true },
  privateKeyFile: { kind: 'parameter', displayName: 'Private Key File', group: 'security', label: 'security', type: 'string' },
  username: { kind: 'parameter', displayName: 'User Name', group: 'security', label: 'security', type: 'string', required: true },
};
const properties = Object.entries(sftp).map(([name, option]) => ({ name, ...option }));

describe('Endpoint editing', () => {
  describe('grouping Options', () => {
    it('folds a producer Step’s Options into Common, Advanced and Security, leaving out path parts and consumer Options', () => {
      const grouped = groupOptions(properties, 'producer').map(option => [option.heading, option.name]);

      expect(grouped).toEqual([
        ['Common', 'binary'],
        ['Common', 'fileExist'],
        ['Advanced', 'autoCreate'],
        ['Security', 'password'],
        ['Security', 'privateKeyFile'],
        ['Security', 'username'],
      ]);
    });

    it('keeps consumer Options for a Source and leaves out producer Options', () => {
      const names = groupOptions(properties, 'consumer').map(option => option.name);

      expect(names).toContain('delay');
      expect(names).toContain('bridgeErrorHandler');
      expect(names).not.toContain('fileExist');
    });
  });

  describe('value fields', () => {
    it.each([
      [{ type: 'boolean' }, 'switch'],
      [{ type: 'enum', enum: ['Override', 'Append'] }, 'choice'],
      [{ type: 'integer' }, 'number'],
      [{ type: 'number' }, 'number'],
      [{ type: 'string', secret: true }, 'secret'],
      [{ type: 'string' }, 'text'],
      [{ type: 'duration' }, 'text'],
      [undefined, 'text'],
    ] as const)('gives an Option of %o a %s field', (option, field) => {
      expect(valueFieldOf(option)).toBe(field);
    });
  });

  describe('required path parts', () => {
    const rule = pathRule('sftp:host:port/directoryName', properties);

    it('reads the path parts and which are required from the syntax and the schema', () => {
      expect(rule.parts.map(part => [part.name, part.required])).toEqual([
        ['host', true],
        ['port', false],
        ['directoryName', false],
      ]);
    });

    it('finds a required path part missing from an empty path', () => {
      expect(missingPathParts(rule, '')).toEqual(['Host']);
      expect(missingPathParts(rule, undefined)).toEqual(['Host']);
    });

    it('accepts a path that fills the required parts', () => {
      expect(missingPathParts(rule, 'example.com')).toEqual([]);
      expect(missingPathParts(rule, 'example.com:22/in')).toEqual([]);
    });

    it('lets a value fill a required part when an optional part before it is left out', () => {
      const jms = pathRule('jms:destinationType:destinationName', [
        { name: 'destinationType', kind: 'path', displayName: 'Destination Type', required: false },
        { name: 'destinationName', kind: 'path', displayName: 'Destination Name', required: true },
      ]);

      expect(missingPathParts(jms, 'orders')).toEqual([]);
      expect(missingPathParts(jms, '')).toEqual(['Destination Name']);
    });

    it('reads a path without delimiters, such as a Windows directory, as one value', () => {
      const file = pathRule('file:directoryName', [{ name: 'directoryName', kind: 'path', displayName: 'Directory Name', required: true }]);

      expect(missingPathParts(file, 'C:\\messages\\in')).toEqual([]);
    });
  });

  it('lists the required Options a Step of this role needs', () => {
    expect(requiredOptions(properties, 'producer')).toEqual(['username']);
  });
});
