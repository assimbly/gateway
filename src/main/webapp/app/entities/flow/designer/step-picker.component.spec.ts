import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { ESSENTIALS } from 'app/shared/camel/catalogue';

import { PickedKind, StepPickerComponent } from './step-picker.component';

describe('Step picker', () => {
  let fixture: ComponentFixture<StepPickerComponent>;
  let picker: StepPickerComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StepPickerComponent] });
    TestBed.inject(FaIconLibrary).addIcons(faPlus);
    fixture = TestBed.createComponent(StepPickerComponent);
    picker = fixture.componentInstance;
    fixture.componentRef.setInput('kinds', ['ACTION', 'ROUTER', 'SINK']);
    fixture.componentRef.setInput('components', { actions: ['azure-files', 'file', 'log', 'setbody'], sinks: ['azure-files', 'file', 'ftp'] });
  });

  it('lists an exact match first, then the names that start with the search, shortest first', () => {
    picker.filter = 'f';
    expect(picker.matches('SINK')).toEqual(['ftp', 'file', 'azure-files']);

    picker.filter = 'file';
    expect(picker.matches('SINK')).toEqual(['file', 'azure-files', 'ftp']);
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

  describe('searching for a Router from the Action tab', () => {
    /** Opens the menu with a search; the menu is rendered in the body. */
    function searchFor(filter: string): HTMLElement[] {
      fixture.detectChanges();
      picker.open();
      picker.filter = filter;
      fixture.componentRef.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      return [...document.body.querySelectorAll<HTMLElement>('.step-picker-item')];
    }

    afterEach(() => fixture.destroy());

    it("offers Split as a Router, not as a catalogue component that can't be used", () => {
      picker.filter = 'split';

      expect(picker.routerMatches('ACTION')[0]).toBe('split');
      expect(picker.hiddenMatches('ACTION').map(hidden => hidden.name)).not.toContain('split');
      expect(picker.routerMatches('ROUTER')).toEqual([]);
    });

    it('adds a Split Router when it is clicked', () => {
      const picked: { kind: PickedKind; componentType: string }[] = [];
      picker.picked.subscribe(p => picked.push(p));

      const split = searchFor('split').find(item => item.querySelector('.step-picker-item-id')?.textContent === 'split');

      expect(split?.tagName).toBe('BUTTON');
      expect(split?.querySelector('.step-picker-item-tag')?.textContent).toBe('Router');
      split!.click();
      expect(picked).toEqual([{ kind: 'ROUTER', componentType: 'split' }]);
    });

    it("shows Split as unavailable where a Router can't go", () => {
      fixture.componentRef.setInput('kinds', ['ACTION', 'SINK']);

      const split = searchFor('split').filter(item => item.querySelector('.step-picker-item-id')?.textContent === 'split');

      expect(split).toHaveLength(1);
      expect(split[0].getAttribute('aria-disabled')).toBe('true');
      expect(split[0].textContent).toContain("Split is a Router; a Router can't go here.");
    });
  });
});
