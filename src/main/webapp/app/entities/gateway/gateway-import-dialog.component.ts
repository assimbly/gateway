import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { GatewayPopupService } from './gateway-popup.service';
import { GatewayService } from './gateway.service';

@Component({
    selector: 'jhi-gateway-import-dialog',
    templateUrl: './gateway-import-dialog.component.html'
})
export class GatewayImportDialogComponent {

    gatewayId: number;
    xmlConfiguration: any;
    fileName = 'Choose file';

    constructor(
        private gatewayService: GatewayService,
        public activeModal: NgbActiveModal
    ) {
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
            .subscribe((r) => {
                this.activeModal.dismiss(true);
            });
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
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            this.gatewayPopupService
                .open(GatewayImportDialogComponent as Component, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
