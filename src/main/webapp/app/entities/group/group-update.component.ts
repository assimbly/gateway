import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlertService } from 'app/core/util/alert.service';
import { IGroup } from 'app/shared/model/group.model';
import { GroupService } from './group.service';
import { IIntegration } from 'app/shared/model/integration.model';
import { IntegrationService } from 'app/entities/integration/integration.service';
import { UserService } from 'app/entities/user/user.service';
import { IUser } from 'app/entities/user/user.model';

@Component({
  selector: 'jhi-group-update',
  templateUrl: './group-update.component.html',
})
export class GroupUpdateComponent implements OnInit {
  group: IGroup;
  isSaving: boolean;

  integrations: IIntegration[];

  users: IUser[];

  constructor(
    protected alertService: AlertService,
    protected groupService: GroupService,
    protected integrationService: IntegrationService,
    protected userService: UserService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.isSaving = false;
    this.activatedRoute.data.subscribe(({ group }) => {
      this.group = group;
    });
    this.integrationService.query().subscribe(
      (res: HttpResponse<IIntegration[]>) => {
        this.integrations = res.body;
      },
      (res: HttpErrorResponse) => this.onError(res.message)
    );
    this.userService.query().subscribe(
      (res: HttpResponse<IUser[]>) => {
        this.users = res.body;
      },
      (res: HttpErrorResponse) => this.onError(res.message)
    );
  }

  previousState() {
    window.history.back();
  }

  save() {
    this.isSaving = true;
    if (this.group.id !== undefined) {
      this.subscribeToSaveResponse(this.groupService.update(this.group));
    } else {
      this.subscribeToSaveResponse(this.groupService.create(this.group));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IGroup>>) {
    result.subscribe(
      (res: HttpResponse<IGroup>) => this.onSaveSuccess(),
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
	this.alertService.addAlert({
	  type: 'danger',
	  message: errorMessage,
	});
  }

  trackIntegrationById(index: number, item: IIntegration) {
    return item.id;
  }

  trackUserById(index: number, item: IUser) {
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
