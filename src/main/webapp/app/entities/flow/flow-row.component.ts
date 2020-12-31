import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { IFlow, Flow } from 'app/shared/model/flow.model';
import { IEndpoint, Endpoint } from 'app/shared/model/endpoint.model';

import { FlowService } from './flow.service';
import { EndpointService } from '../endpoint';
import { SecurityService } from '../security';
import { JhiEventManager } from 'ng-jhipster';
import { LoginModalService, AccountService, Account } from 'app/core';

import { Router } from '@angular/router';
import * as moment from 'moment';
import { map } from 'rxjs/operators';
import { forkJoin, Observable, Observer, Subscription } from 'rxjs';
import { NavigationEnd } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FlowDeleteDialogComponent } from 'app/entities/flow';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

enum Status {
    active = 'active',
    paused = 'paused',
    inactive = 'inactive',
    inactiveError = 'inactiveError'
}
@Component({
    selector: '[jhi-flow-row]',
    templateUrl: './flow-row.component.html'
})
export class FlowRowComponent implements OnInit, OnDestroy {
    sslUrl: any;
    mySubscription: Subscription;

    @Input() flow: Flow;
    //@Input() fromEndpoints: Endpoint[];
    @Input() isAdmin: boolean;

	endpoints: Array<Endpoint> = [new Endpoint()];
    fromEndpoint: Endpoint = new Endpoint();
    toEndpoints: Array<Endpoint> = [];
    errorEndpoint: Endpoint = new Endpoint();

    public isFlowStarted: boolean;
    public isFlowRestarted: boolean;

    public isFlowPaused: boolean;
    public isFlowResumed: boolean;

    public isFlowStopped: boolean;
    public disableActionBtns: boolean;

    public flowDetails: string;
    public flowStatus: string;
    public flowStatusError: string;
    public isFlowStatusOK: boolean;
    public flowStatistic: string;
    public flowStatusButton: string;
    public flowStartTime: any;
    public clickButton = false;

    public flowAlerts: string;
    public flowAlertsButton: string;
    public numberOfAlerts: any;
    public showNumberOfItems: number;

    fromEndpointTooltip: string;
    toEndpointsTooltips: Array<string> = [];
    errorEndpointTooltip: string;
    public statusFlow: Status;
    public previousState: string;
    public p = false;
    lastError: string;

    flowRowID: string;
    flowRowErrorEndpointID: string;

    intervalTime: any;

    stompClient = null;
    subscriber = null;
    connection: Promise<any>;
    connectedPromise: any;
    listener: Observable<any>;
    listenerObserver: Observer<any>;

    alreadyConnectedOnce = false;
    private subscription: Subscription;



    modalRef: NgbModalRef | null;

