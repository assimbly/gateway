/* tslint:disable max-line-length */
import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { GatewayService } from 'app/entities/gateway/gateway.service';
import { IGateway, Gateway, GatewayType, EnvironmentType, ConnectorType } from 'app/shared/model/gateway.model';

describe('Service Tests', () => {
    describe('Gateway Service', () => {
        let injector: TestBed;
        let service: GatewayService;
        let httpMock: HttpTestingController;
        let elemDefault: IGateway;
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule]
            });
            injector = getTestBed();
            service = injector.get(GatewayService);
            httpMock = injector.get(HttpTestingController);

            elemDefault = new Gateway(
                0,
                'AAAAAAA',
                GatewayType.ADAPTER,
                'AAAAAAA',
                EnvironmentType.DEVELOPMENT,
                ConnectorType.CAMEL,
                'AAAAAAA',
                'AAAAAAA',
                'AAAAAAA'
            );
        });

        describe('Service methods', async () => {
            it('should find an element', async () => {
                const returnedFromService = Object.assign({}, elemDefault);
                service
                    .find(123)
                    .pipe(take(1))
                    .subscribe(resp => expect(resp).toMatchObject({ body: elemDefault }));

                const req = httpMock.expectOne({ method: 'GET' });
                req.flush(JSON.stringify(returnedFromService));
            });

            it('should create a Gateway', async () => {
                const returnedFromService = Object.assign(
                    {
                        id: 0
                    },
                    elemDefault
                );
                const expected = Object.assign({}, returnedFromService);
                service
                    .create(new Gateway(null))
                    .pipe(take(1))
                    .subscribe(resp => expect(resp).toMatchObject({ body: expected }));
                const req = httpMock.expectOne({ method: 'POST' });
                req.flush(JSON.stringify(returnedFromService));
            });

            it('should update a Gateway', async () => {
                const returnedFromService = Object.assign(
                    {
                        name: 'BBBBBB',
                        type: 'BBBBBB',
                        environmentName: 'BBBBBB',
                        stage: 'BBBBBB',
                        connectorType: 'BBBBBB',
                        defaultFromEndpointType: 'BBBBBB',
                        defaultToEndpointType: 'BBBBBB',
                        defaultErrorEndpointType: 'BBBBBB'
                    },
                    elemDefault
                );

                const expected = Object.assign({}, returnedFromService);
                service
                    .update(expected)
                    .pipe(take(1))
                    .subscribe(resp => expect(resp).toMatchObject({ body: expected }));
                const req = httpMock.expectOne({ method: 'PUT' });
                req.flush(JSON.stringify(returnedFromService));
            });

            it('should return a list of Gateway', async () => {
                const returnedFromService = Object.assign(
                    {
                        name: 'BBBBBB',
                        type: 'BBBBBB',
                        environmentName: 'BBBBBB',
                        stage: 'BBBBBB',
                        connectorType: 'BBBBBB',
                        defaultFromEndpointType: 'BBBBBB',
                        defaultToEndpointType: 'BBBBBB',
                        defaultErrorEndpointType: 'BBBBBB'
                    },
                    elemDefault
                );
                const expected = Object.assign({}, returnedFromService);
                service
                    .query(expected)
                    .pipe(
                        take(1),
                        map(resp => resp.body)
                    )
                    .subscribe(body => expect(body).toContainEqual(expected));
                const req = httpMock.expectOne({ method: 'GET' });
                req.flush(JSON.stringify([returnedFromService]));
                httpMock.verify();
            });

            it('should delete a Gateway', async () => {
                const rxPromise = service.delete(123).subscribe(resp => expect(resp.ok));

                const req = httpMock.expectOne({ method: 'DELETE' });
                req.flush({ status: 200 });
            });
        });

        afterEach(() => {
            httpMock.verify();
        });
    });
});
