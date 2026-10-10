import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import EndpointTypeSwitch from './endpoint-type-switch';

describe('EndpointTypeSwitch', () => {
  let fixture: ComponentFixture<EndpointTypeSwitch>;

  const links = (): HTMLAnchorElement[] => Array.from(fixture.nativeElement.querySelectorAll('a'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndpointTypeSwitch],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EndpointTypeSwitch);
  });

  it('links to the queue and topic pages', () => {
    fixture.componentRef.setInput('active', 'queue');
    fixture.detectChanges();

    const [queues, topics] = links();
    expect(queues.textContent?.trim()).toBe('Queues');
    expect(queues.getAttribute('href')).toBe('/queue');
    expect(topics.textContent?.trim()).toBe('Topics');
    expect(topics.getAttribute('href')).toBe('/topic');
  });

  it('marks Queues as active', () => {
    fixture.componentRef.setInput('active', 'queue');
    fixture.detectChanges();

    const [queues, topics] = links();
    expect(queues.classList.contains('active')).toBe(true);
    expect(queues.getAttribute('aria-pressed')).toBe('true');
    expect(topics.classList.contains('active')).toBe(false);
    expect(topics.getAttribute('aria-pressed')).toBe('false');
  });

  it('marks Topics as active', () => {
    fixture.componentRef.setInput('active', 'topic');
    fixture.detectChanges();

    const [queues, topics] = links();
    expect(queues.classList.contains('active')).toBe(false);
    expect(topics.classList.contains('active')).toBe(true);
    expect(topics.getAttribute('aria-pressed')).toBe('true');
  });
});
