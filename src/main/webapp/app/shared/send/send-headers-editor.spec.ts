import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { provideTranslateService } from '@ngx-translate/core';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';
import { AlertService } from 'app/core/util/alert.service';

import SendHeadersEditor from './send-headers-editor';
import { SendTemplateService } from './send-template.service';

describe('SendHeadersEditor', () => {
  let fixture: ComponentFixture<SendHeadersEditor>;
  let comp: SendHeadersEditor;
  let templates: SendTemplateService;

  function create(inputs: { templatesEnabled?: boolean; suggestions?: string[] } = {}): void {
    TestBed.configureTestingModule({
      providers: [provideTranslateService(), provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    templates = TestBed.inject(SendTemplateService);
    jest.spyOn(templates, 'list').mockReturnValue(of([{ id: 7, name: 'orders' }]));

    fixture = TestBed.createComponent(SendHeadersEditor);
    comp = fixture.componentInstance;
    fixture.componentRef.setInput('templatesEnabled', inputs.templatesEnabled ?? false);
    fixture.componentRef.setInput('suggestions', inputs.suggestions ?? []);
    fixture.detectChanges();
  }

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  it('starts without rows and adds, edits and removes rows', () => {
    create();
    expect(text()).toContain('No headers');

    comp.add();
    comp.add();
    comp.patch(0, { key: 'a', value: '1' });
    comp.patch(1, { key: 'b', value: '2' });
    expect(comp.headers().map(h => h.key)).toEqual(['a', 'b']);

    comp.remove(0);
    expect(comp.headers().map(h => h.key)).toEqual(['b']);
  });

  it('adds a row on Enter in the last row only', () => {
    create();
    comp.add();
    comp.add();
    const event = { preventDefault: jest.fn() } as unknown as Event;

    comp.onEnter(0, event);
    expect(comp.headers()).toHaveLength(2);

    comp.onEnter(1, event);
    expect(comp.headers()).toHaveLength(3);
  });

  it('offers the suggestions and the keys that are in use as options for the key', () => {
    create({ suggestions: ['JMSType', 'JMSReplyTo'] });
    comp.headers.set([{ key: 'color', value: 'red' }, { key: 'JMSType', value: 'x' }]);

    expect(comp.keyOptions()).toEqual(['JMSType', 'JMSReplyTo', 'color']);
  });

  it('keeps a name that was typed but not confirmed when the key loses focus', () => {
    create();
    comp.add();

    comp.onKeySearch(0, { term: 'X-Typed' });
    comp.onKeyBlur(0);

    expect(comp.headers()[0].key).toBe('X-Typed');
  });

  it('does not show the template bar for the broker', () => {
    create();

    expect(text()).not.toContain('Save as template');
    expect(templates.list).not.toHaveBeenCalled();
  });

  describe('templates', () => {
    const stored = [
      { id: 11, key: 'color', value: 'red', type: 'header', language: 'constant' },
      { id: 12, key: 'step', value: '1', type: 'property', language: 'constant' },
    ];

    beforeEach(() => create({ templatesEnabled: true }));

    it('loads the templates', () => {
      expect(templates.list).toHaveBeenCalled();
      expect(comp.templates()).toEqual([{ id: 7, name: 'orders' }]);
      expect(text()).toContain('Save as template');
      expect(text()).toContain('Manage templates');
    });

    it('copies a template into the rows and marks the rows as modified when they change', () => {
      jest.spyOn(templates, 'load').mockReturnValue(of(stored));

      comp.selectTemplate(7);

      expect(comp.headers().map(h => [h.key, h.value])).toEqual([
        ['color', 'red'],
        ['step', '1'],
      ]);
      expect(comp.modified()).toBe(false);

      comp.patch(0, { value: 'blue' });
      expect(comp.modified()).toBe(true);
    });

    it('keeps the rows when the template is cleared', () => {
      jest.spyOn(templates, 'load').mockReturnValue(of(stored));
      comp.selectTemplate(7);

      comp.selectTemplate(null);

      expect(comp.templateId()).toBeNull();
      expect(comp.headers()).toHaveLength(2);
      expect(comp.modified()).toBe(false);
    });

    it('saves the rows as a new template with a unique name', () => {
      comp.headers.set([{ key: 'color', value: 'red' }]);
      comp.startNamingTemplate();

      comp.templateName.set('');
      expect(comp.nameError()).toBe('Name is required.');
      comp.templateName.set('orders');
      expect(comp.nameError()).toBe('Name already exists.');
      comp.templateName.set('colors');
      expect(comp.nameError()).toBeNull();

      const create$ = jest.spyOn(templates, 'create').mockReturnValue(of({ id: 9, rows: [{ ...stored[0] }] }));
      jest.spyOn(TestBed.inject(AlertService), 'addAlert').mockImplementation(() => ({}) as any);

      comp.saveAsTemplate();

      expect(create$).toHaveBeenCalledWith('colors', [{ key: 'color', value: 'red' }]);
      expect(comp.templateId()).toBe(9);
      expect(comp.namingTemplate()).toBe(false);
      expect(comp.modified()).toBe(false);
    });

    it('updates the loaded template with the changed rows', () => {
      jest.spyOn(templates, 'load').mockReturnValue(of(stored));
      comp.selectTemplate(7);
      comp.patch(0, { value: 'blue' });
      const update$ = jest.spyOn(templates, 'update').mockReturnValue(of([{ ...stored[0], value: 'blue' }, stored[1]]));
      jest.spyOn(TestBed.inject(AlertService), 'addAlert').mockImplementation(() => ({}) as any);

      comp.updateTemplate();

      expect(update$).toHaveBeenCalledWith(7, stored.map(row => expect.objectContaining({ id: row.id })), expect.any(Array));
      expect(comp.modified()).toBe(false);
      expect(comp.headers()[0].value).toBe('blue');
    });
  });
});
