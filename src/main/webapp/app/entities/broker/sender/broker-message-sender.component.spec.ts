import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, NEVER, of, throwError } from 'rxjs';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { provideTranslateService } from '@ngx-translate/core';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';
import { BrokerService } from 'app/entities/broker/broker.service';
import { QueueService } from 'app/entities/queue/queue.service';
import { TopicService } from 'app/entities/topic/topic.service';
import { Components } from 'app/shared/camel/component-type';

import { BrokerMessageSenderComponent, JMS_HEADER_NAMES } from './broker-message-sender.component';

// jsdom cannot measure text, which CodeMirror needs to draw the body
Range.prototype.getBoundingClientRect = () => ({ x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }) as DOMRect;
Range.prototype.getClientRects = () => ({ length: 0, item: () => null, [Symbol.iterator]: [][Symbol.iterator] }) as unknown as DOMRectList;

describe('BrokerMessageSenderComponent', () => {
    let fixture: ComponentFixture<BrokerMessageSenderComponent>;
    let comp: BrokerMessageSenderComponent;
    let queryParams: BehaviorSubject<Record<string, string>>;
    let brokerService: BrokerService;
    let queueService: QueueService;
    let topicService: TopicService;

    const address = (name: string, temporary = false) => ({ name, temporary });

    function create(params: Record<string, string> = {}): void {
        queryParams = new BehaviorSubject(params);
        TestBed.configureTestingModule({
            providers: [
                provideTranslateService(),
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: ActivatedRoute, useValue: { queryParams } },
                { provide: Components, useValue: {} },
            ],
        });
        TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);

        brokerService = TestBed.inject(BrokerService);
        queueService = TestBed.inject(QueueService);
        topicService = TestBed.inject(TopicService);

        jest.spyOn(brokerService, 'getBrokers').mockReturnValue(of(new HttpResponse({ body: [{ type: 'artemis' }] })) as any);
        jest.spyOn(queueService, 'getAllQueues').mockReturnValue(
            of(new HttpResponse({ body: { queues: { queue: [address('B-queue'), address('A-queue'), address('tmp', true)] } } })) as any
        );
        jest.spyOn(topicService, 'getAllTopics').mockReturnValue(
            of(new HttpResponse({ body: { topics: { topic: [address('news')] } } })) as any
        );
        jest.spyOn(brokerService, 'sendMessage').mockReturnValue(of(new HttpResponse({ body: 'ok' })));

        fixture = TestBed.createComponent(BrokerMessageSenderComponent);
        comp = fixture.componentInstance;
        fixture.detectChanges();
    }

    it('defaults to a queue and resolves the broker type when opened from the sidebar', () => {
        create();

        expect(comp.selectedEndpointType).toBe('queue');
        expect(comp.openedFromEndpoint).toBe(false);
        expect(comp.brokerType).toBe('artemis');
        expect(comp.suggestions).toEqual(['A-queue', 'B-queue']);
    });

    it('pre-fills the destination from the query params', () => {
        create({ endpointName: 'news', endpointType: 'topic', brokerType: 'classic' });

        expect(comp.openedFromEndpoint).toBe(true);
        expect(comp.selectedEndpointType).toBe('topic');
        expect(comp.messageSenderForm.controls.destination.value).toBe('news');
        expect(topicService.getAllTopics).toHaveBeenCalledWith('classic');
        expect(comp.suggestions).toEqual(['news']);
    });

    it('reloads the suggestions when the type changes', () => {
        create();

        comp.setEndpointType('topic');

        expect(comp.selectedEndpointType).toBe('topic');
        expect(comp.suggestions).toEqual(['news']);
    });

    it('does not send without a destination', () => {
        create();

        comp.send();

        expect(brokerService.sendMessage).not.toHaveBeenCalled();
        expect(comp.messageSenderForm.controls.destination.touched).toBe(true);
    });

    it('sends to a queue by default', () => {
        create();
        comp.messageSenderForm.controls.destination.setValue('TestQ');
        comp.body.set('hello');

        comp.send();

        expect(brokerService.sendMessage).toHaveBeenCalledWith('artemis', 'TestQ', '{}', 'hello', 'queue');
    });

    it('sends the headers of the page as JSON, including JMS headers, and skips rows without a key', () => {
        create();
        comp.messageSenderForm.controls.destination.setValue('TestQ');
        comp.headers.set([
            { key: 'color', value: 'red' },
            { key: 'JMSType', value: 'order' },
            { key: '', value: 'ignored' },
        ]);

        comp.send();

        expect(brokerService.sendMessage).toHaveBeenCalledWith('artemis', 'TestQ', '{"color":"red","JMSType":"order"}', ' ', 'queue');
    });

    it('offers the JMS headers as suggestions for the name of a header', () => {
        create();

        expect(comp.jmsHeaderNames).toEqual(['JMSCorrelationID', 'JMSReplyTo', 'JMSType']);
        expect(JMS_HEADER_NAMES).toBe(comp.jmsHeaderNames);
    });

    it('shows a success message with the destination after sending', () => {
        create();
        comp.messageSenderForm.controls.destination.setValue('TestQ');

        comp.send();
        fixture.detectChanges();

        const alert = fixture.nativeElement.querySelector('.alert-success') as HTMLElement;
        expect(alert.textContent).toContain('Message sent');
        expect(alert.textContent).toContain('to queue TestQ');
        expect(fixture.nativeElement.querySelector('.alert-danger')).toBeNull();
    });

    it('shows the error when sending fails', () => {
        create();
        jest.spyOn(brokerService, 'sendMessage').mockReturnValue(
            throwError(() => new HttpErrorResponse({ status: 500, error: 'Queue TestQ does not exist' }))
        );
        comp.messageSenderForm.controls.destination.setValue('TestQ');

        comp.send();
        fixture.detectChanges();

        const alert = fixture.nativeElement.querySelector('.alert-danger') as HTMLElement;
        expect(alert.textContent).toContain('Sending failed');
        expect(alert.textContent).toContain('to queue TestQ');
        expect(alert.textContent).toContain('Queue TestQ does not exist');
        expect(fixture.nativeElement.querySelector('.alert-success')).toBeNull();
    });

    it('names the endpoint while sending, without a message counter', () => {
        create();
        jest.spyOn(brokerService, 'sendMessage').mockReturnValue(NEVER);
        comp.messageSenderForm.controls.destination.setValue('TestQ');

        comp.send();
        fixture.detectChanges();

        const status = fixture.nativeElement.querySelector('.alert-secondary') as HTMLElement;
        expect(status.textContent?.replace(/\s+/g, ' ').trim()).toBe('Sending message to queue TestQ...');
        expect((fixture.nativeElement.querySelector('button.btn-fx-primary') as HTMLButtonElement).disabled).toBe(true);
    });

    it('does not send again while a send is pending', () => {
        create();
        jest.spyOn(brokerService, 'sendMessage').mockReturnValue(NEVER);
        comp.messageSenderForm.controls.destination.setValue('TestQ');

        comp.send();
        comp.send();

        expect(brokerService.sendMessage).toHaveBeenCalledTimes(1);
    });

    it('stops waiting and says so when the broker does not answer', () => {
        jest.useFakeTimers();
        try {
            create();
            jest.spyOn(brokerService, 'sendMessage').mockReturnValue(NEVER);
            comp.messageSenderForm.controls.destination.setValue('TestQ');

            comp.send();
            expect(comp.isSending).toBe(true);

            jest.advanceTimersByTime(30000);
            fixture.detectChanges();

            expect(comp.isSending).toBe(false);
            const alert = fixture.nativeElement.querySelector('.alert-danger') as HTMLElement;
            expect(alert.textContent).toContain('did not answer within 30 seconds');
        } finally {
            jest.useRealTimers();
        }
    });

    it('stays on the page after sending', () => {
        create({ endpointName: 'TestQ', endpointType: 'queue', brokerType: 'artemis' });
        const back = jest.spyOn(window.history, 'back').mockImplementation(() => undefined);

        comp.send();

        expect(back).not.toHaveBeenCalled();
    });

    it('only shows the Back button when opened from an endpoint', () => {
        create();
        expect(fixture.nativeElement.textContent).not.toContain('Back');
    });

    it('offers the existing endpoints and the filled in name as options', () => {
        create({ endpointName: 'NewQ', endpointType: 'queue', brokerType: 'artemis' });

        expect(comp.endpointOptions).toEqual(['NewQ', 'A-queue', 'B-queue']);
    });

    it('passes the topic type to the backend', () => {
        create();
        comp.messageSenderForm.controls.destination.setValue('news');
        comp.body.set('hello');
        comp.setEndpointType('topic');

        comp.send();

        expect(brokerService.sendMessage).toHaveBeenCalledWith('artemis', 'news', '{}', 'hello', 'topic');
    });

    describe('upload', () => {
        const file = (content: string, name = 'messages.json') => new File([content], name);

        it('fills the body and the headers with a file of one message, JMS headers included', async () => {
            create();
            const content = JSON.stringify({ messages: { message: [{ body: '{"a":1}', headers: { color: 'red' }, jmsHeaders: { JMSType: 'order' } }] } });

            await comp.onFile(file(content));

            expect(comp.body()).toBe('{"a":1}');
            expect(comp.bodyMode()).toBe('json');
            expect(comp.headers().map(h => [h.key, h.value])).toEqual([
                ['color', 'red'],
                ['JMSType', 'order'],
            ]);
        });

        it('uses a file that is not a message file as the body and keeps the headers of the page', async () => {
            create();
            comp.headers.set([{ key: 'color', value: 'red' }]);

            await comp.onFile(file('<a/>', 'a.xml'));

            expect(comp.body()).toBe('<a/>');
            expect(comp.bodyMode()).toBe('xml');
            expect(comp.headers().map(h => h.key)).toEqual(['color']);
        });

        it('sends every message of a file with the headers of the page plus its own', async () => {
            create();
            comp.messageSenderForm.controls.destination.setValue('TestQ');
            comp.headers.set([{ key: 'page', value: 'p' }]);
            const content = JSON.stringify({
                messages: { message: [{ body: 'one', headers: { b: '1' } }, { body: 'two', jmsHeaders: { JMSType: 'order' } }] },
            });

            await comp.onFile(file(content));
            expect(comp.body()).toBe('Uploaded 2 messages from messages.json');

            comp.send();
            fixture.detectChanges();

            expect(brokerService.sendMessage).toHaveBeenCalledTimes(2);
            expect(brokerService.sendMessage).toHaveBeenNthCalledWith(1, 'artemis', 'TestQ', '{"page":"p","b":"1"}', 'one', 'queue');
            expect(brokerService.sendMessage).toHaveBeenNthCalledWith(2, 'artemis', 'TestQ', '{"page":"p","JMSType":"order"}', 'two', 'queue');
            expect((fixture.nativeElement.querySelector('.alert-success') as HTMLElement).textContent).toContain('2 messages sent');
        });

        it('sends only the body once the body of an upload is replaced', async () => {
            create();
            comp.messageSenderForm.controls.destination.setValue('TestQ');
            await comp.onFile(file(JSON.stringify({ messages: { message: [{ body: 'first' }, { body: 'second' }] } })));

            comp.body.set('typed');
            comp.send();

            expect(brokerService.sendMessage).toHaveBeenCalledTimes(1);
            expect(brokerService.sendMessage).toHaveBeenCalledWith('artemis', 'TestQ', '{}', 'typed', 'queue');
        });
    });
});
