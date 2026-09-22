import { ChangeDetectorRef, Component, OnInit, OnDestroy, TemplateRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';
import { NgbDropdownModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HasAnyAuthorityDirective } from 'app/shared/auth';
import { SearchToolbar } from 'app/shared/filter';
import { SortState } from 'app/shared/sort';
import { DataTable, DataTableColumn, OverflowActionDirective, PrimaryActionDirective, RowActions, Truncate } from 'app/shared/table';
import { IIntegration } from 'app/shared/model/integration.model';
import { IntegrationDeleteDialogComponent } from './integration-delete-dialog.component';
import { AccountService } from 'app/core/auth/account.service';
import { IntegrationService } from './integration.service';
import { FlowService } from '../flow/flow.service';

@Component({
    selector: 'jhi-integration',
    templateUrl: './integration.component.html',
    imports: [
        CommonModule,
        RouterModule,
        FontAwesomeModule,
        NgbDropdownModule,
        HasAnyAuthorityDirective,
        SearchToolbar,
        DataTable,
        RowActions,
        PrimaryActionDirective,
        OverflowActionDirective,
        Truncate,
    ],
})
export class IntegrationComponent implements OnInit, OnDestroy {
    readonly integrations = signal<IIntegration[]>([]);
    currentAccount: any;
    eventSubscriber: Subscription;
    restartIntegrationMessage: string;
    modalRef: NgbModalRef | null;
    searchText = '';
    infoIntegration: IIntegration | null = null;
    sortState: SortState = { predicate: 'name', order: 'asc' };
    readonly columns: DataTableColumn[] = [
        { key: 'name', header: 'Name', sortable: true },
        { key: 'type', header: 'Type', sortable: true },
        { key: 'stage', header: 'Stage', sortable: true },
        { key: 'actions', header: 'Actions', align: 'end' },
    ];

    constructor(
        protected flowService: FlowService,
        protected integrationService: IntegrationService,
        protected alertService: AlertService,
        protected eventManager: EventManager,
        protected accountService: AccountService,
        private router: Router,
        private modalService: NgbModal,
        private changeDetector: ChangeDetectorRef
    ) {}

    loadAll() {
        this.integrationService.query().subscribe(
            (res: HttpResponse<IIntegration[]>) => {
                this.integrations.set(res.body ?? []);
                this.changeDetector.detectChanges();
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().subscribe(account => {
            this.currentAccount = account;
        });
        this.registerChangeInIntegrations();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IIntegration) {
        return item.id;
    }

    get filteredIntegrations(): IIntegration[] {
        const query = this.searchText?.toLocaleLowerCase() ?? '';
        let result = [...(this.integrations() ?? [])];
        const { predicate, order } = this.sortState;
        const direction = order === 'asc' ? 1 : -1;
        result.sort((a, b) => {
            const left = String((a as any)[predicate ?? 'name'] ?? '').toLocaleLowerCase();
            const right = String((b as any)[predicate ?? 'name'] ?? '').toLocaleLowerCase();
            return left < right ? -1 * direction : direction;
        });
        if (query) {
            result = result.filter(item => (item.name ?? '').toLocaleLowerCase().includes(query));
        }
        return result;
    }

    registerChangeInIntegrations() {
        this.eventSubscriber = this.eventManager.subscribe('integrationListModification', response => this.loadAll());
    }

	delete(integration: IIntegration): void {
		const modalRef = this.modalService.open(IntegrationDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
		modalRef.componentInstance.integration = integration;
		// unsubscribe not needed because closed completes on modal close
		modalRef.closed.subscribe(reason => {
		  if (reason === 'deleted') {
			this.loadAll();
		  }
		});
	}

    openModal(templateRef: TemplateRef<any>) {
        this.modalRef = this.modalService.open(templateRef);
    }

    openRestartIntegrationModal(templateRef: TemplateRef<any>) {
        this.restartIntegrationMessage = '';
        this.modalRef = this.modalService.open(templateRef);
    }

    openInfoModal(templateRef: TemplateRef<any>, integration: IIntegration) {
        this.infoIntegration = integration;
        this.modalRef = this.modalService.open(templateRef);
    }

    cancelModal(): void {
        if (this.modalRef) {
            this.modalRef.dismiss();
            this.modalRef = null;
        }
    }

    restartIntegration(index: number) {
        this.integrationService.stop(index).subscribe(
            (res: HttpResponse<string>) => {
                this.startIntegration(index);
            },
            (res: HttpErrorResponse) => {
                this.restartIntegrationMessage = 'Assimbly Integration failed to stop: ' + res.message;
                this.onError(res.message);
            }
        );
    }

    startIntegration(index: number) {
        this.integrationService.start(index).subscribe(
            (res: HttpResponse<string>) => {
                this.restartIntegrationMessage = 'Assimbly Integration is (re)started successful';
            },
            (res: HttpErrorResponse) => {
                this.restartIntegrationMessage = 'Assimbly Integration failed to start: ' + res.message;
                this.onError(res.message);
            }
        );
    }

    protected onError(errorMessage: string) {
        this.alertService.addAlert({
		  type: 'danger',
		  message: errorMessage,
		});
    }

    reset() {
        this.integrations.set([]);
        this.loadAll();
    }
}
