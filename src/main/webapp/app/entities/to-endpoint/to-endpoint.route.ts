import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { ToEndpoint, IToEndpoint } from 'app/shared/model/to-endpoint.model';
import { ToEndpointService } from './to-endpoint.service';
import { ToEndpointComponent } from './to-endpoint.component';
import { ToEndpointDetailComponent } from './to-endpoint-detail.component';
import { ToEndpointUpdateComponent } from './to-endpoint-update.component';
import { ToEndpointDeletePopupComponent } from './to-endpoint-delete-dialog.component';

@Injectable({ providedIn: 'root' })
export class ToEndpointResolve implements Resolve<IToEndpoint> {
    constructor(private service: ToEndpointService) {}
    
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IToEndpoint> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.find(id).pipe(
                map((response: IToEndpoint) => response)
            );
        }
        return of(new ToEndpoint());
    }
    
}

export const toEndpointRoute: Routes = [
    {
        path: 'to-endpoint',
        component: ToEndpointComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'ToEndpoints'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'to-endpoint/:id/view',
        component: ToEndpointDetailComponent,
        resolve: {
            toEndpoint: ToEndpointResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'ToEndpoints'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'to-endpoint/new',
        component: ToEndpointUpdateComponent,
        resolve: {
            toEndpoint: ToEndpointResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'ToEndpoints'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'to-endpoint/:id/edit',
        component: ToEndpointUpdateComponent,
        resolve: {
            toEndpoint: ToEndpointResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'ToEndpoints'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const toEndpointPopupRoute: Routes = [
    {
        path: 'to-endpoint/:id/delete',
        component: ToEndpointDeletePopupComponent,
        resolve: {
            toEndpoint: ToEndpointResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'ToEndpoints'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
