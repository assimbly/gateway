import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestMessageComponent } from './test-message.component';

describe('Test message', () => {
  let fixture: ComponentFixture<TestMessageComponent>;
  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const text = (): string => element().textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const tabs = () => Array.from(element().querySelectorAll('a[ngbNavLink]')).map(a => a.textContent?.replace(/\s+/g, ' ').trim());

  beforeEach(() => {
    fixture = TestBed.createComponent(TestMessageComponent);
  });

  it('shows the message in the same Body and Headers tabs as the message that is sent', () => {
    fixture.componentRef.setInput('message', { body: 'Hello', headers: { Id: '7', Type: 'greeting' }, truncated: false });
    fixture.detectChanges();

    expect(tabs()).toEqual(['Body', 'Headers 2']);
    expect(element().querySelector('[data-cy="test-body"]')).toBeTruthy();
    expect(fixture.componentInstance.bodyOptions().readOnly).toBe(true);
    // grey, with a Read-only hint, as the response on Flows > Send
    expect(element().querySelector('.response-body-readonly [data-cy="test-body"]')).toBeTruthy();
  });

  it('lists the headers on the Headers tab', () => {
    fixture.componentRef.setInput('message', { body: 'Hello', headers: { Id: '7' }, truncated: false });
    fixture.componentInstance.activeTab.set('headers');
    fixture.detectChanges();

    const cells = Array.from(element().querySelectorAll('th, td')).map(cell => cell.textContent?.trim());
    expect(cells).toEqual(['Id', '7']);
  });

  it('says when the body is cut short or empty', () => {
    fixture.componentRef.setInput('message', { body: 'Hel', headers: {}, truncated: true });
    fixture.detectChanges();
    expect(text()).toContain('The body is cut short.');

    fixture.componentRef.setInput('message', { body: '', headers: {}, truncated: false });
    fixture.detectChanges();
    expect(text()).toContain('The body is empty.');
  });

  it('colours a JSON body as JSON', () => {
    fixture.componentRef.setInput('message', { body: '{"a":1}', headers: {}, truncated: false });
    expect(fixture.componentInstance.bodyOptions().mode).toBe('json');
  });

  it('shows the placeholder when there is no message', () => {
    fixture.componentRef.setInput('message', null);
    fixture.componentRef.setInput('placeholder', 'Run the test to see what the Flow sends back.');
    fixture.detectChanges();

    expect(tabs()).toEqual([]);
    expect(element().querySelector('[data-cy="test-placeholder"]')?.textContent).toContain('Run the test');
  });
});
