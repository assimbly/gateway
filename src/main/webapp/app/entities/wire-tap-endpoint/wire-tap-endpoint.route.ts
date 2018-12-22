import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { WireTapEndpoint } from 'app/shared/model/wire-tap-endpoint.model';
import { WireTapEndpointService } from './wire-tap-endpoint.service';
import { WireTapEndpointComponent } from './wire-tap-endpoint.component';
import { WireTapEndpointDetailComponent } from './wire-tap-endpoint-detail.component';
import { WireTapEndpointPopupComponent } from './wire-tap-endpoint-dialog.component';
import { WireTapEndpointEditComponent } from './wire-tap-endpoint-edit.component';
import { WireTapEndpointUpdateComponent } from './wire-tap-endpoint-update.component';
import { WireTapEndpointDeletePopupComponent } from './wire-tap-endpoint-delete-dialog.component';
import { IWireTapEndpoint } from 'app/shared/model/wire-tap-endpoint.model';

@Injectable({ providedIn: 'root' })
export class WireTapEndpointResolve implements Resolve<IWireTapEndpoint> {
    constructor(private service: WireTapEndpointService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<WireTapEndpoint> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.find(id).pipe(
                filter((response: HttpResponse<WireTapEndpoint>) => response.ok),
                map((wireTapEndpoint: HttpResponse<WireTapEndpoint>) => wireTapEndpoint.body)
            );
        }
        return of(new WireTapEndpoint());
    }
}

export const wireTapEndpointRoute: Routes = [
    {
        path: 'wire-tap-endpoint',
        component: WireTapEndpointComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'WireTapEndpoints'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'wire-tap-endpoint/:id/view',
        component: WireTapEndpointDetailComponent,
        resolve: {
            wireTapEndpoint: WireTapEndpointResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'WireTapEndpoints'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'wire-tap-endpoint-create',
        component: WireTapEndpointEditComponent,
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'WireTapEndpoints'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'wire-tap-endpoint-edit/:id',
        component: WireTapEndpointEditComponent,
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'WireTapEndpoints'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const wireTapEndpointPopupRoute: Routes = [
    {
        path: 'wire-tap-endpoint/new',
        component: WireTapEndpointUpdateComponent,
        resolve: {
            wireTapEndpoint: WireTapEndpointResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'WireTapEndpoints'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'wire-tap-endpoint/:id/edit',
        component: WireTapEndpointUpdateComponent,
        resolve: {
            wireTapEndpoint: WireTapEndpointResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'WireTapEndpoints'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'wire-tap-endpoint/:id/delete',
        component: WireTapEndpointDeletePopupComponent,
        resolve: {
            wireTapEndpoint: WireTapEndpointResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'WireTapEndpoints'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }

];