import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { QueueService } from 'app/entities/queue/queue.service';
import { IQueue, Queue } from 'app/shared/model/queue.model';
import { IRootAddress, IAddress } from 'app/shared/model/address.model';

describe('Service Tests', () => {
    describe('Queue Service', () => {
        let injector: TestBed;
        let service: QueueService;
        let httpMock: HttpTestingController;
        let elemDefault: IQueue;
        let elemDefIRootAddress: IRootAddress;
        let expectedResult: IQueue | IQueue[] | IRootAddress | IAddress | IAddress[] | boolean | null;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule]
            });
            expectedResult = null;
            injector = getTestBed();
            service = injector.get(QueueService);
            httpMock = injector.get(HttpTestingController);

            elemDefault = new Queue(0, 0, 0, 'AAAAAAA', 'AAAAAAA');
        });

        describe('Service methods', () => {
            it('should find an element', () => {
                const returnedFromService = Object.assign({}, elemDefault);

                service.find(123).subscribe(resp => (expectedResult = resp.body));

                const req = httpMock.expectOne({ method: 'GET' });
                req.flush(returnedFromService);
                expect(expectedResult).toMatchObject(elemDefault);
            });

            it('should create a Queue', () => {
                const returnedFromService = Object.assign(
                    {
                        id: 0
                    },
                    elemDefault
                );

                const expected = Object.assign({}, returnedFromService);

                service.create(new Queue()).subscribe(resp => (expectedResult = resp.body));

                const req = httpMock.expectOne({ method: 'POST' });
                req.flush(returnedFromService);
                expect(expectedResult).toMatchObject(expected);
            });

            it('should update a Queue', () => {
                const returnedFromService = Object.assign(
                    {
                        itemsOnPage: 1,
                        refreshInterval: 1,
                        selectedColumn: 'BBBBBB',
                        orderColumn: 'BBBBBB'
                    },
                    elemDefault
                );

                const expected = Object.assign({}, returnedFromService);

                service.update(expected).subscribe(resp => (expectedResult = resp.body));

                const req = httpMock.expectOne({ method: 'PUT' });
                req.flush(returnedFromService);
                expect(expectedResult).toMatchObject(expected);
            });

            it('should return a IRootAddress with a list of queues', () => {
                const returnedFromService = Object.assign(
                    {
                        itemsOnPage: 1,
                        refreshInterval: 1,
                        selectedColumn: 'BBBBBB',
                        orderColumn: 'BBBBBB'
                    },
                    elemDefIRootAddress
                );

                const expected = Object.assign({}, returnedFromService);

                service.query().subscribe(resp => (expectedResult = resp.body));

                const req = httpMock.expectOne({ method: 'GET' });
                req.flush([returnedFromService]);
                httpMock.verify();
                expect(expectedResult).toContainEqual(expected);
            });

            it('should delete a Queue', () => {
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
