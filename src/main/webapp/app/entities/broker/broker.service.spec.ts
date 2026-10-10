import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BrokerService } from './broker.service';

describe('BrokerService.sendMessage', () => {
    let service: BrokerService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
        service = TestBed.inject(BrokerService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    const expectSend = (call: () => void, endpointType: string) => {
        call();
        const req = httpMock.expectOne(r => r.url.endsWith('api/brokers/artemis/message/TestQ/send'));
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toBe('hello');
        expect(req.request.params.get('messageHeaders')).toBe('{}');
        expect(req.request.params.get('endpointType')).toBe(endpointType);
        req.flush('ok');
    };

    it('sends to a queue by default', () => {
        expectSend(() => service.sendMessage('artemis', 'TestQ', '{}', 'hello').subscribe(), 'queue');
    });

    it('sends the endpoint type as query parameter', () => {
        expectSend(() => service.sendMessage('artemis', 'TestQ', '{}', 'hello', 'topic').subscribe(), 'topic');
    });
});
