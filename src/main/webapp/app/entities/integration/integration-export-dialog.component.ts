import { Component, OnInit, OnDestroy, AfterContentInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertError } from 'app/shared/alert';
import { IntegrationService } from './integration.service';
import { IIntegration } from 'app/shared/model/integration.model';
import { IntegrationPopupService } from 'app/entities/integration/integration-popup.service';
import { DeploymentService } from 'app/admin/deployment/deployment.service';

@Component({
    selector: 'jhi-integration-export-dialog',
    templateUrl: './integration-export-dialog.component.html',
    imports: [FormsModule, AlertError],
})
export class IntegrationExportDialogComponent implements AfterContentInit {
    private integrationService = inject(IntegrationService);
    activeModal = inject(NgbActiveModal);
    protected deploymentService = inject(DeploymentService);

    integrationId: number;
    integrations: Array<IIntegration> = [];
    xmlConfiguration: any;
    fileName = 'Choose file';
    exportError = false;

    ngAfterContentInit() {
        this.integrationService.query().subscribe(res => {
            this.integrations = res.body;
            this.integrationId = this.integrations[0].id;
        });
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    exportConfiguration(integrations: IIntegration[], integrationId: number) {
        this.deploymentService.exportIntegrationConfiguration(integrations.find(i => i.id === integrationId));
        this.activeModal.dismiss(true);
    }
}
