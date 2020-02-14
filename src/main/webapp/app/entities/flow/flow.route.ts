import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { IFlow, Flow } from 'app/shared/model/flow.model';
import { FlowService } from './flow.service';
import { FlowComponent } from './flow.component';
import { FlowConfigurationComponent } from './flow-configuration.component';
import { FlowDetailComponent } from './flow-detail.component';
import { FlowUpdateComponent } from './flow-update.component';
import { FlowEditAllComponent } from './flow-edit-all.component';
import { FlowDeletePopupComponent } from './flow-delete-dialog.component';

@Injectable({ providedIn: 'root' })
export class FlowResolve implements Resolve<IFlow> {
    constructor(private service: FlowService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Flow> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.find(id).pipe(
                filter((response: HttpResponse<Flow>) => response.ok),
                map((flow: HttpResponse<Flow>) => flow.body)
            );
        }
        return of(new Flow());
    }
}

export const flowRoute: Routes = [
    {
        path: 'flow',
        component: FlowComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Flows'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'flow/edit-all',
        component: FlowEditAllComponent,
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Flows'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'flow/edit-all/:id',
        component: FlowEditAllComponent,
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Flows'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'flow/edit-all/:id/:clone',
        component: FlowEditAllComponent,
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Flows'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'flow/configuration',
        component: FlowConfigurationComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Flows'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'flow/new',
        component: FlowUpdateComponent,
        resolve: {
            flow: FlowResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Flows'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'flow/:id/edit',
        component: FlowUpdateComponent,
        resolve: {
            flow: FlowResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Flows'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const flowPopupRoute: Routes = [
    {
        path: 'flow/:id/delete',
        component: FlowDeletePopupComponent,
        resolve: {
            flow: FlowResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Flows'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
