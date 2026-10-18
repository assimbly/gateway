import { TestBed } from '@angular/core/testing';

import { ESSENTIALS } from 'app/shared/camel/catalogue';

import { PickedKind, StepPickerComponent } from './step-picker.component';

describe('Step picker', () => {
  let picker: StepPickerComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StepPickerComponent] });
    picker = TestBed.createComponent(StepPickerComponent).componentInstance;
    picker.kinds = ['ACTION', 'ROUTER', 'SINK'];
    picker.components = { actions: ['azure-files', 'file', 'log', 'setbody'], sinks: ['azure-files', 'file', 'ftp'] };
  });

  it('lists an exact match first, then the names that start with the search', () => {
    picker.filter = 'f';

    expect(picker.matches('SINK')).toEqual(['file', 'ftp', 'azure-files']);
  });

  it('picks the first match of the chosen kind on Enter', () => {
    const picked: { kind: PickedKind; componentType: string }[] = [];
    picker.picked.subscribe(p => picked.push(p));
    picker.activeKind = 'SINK';
    picker.filter = 'file';

    picker.pickFirstMatch();

    expect(picked).toEqual([{ kind: 'SINK', componentType: 'file' }]);
  });

  it('picks from another kind on Enter when the chosen kind has no match', () => {
    const picked: { kind: PickedKind; componentType: string }[] = [];
    picker.picked.subscribe(p => picked.push(p));
    picker.filter = 'content';

    picker.pickFirstMatch();

    expect(picked).toEqual([{ kind: 'ROUTER', componentType: 'content' }]);
  });

  it('shows a Router by its own name and description, not by a catalogue component with the same id', () => {
    expect(picker.entry('split', 'ROUTER')).toEqual(expect.objectContaining({ title: 'Split', description: expect.stringContaining('each item') }));
    expect(picker.entry('if', 'ROUTER').title).toBe('If / else');
  });

  it('finds a Router by words from its name', () => {
    picker.filter = 'else';

    expect(picker.matches('ROUTER')).toEqual(['if']);
  });

  it("lists Assimbly's own Actions first, and offers them as the Essentials chip", () => {
    expect(picker.matches('ACTION')[0]).toBe('setbody');
    expect(picker.essentialsOf('ACTION')).toEqual(['setbody']);
    expect(picker.essentialsOf('SINK')).toEqual([]);

    picker.chooseCategory(ESSENTIALS);

    expect(picker.matches('ACTION')).toEqual(['setbody']);
  });

  it('shows Set body by its title', () => {
    expect(picker.entry('setbody').title).toBe('Set body');
  });

  it('lists the most used Routers first', () => {
    expect(picker.matches('ROUTER').slice(0, 3)).toEqual(['content', 'if', 'split']);
  });
});
