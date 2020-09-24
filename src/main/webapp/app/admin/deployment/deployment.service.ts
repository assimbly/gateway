import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FlowService } from 'app/entities/flow';
import { GatewayService } from 'app/entities/gateway';

@Injectable()
export class DeploymentService {
    constructor(protected http: HttpClient, protected flowService: FlowService, protected gatewayService: GatewayService) {}

    exportGatewayConfiguration() {
        // TODO: GET CORRECT GATEWAY
        // this.flowService.exportGatewayConfiguration(gateway);
    }
}
