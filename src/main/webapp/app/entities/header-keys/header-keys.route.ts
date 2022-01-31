import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { HeaderKeys } from 'app/shared/model/header-keys.model';
import { HeaderKeysService } from './header-keys.service';
import { HeaderKeysComponent } from './header-keys.component';
import { HeaderKeysDetailComponent } from './header-keys-detail.component';
import { HeaderKeysUpdateComponent } from './header-keys-update.component';
import { HeaderKeysDeletePopupComponent } from './header-keys-delete-dialog.component';
import { IHeaderKeys } from 'app/shared/model/header-keys.model';

@Injectable({ providedIn: 'root' })
export class HeaderKeysResolve implements Resolve<IHeaderKeys> {
    constructor(private service: HeaderKeysService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<HeaderKeys> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.find(id).pipe(
                filter((response: HttpResponse<HeaderKeys>) => response.ok),
                map((headerKeys: HttpResponse<HeaderKeys>) => headerKeys.body)
            );
        }
        return of(new HeaderKeys());
    }
}

export const headerKeysRoute: Routes = [
    {
        path: 'header-keys',
        component: HeaderKeysComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'HeaderKeys'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'header-keys/:id/view',
        component: HeaderKeysDetailComponent,
        resolve: {
            headerKeys: HeaderKeysResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'HeaderKeys'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'header-keys/new',
        component: HeaderKeysUpdateComponent,
        resolve: {
            headerKeys: HeaderKeysResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'HeaderKeys'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'header-keys/:id/edit',
        component: HeaderKeysUpdateComponent,
        resolve: {
            headerKeys: HeaderKeysResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'HeaderKeys'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const headerKeysPopupRoute: Routes = [
    {
        path: 'header-keys/:id/delete',
        component: HeaderKeysDeletePopupComponent,
        resolve: {
            headerKeys: HeaderKeysResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'HeaderKeys'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
