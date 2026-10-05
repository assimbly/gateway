import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SortState, sortParams } from 'app/shared/sort';
import { HasAnyAuthorityDirective } from 'app/shared/auth';
import { SearchToolbar } from 'app/shared/filter';
import { DataTable, DataTableColumn, OverflowActionDirective, RowActions, Truncate } from 'app/shared/table';

import { IEnvironmentVariables } from 'app/shared/model/environment-variables.model';
import { EnvironmentVariablesDeleteDialogComponent } from './environment-variables-delete-dialog.component';
import { AccountService } from 'app/core/auth/account.service';
import { EnvironmentVariablesService } from './environment-variables.service';

@Component({
    selector: 'jhi-environment-variables',
    templateUrl: './environment-variables.component.html',
    imports: [
        CommonModule,
        RouterModule,
        FontAwesomeModule,
        NgbDropdownModule,
        HasAnyAuthorityDirective,
        SearchToolbar,
        DataTable,
        RowActions,
        OverflowActionDirective,
        Truncate,
    ],
})
export class EnvironmentVariablesComponent implements OnInit, OnDestroy {
    environmentVariables: IEnvironmentVariables[] = [];
    currentAccount: any;
    eventSubscriber: Subscription;
    searchText = '';

    sortState: SortState = { predicate: 'key', order: 'asc' };
    page: any;
    last: any = 100;
    private loadRequest = 0;
    readonly columns: DataTableColumn[] = [
        { key: 'key', header: 'Key', sortable: true },
        { key: 'value', header: 'Value' },
        { key: 'actions', header: 'Actions', align: 'end' },
    ];

    constructor(
        protected environmentVariablesService: EnvironmentVariablesService,
        protected alertService: AlertService,
        protected eventManager: EventManager,
    		protected modalService: NgbModal,
        protected accountService: AccountService,
        protected cdr: ChangeDetectorRef
    ) {
        this.page = 0;
    }

    loadAll() {
        const requestId = ++this.loadRequest;
        this.environmentVariablesService
            .query({
                page: this.page,
                sort: this.sort()
            })
            .subscribe(
                (res: HttpResponse<IEnvironmentVariables[]>) => {
                    if (requestId !== this.loadRequest) {
                        return;
                    }
                    const body = res.body || [];
                    if (this.page > 0) {
                        this.environmentVariables = [...this.environmentVariables, ...body];
                    } else {
                        this.environmentVariables = body;
                    }

                    if (body.length < 20) {
                        this.last = this.page;
                    }
                    this.cdr.detectChanges();
                },
                (res: HttpErrorResponse) => this.onError(res.message)
            );
    }

    loadPage(page: number) {
        this.page = page;
        this.loadAll();
    }

    ngOnInit() {
        this.accountService.identity().subscribe(account => {
            this.currentAccount = account;
        });
        this.loadAll();
        this.registerChangeInEnvironmentVariables();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    get filteredVariables(): IEnvironmentVariables[] {
        const query = this.searchText?.toLocaleLowerCase() ?? '';
        let result = this.environmentVariables ?? [];
        if (query) {
            result = result.filter(
                item => (item.key ?? '').toLocaleLowerCase().includes(query) || (item.value ?? '').toLocaleLowerCase().includes(query)
            );
        }
        return result;
    }

    trackId(index: number, item: IEnvironmentVariables) {
        return item.id;
    }

    registerChangeInEnvironmentVariables() {
        this.eventSubscriber = this.eventManager.subscribe('environmentVariablesListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
		this.alertService.addAlert({
		  type: 'danger',
		  message: errorMessage,
		});
    }

	delete(environmentVariables: IEnvironmentVariables): void {
		const modalRef = this.modalService.open(EnvironmentVariablesDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
		modalRef.componentInstance.environmentVariables = environmentVariables;
		modalRef.closed.subscribe(result => {
			if (result === 'deleted') {
				this.environmentVariables = this.environmentVariables.filter(item => item.id !== environmentVariables.id);
				this.reset();
			}
		});
	}

    sort(): string[] {
        return sortParams(this.sortState, 'key');
    }

    reset() {
        this.page = 0;
        this.environmentVariables = [];
        this.loadAll();
    }

    onSortChange() {
        this.reset();
    }
}
