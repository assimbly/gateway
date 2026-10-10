import { provideHttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { provideTranslateService } from '@ngx-translate/core';

import { fontAwesomeIcons } from 'app/config/font-awesome-icons';
import { ConnectionService } from 'app/entities/connection/connection.service';
import { StepService } from 'app/entities/step/step.service';

import { FlowService } from '../flow.service';
import { FlowMessageSenderComponent } from './flow-message-sender.component';

// jsdom cannot measure text, which CodeMirror needs to draw the body
Range.prototype.getBoundingClientRect = () => ({ x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }) as DOMRect;
Range.prototype.getClientRects = () => ({ length: 0, item: () => null, [Symbol.iterator]: [][Symbol.iterator] }) as unknown as DOMRectList;

describe('FlowMessageSenderComponent', () => {
    let fixture: ComponentFixture<FlowMessageSenderComponent>;
    let comp: FlowMessageSenderComponent;
    let flowService: FlowService;
    let connectionService: ConnectionService;

    const ok = (body: unknown, status = 200) => of(new HttpResponse({ body, status })) as any;

    function create(queryParams: Record<string, string> = {}): void {
        TestBed.configureTestingModule({
            providers: [
                provideTranslateService(),
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } } },
            ],
        });
        TestBed.inject(FaIconLibrary).addIcons(...fontAwesomeIcons);

        flowService = TestBed.inject(FlowService);
        connectionService = TestBed.inject(ConnectionService);
        const stepService = TestBed.inject(StepService);

        jest.spyOn(flowService, 'getCamelDocUrl').mockReturnValue(ok('https://camel'));
        jest.spyOn(flowService, 'getComponentOptions').mockReturnValue(
            ok({
                properties: {
                    fileName: { displayName: 'File name', description: 'Name of the file' },
                    charset: { displayName: 'Charset', description: 'The charset', defaultValue: 'UTF-8' },
                },
            })
        );
        jest.spyOn(flowService, 'find').mockReturnValue(
            ok({
                steps: [{ stepType: 'SOURCE', componentType: 'file', uri: 'tmp/in', options: 'fileName=a.txt&noop=true' }],
            })
        );
        jest.spyOn(flowService, 'send').mockReturnValue(ok('sent'));
        jest.spyOn(flowService, 'sendRequest').mockReturnValue(ok('reply'));
        jest.spyOn(connectionService, 'getAllConnections').mockReturnValue(ok([{ id: 1, name: 'broker', type: 'ActiveMQ' }]));
        jest.spyOn(connectionService, 'getConnectionKeys').mockReturnValue(ok({ url: 'tcp://localhost' }));
        jest.spyOn(stepService, 'query').mockReturnValue(
            ok([
                { componentType: 'file', uri: 'tmp/out' },
                { componentType: 'file', uri: 'tmp/out' },
                { componentType: 'jms', uri: 'queue:orders' },
            ])
        );

        fixture = TestBed.createComponent(FlowMessageSenderComponent);
        comp = fixture.componentInstance;
        fixture.detectChanges();
    }

    const form = () => comp.messageSenderForm.controls;

    it('starts with the file component and offers the paths that are in use by that component', () => {
        create();

        expect(comp.finished).toBe(true);
        expect(form().componentType.value).toBe('file');
        expect(comp.URIList).toEqual(['tmp/out']);
        expect(comp.openedFromFlow).toBe(false);
        expect(comp.componentOptions.map(o => o.name)).toEqual(['charset', 'fileName']);
    });

    it('has no Cancel button and one Send button at the top', () => {
        create();

        const labels = Array.from(fixture.nativeElement.querySelectorAll('button')).map(b => (b as HTMLElement).textContent?.trim());
        expect(labels).not.toContain('Cancel');
        expect(fixture.nativeElement.querySelectorAll('button.btn-fx-primary')).toHaveLength(1);
        expect(fixture.nativeElement.querySelector('jhi-send-toolbar button.btn-fx-primary')).not.toBeNull();
    });

    it('does not send without a path', () => {
        create();

        comp.send();

        expect(flowService.sendRequest).not.toHaveBeenCalled();
        expect(flowService.send).not.toHaveBeenCalled();
        expect(form().uri.touched).toBe(true);
    });

    it('sends with request and reply by default, with the options in the uri, and shows the response', () => {
        create();
        form().uri.setValue('tmp/out');
        comp.options.at(0).patchValue({ key: 'fileName', value: 'a.txt' });
        comp.body.set('hello');

        comp.send();
        fixture.detectChanges();

        expect(flowService.sendRequest).toHaveBeenCalledWith(1, 'file://tmp/out?fileName=a.txt', '0', '', '', '', 'hello');
        expect(comp.response()).toEqual(expect.objectContaining({ ok: true, status: 200, body: 'reply' }));
        expect((fixture.nativeElement.querySelector('.alert-success') as HTMLElement).textContent).toContain('to file://tmp/out');
    });

    it('sends with fire and forget without showing a response', () => {
        create();
        form().uri.setValue('tmp/out');
        form().exchangepattern.setValue('FireAndForget');
        comp.body.set('hello');

        comp.send();

        expect(flowService.send).toHaveBeenCalledWith(1, 'file://tmp/out', '0', '', '', '', '1', 'hello');
        expect(flowService.sendRequest).not.toHaveBeenCalled();
        expect(comp.response()).toBeNull();
    });

    it('sends the headers of the page in the same format as a stored template', () => {
        create();
        form().uri.setValue('tmp/out');
        comp.headers.set([
            { key: 'color', value: 'red', type: 'header', language: 'constant' },
            { key: 'step', value: '1', type: 'property', language: 'constant' },
            { key: '', value: 'ignored' },
        ]);

        comp.send();

        expect((flowService.sendRequest as jest.Mock).mock.calls[0][5]).toBe('{"color":"header(red)","step":"property(1)"}');
    });

    it('shows the error as response and in the banner when sending fails', () => {
        create();
        jest.spyOn(flowService, 'sendRequest').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500, error: 'No route' })));
        form().uri.setValue('tmp/out');

        comp.send();
        fixture.detectChanges();

        expect(comp.response()).toEqual(expect.objectContaining({ ok: false, status: 500, body: 'No route' }));
        const alert = fixture.nativeElement.querySelector('.alert-danger') as HTMLElement;
        expect(alert.textContent).toContain('Sending failed');
        expect(alert.textContent).toContain('No route');
    });

    it('pre-fills the endpoint of the source of the flow and offers Back', () => {
        create({ flowId: '5' });

        expect(flowService.find).toHaveBeenCalledWith(5);
        expect(comp.openedFromFlow).toBe(true);
        expect(form().componentType.value).toBe('file');
        expect(form().uri.value).toBe('tmp/in');
        expect(comp.options.controls.map(o => [o.get('key')?.value, o.get('value')?.value])).toEqual([
            ['fileName', 'a.txt'],
            ['noop', 'true'],
        ]);
        // the option that the component does not know can still be shown
        expect(comp.componentOptions.map(o => o.name)).toContain('noop');
        expect(fixture.nativeElement.textContent).toContain('Back');
    });

    it('requires a connection for a component that needs one, and sends its keys', () => {
        create();
        comp.setComponentType('activemq');
        form().uri.setValue('queue:orders');

        expect(comp.enableConnection).toBe(true);
        expect(comp.filterConnection.map(c => c.name)).toEqual(['broker']);

        comp.send();
        expect(flowService.sendRequest).not.toHaveBeenCalled();
        expect(form().connection.touched).toBe(true);

        form().connection.setValue(1);
        comp.send();

        expect(connectionService.getConnectionKeys).toHaveBeenCalledWith(1);
        expect(flowService.sendRequest).toHaveBeenCalledWith(1, 'activemq://queue:orders', '0', '1', '{"url":"tcp://localhost"}', '', '');
    });

    it('does not ask for a connection for a component that has none', () => {
        create();

        expect(comp.enableConnection).toBe(false);
        expect(form().connection.disabled).toBe(true);
    });

    describe('upload', () => {
        const file = (content: string, name = 'messages.json') => new File([content], name);

        it('sends every message of a file one after the other, with the headers of the page plus its own', async () => {
            create();
            form().uri.setValue('tmp/out');
            comp.headers.set([{ key: 'page', value: 'p' }]);
            const content = JSON.stringify({
                messages: { message: [{ body: 'one', headers: { b: '1' } }, { body: 'two' }] },
            });

            await comp.onFile(file(content));
            comp.send();
            fixture.detectChanges();

            const calls = (flowService.sendRequest as jest.Mock).mock.calls;
            expect(calls).toHaveLength(2);
            expect(calls[0][5]).toBe('{"page":"header(p)","b":"header(1)"}');
            expect(calls[0][6]).toBe('one');
            expect(calls[1][5]).toBe('{"page":"header(p)"}');
            expect(calls[1][6]).toBe('two');
            expect((fixture.nativeElement.querySelector('.alert-success') as HTMLElement).textContent).toContain('2 messages sent');
        });

        it('fills the body with a file that holds one message', async () => {
            create();

            await comp.onFile(file('<a/>', 'a.xml'));

            expect(comp.body()).toBe('<a/>');
            expect(comp.bodyMode()).toBe('xml');
        });
    });
});
