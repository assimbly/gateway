import { Component, OnInit, OnDestroy, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { IntegrationService } from './integration.service';
import { IIntegration } from 'app/shared/model/integration.model';
import { IntegrationPopupService } from 'app/entities/integration/integration-popup.service';

@Component({
    selector: 'jhi-integration-import-dialog',
    templateUrl: './integration-import-dialog.component.html'
})
export class IntegrationImportDialogComponent implements AfterContentInit {
    integrationId: number;
    integrations: Array<IIntegration> = [];
    xmlConfiguration: any;
    fileName = 'Choose file';
    importError = false;

    constructor(private eventManager: EventManager, private integrationService: IntegrationService, public activeModal: NgbActiveModal) {}

    ngAfterContentInit() {
        this.integrationService.query().subscribe(res => {
            this.integrations = res.body;
            this.integrationId = this.integrations[0].id;
        });
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    openFile(event) {
        const reader = new FileReader();
        reader.onload = () => {
            this.xmlConfiguration = reader.result;
        };
        reader.readAsBinaryString(event.target.files[0]);
        this.fileName = event.target.files[0].name;
    }

    importConfiguration() {
        this.integrationService.setIntegrationConfiguration(this.integrationId, this.xmlConfiguration).subscribe(
            data => {
                this.importError = false;
                this.activeModal.dismiss(true);
			    this.eventManager.broadcast(new EventWithContent('integrationListModification', 'OK'));
            },
            err => {
                this.importError = true;
                console.log(err);
            }
        );
    }
}
