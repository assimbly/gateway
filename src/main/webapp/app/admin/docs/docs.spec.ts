import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import Docs from './docs';

const swaggerConfig = {
  urls: [
    { url: '/v3/api-docs/integration', name: 'Flows' },
    { url: '/v3/api-docs/broker', name: 'Broker' },
    { url: '/v3/api-docs/management', name: 'Management' },
  ],
};

describe('Docs (API Explorer)', () => {
  let fixture: ComponentFixture<Docs>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(Docs);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => httpMock.verify());

  function open(definition: string, config: object = swaggerConfig): void {
    fixture.componentRef.setInput('definition', definition);
    fixture.detectChanges();
    httpMock.expectOne(request => request.url.endsWith('v3/api-docs/swagger-config')).flush(config);
    fixture.detectChanges();
  }

  function frameSrc(): string | null {
    return (fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement | null)?.getAttribute('src') ?? null;
  }

  it('should open Swagger UI on the definition of the route', () => {
    open('broker');

    expect(frameSrc()).toBe('swagger-ui/index.html?urls.primaryName=Broker');
  });

  it('should load another definition when the route changes', () => {
    open('broker');

    fixture.componentRef.setInput('definition', 'management');
    fixture.detectChanges();

    expect(frameSrc()).toBe('swagger-ui/index.html?urls.primaryName=Management');
  });

  it('should follow a definition picked in Swagger UI without reloading the frame', () => {
    open('broker');
    // Stands in for the window of Swagger UI, which its dropdown updates with replaceState.
    const swaggerWindow = {
      fetch: jest.fn(),
      location: { search: '?urls.primaryName=Broker', href: 'http://localhost/swagger-ui/index.html' },
      history: {
        pushState: jest.fn(),
        replaceState: jest.fn((data: unknown, unused: string, url: string) => (swaggerWindow.location.search = url)),
      },
    };
    fixture.componentInstance.onLoad({ contentWindow: swaggerWindow } as unknown as HTMLIFrameElement);

    swaggerWindow.history.replaceState(null, '', '?urls.primaryName=Flows');
    expect(router.navigate).toHaveBeenCalledWith(['/explorer', 'integration'], { replaceUrl: true });

    fixture.componentRef.setInput('definition', 'integration');
    fixture.detectChanges();
    expect(frameSrc()).toBe('swagger-ui/index.html?urls.primaryName=Broker');
  });

  it('should go to the first definition when the route names an unknown one', () => {
    open('unknown');

    expect(router.navigate).toHaveBeenCalledWith(['/explorer', 'integration'], { replaceUrl: true });
    expect(frameSrc()).toBeNull();
  });

  it('should still open Swagger UI when its groups are unknown', () => {
    open('broker', {});

    expect(frameSrc()).toBe('swagger-ui/index.html');
  });
});
