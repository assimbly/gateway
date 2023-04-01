import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { FlowService } from 'app/entities/flow/flow.service';
import { IntegrationService } from 'app/entities/integration/integration.service';
import { IIntegration } from 'app/shared/model/integration.model';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from 'app/core/config/application-config.service';


@Injectable()
export class DeploymentService {
    constructor(protected http: HttpClient, protected flowService: FlowService, protected integrationService: IntegrationService, private applicationConfigService: ApplicationConfigService) {}

    exportIntegrationConfiguration(integration: IIntegration) {
        return this.flowService.exportIntegrationConfiguration(integration);
    }
}
