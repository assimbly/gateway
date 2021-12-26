import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Routes, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { IRoute, Route } from 'app/shared/model/route.model';
import { RouteService } from './route.service';
import { RouteComponent } from './route.component';
import { RouteDetailComponent } from './route-detail.component';
import { RouteUpdateComponent } from './route-update.component';
import { HeaderDeletePopupComponent, HeaderPopupComponent, HeaderResolve } from 'app/entities/header';

@Injectable({ providedIn: 'root' })
export class RouteResolve implements Resolve<IRoute> {
    constructor(private service: RouteService, private router: Router) {}

    resolve(route: ActivatedRouteSnapshot): Observable<IRoute> | Observable<never> {
        const id = route.params['id'];
        if (id) {
            return this.service.find(id).pipe(
                flatMap((route: HttpResponse<Route>) => {
                    if (route.body) {
                        return of(route.body);
                    } else {
                        this.router.navigate(['404']);
                        return EMPTY;
                    }
                })
            );
        }
        return of(new Route());
    }
}

export const routeRoute: Routes = [
    {
        path: 'route',
        component: RouteComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Routes'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'route/:id/view',
        component: RouteDetailComponent,
        resolve: {
            route: RouteResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Routes'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'route/new',
        component: RouteUpdateComponent,
        resolve: {
            route: RouteResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Routes'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'route/:id/edit',
        component: RouteUpdateComponent,
        resolve: {
            route: RouteResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Routes'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const routePopupRoute: Routes = [
    {
        path: 'route-new',
        component: HeaderPopupComponent,
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Headers'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'route/:id/edit',
        component: HeaderPopupComponent,
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Headers'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'route/:id/delete',
        component: HeaderDeletePopupComponent,
        resolve: {
            header: HeaderResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Headers'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
