import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { FlowService } from 'app/entities/flow';
import { GatewayService } from 'app/entities/gateway';
import { IGateway } from 'app/shared/model/gateway.model';
import { SERVER_API_URL } from 'app/app.constants';

@Injectable()
export class DeploymentService {
    public connectorUrl = SERVER_API_URL + 'api/connector';

    constructor(protected http: HttpClient, protected flowService: FlowService, protected gatewayService: GatewayService) {}

    exportGatewayConfiguration(gateway: IGateway) {
        this.flowService.exportGatewayConfiguration(gateway);
    }

    updateBackupFrequency(connectorId, frequency) {
        const options = {
            headers: new HttpHeaders({ observe: 'response', 'Content-Type': 'application/xml', Accept: 'application/json' })
        };
        return this.http.post(`${this.connectorUrl}/${connectorId}/updatebackup`, frequency, options);
    }
}
