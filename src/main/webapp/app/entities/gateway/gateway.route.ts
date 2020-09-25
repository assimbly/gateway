import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Gateway } from 'app/shared/model/gateway.model';
import { GatewayService } from './gateway.service';
import { GatewayComponent } from './gateway.component';
import { GatewayDetailComponent } from './gateway-detail.component';
import { GatewayUpdateComponent } from './gateway-update.component';
import { GatewayDeletePopupComponent } from './gateway-delete-dialog.component';
import { IGateway } from 'app/shared/model/gateway.model';
import { GatewayImportPopupComponent } from 'app/entities/gateway';
import { GatewayExportPopupComponent } from 'app/entities/gateway/gateway-export-dialog.component';

@Injectable({ providedIn: 'root' })
export class GatewayResolve implements Resolve<IGateway> {
    constructor(private service: GatewayService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Gateway> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.find(id).pipe(
                filter((response: HttpResponse<Gateway>) => response.ok),
                map((gateway: HttpResponse<Gateway>) => gateway.body)
            );
        }
        return of(new Gateway());
    }
}

export const gatewayRoute: Routes = [
    {
        path: 'gateway',
        component: GatewayComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Gateways'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'gateway/:id/view',
        component: GatewayDetailComponent,
        resolve: {
            gateway: GatewayResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Gateways'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'gateway/new',
        component: GatewayUpdateComponent,
        resolve: {
            gateway: GatewayResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Gateways'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'gateway/:id/edit',
        component: GatewayUpdateComponent,
        resolve: {
            gateway: GatewayResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Gateways'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const gatewayPopupRoute: Routes = [
    {
        path: 'gateway/:id/delete',
        component: GatewayDeletePopupComponent,
        resolve: {
            gateway: GatewayResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Gateways'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'import',
        component: GatewayImportPopupComponent,
        resolve: {
            gateway: GatewayResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Gateways'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'export',
        component: GatewayExportPopupComponent,
        resolve: {
            gateway: GatewayResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Gateways'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
