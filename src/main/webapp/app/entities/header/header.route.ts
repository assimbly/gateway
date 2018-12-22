import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Header } from 'app/shared/model/header.model';
import { HeaderService } from './header.service';
import { HeaderComponent } from './header.component';
import { HeaderDetailComponent } from './header-detail.component';
import { HeaderUpdateComponent } from './header-update.component';
import { HeaderDeletePopupComponent } from './header-delete-dialog.component';
import { HeaderAllComponent } from './header-all.component';

@Injectable({ providedIn: 'root' })
export class HeaderResolve implements Resolve<Header> {
    constructor(private service: HeaderService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Header> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.find(id).pipe(
                filter((response: HttpResponse<Header>) => response.ok),
                map((header: HttpResponse<Header>) => header.body)
            );
        }
        return of(new Header());
    }
}

export const headerRoute: Routes = [
    {
        path: 'header/all',
        component: HeaderComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Headers'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'header',
        component: HeaderAllComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Headers'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'header/:id',
        component: HeaderDetailComponent,
        resolve: {
            header: HeaderResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Headers'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'header/new',
        component: HeaderUpdateComponent,
        resolve: {
            header: HeaderResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Headers'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'header/:id/edit',
        component: HeaderUpdateComponent,
        resolve: {
            header: HeaderResolve
        },
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Headers'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const headerPopupRoute: Routes = [
    {
        path: 'header/:id/delete',
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
