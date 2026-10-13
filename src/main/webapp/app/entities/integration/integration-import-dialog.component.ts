import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AlertService } from 'app/core/util/alert.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { IIntegration } from 'app/shared/model/integration.model';
import { readText } from 'app/entities/import/import-files';

import { IntegrationService } from './integration.service';

/** Imports a Gateway backup: the complete configuration of an integration, as exported from a Gateway. */
@Component({
    selector: 'jhi-integration-import-dialog',
    templateUrl: './integration-import-dialog.component.html',
    imports: [FormsModule, FontAwesomeModule],
})
export class IntegrationImportDialogComponent implements OnInit {
    readonly integrations = signal<IIntegration[]>([]);
    readonly fileName = signal<string | undefined>(undefined);
    readonly importing = signal(false);
    readonly error = signal<string | undefined>(undefined);

    integrationId?: number;
    xmlConfiguration = '';

    readonly activeModal = inject(NgbActiveModal);
    private readonly integrationService = inject(IntegrationService);
    private readonly eventManager = inject(EventManager);
    private readonly alertService = inject(AlertService);

    ngOnInit(): void {
        this.integrationService.query().subscribe(res => {
            const integrations = res.body ?? [];
            this.integrations.set(integrations);
            this.integrationId = integrations[0]?.id;
        });
    }

    clear(): void {
        this.activeModal.dismiss('cancel');
    }

    async openFile(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        input.value = '';
        if (!file) {
            return;
        }
        this.error.set(undefined);
        try {
            this.xmlConfiguration = await readText(file);
            this.fileName.set(file.name);
        } catch {
            this.xmlConfiguration = '';
            this.fileName.set(undefined);
            this.error.set(`Couldn't read ${file.name}.`);
        }
    }

    importConfiguration(): void {
        if (this.integrationId == null) {
            return;
        }
        this.importing.set(true);
        this.error.set(undefined);
        this.integrationService.setIntegrationConfiguration(this.integrationId, this.xmlConfiguration).subscribe({
            next: () => {
                this.importing.set(false);
                this.alertService.addAlert({ type: 'success', message: `Imported ${this.fileName() ?? 'the configuration'}` });
                this.eventManager.broadcast(new EventWithContent('integrationListModification', 'OK'));
                this.eventManager.broadcast(new EventWithContent('flowListModification', 'imported'));
                this.activeModal.close(true);
            },
            error: (err: HttpErrorResponse) => {
                this.importing.set(false);
                this.error.set(`Couldn't import ${this.fileName() ?? 'the configuration'}: ${failureMessage(err)}`);
            },
        });
    }
}

/** The reason the Gateway gives for refusing the configuration: the message of its JSON response. */
function failureMessage(err: HttpErrorResponse): string {
    const body = err.error;
    if (body && typeof body === 'object' && typeof body.message === 'string' && body.message) {
        return body.message;
    }
    if (typeof body === 'string' && body.trim()) {
        return body;
    }
    return 'That did not work. Please try again.';
}
