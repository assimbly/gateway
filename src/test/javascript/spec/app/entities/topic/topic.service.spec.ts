import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TopicService } from 'app/entities/topic/topic.service';
import { ITopic, Topic } from 'app/shared/model/topic.model';

describe('Service Tests', () => {
    describe('Topic Service', () => {
        let injector: TestBed;
        let service: TopicService;
        let httpMock: HttpTestingController;
        let elemDefault: ITopic;
        let expectedResult: ITopic | ITopic[] | boolean | null;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule]
            });
            expectedResult = null;
            injector = getTestBed();
            service = injector.get(TopicService);
            httpMock = injector.get(HttpTestingController);

            elemDefault = new Topic(0, 0, 0, 'AAAAAAA', 'AAAAAAA');
        });

        describe('Service methods', () => {
            it('should find an element', () => {
                const returnedFromService = Object.assign({}, elemDefault);

                service.find(123).subscribe(resp => (expectedResult = resp.body));

                const req = httpMock.expectOne({ method: 'GET' });
                req.flush(returnedFromService);
                expect(expectedResult).toMatchObject(elemDefault);
            });

            it('should create a Topic', () => {
                const returnedFromService = Object.assign(
                    {
                        id: 0
                    },
                    elemDefault
                );

                const expected = Object.assign({}, returnedFromService);

                service.create(new Topic()).subscribe(resp => (expectedResult = resp.body));

                const req = httpMock.expectOne({ method: 'POST' });
                req.flush(returnedFromService);
                expect(expectedResult).toMatchObject(expected);
            });

            it('should update a Topic', () => {
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

            it('should return a list of Topic', () => {
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

                service.query().subscribe(resp => (expectedResult = resp.body));

                const req = httpMock.expectOne({ method: 'GET' });
                req.flush([returnedFromService]);
                httpMock.verify();
                expect(expectedResult).toContainEqual(expected);
            });

            it('should delete a Topic', () => {
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
