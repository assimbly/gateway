import { OptionSchema, groupOptions, missingPathParts, pathLabel, pathRule, requiredOptions, splitHttpUrl, suggestedOptions, valueFieldOf } from './endpoint';

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
      [{ name: 'language', type: 'string' }, 'choice'],
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

  describe('full URLs in HTTP(S) Steps', () => {
    it('takes the scheme off and picks the Component it names', () => {
      expect(splitHttpUrl('http', 'https://api.open-meteo.com/v1/forecast?latitude=52.37')).toEqual({
        componentType: 'https',
        uri: 'api.open-meteo.com/v1/forecast?latitude=52.37',
      });
      expect(splitHttpUrl('https', ' HTTP://www.dneonline.com/calculator.asmx ')).toEqual({
        componentType: 'http',
        uri: 'www.dneonline.com/calculator.asmx',
      });
    });

    it('leaves a path without a scheme, or another Component, alone', () => {
      expect(splitHttpUrl('https', 'api.open-meteo.com/v1/forecast')).toBeNull();
      expect(splitHttpUrl('file', 'https://example.com')).toBeNull();
      expect(splitHttpUrl('http', null)).toBeNull();
    });
  });

  describe('Path label', () => {
    it('names the Path field after the one value it takes', () => {
      expect(pathLabel(pathRule('file:directoryName', [{ name: 'directoryName', kind: 'path', displayName: 'Directory Name' }]).parts)).toBe(
        'Directory Name',
      );
    });

    it('names it after the required last part when the optional parts before it can be left out', () => {
      const jms = pathRule('jms:destinationType:destinationName', [
        { name: 'destinationType', kind: 'path', displayName: 'Destination Type', required: false },
        { name: 'destinationName', kind: 'path', displayName: 'Destination Name', required: true },
      ]);

      expect(pathLabel(jms.parts)).toBe('Destination Name');
    });

    it("names a path part the schema doesn't describe after its syntax", () => {
      expect(pathLabel(pathRule('headerName', []).parts)).toBe('Header Name');
    });

    it('keeps Path for a path of several values, or none', () => {
      expect(pathLabel(pathRule('sftp:host:port/directoryName', properties).parts)).toBe('Path');
      expect(pathLabel([])).toBe('Path');
    });
  });

  it('lists the required Options a Step of this role needs', () => {
    expect(requiredOptions(properties, 'producer')).toEqual(['username']);
  });

  describe('suggested Options', () => {
    const setbody: OptionSchema[] = [
      { name: 'language', kind: 'parameter', displayName: 'Language', group: 'common', type: 'string', defaultValue: 'simple' },
      { name: 'expression', kind: 'parameter', displayName: 'Expression', group: 'common', type: 'string' },
    ];

    it('suggests every Common Option of a Component with only a few Options', () => {
      expect(suggestedOptions(setbody, 'producer')).toEqual(['expression', 'language']);
    });

    it('suggests only the required Options of a Component with many Options', () => {
      const many: OptionSchema[] = [
        ...Array.from({ length: 10 }, (_, i) => ({ name: `option${i}`, kind: 'parameter', group: 'common' })),
        { name: 'host', kind: 'parameter', group: 'common', required: true },
      ];

      expect(suggestedOptions(many, 'producer')).toEqual(['host']);
    });

    it("doesn't suggest Options of the other role", () => {
      const fileLike: OptionSchema[] = [
        { name: 'delay', kind: 'parameter', group: 'consumer' },
        { name: 'fileExist', kind: 'parameter', group: 'producer' },
      ];

      expect(suggestedOptions(fileLike, 'producer')).toEqual(['fileExist']);
    });
  });
});