    constructor(
        private flowService: FlowService,
        private endpointService: EndpointService,
        private securityService: SecurityService,
        private loginModalService: LoginModalService,
        private modalService: NgbModal,
        private router: Router,
        private eventManager: JhiEventManager
    ) {
        this.listener = this.createListener();

        this.router.routeReuseStrategy.shouldReuseRoute = function() {
            return false;
        };

        this.mySubscription = this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                // Trick the Router into believing it's last link wasn't previously loaded
                this.router.navigated = false;
            }
        });
    }

    ngOnInit() {
        this.setFlowStatusDefaults();
        this.getStatus(this.flow.id);
        this.endpoints = this.flow.endpoints;
        this.getEndpoints();

        this.registerTriggeredAction();
    }

    ngAfterViewInit() {
        this.connection = this.flowService.connectionStomp();
        this.stompClient = this.flowService.client();
        this.subscribe('alert');
        this.subscribe('event');
        this.receive().subscribe(data => {
            const data2 = data.split(':');

            if (Array.isArray(data2) || data2.length) {
                if (data2[0] === 'event') {
                    this.setFlowStatus(data2[1]);
                } else if (data2[0] === 'alert') {
                    const alertId = Number(data2[1]);
                    if (this.flow.id === alertId) {
                        this.getFlowNumberOfAlerts(alertId);
                    }
                }
            }
        });
    }

    ngOnDestroy() {
        this.flowService.unsubscribe();
        if (this.mySubscription) {
            this.mySubscription.unsubscribe();
        }
    }

    getStatus(id: number) {
        this.clickButton = true;

        forkJoin(this.flowService.getFlowStatus(id), this.flowService.getFlowNumberOfAlerts(id)).subscribe(
            ([flowStatus, flowAlertsNumber]) => {
                if (flowStatus.body != 'unconfigured') {
                    this.setFlowStatus(flowStatus.body);
                }
                this.setFlowNumberOfAlerts(flowAlertsNumber.body);
            }
        );
    }

    setFlowStatusDefaults() {
        this.isFlowStatusOK = true;
        this.flowStatus = 'unconfigured';
        this.lastError = '';
        this.setFlowStatus(this.flowStatus);
    }

    getFlowStatus(id: number) {
        this.clickButton = true;
        this.flowService.getFlowStatus(id).subscribe(response => {
            this.setFlowStatus(response.body);
        });
    }

    setFlowStatus(status: string): void {
        switch (status) {
            case 'unconfigured':
                this.statusFlow = Status.inactive;
                this.isFlowStarted = this.isFlowPaused = false;
                this.isFlowStopped = this.isFlowRestarted = this.isFlowResumed = true;
                this.flowStatusButton = `
                            Last action: - <br/>
                            Status: Flow is stopped<br/>
            `;

                break;
            case 'started':
                this.statusFlow = Status.active;
                this.isFlowPaused = this.isFlowStopped = this.isFlowRestarted = false;
                this.isFlowStarted = this.isFlowResumed = true;
                this.flowStatusButton = `
                            Last action: Start <br/>
                            Status: Started succesfullly
                        `;

                break;
            case 'suspended':
                this.statusFlow = Status.paused;
                this.isFlowResumed = this.isFlowStopped = this.isFlowRestarted = false;
                this.isFlowPaused = this.isFlowStarted = true;
                this.flowStatusButton = `
                            Last action: Pause <br/>
                            Status:  Paused succesfully
            `;

                break;
            case 'restarted':
                this.statusFlow = Status.active;
                this.isFlowPaused = this.isFlowStopped = this.isFlowRestarted = false;
                this.isFlowResumed = this.isFlowStarted = true;
                this.flowStatusButton = `
                            Last action: Restart <br/>
                            Status:  Restarted succesfully
            `;
                break;
            case 'resumed':
                this.statusFlow = Status.active;
                this.isFlowPaused = this.isFlowStopped = this.isFlowRestarted = false;
                this.isFlowResumed = this.isFlowStarted = true;
                this.flowStatusButton = `
                            Last action: Resume <br/>
                            Status:  Resumed succesfully
            `;
                break;
            case 'stopped':
                this.statusFlow = Status.inactive;
                this.isFlowStarted = this.isFlowPaused = false;
                this.isFlowStopped = this.isFlowRestarted = this.isFlowResumed = true;
                this.flowStatusButton = `
                            Last action: Stop <br/>
                            Status: Stopped succesfully
            `;
                break;
            default:
                this.flowStatusButton = `
                            Last action: ${this.flowStatus} <br/>
                            Status: Stopped after error
              `;
                break;
        }
    }

    getFlowAlerts(id: number) {
        this.clickButton = true;
        this.flowService.getFlowAlerts(id).subscribe(response => {
            this.setFlowAlerts(response.body);
        });
    }

    setFlowAlerts(flowAlertsItems: string): void {
        if (flowAlertsItems !== null) {
            let alertStartItem;
            let alertEndItem;

            let flowAlertsList = flowAlertsItems.split(',');
            if (flowAlertsList.length < 4) {
                this.showNumberOfItems = flowAlertsList.length;
                alertStartItem = flowAlertsList.length - 1;
                alertEndItem = 0;
            } else {
                this.showNumberOfItems = 3;
                alertStartItem = flowAlertsList.length - 1;
                alertEndItem = flowAlertsList.length - 3;
            }

            let i;
            let alertItems = '';
            for (i = alertStartItem; i >= alertEndItem; i--) {
                alertItems += `<a class="list-group-item"><h5 class="mb-1">` + flowAlertsList[i] + `</h5></a>`;
            }

            this.flowAlertsButton = `<div class="list-group">` + alertItems + `</div>`;
        } else {
            this.flowAlertsButton = `Can't retrieve alert details`;
        }
    }

    getFlowNumberOfAlerts(id: number) {
        this.clickButton = true;
        this.flowService.getFlowNumberOfAlerts(id).subscribe(response => {
            this.setFlowNumberOfAlerts(response.body);
        });
    }

    setFlowNumberOfAlerts(numberOfAlerts: string): void {
        let numberOfAlerts2 = parseInt(numberOfAlerts, 10);
        if (numberOfAlerts2 === 0) {
            this.flowAlerts = `false`;
            this.numberOfAlerts = `0`;
            this.showNumberOfItems = 3;
        } else {
            this.flowAlerts = `true`;
            this.numberOfAlerts = numberOfAlerts;
            if (numberOfAlerts2 < 4) {
                this.showNumberOfItems = numberOfAlerts.length;
            } else {
                this.showNumberOfItems = 3;
            }
        }
    }

    navigateToFlow(action: string) {
        switch (action) {
            case 'edit':
                this.isAdmin
                    ? this.router.navigate(['../../flow/edit-all', this.flow.id, 'edit'])
                    : this.router.navigate(['../flow', this.flow.id]);
                break;
            case 'clone':
                this.isAdmin
                    ? this.router.navigate(['../../flow/edit-all', this.flow.id, 'clone'])
                    : this.router.navigate(['../flow', this.flow.id]);
                break;
            case 'delete':
                if (this.isAdmin) {
                    let modalRef = this.modalService.open(FlowDeleteDialogComponent as any);
                    if (typeof FlowDeleteDialogComponent as Component) {
                        modalRef.componentInstance.flow = this.flow;
                        modalRef.result.then(
                            result => {
                                this.eventManager.broadcast({ name: 'flowDeleted', content: this.flow });
                                modalRef = null;
                            },
                            reason => {
                                this.eventManager.broadcast({ name: 'flowDeleted', content: this.flow });
                                modalRef = null;
                            }
                        );
                    }
                } else {
                    this.router.navigate(['../flow', this.flow.id]);
                }

                //this.router.navigate([{ outlets: { popup: 'flow/' + this.flow.id + '/delete' } }], { replaceUrl: true, queryParamsHandling: 'merge' }) :
                //this.router.navigate(['../flow', this.flow.id]);
                break;
            default:
                break;
        }
    }

    navigateToEndpoint(endpoint: Endpoint) {
            this.isAdmin
                ? this.router.navigate(['../../flow/edit-all', this.flow.id], { queryParams: { mode: 'edit' , endpointid: endpoint.id} })
                : this.router.navigate(['../flow', this.flow.id]);
	
	}

    getFlowLastError(id: number, action: string, errMessage: string) {
        if (errMessage) {
            if (errMessage.startsWith('Full authentication is required to access this resource', 0)) {
                this.loginModalService.open();
            } else {
                this.flowStatusButton = `
                    Last action: ${action} <br/>
                    Status: Stopped after error <br/><br/>
                    ${errMessage}
                    `;
                this.statusFlow = Status.inactiveError;
            }
        } else {
            this.flowService.getFlowLastError(id).subscribe(response => {
                this.lastError = response === '0' ? '' : response.body;
                this.flowStatusButton = `
                Last action: ${action} <br/>
                Status: Stopped after error <br/><br/>
                ${this.lastError}
                `;
                this.statusFlow = Status.inactiveError;
            });
        }
    }

    getFlowStats(id: number) {

        this.flowService.getFlowStats(id, this.flow.gatewayId).subscribe(res => {
            this.setFlowStatistic(res.body);
        });

		//refresh every 5 seconds
		this.intervalTime = setInterval(() => {
            this.flowService.getFlowStats(id, this.flow.gatewayId).subscribe(res => {
                this.setFlowStatistic(res.body);
            });
        }, 5000)
    }

    stopGetFlowStats() {
        clearInterval(this.intervalTime);
    }

    getFlowDetails() {
        
        const createdFormatted = moment(this.flow.created).format("YYYY-MM-DD HH:mm:ss");
        const lastModifiedFormatted = moment(this.flow.lastModified).format("YYYY-MM-DD HH:mm:ss");
                
        this.flowDetails = `
        
                <b>ID:</b> ${this.flow.id}<br/>
                <b>Name:</b> ${this.flow.name}<br/>
                <b>Version:</b> ${this.flow.version}<br/><br/>
                <b>Created:</b> ${createdFormatted}<br/>
                <b>Last modified:</b> ${lastModifiedFormatted}<br/><br/>
                <b>Autostart:</b> ${this.flow.autoStart}<br/>
                <b>Offloading:</b> ${this.flow.offLoading}<br/><br/>
                <b>Maximum Redeliveries:</b> ${this.flow.maximumRedeliveries}<br/>
                <b>Redelivery Delay:</b> ${this.flow.redeliveryDelay}<br/>
                <b>Log Level:</b> ${this.flow.logLevel}<br/>

        `;
    }

    setFlowStatistic(res) {
        /* Example Available stats
          *
          * "maxProcessingTime": 1381,
            "lastProcessingTime": 1146,
            "meanProcessingTime": 1262,
            "lastExchangeFailureExchangeId": "",
            "firstExchangeFailureTimestamp": "1970-01-01T00:59:59.999+0100",
            "firstExchangeCompletedExchangeId": "ID-win81-1553585873482-0-1",
            "lastExchangeCompletedTimestamp": "2019-03-26T08:44:04.510+0100",
            "exchangesCompleted": 3,
            "deltaProcessingTime": -114,
            "firstExchangeCompletedTimestamp": "2019-03-26T08:44:01.955+0100",
            "externalRedeliveries": 0,
            "firstExchangeFailureExchangeId": "",
            "lastExchangeCompletedExchangeId": "ID-win81-1553585873482-0-9",
            "lastExchangeFailureTimestamp": "1970-01-01T00:59:59.999+0100",
            "exchangesFailed": 0,
            "redeliveries": 0,
            "minProcessingTime": 1146,
            "resetTimestamp": "2019-03-26T08:43:59.201+0100",
            "failuresHandled": 3,
            "totalProcessingTime": 3787,
            "startTimestamp": "2019-03-26T08:43:59.201+0100"
         */

        if (res === 0) {
            this.flowStatistic = `Currently there are no statistics for this flow.`;
        } else {
            const now = moment(new Date());
            const start = moment(res.stats.startTimestamp);
            const flowRuningTime = moment.duration(now.diff(start));
            const hours = Math.floor(flowRuningTime.asHours());
            const minutes = flowRuningTime.minutes();
            const completed = res.stats.exchangesCompleted - res.stats.failuresHandled;
            const failures = res.stats.exchangesFailed + res.stats.failuresHandled;
            let processingTime = ``;

            if (res.stats.lastProcessingTime > 0) {

                processingTime = `<tr>
			      <th scope="row">Min</th>
			      <td>${res.stats.minProcessingTime} ms</td>
			    </tr>
			    <tr>
			      <th scope="row">Max</th>
			      <td>${res.stats.maxProcessingTime} ms</td>
			    </tr>
			    <tr>
			      <th scope="row">Average</th>
			      <td>${res.stats.meanProcessingTime} ms</td>
			    </tr>`;

            }

            this.flowStatistic =
                `
			<table class="table">
			  <tbody>
			    <tr>
			      <th scope="row">Start time</th>
			      <td>${this.checkDate(res.stats.startTimestamp)}</td>
			    </tr>
			    <tr>
			      <th scope="row">Running</th>
			      <td>${hours} hours ${minutes} ${minutes > 1 ? 'minutes' : 'minute'}</td>
			    </tr>
			    <tr>
			      <th scope="row">First Message</th>
			      <td>${this.checkDate(res.stats.firstExchangeCompletedTimestamp)}</td>
			    </tr>
			    <tr>
			      <th scope="row">Last Message</th>
			      <td>${this.checkDate(res.stats.lastExchangeCompletedTimestamp)}</td>
			    </tr>` + processingTime +
              `
			    <tr>
			      <th scope="row">Completed</th>
			      <td>${completed}</td>
			    </tr>
			    <tr>
			      <th scope="row">Failed</th>
			      <td>${failures}</td>
			    </tr>
               </tbody>
			</table>`;
        }
    }

    checkDate(r) {
        if (!!r) {
            return moment(r).format('YYYY-MM-DD HH:mm:ss');
        } else {
            return '-';
        }
    }

    flowConfigurationNotObtained(id) {
        this.isFlowStatusOK = false;
        this.flowStatusError = `Configuration for flow with id=${id} is not obtained.`;
    }


    getEndpoints() {

        this.endpoints.forEach(endpoint => {

			if (endpoint.endpointType.valueOf() === 'FROM') {
                this.fromEndpoint = endpoint;
                this.fromEndpointTooltip = this.endpointTooltip(endpoint.componentType, endpoint.uri, endpoint.options);
            } else if (endpoint.endpointType.valueOf() ===  'TO') {
				this.toEndpoints.push(endpoint);	
                this.toEndpointsTooltips.push(this.endpointTooltip(endpoint.componentType, endpoint.uri, endpoint.options));
            } else if (endpoint.endpointType.valueOf() ===  'ERROR') {
	            this.errorEndpoint = endpoint;
    	        this.errorEndpointTooltip = this.endpointTooltip(endpoint.componentType, endpoint.uri, endpoint.options);
            }            	
        });
    }

    getSSLUrl(type: String, uri: String, options: String) {
        var hostname;

        switch (type) {
            case 'FTPS':
                if (uri.includes('@')) {
                    uri = uri.substring(uri.indexOf('@') + 1);
                }
                hostname = new URL('https://' + uri).hostname;
                this.sslUrl = 'https://' + hostname;
                break;
            case 'HTTPS':
                hostname = new URL('https://' + uri).hostname;
                this.sslUrl = 'https://' + hostname;
                break;
            case 'IMAPS':
                if (uri.includes('@')) {
                    uri = uri.substring(uri.indexOf('@') + 1);
                }
                hostname = new URL('https://' + uri).hostname;
                this.sslUrl = 'https://' + hostname;
                break;
            case 'KAFKA':
                if (options.includes(',')) {
                    options = options.substring(options.lastIndexOf('brokers=') + 1, options.lastIndexOf(','));
                } else {
                    options = options.substring(uri.indexOf(',') + 1);
                }
                hostname = new URL('https://' + options).hostname;
                this.sslUrl = 'https://' + hostname;
                break;
            case 'NETTY4':
                hostname = new URL('https://' + uri).hostname;
                this.sslUrl = 'https://' + hostname;
                break;
            case 'SMTPS':
                if (uri.includes('@')) {
                    uri = uri.substring(uri.indexOf('@') + 1);
                }
                hostname = new URL('https://' + uri).hostname;
                this.sslUrl = 'https://' + hostname;
                break;
            default:
                this.sslUrl = `0`;
                break;
        }

        return this.sslUrl;
    }

    endpointTooltip(type, uri, options): string {
        if (type === null) {
            return;
        }
        const opt = options === '' ? '' : `?${options}`;
        return `${type.toLowerCase()}://${uri}${opt}`;
    }

    curentDateTime(): string {
        return moment().format('YYYY-MM-DD HH:mm:ss');
    }

    registerTriggeredAction() {
        this.eventManager.subscribe('trigerAction', response => {
            switch (response.content) {
                case 'start':
                    if (this.statusFlow === Status.inactive) {
                        this.start();
                    }
                    break;
                case 'stop':
                    if (this.statusFlow === Status.active || this.statusFlow === Status.paused) {
                        this.stop();
                    }
                    break;
                case 'pause':
                    if (this.statusFlow === Status.active) {
                        this.pause();
                    }
                    break;
                case 'restart':
                    if (this.statusFlow === Status.active) {
                        this.restart();
                    }
                    break;
                case 'resume':
                    if (this.statusFlow === Status.paused) {
                        this.resume();
                    }
                    break;
                default:
                    break;
            }
        });
    }

    start() {
        this.flowStatus = 'Starting';
        this.isFlowStatusOK = true;
        this.disableActionBtns = true;

        this.flowService.getConfiguration(this.flow.id).subscribe(
            data => {
                this.flowService.setConfiguration(this.flow.id, data.body).subscribe(data2 => {
                    this.flowService.start(this.flow.id).subscribe(
                        response => {
                            if (response.status === 200) {
                                // this.setFlowStatus('started');
                            }
                            this.disableActionBtns = false;
                        },
                        err => {
                            this.getFlowLastError(this.flow.id, 'Start', err.error);
                            this.isFlowStatusOK = false;
                            this.flowStatusError = `Flow with id=${this.flow.id} is not started.`;
                            this.disableActionBtns = false;
                        }
                    );
                });
            },
            err => {
                this.getFlowLastError(this.flow.id, 'Start', err.error);
                this.isFlowStatusOK = false;
                this.flowStatusError = `Flow with id=${this.flow.id} is not started.`;
                this.flowConfigurationNotObtained(this.flow.id);
                this.disableActionBtns = false;
            }
        );
    }

    pause() {
        this.flowStatus = 'Pausing';
        this.isFlowStatusOK = true;
        this.disableActionBtns = true;
        this.flowService.pause(this.flow.id).subscribe(
            response => {
                if (response.status === 200) {
                    // this.setFlowStatus('suspended');
                }
                this.disableActionBtns = false;
            },
            err => {
                this.getFlowLastError(this.flow.id, 'Pause', err.error);
                this.isFlowStatusOK = false;
                this.flowStatusError = `Flow with id=${this.flow.id} is not paused.`;
                this.disableActionBtns = false;
            }
        );
    }

    resume() {
        this.flowStatus = 'Resuming';
        this.isFlowStatusOK = true;
        this.disableActionBtns = true;

        this.flowService.getConfiguration(this.flow.id).subscribe(
            data => {
                this.flowService.setConfiguration(this.flow.id, data.body).subscribe(data2 => {
                    this.flowService.resume(this.flow.id).subscribe(                            
                        response => {
                            if (response.status === 200) {
                                // this.setFlowStatus('resumed');
                            }
                            this.disableActionBtns = false;
                        },
                        err => {
                            this.getFlowLastError(this.flow.id, 'Resume', err.error);
                            this.isFlowStatusOK = false;
                            this.flowStatusError = `Flow with id=${this.flow.id} is not resumed.`;
                            this.disableActionBtns = false;
                        }
                    );
                });
            },
            err => {
                this.flowConfigurationNotObtained(this.flow.id);
                this.disableActionBtns = false;
            }
        );
    }

    restart() {
        this.flowStatus = 'Restarting';
        this.isFlowStatusOK = true;
        this.disableActionBtns = true;

        this.flowService.getConfiguration(this.flow.id).subscribe(
            data => {
                this.flowService.setConfiguration(this.flow.id, data.body).subscribe(data2 => {
                    this.flowService.restart(this.flow.id).subscribe(
                        response => {
                            if (response.status === 200) {
                                // this.setFlowStatus('restarted');
                            }
                            this.disableActionBtns = false;
                        },
                        err => {
                            this.getFlowLastError(this.flow.id, 'Restart', err.error);
                            this.isFlowStatusOK = false;
                            this.flowStatusError = `Flow with id=${this.flow.id} is not restarted.`;
                            this.disableActionBtns = false;
                        }
                    );
                });
            },
            err => {
                this.flowConfigurationNotObtained(this.flow.id);
                this.disableActionBtns = false;
            }
        );
    }

    stop() {
        this.flowStatus = 'Stopping';
        this.isFlowStatusOK = true;
        this.disableActionBtns = true;

        this.flowService.stop(this.flow.id).subscribe(
            response => {
                if (response.status === 200) {
                    // this.setFlowStatus('stopped');
                }
                this.disableActionBtns = false;
            },
            err => {
                this.getFlowLastError(this.flow.id, 'Stop', err.error);
                this.isFlowStatusOK = false;
                this.flowStatusError = `Flow with id=${this.flow.id} is not stopped.`;
                this.disableActionBtns = false;
            }
        );
    }

    receive() {
        return this.listener;
    }

    subscribe(type) {
        const topic = '/topic/' + this.flow.id + '/' + type;

        this.connection.then(() => {
            this.subscriber = this.stompClient.subscribe(topic, data => {
                if (!this.listenerObserver) {
                    this.listener = this.createListener();
                }
                this.listenerObserver.next(data.body);
            });
        });
    }

    unsubscribe() {
        if (this.subscriber !== null) {
            this.subscriber.unsubscribe();
        }
        this.listener = this.createListener();
    }

    private createListener(): Observable<any> {
        return new Observable(observer => {
            this.listenerObserver = observer;
        });
    }
}
