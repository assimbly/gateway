import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
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
import { EmptyState } from 'app/shared/empty-state';
import { SearchToolbar } from 'app/shared/filter';
import { DataTable, DataTableColumn, OverflowActionDirective, PrimaryActionDirective, RowActions, Truncate } from 'app/shared/table';

import { IEnvironmentVariables } from 'app/shared/model/environment-variables.model';
import { EnvironmentVariablesDeleteDialogComponent } from './environment-variables-delete-dialog.component';
import { AccountService } from 'app/core/auth/account.service';
import { variableRef } from 'app/shared/camel/variables';
import { EnvironmentVariablesService } from './environment-variables.service';
import { VariableKeysService } from './variable-keys.service';

@Component({
    selector: 'jhi-environment-variables',
    templateUrl: './environment-variables.component.html',
    imports: [
        CommonModule,
        RouterModule,
        FontAwesomeModule,
        NgbDropdownModule,
        HasAnyAuthorityDirective,
        EmptyState,
        SearchToolbar,
        DataTable,
        RowActions,
        PrimaryActionDirective,
        OverflowActionDirective,
        Truncate,
    ],
})
export class EnvironmentVariablesComponent implements OnInit, OnDestroy {
    readonly environmentVariables = signal<IEnvironmentVariables[]>([]);
    currentAccount: any;
    eventSubscriber!: Subscription;
    readonly searchText = signal('');
    readonly loading = signal(true);
    readonly loadFailed = signal(false);

    readonly sortState = signal<SortState>({ predicate: 'key', order: 'asc' });
    page: any;
    last: any = 100;
    private loadRequest = 0;
    readonly columns: DataTableColumn[] = [
        { key: 'key', header: 'Key', sortable: true },
        { key: 'value', header: 'Value', sortable: true },
        { key: 'reference', header: 'Use in a Flow as' },
        { key: 'actions', header: 'Actions', align: 'end' },
    ];

    constructor(
        protected environmentVariablesService: EnvironmentVariablesService,
        protected alertService: AlertService,
        protected eventManager: EventManager,
    		protected modalService: NgbModal,
        protected accountService: AccountService,
    ) {
        this.page = 0;
    }

    private readonly variableKeys = inject(VariableKeysService);

    /** The key whose reference was just copied, to show that it was. */
    readonly copiedKey = signal<string | undefined>(undefined);

    /** How a Flow refers to the Variable. */
    reference(key: string | undefined): string {
        return variableRef(key ?? '');
    }

    copyReference(key: string | undefined): void {
        navigator.clipboard?.writeText(this.reference(key)).then(
            () => {
                this.copiedKey.set(key);
                setTimeout(() => {
                    if (this.copiedKey() === key) {
                        this.copiedKey.set(undefined);
                    }
                }, 2000);
            },
            () => this.alertService.addAlert({ type: 'warning', message: `Couldn't copy. Select ${this.reference(key)} and copy it yourself.` }),
        );
    }

    loadAll() {
        const requestId = ++this.loadRequest;
        this.loading.set(true);
        this.loadFailed.set(false);
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
                        this.environmentVariables.update(variables => [...variables, ...body]);
                    } else {
                        this.environmentVariables.set(body);
                    }

                    if (body.length < 20) {
                        this.last = this.page;
                    }
                    this.loading.set(false);
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

    get isAdmin(): boolean {
        return this.accountService.hasAnyAuthority('ROLE_ADMIN');
    }

    /** With no Variable at all, the list gives way to an explanation of Variables and how to add the first. */
    readonly showEmptyState = computed(() => !this.loading() && !this.loadFailed() && !this.environmentVariables().length);

    readonly filteredVariables = computed(() => {
        const query = this.searchText().toLocaleLowerCase();
        let result = this.environmentVariables();
        if (query) {
            result = result.filter(
                item => (item.key ?? '').toLocaleLowerCase().includes(query) || (item.value ?? '').toLocaleLowerCase().includes(query)
            );
        }
        return result;
    });

    trackId(index: number, item: IEnvironmentVariables) {
        return item.id;
    }

    registerChangeInEnvironmentVariables() {
        this.eventSubscriber = this.eventManager.subscribe('environmentVariablesListModification', response => {
            this.loadAll();
            this.variableKeys.refresh();
        });
    }

    protected onError(errorMessage: string) {
        this.loading.set(false);
        this.loadFailed.set(true);
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
				this.environmentVariables.update(variables => variables.filter(item => item.id !== environmentVariables.id));
				this.reset();
			}
		});
	}

    sort(): string[] {
        return sortParams(this.sortState(), 'key');
    }

    reset() {
        this.page = 0;
        this.environmentVariables.set([]);
        this.loadAll();
    }

    onSortChange() {
        this.reset();
    }
}
