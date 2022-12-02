import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IFlow, Flow } from 'app/shared/model/flow.model';
import { Step } from 'app/shared/model/step.model';
import { Gateway } from 'app/shared/model/gateway.model';

import { FlowService } from './flow.service';
import { StepService } from '../step/step.service';
import { GatewayService } from 'app/entities/gateway/gateway.service';
import { forkJoin } from 'rxjs';

import { Components } from 'app/shared/camel/component-type';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'jhi-flow-detail',
  templateUrl: './flow-detail.component.html',
})
export class FlowDetailComponent implements OnInit {
  flow: IFlow;
  gateway: Gateway;
  steps: Array<Step>;

  // typesLinks: Array<TypeLinks>;

  fromTypeAssimblyLink: string;
  fromTypeCamelLink: string;
  componentTypeAssimblyLinks: Array<string> = [];
  componentTypeCamelLinks: Array<string> = [];
  errorTypeAssimblyLink: string;
  errorTypeCamelLink: string;

  private subscription: Subscription;
  private eventSubscriber: Subscription;
  private wikiDocUrl: string;
  private camelDocUrl: string;

  constructor(
    protected gatewayService: GatewayService,
    protected stepService: StepService,
    protected eventManager: EventManager,
    protected flowService: FlowService,
    protected activatedRoute: ActivatedRoute,
    public components: Components
  ) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ flow }) => {
      this.flow = flow;
    });
  }

  load(id) {
    forkJoin([this.flowService.getWikiDocUrl(), this.flowService.getCamelDocUrl()]).subscribe(results => {
      this.wikiDocUrl = results[0].url;
      this.camelDocUrl = results[1].url;
    });

    this.flowService.find(id).subscribe(flow => {
      this.flow = flow.body;
      this.getGateway(flow.body.gatewayId);
      this.getStepByFlowId(flow.body.id);
    });
  }

  getGateway(id) {
    if (!id) {
      return;
    }

    this.gatewayService.find(id).subscribe(gateway => (this.gateway = gateway.body));
  }

  getStepByFlowId(id) {
    if (!id) {
      return;
    }

    this.stepService.findByFlowId(id).subscribe(steps => {
      this.steps = steps.body;
      this.steps.forEach(step => {
        this.setTypeLinks(step);
      });
    });
  }

  previousState() {
    window.history.back();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.eventManager.destroy(this.eventSubscriber);
  }

  registerChangeInFlows() {
    this.eventSubscriber = this.eventManager.subscribe('flowListModification', response => this.load(this.flow.id));
  }

  private setTypeLinks(step: any) {
    let type;
    let componentType;
    let camelComponentType;

    componentType = step.componentType.toString();
    camelComponentType = this.components.getCamelComponentType(componentType);
    type = this.components.types.find(x => x.name === step.componentType.toString());

    this.componentTypeAssimblyLinks[this.steps.indexOf(step)] = this.wikiDocUrl + '/component-' + componentType;
    this.componentTypeCamelLinks[this.steps.indexOf(step)] = this.camelDocUrl + '/' + camelComponentType + '-component.html';
  }
}
