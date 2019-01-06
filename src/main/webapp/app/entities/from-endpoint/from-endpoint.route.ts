import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { FromEndpoint } from 'app/shared/model/from-endpoint.model';
import { FromEndpointService } from './from-endpoint.service';
import { FromEndpointComponent } from './from-endpoint.component';
import { FromEndpointDetailComponent } from './from-endpoint-detail.component';
import { FromEndpointUpdateComponent } from './from-endpoint-update.component';
import { FromEndpointDeletePopupComponent } from './from-endpoint-delete-dialog.component';
import { IFromEndpoint } from 'app/shared/model/from-endpoint.model';

@Injectable({ providedIn: 'root' })
export class FromEndpointResolve implements Resolve<IFromEndpoint> {
    constructor(private service: FromEndpointService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FromEndpoint> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.find(id).pipe(
                filter((response: HttpResponse<FromEndpoint>) => response.ok),
                map((fromEndpoint: HttpResponse<FromEndpoint>) => fromEndpoint.body)
            );
        }
        return of(new FromEndpoint());
    }
}

export const fromEndpointRoute: Routes = [
    {
        path: 'from-endpoint',
        component: FromEndpointComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'FromEndpoints'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'from-endpoint/:id/view',
        component: FromEndpointDetailComponent,
        resolve: {
            fromEndpoint: FromEndpointResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'FromEndpoints'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'from-endpoint/new',
        component: FromEndpointUpdateComponent,
        resolve: {
            fromEndpoint: FromEndpointResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'FromEndpoints'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'from-endpoint/:id/edit',
        component: FromEndpointUpdateComponent,
        resolve: {
            fromEndpoint: FromEndpointResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'FromEndpoints'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const fromEndpointPopupRoute: Routes = [
    {
        path: 'from-endpoint/:id/delete',
        component: FromEndpointDeletePopupComponent,
        resolve: {
            fromEndpoint: FromEndpointResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'FromEndpoints'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
