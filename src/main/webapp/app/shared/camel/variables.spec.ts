import { insertVariable, referencedVariables, unknownVariables, variableRef, variableWarnings } from './variables';

describe('Variables', () => {
  it('refers to a Variable as @{key}', () => {
    expect(variableRef('SftpHost')).toBe('@{SftpHost}');
  });

  it('finds every Variable a text refers to, each once', () => {
    expect(referencedVariables('@{Host}:22/@{Folder}/@{Host}')).toEqual(['Host', 'Folder']);
    expect(referencedVariables('no variables, {{camel}} placeholders')).toEqual([]);
    expect(referencedVariables(undefined)).toEqual([]);
  });

  it('lists the Variables a Step refers to that do not exist', () => {
    expect(unknownVariables(['@{Host}/in', 'password=@{Secret}', null], ['Host'])).toEqual(['Secret']);
  });

  it('warns about each Step that refers to an unknown Variable', () => {
    const steps = [
      { key: 'source', uri: '@{InFolder}' },
      { key: 'sink', uri: '@{Host}/out', options: 'password=@{Secret}&binary=true' },
    ];

    expect(variableWarnings(steps, ['InFolder', 'Host'])).toEqual([
      { stepKey: 'sink', message: 'Unknown Variable: Secret. Add it under Flows → Variables.' },
    ]);
    expect(variableWarnings(steps, null)).toEqual([]);
  });

  it('puts a reference in at the cursor', () => {
    expect(insertVariable('/out', 'Host', 0)).toEqual({ text: '@{Host}/out', cursor: 7 });
    expect(insertVariable('C:/', 'Folder')).toEqual({ text: 'C:/@{Folder}', cursor: 12 });
  });
});
