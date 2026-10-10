import { TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { HeaderService } from 'app/entities/header/header.service';
import { MessageService } from 'app/entities/message/message.service';
import { EventManager } from 'app/core/util/event-manager.service';

import { SendTemplateService } from './send-template.service';

describe('SendTemplateService', () => {
  let service: SendTemplateService;
  let messages: MessageService;
  let headers: HeaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SendTemplateService);
    messages = TestBed.inject(MessageService);
    headers = TestBed.inject(HeaderService);
    jest.spyOn(TestBed.inject(EventManager), 'broadcast').mockImplementation(() => undefined);
  });

  it('loads the headers of one template as rows', done => {
    jest.spyOn(headers, 'query').mockReturnValue(
      of(
        new HttpResponse({
          body: [
            { id: 1, key: 'a', value: '1', messageId: 7 },
            { id: 2, key: 'b', value: '2', messageId: 8 },
          ],
        })
      )
    );

    service.load(7).subscribe(rows => {
      expect(rows).toEqual([{ id: 1, key: 'a', value: '1', type: 'header', language: 'constant' }]);
      done();
    });
  });

  it('creates the message first and then a header per filled row', done => {
    jest.spyOn(messages, 'create').mockReturnValue(of(new HttpResponse({ body: { id: 5, name: 'colors' } })));
    const createHeader = jest
      .spyOn(headers, 'create')
      .mockImplementation(header => of(new HttpResponse({ body: { ...header, id: 100 + (header.key === 'a' ? 1 : 2) } })));

    service
      .create('colors', [
        { key: 'a', value: '1' },
        { key: '', value: 'skipped' },
        { key: 'b', value: '2', type: 'property' },
      ])
      .subscribe(result => {
        expect(messages.create).toHaveBeenCalledWith({ name: 'colors' });
        expect(createHeader).toHaveBeenCalledTimes(2);
        expect(createHeader).toHaveBeenCalledWith(expect.objectContaining({ key: 'b', type: 'property', messageId: 5 }));
        expect(result.id).toBe(5);
        expect(result.rows.map(r => [r.id, r.key])).toEqual([
          [101, 'a'],
          [102, 'b'],
        ]);
        done();
      });
  });

  it('updates changed rows, creates new rows and deletes the rows that were removed', done => {
    const update = jest.spyOn(headers, 'update').mockImplementation(header => of(new HttpResponse({ body: header })));
    const create = jest.spyOn(headers, 'create').mockImplementation(header => of(new HttpResponse({ body: { ...header, id: 99 } })));
    const remove = jest.spyOn(headers, 'delete').mockReturnValue(of(new HttpResponse()));

    const previous = [
      { id: 1, key: 'keep', value: '1' },
      { id: 2, key: 'gone', value: '2' },
    ];
    const rows = [
      { id: 1, key: 'keep', value: 'changed' },
      { key: 'added', value: '3' },
    ];

    service.update(7, previous, rows).subscribe(saved => {
      expect(remove).toHaveBeenCalledWith(2);
      expect(update).toHaveBeenCalledWith(expect.objectContaining({ id: 1, value: 'changed', messageId: 7 }));
      expect(create).toHaveBeenCalledWith(expect.objectContaining({ key: 'added', messageId: 7 }));
      expect(saved.map(r => r.key)).toEqual(['keep', 'added']);
      done();
    });
  });
});
