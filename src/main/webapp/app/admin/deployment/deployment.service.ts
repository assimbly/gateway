import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FlowService } from 'app/entities/flow';
import { GatewayService } from 'app/entities/gateway';
import { IGateway } from 'app/shared/model/gateway.model';

@Injectable()
export class DeploymentService {
    constructor(protected http: HttpClient, protected flowService: FlowService, protected gatewayService: GatewayService) {}

    exportGatewayConfiguration(gateway: IGateway) {
        this.flowService.exportGatewayConfiguration(gateway);
    }
}
