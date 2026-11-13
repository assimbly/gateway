import { Component, OnInit, OnDestroy, TemplateRef, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';
import { NgbDropdownModule, NgbModal, NgbModalRef, NgbModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule } from '@angular/router';
import { EmptyState } from 'app/shared/empty-state';
import { SearchToolbar } from 'app/shared/filter';
import { SortState } from 'app/shared/sort';
import {
    DataTable,
    DataTableColumn,
    OverflowActionDirective,
    PrimaryActionDirective,
    RowActions,
    StatusControls,
    StatusControlsTone,
    Truncate,
    sortRows,
} from 'app/shared/table';

import { IBroker } from 'app/shared/model/broker.model';
import { AccountService } from 'app/core/auth/account.service';
import { BrokerService } from './broker.service';
import { BrokerDeleteDialogComponent } from './broker-delete-dialog.component';

/** The answers of the Broker's status, start and restart calls when it runs. */
const STARTED_STATUSES = ['started', 'started with errors', 'restarted'];
/** The statuses of a Broker that is not running; any other answer is an error message. */
const STOPPED_STATUSES = ['unconfigured', 'stopped'];

@Component({
    selector: 'jhi-broker',
    templateUrl: './broker.component.html',
    imports: [
        CommonModule,
        RouterModule,
        FontAwesomeModule,
        NgbModule,
        NgbDropdownModule,
        NgbPopoverModule,
        EmptyState,
        SearchToolbar,
        DataTable,
        RowActions,
        PrimaryActionDirective,
        OverflowActionDirective,
        StatusControls,
        Truncate,
    ],
})
export class BrokerComponent implements OnInit, OnDestroy {
    readonly brokers = signal<IBroker[]>([]);
    readonly brokersLoading = signal(true);
    readonly brokersLoadFailed = signal(false);
    broker!: IBroker;
    readonly searchText = signal('');
    readonly sortState = signal<SortState>({ predicate: 'name', order: 'asc' });
    readonly columns: DataTableColumn[] = [
        { key: 'name', header: 'Name', sortable: true },
        { key: 'status', header: 'Status' },
        { key: 'consumers', header: 'Consumers', numeric: true },
        { key: 'messages', header: 'Messages', numeric: true },
        { key: 'stats', header: 'Stats' },
        { key: 'actions', header: 'Actions', align: 'end' },
    ];
    readonly totalConsumers = signal<number | null>(null);
    readonly totalMessages = signal<number | null>(null);
    modalRef: NgbModalRef | null = null;

    currentAccount: any;
    eventSubscriber!: Subscription;

    /** What the Broker last said about its state, such as 'started' or 'stopped', or the error it gave instead. */
    readonly status = signal('unconfigured');
    readonly isBrokerStarted = computed(() => STARTED_STATUSES.includes(this.status()));
    readonly statusTone = computed<StatusControlsTone>(() => {
        const status = this.status();
        if (status === 'started with errors' || (!this.isBrokerStarted() && !STOPPED_STATUSES.includes(status))) {
            return 'failed';
        }
        return this.isBrokerStarted() ? 'started' : 'default';
    });

    readonly disableActionBtns = signal(false);

    readonly brokerDetails = signal('');
    readonly brokerInfo = signal('');

    constructor(
        protected brokerService: BrokerService,
        protected alertService: AlertService,
        protected eventManager: EventManager,
        protected accountService: AccountService,
		protected modalService: NgbModal,
    ) {}

    ngOnInit() {
        this.loadAll();

        this.accountService.identity().subscribe(account => {
            this.currentAccount = account;
        });

        this.registerChangeInBrokers();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    loadAll() {
        this.brokersLoading.set(true);
        this.brokersLoadFailed.set(false);
        this.brokerService.query().subscribe(
            (res: HttpResponse<IBroker[]>) => {
                const brokers = res.body ?? [];
                this.brokers.set(brokers);
                this.brokersLoading.set(false);

                if (brokers[0]) {
                    this.broker = brokers[0];
                    this.getbrokerStatus(this.broker.id!);
                    this.getBrokerInfo(this.broker.id!);
                } else {
                    this.setbrokerStatus('unconfigured');
                }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    getbrokerStatus(id: number) {
        this.brokerService.getBrokerStatus(id, this.broker.type!).subscribe(response => {
            this.setbrokerStatus(response.body!);
        });
    }

    setbrokerStatus(status: string): void {
        this.status.set(status);
    }

    getBrokerInfo(id: number) {
        this.brokerService.getBrokerInfo(id, this.broker.type!).subscribe(res => {
            this.setBrokerInfo(res.body!);
        });
    }

    setBrokerInfo(info: String) {
        this.totalConsumers.set(null);
        this.totalMessages.set(null);
        if (info.startsWith('no info')) {
            this.brokerInfo.set(`Currently there are no statistics for this flow.`);
        } else {
            const infoSplitted = info.split(',');

            const uptime = infoSplitted[0].split('=').pop();
            const totalConnections = infoSplitted[1].split('=').pop();
            const totalConsumers = infoSplitted[2].split('=').pop();
            const totalMessages = infoSplitted[3].split('=').pop();
            const nodeId = infoSplitted[4].split('=').pop();
            const state = infoSplitted[5].split('=').pop();
            const version = infoSplitted[6].split('=')[1];
            const type = infoSplitted[7].split('=')[1];

            this.totalConsumers.set(totalConsumers ? Number(totalConsumers) : null);
            this.totalMessages.set(totalMessages ? Number(totalMessages) : null);

            this.brokerInfo.set(`
               <br/>
               <b>Broker type:</b> ${type}<br/>
               <b>Broker version:</b> ${version}<br/>
               <b>Broker Node ID:</b> ${nodeId}<br/>
               <br/>
               <b>Broker state:</b> ${state}<br/>
               <b>Broker uptime:</b> ${uptime}<br/>
               <br/>
               <b>Total Connections:</b> ${totalConnections}<br/>
               <b>Total Consumers:</b> ${totalConsumers}<br/>
               <b>Total Messages:</b> ${totalMessages}<br/>`);
        }
    }

	delete(broker: IBroker): void {
		const modalRef = this.modalService.open(BrokerDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
		modalRef.componentInstance.broker = broker;
		// unsubscribe not needed because closed completes on modal close
		modalRef.closed.subscribe(reason => {
		  if (reason === 'deleted') {
			this.loadAll();
		  }
		});
	}

    start() {
        this.disableActionBtns.set(true);

        this.brokerService.start(this.broker.id!, this.broker.type!, this.broker.configurationType!).subscribe(
            response => {
                if (response.status === 200) {
                    this.setbrokerStatus(response.body!);
                }
                this.disableActionBtns.set(false);
            },
            err => {
                // this.getFlowLastError(this.broker.id, 'Start', err.error);
                this.disableActionBtns.set(false);
                this.setbrokerStatus(err.body);
            }
        );
    }

    restart() {
        this.disableActionBtns.set(true);

        this.brokerService.restart(this.broker.id!, this.broker.type!, this.broker.configurationType!).subscribe(
            response => {
                if (response.status === 200) {
                    if (response.body === 'started') {
                        this.setbrokerStatus('restarted');
                    } else {
                        this.setbrokerStatus(response.body!);
                    }
                }
                this.disableActionBtns.set(false);
            },
            err => {
                // this.getFlowLastError(this.broker.id, 'Restart', err.error);
                this.disableActionBtns.set(false);
                this.setbrokerStatus(err.body);
            }
        );
    }

    stop() {
        this.disableActionBtns.set(true);

        this.brokerService.stop(this.broker.id!, this.broker.type!, this.broker.configurationType!).subscribe(
            response => {
                if (response.status === 200) {
                    this.setbrokerStatus(response.body!);
                }
                this.disableActionBtns.set(false);
            },
            err => {
                // this.getFlowLastError(this.broker.id, 'Stop', err.error);
                this.disableActionBtns.set(false);
            }
        );
    }

    getBrokerDetails() {
        this.brokerDetails.set(`

                <b>ID:</b> ${this.broker.id}<br/>
                <b>Name:</b> ${this.broker.name}<br/>
                <b>Type:</b> ${this.broker.type}<br/>
                <b>Autostart:</b> ${this.broker.autoStart}<br/>
                <b>Configuration Type:</b> ${this.broker.configurationType}<br/>
        `);
    }

    openInfoModal(templateRef: TemplateRef<any>) {
        this.getBrokerDetails();
        this.modalRef = this.modalService.open(templateRef);
    }

    cancelModal(): void {
        if (this.modalRef) {
            this.modalRef.dismiss();
            this.modalRef = null;
        } else {
            this.modalService.dismissAll();
        }
    }

    formatMetric(value: number | null): string {
        return value == null || Number.isNaN(value) ? '—' : String(value);
    }

    /** With no Broker at all, the list gives way to an explanation of Brokers and how to add the first. */
    readonly showEmptyState = computed(() => !this.brokersLoading() && !this.brokersLoadFailed() && !this.brokers().length);

    readonly filteredBrokers = computed(() => {
        const query = this.searchText().toLocaleLowerCase();
        let result = this.brokers();
        if (query) {
            result = result.filter(item => (item.name ?? '').toLocaleLowerCase().includes(query));
        }
        return sortRows(result, this.sortState(), { name: broker => broker.name });
    });

    trackId(index: number, item: IBroker) {
        return item.id;
    }

    registerChangeInBrokers() {
        this.eventSubscriber = this.eventManager.subscribe('brokerListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.brokersLoading.set(false);
        this.brokersLoadFailed.set(true);
   		this.alertService.addAlert({
		  type: 'danger',
		  message: errorMessage,
		});
    }
}
