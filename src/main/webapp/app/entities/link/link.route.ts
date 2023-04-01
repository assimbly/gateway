import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Link } from 'app/shared/model/link.model';
import { LinkService } from './link.service';
import { LinkComponent } from './link.component';
import { LinkDetailComponent } from './link-detail.component';
import { LinkUpdateComponent } from './link-update.component';
import { ILink } from 'app/shared/model/link.model';

@Injectable({ providedIn: 'root' })
export class LinkResolve implements Resolve<ILink> {
  constructor(private service: LinkService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Link> {
    const id = route.params['id'] ? route.params['id'] : null;
    if (id) {
      return this.service.find(id).pipe(
        filter((response: HttpResponse<Link>) => response.ok),
        map((link: HttpResponse<Link>) => link.body)
      );
    }
    return of(new Link());
  }
}

export const linkRoute: Routes = [
  {
    path: 'link',
    component: LinkComponent,
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'link/:id/view',
    component: LinkDetailComponent,
    resolve: {
      link: LinkResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'link/new',
    component: LinkUpdateComponent,
    resolve: {
      link: LinkResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'link/:id/edit',
    component: LinkUpdateComponent,
    resolve: {
      link: LinkResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'global.title',
    },
    canActivate: [UserRouteAccessService],
  },
];