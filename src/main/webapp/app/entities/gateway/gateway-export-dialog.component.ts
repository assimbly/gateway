import { Component, OnInit, OnDestroy, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';
import { GatewayService } from './gateway.service';
import { IGateway } from 'app/shared/model/gateway.model';
import { GatewayPopupService } from 'app/entities/gateway';
import { DeploymentService } from 'app/admin';

@Component({
    selector: 'jhi-gateway-export-dialog',
    templateUrl: './gateway-export-dialog.component.html'
})
export class GatewayExportDialogComponent implements AfterContentInit {
    gatewayId: number;
    gateways: Array<IGateway> = [];
    xmlConfiguration: any;
    fileName = 'Choose file';
    importError = false;

    constructor(
        private eventManager: JhiEventManager,
        private gatewayService: GatewayService,
        public activeModal: NgbActiveModal,
        protected deploymentService: DeploymentService
    ) {}

    ngAfterContentInit() {
        this.gatewayService.query().subscribe(res => {
            this.gateways = res.body;
            this.gatewayId = this.gateways[0].id;
        });
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    selectFolder(event) {
        const reader = new FileReader();
        reader.onload = () => {
            this.xmlConfiguration = reader.result;
        };
        reader.readAsBinaryString(event.target.files[0]);
        this.fileName = event.target.files[0].name;
    }

    exportConfiguration(gateways: IGateway[], gatewayId: number) {
        console.log(gateways);
        this.deploymentService.exportGatewayConfiguration(gateways.find(i => i.id === gatewayId));
        console.log(gateways.find(i => i.id === gatewayId));
    }
}

@Component({
    selector: 'jhi-gateway-export-popup',
    template: ''
})
export class GatewayExportPopupComponent implements OnInit, OnDestroy {
    routeSub: any;

    constructor(protected route: ActivatedRoute, protected gatewayPopupService: GatewayPopupService) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(() => {
            this.gatewayPopupService.open(GatewayExportDialogComponent as Component);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
