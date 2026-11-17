import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { ESSENTIALS } from 'app/shared/camel/catalogue';

import { PickedKind, ROUTER_CATEGORY, StepPickerComponent } from './step-picker.component';

describe('Step picker', () => {
  let fixture: ComponentFixture<StepPickerComponent>;
  let picker: StepPickerComponent;

  /** The ids listed on a tab. */
  const names = (tab: PickedKind): string[] => picker.matches(tab).map(item => item.name);

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StepPickerComponent] });
    TestBed.inject(FaIconLibrary).addIcons(faPlus);
    fixture = TestBed.createComponent(StepPickerComponent);
    picker = fixture.componentInstance;
    fixture.componentRef.setInput('kinds', ['ACTION', 'ROUTER', 'SINK']);
    fixture.componentRef.setInput('components', {
      actions: ['azure-files', 'file', 'log', 'setbody'],
      sinks: ['azure-files', 'file', 'ftp'],
    });
  });

  it('lists an exact match first, then the names that start with the search, shortest first', () => {
    picker.filter = 'f';
    expect(names('SINK')).toEqual(['ftp', 'file', 'azure-files']);

    picker.filter = 'file';
    expect(names('SINK')).toEqual(['file', 'azure-files', 'ftp']);
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
    picker.activeKind = 'SINK';
    picker.filter = 'content';

    picker.pickFirstMatch();

    expect(picked).toEqual([{ kind: 'ROUTER', componentType: 'content' }]);
  });

  it('shows a Router by its own name and description, not by a catalogue component with the same id', () => {
    expect(picker.entry('split', 'ROUTER')).toEqual(
      expect.objectContaining({ title: 'Split', description: expect.stringContaining('each item') }),
    );
    expect(picker.entry('if', 'ROUTER').title).toBe('If / else');
  });

  it('finds a Router by words from its name', () => {
    picker.filter = 'else';

    expect(names('ACTION')).toEqual(['if']);
  });

  it("lists Assimbly's own Actions first, and offers them as the Essentials chip", () => {
    expect(names('ACTION')[0]).toBe('setbody');
    expect(picker.essentialsOf('ACTION')).toEqual(['setbody']);
    expect(picker.essentialsOf('SINK')).toEqual([]);

    picker.chooseCategory(ESSENTIALS);

    expect(names('ACTION')).toEqual(['setbody']);
  });

  it('shows Set body by its title', () => {
    expect(picker.entry('setbody').title).toBe('Set body');
  });

  describe('with Actions and Routers in one list', () => {
    it('has no Router tab, as the Routers are listed with the Actions', () => {
      expect(picker.tabs).toEqual(['ACTION', 'SINK']);

      fixture.componentRef.setInput('kinds', ['ACTION', 'ROUTER']);

      expect(picker.tabs).toEqual(['ACTION']);
    });

    it('lists the Routers after the Essentials and before the other Actions', () => {
      expect(picker.matches('ACTION').slice(0, 4)).toEqual([
        { kind: 'ACTION', name: 'setbody' },
        { kind: 'ROUTER', name: 'content' },
        { kind: 'ROUTER', name: 'if' },
        { kind: 'ROUTER', name: 'split' },
      ]);
      expect(names('ACTION')).toEqual(expect.arrayContaining(['azure-files', 'file', 'log']));
    });

    it('lists only the Routers, the most used first, once the Router chip is chosen', () => {
      expect(picker.offersRouterChip('ACTION')).toBe(true);

      picker.chooseCategory(ROUTER_CATEGORY);

      expect(picker.matches('ACTION').every(item => item.kind === 'ROUTER')).toBe(true);
      expect(names('ACTION').slice(0, 3)).toEqual(['content', 'if', 'split']);
    });

    it('has no Router chip where Routers cannot go', () => {
      fixture.componentRef.setInput('kinds', ['ACTION', 'SINK']);

      expect(picker.offersRouterChip('ACTION')).toBe(false);
    });

    it('lists Wiretap as a Router only, not as an Action or Sink', () => {
      fixture.componentRef.setInput('components', { actions: ['file', 'wiretap'], sinks: ['file', 'wiretap'] });
      picker.filter = 'wiretap';

      expect(picker.matches('ACTION')).toEqual([{ kind: 'ROUTER', name: 'wiretap' }]);
      expect(picker.matches('SINK')).toEqual([]);
    });
  });

  describe('what the open menu shows', () => {
    /** Opens the menu, with or without a search; the menu is rendered in the body. */
    function opened(filter = ''): HTMLElement {
      fixture.detectChanges();
      picker.open();
      picker.filter = filter;
      fixture.componentRef.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      return document.body.querySelector<HTMLElement>('.step-picker')!;
    }
    const ids = (menu: HTMLElement) => [...menu.querySelectorAll('.step-picker-item-id')].map(id => id.textContent);

    afterEach(() => fixture.destroy());

    it('names the categories in words, and still filters on the catalogue label', () => {
      const chips = [...opened().querySelectorAll<HTMLElement>('.step-picker-chip')];
      const titles = chips.map(chip => chip.firstChild?.textContent?.trim());

      expect(titles).toContain('Built-in');
      expect(titles).not.toContain('core');

      chips[titles.indexOf('Built-in')].click();
      expect(picker.category).toBe('core');
    });

    it('shows the id of a component only while searching', () => {
      expect(ids(opened())).toEqual([]);
      expect(ids(opened('file'))).toContain('file');
    });
  });

  describe('searching for a Router', () => {
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

    it('offers Split in the list of Actions, not as a catalogue component that can not be used', () => {
      picker.filter = 'split';

      expect(picker.matches('ACTION')[0]).toEqual({ kind: 'ROUTER', name: 'split' });
      expect(picker.hiddenMatches('ACTION').map(hidden => hidden.name)).not.toContain('split');
      expect(picker.routerMatches('ACTION')).toEqual([]);
    });

    it('offers Split on the Sink tab too', () => {
      picker.filter = 'split';

      expect(picker.routerMatches('SINK')[0]).toBe('split');
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
