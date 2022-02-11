import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import moment from 'moment';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { JhiAlertService } from 'ng-jhipster';

import { IMaintenance } from 'app/shared/model/maintenance.model';
import { MaintenanceService } from './maintenance.service';
import { IFlow } from 'app/shared/model/flow.model';
import { FlowService } from 'app/entities/flow/flow.service';

@Component({
  selector: 'jhi-maintenance-update',
  templateUrl: './maintenance-update.component.html',
})
export class MaintenanceUpdateComponent implements OnInit {
  maintenance: IMaintenance;
  isSaving: boolean;

  flows: IFlow[];
  startTime: string;
  endTime: string;
  duration: string;

  constructor(
    protected jhiAlertService: JhiAlertService,
    protected maintenanceService: MaintenanceService,
    protected flowService: FlowService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.isSaving = false;
    this.activatedRoute.data.subscribe(({ maintenance }) => {
      this.maintenance = maintenance;
      this.startTime = this.maintenance.startTime != null ? this.maintenance.startTime.format(DATE_TIME_FORMAT) : null;
      this.endTime = this.maintenance.endTime != null ? this.maintenance.endTime.format(DATE_TIME_FORMAT) : null;
      this.duration = this.maintenance.duration != null ? this.maintenance.duration.format(DATE_TIME_FORMAT) : null;
    });
    this.flowService.query({ filter: 'maintenance-is-null' }).subscribe(
      (res: HttpResponse<IFlow[]>) => {
        if (!this.maintenance.flowId) {
          this.flows = res.body;
        } else {
          this.flowService.find(this.maintenance.flowId).subscribe(
            (subRes: HttpResponse<IFlow>) => {
              this.flows = [subRes.body].concat(res.body);
            },
            (subRes: HttpErrorResponse) => this.onError(subRes.message)
          );
        }
      },
      (res: HttpErrorResponse) => this.onError(res.message)
    );
  }

  previousState() {
    window.history.back();
  }

  save() {
    this.isSaving = true;
    this.maintenance.startTime = this.startTime != null ? moment(this.startTime, DATE_TIME_FORMAT) : null;
    this.maintenance.endTime = this.endTime != null ? moment(this.endTime, DATE_TIME_FORMAT) : null;
    this.maintenance.duration = this.duration != null ? moment(this.duration, DATE_TIME_FORMAT) : null;
    if (this.maintenance.id !== undefined) {
      this.subscribeToSaveResponse(this.maintenanceService.update(this.maintenance));
    } else {
      this.subscribeToSaveResponse(this.maintenanceService.create(this.maintenance));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IMaintenance>>) {
    result.subscribe(
      (res: HttpResponse<IMaintenance>) => this.onSaveSuccess(),
      (res: HttpErrorResponse) => this.onSaveError()
    );
  }

  protected onSaveSuccess() {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError() {
    this.isSaving = false;
  }

  protected onError(errorMessage: string) {
    this.jhiAlertService.error(errorMessage, null, null);
  }

  trackFlowById(index: number, item: IFlow) {
    return item.id;
  }

  getSelected(selectedVals: Array<any>, option: any) {
    if (selectedVals) {
      for (let i = 0; i < selectedVals.length; i++) {
        if (option.id === selectedVals[i].id) {
          return selectedVals[i];
        }
      }
    }
    return option;
  }
}
