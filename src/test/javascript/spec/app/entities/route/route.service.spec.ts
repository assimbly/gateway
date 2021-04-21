import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouteService } from 'app/entities/route/route.service';
import { IRoute, Route } from 'app/shared/model/route.model';

describe('Service Tests', () => {
    describe('Route Service', () => {
        let injector: TestBed;
        let service: RouteService;
        let httpMock: HttpTestingController;
        let elemDefault: IRoute;
        let expectedResult: IRoute | IRoute[] | boolean | null;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule]
            });
            expectedResult = null;
            injector = getTestBed();
            service = injector.get(RouteService);
            httpMock = injector.get(HttpTestingController);

            elemDefault = new Route(0, 'AAAAAAA', 'AAAAAAA', 'AAAAAAA');
        });

        describe('Service methods', () => {
            it('should find an element', () => {
                const returnedFromService = Object.assign({}, elemDefault);

                service.find(123).subscribe(resp => (expectedResult = resp.body));

                const req = httpMock.expectOne({ method: 'GET' });
                req.flush(returnedFromService);
                expect(expectedResult).toMatchObject(elemDefault);
            });

            it('should create a Route', () => {
                const returnedFromService = Object.assign(
                    {
                        id: 0
                    },
                    elemDefault
                );

                const expected = Object.assign({}, returnedFromService);

                service.create(new Route()).subscribe(resp => (expectedResult = resp.body));

                const req = httpMock.expectOne({ method: 'POST' });
                req.flush(returnedFromService);
                expect(expectedResult).toMatchObject(expected);
            });

            it('should update a Route', () => {
                const returnedFromService = Object.assign(
                    {
                        name: 'BBBBBB',
                        type: 'BBBBBB',
                        content: 'BBBBBB'
                    },
                    elemDefault
                );

                const expected = Object.assign({}, returnedFromService);

                service.update(expected).subscribe(resp => (expectedResult = resp.body));

                const req = httpMock.expectOne({ method: 'PUT' });
                req.flush(returnedFromService);
                expect(expectedResult).toMatchObject(expected);
            });

            it('should return a list of Route', () => {
                const returnedFromService = Object.assign(
                    {
                        name: 'BBBBBB',
                        type: 'BBBBBB',
                        content: 'BBBBBB'
                    },
                    elemDefault
                );

                const expected = Object.assign({}, returnedFromService);

                service.query().subscribe(resp => (expectedResult = resp.body));

                const req = httpMock.expectOne({ method: 'GET' });
                req.flush([returnedFromService]);
                httpMock.verify();
                expect(expectedResult).toContainEqual(expected);
            });

            it('should delete a Route', () => {
                service.delete(123).subscribe(resp => (expectedResult = resp.ok));

                const req = httpMock.expectOne({ method: 'DELETE' });
                req.flush({ status: 200 });
                expect(expectedResult);
            });
        });

        afterEach(() => {
            httpMock.verify();
        });
    });
});
