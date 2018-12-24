import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Service } from 'app/shared/model/service.model';
import { ServiceService } from './service.service';
import { ServiceComponent } from './service.component';
import { ServiceDetailComponent } from './service-detail.component';
import { ServiceUpdateComponent } from './service-update.component';
import { ServiceDeletePopupComponent } from './service-delete-dialog.component';
import { ServiceAllComponent } from './service-all.component';

@Injectable({ providedIn: 'root' })
export class ServiceResolve implements Resolve<Service> {
    constructor(private service: ServiceService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Service> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.find(id).pipe(
                filter((response: HttpResponse<Service>) => response.ok),
                map((service: HttpResponse<Service>) => service.body)
            );
        }
        return of(new Service());
    }
}

export const serviceRoute: Routes = [
    {
        path: 'service/all',
        component: ServiceComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Services'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'service',
        component: ServiceAllComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Services'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'service/:id',
        component: ServiceDetailComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Services'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'service/:id/view',
        component: ServiceDetailComponent,
        resolve: {
            service: ServiceResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Services'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'service/new',
        component: ServiceUpdateComponent,
        resolve: {
            service: ServiceResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Services'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'service-all-new',
        component: ServiceComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Services'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'service/:id/edit',
        component: ServiceUpdateComponent,
        resolve: {
            service: ServiceResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Services'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const servicePopupRoute: Routes = [
    {
        path: 'service/:id/delete',
        component: ServiceDeletePopupComponent,
        resolve: {
            service: ServiceResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Services'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
