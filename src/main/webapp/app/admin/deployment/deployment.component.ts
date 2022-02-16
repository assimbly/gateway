import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { IGateway } from 'app/shared/model/gateway.model';
import { Router } from '@angular/router';
import { DeploymentService } from 'app/admin/deployment/deployment.service';
import { GatewayService } from 'app/entities/gateway/gateway.service';
import { Flow, IFlow } from 'app/shared/model/flow.model';
import { FlowService } from 'app/entities/flow/flow.service';

@Component({
  selector: 'deployment',
  templateUrl: './deployment.component.html',
})
export class DeploymentComponent implements OnInit {
  gateways: IGateway[] = [];
  flows: IFlow[];
  frequencies: String[] = ['Never', 'Daily', 'Weekly', 'Monthly'];
  selectedFrequency: String = 'Never';
  gatewayId: number = null;
  url: String;
  constructor(
    private router: Router,
    protected gatewayService: GatewayService,
    protected flowService: FlowService
  ) {}

  ngOnInit(): void {
    this.loadAllGateways();
  }

  updateBackupFrequency(gatewayId, frequency, url) {
    this.gatewayService.updateBackupFrequency(gatewayId, frequency, url).subscribe(res => {
      console.log(res);
    });
  }

  loadAllGateways() {
    this.gatewayService.query().subscribe((res: HttpResponse<IGateway[]>) => {
      this.gateways = res.body;
    });
  }

  exportFlowConfiguration(flow) {
    this.flowService.exportFlowConfiguration(flow);
  }

  getFlowsForSelectedGateway(event) {
    let id = (event.target as HTMLSelectElement).value as string;
    this.flowService.getFlowByGatewayId(Number(id)).subscribe((res: HttpResponse<IFlow[]>) => {
      this.flows = res.body;
    });
  }

  downloadConfiguration() {
    this.router.navigate(['/', { outlets: { popup: ['export'] } }]);
  }

  uploadConfiguration() {
    this.router.navigate(['/', { outlets: { popup: ['import'] } }]);
  }
}
