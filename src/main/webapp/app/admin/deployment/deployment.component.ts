import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { IIntegration } from 'app/shared/model/integration.model';
import { Router } from '@angular/router';
import { DeploymentService } from 'app/admin/deployment/deployment.service';
import { IntegrationService } from 'app/entities/integration/integration.service';
import { IntegrationPopupService } from 'app/entities/integration/integration-popup.service';
import { IntegrationExportDialogComponent } from 'app/entities/integration/integration-export-dialog.component';
import { IntegrationImportDialogComponent } from 'app/entities/integration/integration-import-dialog.component';

import { Flow, IFlow } from 'app/shared/model/flow.model';
import { FlowService } from 'app/entities/flow/flow.service';

@Component({
  selector: 'deployment',
  templateUrl: './deployment.component.html',
})
export class DeploymentComponent implements OnInit {
  integrations: IIntegration[] = [];
  flows: IFlow[];
  frequencies: String[] = ['Never', 'Daily', 'Weekly', 'Monthly'];
  selectedFrequency: String = 'Never';
  integrationId: number = null;
  url: String;
  constructor(
    private router: Router,
    protected integrationService: IntegrationService,
	protected integrationPopupService: IntegrationPopupService,
    protected flowService: FlowService
  ) {}

  ngOnInit(): void {
    this.loadAllIntegrations();
  }

  updateBackupFrequency(frequency, url) {
    this.integrationService.updateBackupFrequency(frequency, url).subscribe(res => {
      console.log(res);
    });
  }

  loadAllIntegrations() {
    this.integrationService.query().subscribe((res: HttpResponse<IIntegration[]>) => {
      this.integrations = res.body;
    });
  }

  exportFlowConfiguration(flow) {
    this.flowService.exportFlowConfiguration(flow);
  }

  getFlowsForSelectedIntegration(event) {
    let id = (event.target as HTMLSelectElement).value as string;
    this.flowService.getFlowByIntegrationId(Number(id)).subscribe((res: HttpResponse<IFlow[]>) => {
      this.flows = res.body;
    });
  }

  downloadConfiguration() {
    this.integrationPopupService.open(IntegrationExportDialogComponent as Component);
  }

  uploadConfiguration() {
	  this.integrationPopupService.open(IntegrationImportDialogComponent as Component);
  }
}
