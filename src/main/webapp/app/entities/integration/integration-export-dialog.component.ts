import { Component, OnInit, OnDestroy, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IntegrationService } from './integration.service';
import { IIntegration } from 'app/shared/model/integration.model';
import { IntegrationPopupService } from 'app/entities/integration/integration-popup.service';
import { DeploymentService } from 'app/admin/deployment/deployment.service';

@Component({
    standalone: false,
    selector: 'jhi-integration-export-dialog',
    templateUrl: './integration-export-dialog.component.html'
})
export class IntegrationExportDialogComponent implements AfterContentInit {
    integrationId: number;
    integrations: Array<IIntegration> = [];
    xmlConfiguration: any;
    fileName = 'Choose file';
    exportError = false;

    constructor(
        private integrationService: IntegrationService,
        public activeModal: NgbActiveModal,
        protected deploymentService: DeploymentService
    ) {}

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
