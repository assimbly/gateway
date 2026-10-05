import { TestBed } from '@angular/core/testing';

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
});
