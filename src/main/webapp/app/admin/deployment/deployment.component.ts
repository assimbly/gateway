import { Component, OnInit } from '@angular/core';
import { IGateway } from 'app/shared/model/gateway.model';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { Router } from '@angular/router';
import { DeploymentService } from 'app/admin';
import { GatewayService } from 'app/entities/gateway';

@Component({
    selector: 'deployment',
    templateUrl: './deployment.component.html'
})
export class DeploymentComponent implements OnInit {
    gateways: IGateway[] = [];
    constructor(
        protected deploymentService: DeploymentService,
        private router: Router,
        protected eventManager: JhiEventManager,
        protected gatewayService: GatewayService,
        protected jhiAlertService: JhiAlertService
    ) {}

    ngOnInit(): void {}

    downloadConfiguration() {
        this.router.navigate(['/', { outlets: { popup: ['export'] } }]);

        // this.deploymentService.exportGatewayConfiguration();
    }

    uploadConfiguration() {
        this.router.navigate(['/', { outlets: { popup: ['import'] } }]);
    }
}
