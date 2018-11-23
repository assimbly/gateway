import { Component, OnInit, OnDestroy, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { GatewayPopupService } from './gateway-popup.service';
import { GatewayService } from './gateway.service';
import { Gateway } from './gateway.model';

@Component({
    selector: 'jhi-gateway-import-dialog',
    templateUrl: './gateway-import-dialog.component.html'
})
export class GatewayImportDialogComponent implements AfterContentInit {

    gatewayId: number;
    gateways: Array<Gateway> = [];
    xmlConfiguration: any;
    fileName = 'Choose file';
    importError = false;

    constructor(
        private gatewayService: GatewayService,
        public activeModal: NgbActiveModal
    ) {
    }

    ngAfterContentInit() {
        this.gatewayService.query().subscribe((res) => {
            this.gateways = res.json;
            this.gatewayId = this.gateways[0].id;
        });
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    openFile(event) {
        let reader = new FileReader();
        reader.onload = () => {
            this.xmlConfiguration = reader.result;
        }
        reader.readAsBinaryString(event.target.files[0]);
        this.fileName = event.target.files[0].name;
    }

    importConfiguration() {
        this.gatewayService.setGatewayConfiguration(this.gatewayId, this.xmlConfiguration)
            .subscribe(
            (r) => {
                this.activeModal.dismiss(true);
            },
            (err) => {
                this.importError = true;
                console.log(err)
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
        private route: ActivatedRoute,
        private gatewayPopupService: GatewayPopupService
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
