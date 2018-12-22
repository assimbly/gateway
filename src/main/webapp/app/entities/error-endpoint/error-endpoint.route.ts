import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ErrorEndpoint } from 'app/shared/model/error-endpoint.model';
import { ErrorEndpointService } from './error-endpoint.service';
import { ErrorEndpointComponent } from './error-endpoint.component';
import { ErrorEndpointDetailComponent } from './error-endpoint-detail.component';
import { ErrorEndpointUpdateComponent } from './error-endpoint-update.component';
import { ErrorEndpointDeletePopupComponent } from './error-endpoint-delete-dialog.component';
import { IErrorEndpoint } from 'app/shared/model/error-endpoint.model';

@Injectable({ providedIn: 'root' })
export class ErrorEndpointResolve implements Resolve<IErrorEndpoint> {
    constructor(private service: ErrorEndpointService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ErrorEndpoint> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.find(id).pipe(
                filter((response: HttpResponse<ErrorEndpoint>) => response.ok),
                map((errorEndpoint: HttpResponse<ErrorEndpoint>) => errorEndpoint.body)
            );
        }
        return of(new ErrorEndpoint());
    }
}

export const errorEndpointRoute: Routes = [
    {
        path: 'error-endpoint',
        component: ErrorEndpointComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'ErrorEndpoints'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'error-endpoint/:id/view',
        component: ErrorEndpointDetailComponent,
        resolve: {
            errorEndpoint: ErrorEndpointResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'ErrorEndpoints'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'error-endpoint/new',
        component: ErrorEndpointUpdateComponent,
        resolve: {
            errorEndpoint: ErrorEndpointResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'ErrorEndpoints'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'error-endpoint/:id/edit',
        component: ErrorEndpointUpdateComponent,
        resolve: {
            errorEndpoint: ErrorEndpointResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'ErrorEndpoints'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const errorEndpointPopupRoute: Routes = [
    {
        path: 'error-endpoint/:id/delete',
        component: ErrorEndpointDeletePopupComponent,
        resolve: {
            errorEndpoint: ErrorEndpointResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'ErrorEndpoints'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
