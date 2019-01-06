import { Component, OnInit, OnDestroy, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { GatewayService } from './gateway.service';
import { IGateway } from 'app/shared/model/gateway.model';
import { GatewayPopupService } from "app/entities/gateway";

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

    constructor(
        private eventManager: JhiEventManager,    
        private gatewayService: GatewayService,
        public activeModal: NgbActiveModal
    ) {
    }

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
            r => {
                this.importError = false;
                this.eventManager.broadcast({ name: 'gatewayListModification', content: 'OK' });
                this.activeModal.dismiss(true);
            },
            err => {
                this.importError = true;
                console.log(err);
            }
            );
    }
}

@Component({
    selector: 'jhi-gateway-import-popup',
    template: ''
})
export class GatewayImportPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        protected route: ActivatedRoute,
        protected gatewayPopupService: GatewayPopupService
    ) { }

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(() => {
            this.gatewayPopupService
                .open(GatewayImportDialogComponent as Component);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
