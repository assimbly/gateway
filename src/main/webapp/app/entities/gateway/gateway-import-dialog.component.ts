import { Component, OnInit, OnDestroy, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { GatewayService } from './gateway.service';
import { IGateway } from 'app/shared/model/gateway.model';
import { GatewayPopupService } from 'app/entities/gateway/gateway-popup.service';

@Component({
    selector: 'jhi-gateway-import-dialog',
    templateUrl: './gateway-import-dialog.component.html'
})
export class GatewayImportDialogComponent implements AfterContentInit {
    gatewayId: number;
    gateways: Array<IGateway> = [];
    xmlConfiguration: any;
    fileName = 'Choose file';
    importError = false;

    constructor(private eventManager: EventManager, private gatewayService: GatewayService, public activeModal: NgbActiveModal) {}

    ngAfterContentInit() {
        this.gatewayService.query().subscribe(res => {
            this.gateways = res.body;
            this.gatewayId = this.gateways[0].id;
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
        this.gatewayService.setGatewayConfiguration(this.gatewayId, this.xmlConfiguration).subscribe(
            data => {
                this.importError = false;
                this.activeModal.dismiss(true);
			    this.eventManager.broadcast(new EventWithContent('gatewayListModification', 'OK'));
            },
            err => {
                this.importError = true;
                console.log(err);
            }
        );
    }
}