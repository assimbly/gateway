import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Security } from 'app/shared/model/security.model';
import { SecurityService } from './security.service';
import { SecurityComponent } from './security.component';
import { SecurityDetailComponent } from './security-detail.component';
import { SecurityUpdateComponent } from './security-update.component';
import { SecurityDeletePopupComponent } from './security-delete-dialog.component';
import { SecuritySelfSignPopupComponent, SecurityUploadP12PopupComponent, SecurityUploadPopupComponent } from 'app/entities/security';
import { ISecurity } from 'app/shared/model/security.model';

@Injectable({ providedIn: 'root' })
export class SecurityResolve implements Resolve<ISecurity> {
    constructor(private service: SecurityService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Security> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.find(id).pipe(
                filter((response: HttpResponse<Security>) => response.ok),
                map((security: HttpResponse<Security>) => security.body)
            );
        }
        return of(new Security());
    }
}

export const securityRoute: Routes = [
    {
        path: 'security',
        component: SecurityComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Security (TLS)'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'security/:id/view',
        component: SecurityDetailComponent,
        resolve: {
            security: SecurityResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Securities'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'security/new',
        component: SecurityUpdateComponent,
        resolve: {
            security: SecurityResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Securities'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'security/:id/edit',
        component: SecurityUpdateComponent,
        resolve: {
            security: SecurityResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Securities'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const securityPopupRoute: Routes = [
    {
        path: 'security/:id/delete',
        component: SecurityDeletePopupComponent,
        resolve: {
            security: SecurityResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Securities'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'upload',
        component: SecurityUploadPopupComponent,
        resolve: {
            security: SecurityResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Securities'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'uploadp12',
        component: SecurityUploadP12PopupComponent,
        resolve: {
            security: SecurityResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Securities'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'self-sign',
        component: SecuritySelfSignPopupComponent,
        resolve: {
            security: SecurityResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Securities'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
