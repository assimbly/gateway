import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

import { of } from 'rxjs';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';

import { ApiDetailComponent } from './api-detail.component';
import { ApiService } from './api.service';
import { HandlerFlowsService } from './handler-flows.service';

describe('ApiDetailComponent', () => {
  it('puts the cursor in the name of a new API', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: 'new' })) } },
        { provide: ApiService, useValue: {} },
        { provide: HandlerFlowsService, useValue: {} },
      ],
    });
    TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);
    const fixture = TestBed.createComponent(ApiDetailComponent);
    document.body.appendChild(fixture.nativeElement);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.activeElement?.id).toBe('api-name');
    fixture.nativeElement.remove();
  });
});
