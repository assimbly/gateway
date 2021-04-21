import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from 'app/shared/shared.module';
import { RouteComponent } from './route.component';
import { RouteDetailComponent } from './route-detail.component';
import { RouteUpdateComponent } from './route-update.component';
import { RouteDeleteDialogComponent } from './route-delete-dialog.component';
import { routeRoute } from './route.route';

@NgModule({
    imports: [GatewaySharedModule, RouterModule.forChild(routeRoute)],
    declarations: [RouteComponent, RouteDetailComponent, RouteUpdateComponent, RouteDeleteDialogComponent],
    entryComponents: [RouteDeleteDialogComponent]
})
export class GatewayRouteModule {}
