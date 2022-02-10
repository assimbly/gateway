import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'app/shared/shared.module';
import { RouteComponent } from './route.component';
import { RouteDetailComponent } from './route-detail.component';
import { RouteUpdateComponent } from './route-update.component';
import { RouteDeleteDialogComponent, RouteDeletePopupComponent } from './route-delete-dialog.component';
import { routeRoute } from './route.route';
import { RoutePopupService } from 'app/entities/route/route-popup.service';
import { RouteService } from 'app/entities/route/route.service';
import { RouteDialogComponent, RoutePopupComponent } from 'app/entities/route/route-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ForbiddenRouteNamesValidatorDirective } from 'app/entities/route/route-validation.directive';

@NgModule({
  imports: [SharedModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routeRoute)],
  declarations: [
    RouteComponent,
    RouteDetailComponent,
    RouteUpdateComponent,
    RouteDeleteDialogComponent,
    RouteDialogComponent,
    RoutePopupComponent,
    RouteDeletePopupComponent,
    ForbiddenRouteNamesValidatorDirective,
  ],
  entryComponents: [
    RouteComponent,
    RouteDialogComponent,
    RouteUpdateComponent,
    RoutePopupComponent,
    RouteDeleteDialogComponent,
    RouteDeletePopupComponent,
  ],
  providers: [RouteService, RoutePopupService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GatewayRouteModule {}
